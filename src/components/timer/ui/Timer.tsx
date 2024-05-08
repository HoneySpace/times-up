import moment, { Duration } from "moment";
import { FC, useEffect, useRef, useState } from "react";
import {
  SystemEventsToArgs,
  TimerEntryTypes,
  TimerId,
  TimerTimeEntry,
  store,
  subscribe,
  unsubscribe,
} from "../../store/store";

const getDuration = (marks: TimerTimeEntry[]) => {
  let running = false;
  const total = marks.reduce((total, current, index, arr) => {
    if (current.type === TimerEntryTypes.start) {
      running = true;

      return total;
    }

    const prev = arr[index - 1];

    if (!prev) {
      throw new Error("Now previous mark found");
    }

    const diff = current.value.getTime() - arr[index - 1].value.getTime();
    running = false;

    return total + diff;
  }, 0);

  return { running, total };
};

export const formateDuration = (duration: Duration) => {
  const hours = duration.hours();
  const minutes = duration.minutes();
  const seconds = duration.seconds();

  return `${hours !== 0 ? `${hours}h ` : ""}${
    minutes !== 0 ? `${minutes}m ` : ""
  }${seconds}s`;
};

export const Timer: FC<{ timerId: TimerId }> = ({ timerId }) => {
  const [running, setRunning] = useState(false);

  const [startAt, setStartAt] = useState<Date>(new Date());
  const [calculated, setCalculated] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const timeoutRef = useRef<NodeJS.Timeout>();
  const runningRef = useRef(running);
  runningRef.current = running;
  const startAtRef = useRef(startAt);
  startAtRef.current = startAt;

  useEffect(() => {
    const time = () => {
      if (runningRef.current) {
        setCurrentTime(Date.now() - startAtRef.current.getTime());
        timeoutRef.current = setTimeout(time, 1000);
      }
    };

    if (running) {
      time();
    }

    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, [startAt, running]);

  useEffect(() => {
    const updateTime = () => {
      store.getTimerTimeMarks(timerId).then((marks) => {
        const d = getDuration(marks);

        setCalculated(d.total);
        if (d.running) {
          const last = marks.at(-1)!;
          setStartAt(last.value);
        }
        setRunning(d.running);
      });
    };
    updateTime();

    const start = (e: SystemEventsToArgs["timer-created"]) => {
      if (e.timerId === timerId) {
        setRunning(true);
        setStartAt(new Date());
      }
    };

    const end = (e: SystemEventsToArgs["timer-stopped"]) => {
      console.log({ stoped: e });
      if (e.timerId === timerId) {
        setRunning(false);
        setCurrentTime(0);
        updateTime();
      }
    };

    subscribe("timer-started", start);
    subscribe("timer-stopped", end);

    return () => {
      unsubscribe("timer-started", start);
      unsubscribe("timer-stopped", end);
    };
  }, []);

  return (
    <div
      data-running={running}
      className="p-3 rounded border group data-[running=true]:border-emerald-700 text-slate-600 border-slate-800 hover:border-slate-400 transition-colors shadow-sm shadow-slate-950"
    >
      <div
        title={timerId}
        className="timer-title text-lg font-semibold text-white text-ellipsis overflow-hidden whitespace-nowrap"
      >
        {timerId}
      </div>
      {(calculated || currentTime) > 0 ? (
        <div>
          Time: {formateDuration(moment.duration(calculated + currentTime))}
        </div>
      ) : null}
      <div className="opacity-0 group-hover:opacity-100 transition-all">
        <div>
          {running ? (
            <button
              onClick={() => {
                store.stopTimer(timerId);
              }}
            >
              Stop
            </button>
          ) : (
            <button
              onClick={() => {
                store.startTimer(timerId);
              }}
            >
              Start
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
