import EventEmitter from "eventemitter3";
import { DBSchema, IDBPDatabase, openDB } from "idb";
import moment from "moment";
import { useSyncExternalStore } from "react";

export type Timer = {
  title: string;
  lastStarted: Date;
};

export type TimerId = Timer["title"];

export const TimerEntryTypes = {
  start: "start",
  end: "end",
} as const;

export type ValuesOf<T> = T[keyof T];

export type TimerEntryType = ValuesOf<typeof TimerEntryTypes>;

export type TimerTimeEntry = {
  timer: TimerId;
  value: Date;
  type: TimerEntryType;
};

interface DataBase extends DBSchema {
  timers: {
    key: string;
    value: Timer;
    indexes: {
      "by-title": TimerId;
      "by-use": Date;
    };
  };
  timeEntries: {
    key: string;
    value: TimerTimeEntry;
    indexes: {
      "by-timer": TimerId;
      "by-value": Date;
    };
  };
}

export type SystemEvents =
  | "timer-created"
  | "timer-started"
  | "timer-stopped"
  | "init";

type InforceKeys<T extends { [TK in K]: any }, K extends string> = T;

export type SystemEventsToArgs = InforceKeys<
  {
    init: IDBPDatabase<DataBase>;
    "timer-created": { timerId: TimerId };
    "timer-started": { timerId: TimerId };
    "timer-stopped": { timerId: TimerId };
  },
  SystemEvents
>;

const eventEmitter = new EventEmitter();

export const emit = <E extends SystemEvents>(
  event: E,
  args: SystemEventsToArgs[E]
) => eventEmitter.emit(event, args);
export const subscribe = <E extends SystemEvents>(
  event: E,
  handler: (e: SystemEventsToArgs[E]) => void
) => eventEmitter.addListener(event, handler);
export const unsubscribe = <E extends SystemEvents>(
  event: E,
  handler: (e: SystemEventsToArgs[E]) => void
) => eventEmitter.removeListener(event, handler);

let db: IDBPDatabase<DataBase>;

export async function init() {
  db = await openDB<DataBase>("db", 1, {
    upgrade(db) {
      const timersStore = db.createObjectStore("timers", {
        keyPath: "title",
      });

      timersStore.createIndex("by-title", "title" satisfies keyof Timer);
      timersStore.createIndex("by-use", "lastStarted" satisfies keyof Timer);

      const entriesStore = db.createObjectStore("timeEntries", {
        autoIncrement: true,
      });

      entriesStore.createIndex(
        "by-timer",
        "timer" satisfies keyof TimerTimeEntry
      );
      entriesStore.createIndex(
        "by-value",
        "value" satisfies keyof TimerTimeEntry
      );
    },
  });

  emit("init", db);

  return db;
}

type TStoreState = {
  activeTimer: TimerId | null;
  activeTimerRunning: boolean;
  allTimers: Timer[];
};

type StoreListener = (state: TStoreState) => any;

function createStore(initialState: TStoreState) {
  let currentState = initialState;
  const listeners = new Set<(state: TStoreState) => any>();

  const notify = () => {
    listeners.forEach((listener) => listener(currentState));
  };

  const getAllTimers = async (db: IDBPDatabase<DataBase>) => {
    const all = await db
      .transaction("timers")
      .objectStore("timers")
      .index("by-use")
      .getAll();

    return all.reverse();
  };

  subscribe("init", async (db) => {
    getAllTimers(db).then((t) => {
      currentState.allTimers = t;
      notify();
    });

    const tx = db.transaction("timeEntries");
    const cursor = await tx
      .objectStore("timeEntries")
      .index("by-value")
      .openCursor(null, "prev");
    const v = cursor?.value;

    if (v?.type === TimerEntryTypes.start) {
      currentState.activeTimer = v.timer ?? null;
      currentState.activeTimerRunning = true;
    } else {
      currentState.activeTimerRunning = false;
    }
    notify();
  });

  subscribe("timer-created", async () => {
    currentState.allTimers = await getAllTimers(db);
    notify();
  });

  return {
    getState: () => currentState,
    getAllTimers: async (): Promise<Timer[]> => {
      return await getAllTimers(db);
    },
    getTimerTimeMarks: async (timerId: TimerId): Promise<TimerTimeEntry[]> => {
      const tx = db.transaction("timeEntries");
      const store = tx.objectStore("timeEntries");
      return await store.index("by-timer").getAll(timerId);
    },
    getLastTimerMark: async (
      timerId: TimerId
    ): Promise<TimerTimeEntry | undefined> => {
      const cursor = await db
        .transaction("timeEntries")
        .objectStore("timeEntries")
        .index("by-timer")
        .openCursor(timerId, "prev");
      return cursor?.value;
    },
    getTimeEntriesAt: async (date: Date) => {
      const dateAsMoment = moment(date);
      const start = dateAsMoment.startOf("D").toDate();
      const end = dateAsMoment.endOf("D").toDate();

      console.log({ start, end });

      const range = IDBKeyRange.bound(start, end);
      const index = db
        .transaction("timeEntries")
        .objectStore("timeEntries")
        .index("by-value");

      return index.getAll(range);
    },
    // CRUD
    createTimer: (timer: Omit<Timer, "lastStarted">) => {
      db.put("timers", { ...timer, lastStarted: new Date() }).then(() => {
        if (!currentState.activeTimerRunning)
          currentState.activeTimer = timer.title;
        notify();
      });
      emit("timer-created", { timerId: timer.title });
    },
    startTimer(timerId: TimerId) {
      console.log({ ...currentState });
      if (
        currentState.activeTimer !== null &&
        currentState.activeTimer !== timerId &&
        currentState.activeTimerRunning
      )
        this.stopTimer(currentState.activeTimer);

      const startDate = new Date();

      db.put("timers", {
        title: timerId,
        lastStarted: startDate,
      });
      db.put("timeEntries", {
        timer: timerId,
        type: TimerEntryTypes.start,
        value: startDate,
      }).then(() => {
        currentState.activeTimer = timerId;
        currentState.activeTimerRunning = true;
        notify();
      });

      emit("timer-started", { timerId });
    },
    stopTimer: (timerId: TimerId) => {
      const endDate = new Date();

      db.put("timeEntries", {
        timer: timerId,
        type: TimerEntryTypes.end,
        value: endDate,
      }).then(() => {
        currentState.activeTimerRunning = false;
        notify();
      });
      emit("timer-stopped", { timerId });
    },
    subscribe: (listener: StoreListener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

export const store = createStore({
  activeTimer: null,
  allTimers: [],
  activeTimerRunning: false,
});

export const useStore = <T extends unknown = any>(
  selector: (state: TStoreState) => T = (state) => state as T
) =>
  useSyncExternalStore(store.subscribe, () => selector(store.getState())) as T;
