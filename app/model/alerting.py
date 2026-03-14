"""NeoTherm Model Pipeline — Stateful Alert Engine.

Maintains per-patient history for:
  1. Three-tier outlier filtering (physiological bounds, frame-to-frame jump,
     rolling-window SD).
  2. CPTD computation from zone temperatures.
  3. Alert level classification (normal / warning / high / critical).
  4. Consecutive abnormal reading tracking with escalation after 5+.
"""

from __future__ import annotations

from collections import defaultdict, deque
from dataclasses import dataclass, field
from statistics import mean, stdev
from typing import Optional

from . import config


# ---------------------------------------------------------------------------
# Per-patient state
# ---------------------------------------------------------------------------
@dataclass
class _PatientState:
    """Internal mutable state for a single patient."""

    # Last accepted temperature per zone (for frame-to-frame jump filter)
    last_temp: dict[str, Optional[float]] = field(default_factory=dict)

    # Rolling window of accepted temperatures per zone
    history: dict[str, deque] = field(default_factory=lambda: defaultdict(lambda: deque(maxlen=config.ROLLING_WINDOW)))

    # Rolling window of accepted CPTD values (for potential future use)
    cptd_history: deque = field(default_factory=lambda: deque(maxlen=config.ROLLING_WINDOW))

    # Consecutive abnormal reading counter
    consecutive_abnormal: int = 0


# ---------------------------------------------------------------------------
# Three-tier outlier filter
# ---------------------------------------------------------------------------

def _passes_bounds(value: Optional[float]) -> bool:
    """Tier 1: reject temps outside physiological bounds."""
    if value is None:
        return False
    return config.TEMP_MIN <= value <= config.TEMP_MAX


def _passes_jump(value: float, last: Optional[float]) -> bool:
    """Tier 2: reject frame-to-frame jumps exceeding threshold.

    If there is no previous reading, the value passes automatically.
    """
    if last is None:
        return True
    return abs(value - last) <= config.MAX_FRAME_JUMP


def _passes_rolling(value: float, history: deque) -> bool:
    """Tier 3: reject values more than N SDs from rolling mean.

    If there are fewer than 2 historical readings, the value passes
    automatically (not enough data to compute SD).
    """
    if len(history) < 2:
        return True
    mu = mean(history)
    sd = stdev(history)
    if sd == 0:
        # All historical values identical — accept if value matches
        return value == mu
    return abs(value - mu) <= config.ROLLING_SD_THRESHOLD * sd


def filter_temperature(
    value: Optional[float],
    zone: str,
    state: _PatientState,
) -> Optional[float]:
    """Run a single temperature value through the 3-tier outlier filter.

    Returns the value if it passes all tiers, or None if rejected.
    On acceptance the value is recorded in the patient's history.
    """
    # Tier 1 — physiological bounds
    if not _passes_bounds(value):
        return None

    # value is guaranteed non-None after bounds check
    assert value is not None

    # Tier 2 — frame-to-frame jump
    if not _passes_jump(value, state.last_temp.get(zone)):
        return None

    # Tier 3 — rolling window SD
    if not _passes_rolling(value, state.history[zone]):
        return None

    # Accepted — update state
    state.last_temp[zone] = value
    state.history[zone].append(value)
    return value


# ---------------------------------------------------------------------------
# CPTD computation
# ---------------------------------------------------------------------------

def compute_cptd(
    core: Optional[float],
    left_hand: Optional[float],
    right_hand: Optional[float],
    left_foot: Optional[float],
    right_foot: Optional[float],
) -> Optional[float]:
    """Compute Core-Peripheral Temperature Difference.

    Peripheral = mean of non-null hand temps.
    If both hands are null, fall back to mean of non-null foot temps.
    If all peripheral values are null, or core is null, returns None.
    """
    if core is None:
        return None

    # Try hands first
    hands = [t for t in (left_hand, right_hand) if t is not None]
    if hands:
        return core - mean(hands)

    # Fallback to feet
    feet = [t for t in (left_foot, right_foot) if t is not None]
    if feet:
        return core - mean(feet)

    return None


# ---------------------------------------------------------------------------
# Alert classification
# ---------------------------------------------------------------------------

def classify_alert(cptd: Optional[float]) -> str:
    """Return alert level string for a given CPTD value."""
    if cptd is None:
        return "normal"
    if cptd >= config.CPTD_CRITICAL:
        return "critical"
    if cptd >= config.CPTD_HIGH:
        return "high"
    if cptd >= config.CPTD_WARNING:
        return "warning"
    return "normal"


_ALERT_MESSAGES = {
    "normal": "Temperature difference within normal range",
    "warning": "CPTD approaching threshold",
    "high": "CPTD elevated — monitor closely",
    "critical": "CPTD critically elevated — immediate assessment recommended",
}

# Escalation threshold: after this many consecutive abnormal readings the
# alert message is augmented.
_ESCALATION_COUNT = 5


# ---------------------------------------------------------------------------
# AlertEngine — public API
# ---------------------------------------------------------------------------

class AlertEngine:
    """Stateful alert engine that maintains per-patient context.

    Usage::

        engine = AlertEngine()
        result = engine.process(
            patient_id="baby_40",
            core=36.89,
            left_hand=34.97,
            right_hand=None,
            left_foot=33.21,
            right_foot=33.58,
        )
        # result is a dict with keys:
        #   cptd, alert_level, alert_message, consecutive_abnormal
    """

    def __init__(self) -> None:
        self._states: dict[str, _PatientState] = {}

    # -- helpers ----------------------------------------------------------

    def _get_state(self, patient_id: str) -> _PatientState:
        if patient_id not in self._states:
            self._states[patient_id] = _PatientState()
        return self._states[patient_id]

    def reset(self, patient_id: Optional[str] = None) -> None:
        """Clear state for one patient, or all patients if *patient_id* is None."""
        if patient_id is None:
            self._states.clear()
        else:
            self._states.pop(patient_id, None)

    # -- main entry point -------------------------------------------------

    def process(
        self,
        patient_id: str,
        core: Optional[float],
        left_hand: Optional[float],
        right_hand: Optional[float],
        left_foot: Optional[float],
        right_foot: Optional[float],
    ) -> dict:
        """Process a single set of zone temperatures for *patient_id*.

        Each temperature is independently filtered through the 3-tier
        outlier pipeline before CPTD is computed.

        Returns a dict::

            {
                "cptd": float | None,
                "alert_level": str,         # normal / warning / high / critical
                "alert_message": str,
                "consecutive_abnormal": int,
            }
        """
        state = self._get_state(patient_id)

        # --- Filter each zone independently ---
        f_core = filter_temperature(core, "core", state)
        f_left_hand = filter_temperature(left_hand, "left_hand", state)
        f_right_hand = filter_temperature(right_hand, "right_hand", state)
        f_left_foot = filter_temperature(left_foot, "left_foot", state)
        f_right_foot = filter_temperature(right_foot, "right_foot", state)

        # --- CPTD ---
        cptd = compute_cptd(f_core, f_left_hand, f_right_hand, f_left_foot, f_right_foot)

        if cptd is not None:
            state.cptd_history.append(cptd)

        # --- Alert level ---
        level = classify_alert(cptd)

        # --- Consecutive tracking ---
        if level != "normal":
            state.consecutive_abnormal += 1
        else:
            state.consecutive_abnormal = 0

        # --- Build message ---
        message = _ALERT_MESSAGES[level]
        if state.consecutive_abnormal >= _ESCALATION_COUNT and level != "normal":
            message += (
                f" (sustained for {state.consecutive_abnormal} consecutive readings)"
            )

        return {
            "cptd": round(cptd, 2) if cptd is not None else None,
            "alert_level": level,
            "alert_message": message,
            "consecutive_abnormal": state.consecutive_abnormal,
        }
