import "./App.css";
import { ActiveTimer } from "./components/active-timer/ui/ActiveTimer";
import { CrateTimer } from "./components/create-timer/ui/CreateTimer";
import { TimeReportToday } from "./components/reports";
import { AtDayReport } from "./components/reports/content/at-day";
import { TimersList } from "./components/timers-lits/ui/TimerList";

function App() {
  return (
    <>
      <div className="min-h-screen bg-slate-900 text-white px-6 pb-6">
        <div className="flex items-baseline gap-4 py-4">
          <div className="text-3xl font-bold">Time's up</div>
          <CrateTimer />
          <TimeReportToday />
          <AtDayReport />
        </div>
        <ActiveTimer />
        <TimersList />
      </div>
    </>
  );
}

export default App;
