import type { AppState, Action, Tab } from './types';

export const CENSUS_TAB: Tab = {
  id: '__census__',
  label: 'My Patients',
  type: 'census',
};

export const initialState: AppState = {
  tabs: [CENSUS_TAB],
  activeTabId: CENSUS_TAB.id,
  activeNav: 'Summary',
  bpaAlerts: [],
  showBPA: false,
};

export function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'OPEN_CHART': {
      const tabId = `patient-${action.patient.id}`;
      const existing = state.tabs.find((t) => t.id === tabId);
      if (existing) {
        return { ...state, activeTabId: tabId, activeNav: 'Summary' };
      }
      const newTab: Tab = {
        id: tabId,
        label: `${action.patient.last_name}, ${action.patient.first_name.charAt(0)}.`,
        type: 'chart',
        patientId: action.patient.id,
      };
      return {
        ...state,
        tabs: [...state.tabs, newTab],
        activeTabId: tabId,
        activeNav: 'Summary',
      };
    }

    case 'SWITCH_TAB':
      return {
        ...state,
        activeTabId: action.tabId,
        activeNav: 'Summary',
      };

    case 'CLOSE_TAB': {
      const filtered = state.tabs.filter((t) => t.id !== action.tabId);
      if (filtered.length === 0) {
        return { ...state, tabs: [CENSUS_TAB], activeTabId: CENSUS_TAB.id };
      }
      let nextActive = state.activeTabId;
      if (state.activeTabId === action.tabId) {
        const idx = state.tabs.findIndex((t) => t.id === action.tabId);
        const newIdx = Math.min(idx, filtered.length - 1);
        nextActive = filtered[newIdx].id;
      }
      return { ...state, tabs: filtered, activeTabId: nextActive };
    }

    case 'SET_NAV':
      return { ...state, activeNav: action.nav };

    case 'SHOW_BPA':
      return { ...state, bpaAlerts: action.alerts, showBPA: true };

    case 'DISMISS_BPA':
      return { ...state, showBPA: false, bpaAlerts: [] };

    default:
      return state;
  }
}
