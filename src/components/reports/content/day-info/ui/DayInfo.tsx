import React, { useEffect, useState } from "react";
import { DayInfoInterface } from "../domain/day-info.interface";
import moment, { Duration } from "moment";
import {
  store,
  TimerId,
  TimerEntryTypes,
  Timer,
} from "../../../../store/store";
import { formateDuration } from "../../../../timer/ui/Timer";

type Entry = {
  title: Timer["title"];
  duration: Duration;
};

export const DayInfo: React.FC<DayInfoInterface> = ({ date }) => {
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    store.getTimeEntriesAt(date).then((marks) => {
      const timerToDuration = new Map<TimerId, number>();
      const timerToStart = new Map<TimerId, Date>();

      marks.forEach((mark, index, arr) => {
        let duration = timerToDuration.get(mark.timer);
        if (typeof duration === "undefined") {
          timerToDuration.set(mark.timer, 0);
          duration = 0;
        }

        if (mark.type === TimerEntryTypes.start) {
          timerToStart.set(mark.timer, mark.value);

          // cut to now
          if (index === arr.length - 1) {
            const diff = new Date().getTime() - mark.value.getTime();

            timerToDuration.set(mark.timer, duration + diff);
          }
          return;
        }

        let start = timerToStart.get(mark.timer);

        if (!start) {
          start = moment(mark.value).startOf("D").toDate();
        }

        const diff = mark.value.getTime() - start.getTime();

        timerToDuration.set(mark.timer, duration + diff);
      });

      console.log({ timerToDuration });
      setEntries(
        Array.from(timerToDuration.entries()).map(([title, duration]) => ({
          title,
          duration: moment.duration(duration),
        }))
      );
    });
  }, []);

  if (entries.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="text-slate-600 mb-2">
        {moment(date).format("DD.MM.YYYY")}
      </div>
      <div className="flex items-baseline gap-2 text-xl mb-4">
        <span className="font-bold">Всего:</span>
        {formateDuration(
          moment.duration(
            entries.reduce((a, b) => a + b.duration.asMilliseconds(), 0)
          )
        )}
      </div>
      <div className="mb-4">
        {entries.map((entry) => (
          <div className="flex justify-between">
            <div>{entry.title}</div>
            <div>{formateDuration(entry.duration)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
