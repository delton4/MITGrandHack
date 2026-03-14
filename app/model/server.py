"""NeoTherm Model Pipeline — FastAPI server with WebSocket endpoint.

Orchestrates replay and live modes:
  - GET  /          Health check
  - GET  /patients  List available Greek CSV patients for replay
  - WS   /ws        Main WebSocket stream (replay or live)

Startup event pre-loads the YOLO model so the first request isn't slow.
"""

from __future__ import annotations

import asyncio
import json
import logging
from typing import Optional

from pathlib import Path

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse

from . import config

# Frontend HTML path
_FRONTEND_DIR = Path(__file__).resolve().parent.parent / "frontend"
from .alerting import AlertEngine
from .pipeline import PoseDetector

# Lazy imports — these modules may not exist yet during early development.
# The server will still start; endpoints that need them will return an error.
try:
    from .replay import ReplayEngine, list_patients
except ImportError:
    ReplayEngine = None  # type: ignore[assignment,misc]
    list_patients = None  # type: ignore[assignment]

try:
    from .live import LiveCapture
except ImportError:
    LiveCapture = None  # type: ignore[assignment,misc]


logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# FastAPI application
# ---------------------------------------------------------------------------

app = FastAPI(title="NeoTherm")

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Shared singletons — populated at startup
_pose_detector: Optional[PoseDetector] = None
_alert_engine: AlertEngine = AlertEngine()


# ---------------------------------------------------------------------------
# Startup: pre-load YOLO model
# ---------------------------------------------------------------------------

@app.get("/ui", response_class=HTMLResponse)
async def serve_ui():
    """Serve the demo frontend."""
    html_path = _FRONTEND_DIR / "index.html"
    if html_path.exists():
        return HTMLResponse(content=html_path.read_text())
    return HTMLResponse(content="<h1>Frontend not found</h1>", status_code=404)


@app.on_event("startup")
async def _startup() -> None:
    global _pose_detector
    logger.info("Pre-loading YOLO pose model...")
    _pose_detector = PoseDetector()
    logger.info("YOLO model loaded — server ready.")


# ---------------------------------------------------------------------------
# REST endpoints
# ---------------------------------------------------------------------------

@app.get("/")
async def health_check():
    """Simple health check."""
    return {"status": "ok", "service": "neotherm"}


@app.get("/patients")
async def get_patients():
    """Return a list of available patient IDs for replay."""
    if list_patients is None:
        return {"patients": [], "error": "replay module not available"}
    patients = list_patients()
    return {"patients": patients}


# ---------------------------------------------------------------------------
# WebSocket endpoint
# ---------------------------------------------------------------------------

async def _send_json(ws: WebSocket, data: dict) -> None:
    """Send a JSON message, silently ignoring errors on closed sockets."""
    try:
        await ws.send_text(json.dumps(data))
    except Exception:
        pass


async def _run_replay(
    ws: WebSocket,
    patient_id: str,
    speed: float,
) -> None:
    """Stream replay data for a patient over the WebSocket."""
    if ReplayEngine is None:
        await _send_json(ws, {
            "type": "error",
            "message": "replay module not available yet",
        })
        return

    _alert_engine.reset(patient_id)

    engine = ReplayEngine(
        alert_engine=_alert_engine,
        pipeline=_pose_detector,
    )

    async for message in engine.replay(patient_id, speed):
        await _send_json(ws, message)

    # Signal replay complete
    await _send_json(ws, {
        "type": "replay_complete",
        "patient_id": patient_id,
    })


async def _run_demo(
    ws: WebSocket,
    patient_id: str,
    speed: float,
) -> None:
    """Stream demo escalation data for a patient over the WebSocket."""
    if ReplayEngine is None:
        await _send_json(ws, {
            "type": "error",
            "message": "replay module not available yet",
        })
        return

    _alert_engine.reset(patient_id)

    engine = ReplayEngine(
        alert_engine=_alert_engine,
        pipeline=_pose_detector,
    )

    async for message in engine.demo_escalation(speed):
        await _send_json(ws, message)

    # Signal demo complete
    await _send_json(ws, {
        "type": "replay_complete",
        "patient_id": patient_id,
    })


async def _run_live(
    ws: WebSocket,
    camera_index: int,
) -> None:
    """Stream live camera data over the WebSocket."""
    if LiveCapture is None:
        await _send_json(ws, {
            "type": "error",
            "message": "live module not available yet",
        })
        return

    _alert_engine.reset()

    capture = LiveCapture(
        camera_index=camera_index,
        alert_engine=_alert_engine,
        pose_detector=_pose_detector,
    )

    async for message in capture.stream():
        await _send_json(ws, message)


@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    """Main WebSocket endpoint for NeoTherm streaming.

    Client sends JSON commands:
      {"action": "start_replay", "patient_id": "baby_40", "speed": 2.0}
      {"action": "start_live", "camera_index": 0}
      {"action": "stop"}

    Server streams JSON messages back (see spec for full format).
    """
    await ws.accept()
    logger.info("WebSocket client connected")

    current_task: Optional[asyncio.Task] = None

    async def _cancel_current() -> None:
        """Cancel the currently running stream task, if any."""
        nonlocal current_task
        if current_task is not None and not current_task.done():
            current_task.cancel()
            try:
                await current_task
            except asyncio.CancelledError:
                pass
            current_task = None

    try:
        while True:
            raw = await ws.receive_text()
            try:
                msg = json.loads(raw)
            except json.JSONDecodeError:
                await _send_json(ws, {
                    "type": "error",
                    "message": "invalid JSON",
                })
                continue

            action = msg.get("action")

            # ---- stop -------------------------------------------------------
            if action == "stop":
                await _cancel_current()
                await _send_json(ws, {"type": "stopped"})
                continue

            # ---- start_replay -----------------------------------------------
            if action == "start_replay":
                patient_id = msg.get("patient_id")
                if not patient_id:
                    await _send_json(ws, {
                        "type": "error",
                        "message": "patient_id is required for start_replay",
                    })
                    continue

                speed = float(msg.get("speed", config.REPLAY_SPEED))

                # Stop any running stream before starting a new one
                await _cancel_current()

                current_task = asyncio.create_task(
                    _run_replay(ws, patient_id, speed)
                )
                continue

            # ---- start_demo -------------------------------------------------
            if action == "start_demo":
                patient_id = msg.get("patient_id")
                if not patient_id:
                    await _send_json(ws, {
                        "type": "error",
                        "message": "patient_id is required for start_demo",
                    })
                    continue

                speed = float(msg.get("speed", config.REPLAY_SPEED))

                # Stop any running stream before starting a new one
                await _cancel_current()

                current_task = asyncio.create_task(
                    _run_demo(ws, patient_id, speed)
                )
                continue

            # ---- start_live -------------------------------------------------
            if action == "start_live":
                camera_index = int(msg.get("camera_index", 0))

                await _cancel_current()

                current_task = asyncio.create_task(
                    _run_live(ws, camera_index)
                )
                continue

            # ---- unknown action ---------------------------------------------
            await _send_json(ws, {
                "type": "error",
                "message": f"unknown action: {action}",
            })

    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected")
    except Exception:
        logger.exception("Unexpected error in WebSocket handler")
    finally:
        # Clean up any running stream
        await _cancel_current()


# ---------------------------------------------------------------------------
# Main — run with uvicorn
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn

    logging.basicConfig(level=logging.INFO)
    uvicorn.run(app, host=config.WS_HOST, port=config.WS_PORT)
