"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

const handleDateChange = async (newDate) => {
  // catch requests for dates that should not be modified
  const today = new Date().toISOString().split("T")[0];

  if (newDate > today) {
    alert("You attempted to select a future date that has not yet occurred.");
    return;
  }

  // existing logic continues below...

  try {
    const res = await fetch(`/api/activity?userId=${userId}&date=${newDate}`);
    const entries = await res.json();
    const existing = entries[0] ?? null;

    if (existing) {
      const confirmModify = window.confirm(
        "Data already exists for this date. Do you want to modify your previously inputted data?"
      );

      if (!confirmModify) {
        return;
      }

      alert("Data Logging Modification is not implemented yet.");
      return;
    }

    setDate(newDate);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className={styles.container}>
      <div className={styles.entry}>
        <DataEntry
          date={date}
          onDateChange={handleDateChange}
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