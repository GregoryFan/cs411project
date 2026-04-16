"use client";
import { useState, useEffect } from "react";
import DataEntry from "./dataEntry/dataEntry";
import DataDisplay from "./dataDisplay/dataDisplay";
import styles from "./logger.module.css";
import { dbActivitiesToRows } from "./dbActivitiesToRows";

export default function Logger({ userId }) {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [initialEntry, setInitialEntry] = useState(null);
  const [submittedEntry, setSubmittedEntry] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    fetch(`/api/activity?userId=${userId}&date=${date}`)
      .then(r => r.json())
      .then(entries => {
        const existing = entries[0] ?? null;

        setInitialEntry(existing);

        if (existing) {
          setSubmittedEntry({
            entry: existing,
            rows: dbActivitiesToRows(existing.activities)
          });
        } else {
          setSubmittedEntry(null);
        }

        setLoading(false);
      });

  }, [userId, date]);

  return (
    <div className={styles.container}>
      <div className={styles.entry}>
        <DataEntry
          key={date}
          date={date}
          onDateChange={setDate}
          initialEntry={initialEntry}
          onSubmit={setSubmittedEntry}
          userId={userId}
          loading={loading}
        />
      </div>
      <div className={styles.display}>
        <DataDisplay 
          entry={submittedEntry}
          loading = {loading}
         />
      </div>
    </div>
  );
}