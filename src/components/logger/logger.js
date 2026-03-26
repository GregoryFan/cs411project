"use client";
import { useState } from "react";
import DataEntry from "./dataEntry/dataEntry";
import DataDisplay from "./dataDisplay/dataDisplay";
import styles from "./logger.module.css"

export default function Logger() {
  const [submittedEntry, setSubmittedEntry] = useState(null);

  return (
    <div className = {styles.container}>
        <div className = {styles.entry}>
            <DataEntry onSubmit={setSubmittedEntry} />
        </div>
        <div className = {styles.display}>
            <DataDisplay entry={submittedEntry} />
        </div>
    </div>
  );
}