import { useReducer, useCallback } from 'react';
import { appReducer, initialState } from './state';
import type { Patient, NavItem } from './types';
import TopBar from './components/TopBar';
import TabBar from './components/TabBar';
import Navigator from './components/Navigator';
import Storyboard from './components/Storyboard';
import BPAModal from './components/BPAModal';
import PatientList from './views/PatientList';
import Synopsis from './views/Synopsis';
import Notes from './views/Notes';
import Results from './views/Results';
import Orders from './views/Orders';
import MAR from './views/MAR';
import Flowsheet from './views/Flowsheet';
import ProblemList from './views/ProblemList';
import Imaging from './views/Imaging';
import NeoThermWidget from './views/NeoThermWidget';

const viewMap: Record<string, React.FC<{ patientId: number }>> = {
  Summary: Synopsis,
  Notes: Notes,
  'Results Review': Results,
  Orders: Orders,
  MAR: MAR,
  Flowsheets: Flowsheet,
  'Problem List': ProblemList,
  Imaging: Imaging,
  NeoTherm: NeoThermWidget,
};

export default function App() {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const openChart = useCallback((patient: Patient) => {
    dispatch({ type: 'OPEN_CHART', patient });
  }, []);

  const activeTab = state.tabs.find((t) => t.id === state.activeTabId);
  const isChart = activeTab?.type === 'chart' && activeTab.patientId;
  const ActiveView = isChart ? viewMap[state.activeNav] : null;

  return (
    <div className="app-shell">
      <TopBar />
      <TabBar
        tabs={state.tabs}
        activeTabId={state.activeTabId}
        onSwitch={(id) => dispatch({ type: 'SWITCH_TAB', tabId: id })}
        onClose={(id) => dispatch({ type: 'CLOSE_TAB', tabId: id })}
      />

      <div className="app-content">
        {isChart ? (
          <>
            <Navigator
              active={state.activeNav}
              onSelect={(nav: NavItem) => dispatch({ type: 'SET_NAV', nav })}
            />
            <div className="chart-main">
              <Storyboard
                patientId={activeTab!.patientId!}
                onBPA={(alerts) => dispatch({ type: 'SHOW_BPA', alerts })}
              />
              <div className="chart-view">
                {ActiveView && <ActiveView patientId={activeTab!.patientId!} />}
              </div>
            </div>
          </>
        ) : (
          <div className="census-main">
            <PatientList onOpenChart={openChart} />
          </div>
        )}
      </div>

      {state.showBPA && state.bpaAlerts.length > 0 && (
        <BPAModal
          alerts={state.bpaAlerts}
          patientId={activeTab?.patientId ?? 0}
          onDismiss={() => dispatch({ type: 'DISMISS_BPA' })}
          onViewNeoTherm={() => {
            dispatch({ type: 'DISMISS_BPA' });
            dispatch({ type: 'SET_NAV', nav: 'NeoTherm' });
          }}
        />
      )}
    </div>
  );
}
