```ts
interface DataBase extends DBSchema {
  trackers: {
    key: string;
    value: TTrackerEntry;
    indexes: {
      "by-id": TId;
    };
  };
  markers: {
    key: string;
    value: TMarkerEntry;
  };
}

async function init() {
  const db = await openDB<DataBase>("db", 1, {
    upgrade(db) {
      const trackersStore = db.createObjectStore("trackers", {
        keyPath: "id",
      });

      trackersStore.createIndex("by-id", "id");

      db.createObjectStore("markers", {
        keyPath: "id",
      });
    },
  });

  return db;
}
```