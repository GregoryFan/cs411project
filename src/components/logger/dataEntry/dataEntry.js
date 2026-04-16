"use client";

import { useState } from "react";
import { ActivityEntry } from "@/classes/activityEntry";
import {ACTIVITY_CONFIG} from "../activityConfig";
import styles from "./dataEntry.module.css"
import { dbActivitiesToRows } from "../dbActivitiesToRows";



//How each specific row is displayed
function ActivityRow({ row, onChange, onRemove }) {
  const config = row.type ? ACTIVITY_CONFIG[row.type] : null;

  return (
    <div className={styles.row}>
      
      {/*Displays the config icon (if it exists)*/}
      <span className={styles.icon}>{config ? config.icon : "?"}</span>

      {/* main type */}
      <select
        className={styles.pill}
        value={row.type}
        onChange={(e) => onChange({ ...row, type: e.target.value, subtype: "", quantity: "" })}
      >
        <option value="">Select...</option>
        {ACTIVITY_TYPES.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      {/*category*/}
      <select
        className={styles.pill}
        style={{ color: row.subtype ? "inherit" : "#9bbfbb" }}
        value={row.subtype}
        disabled={!config}
        onChange={(e) => onChange({ ...row, subtype: e.target.value })}
      >
        <option value="">{config ? "Select..." : ""}</option>
        {config?.subtypes.map((s) => (
          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
        ))}
      </select>

      {/*quantity*/}
      <div className={styles.quantityWrap}>
        <input
          className={styles.quantityInput}
          type="text"
          min="0"
          placeholder="0"
          value={row.quantity}
          disabled={!config}
          onChange={(e) => {  
            const value = e.target.value.replace(/[^0-9.]/g, "");
            onChange({ ...row, quantity: value })
        }}
        onKeyDown={(e) => {
            if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
            }}
        />
        {config && <span className={styles.unit}>{config.unit}</span>}
      </div>

      {/* Remove button */}
      <button className={styles.removeBtn} onClick={onRemove} aria-label="Remove">✕</button>
      {/* Divider */}
      <div className={styles.divider} />
    </div>
  );
}

const ACTIVITY_TYPES = Object.keys(ACTIVITY_CONFIG);

// Data Entry allows users to input activities, 
// and on submit, will submit all their data to the database, and
// also inform the logger to display the data on the dataDisplay.
export default function DataEntry({ 
  date, 
  onDateChange, 
  initialEntry, 
  onSubmit,
   userId,
   loading
   }) {

  const initialRows = initialEntry?.activities?.length
    ? dbActivitiesToRows(initialEntry.activities)
    : [{ id: 0, type: "", subtype: "", quantity: "" }];

  const [rows, setRows] = useState(initialRows);
  const [nextId, setNextId] = useState(initialRows.length);
  const [submitted, setSubmitted] = useState(!!initialEntry?.activities?.length);

  const updateRow = (updatedRow) => setRows(rows.map(r => r.id === updatedRow.id ? updatedRow : r));
  const addRow = () => { setRows([...rows, { id: nextId, type: "", subtype: "", quantity: "" }]); setNextId(nextId + 1); };
  const removeRow = (rowId) => setRows(rows.filter(r => r.id !== rowId));

  const handleSubmit = async () => {
  const activities = [];
  const activityRows = [];

  for (const row of rows) {
        if (!row.type || !row.subtype || !row.quantity) {
            alert("Please fill out all fields before submitting.");
            return;
            }
            const config = ACTIVITY_CONFIG[row.type];
            const built = config.build(row.subtype, parseFloat(row.quantity));
            activities.push(built);
            activityRows.push(row);
        }

        // Map each built activity into the shape your API/schema expects
        const payload = {
            userId,
            date,
            activities: activities.map((a, i) => {
            const row = activityRows[i];
            const base = { carbonImpact: a.carbonImpact, type: row.type };

            if (row.type === "Food")           return { ...base, foodType: row.subtype,      foodQuantity: parseFloat(row.quantity) };
            if (row.type === "Transportation") return { ...base, transportMode: row.subtype, distance: parseFloat(row.quantity) };
            if (row.type === "Utility")        return { ...base, utilityType: row.subtype,   consumptionValue: parseFloat(row.quantity) };
            return base;
            })
        };

        const res = await fetch("/api/activity", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            alert("Failed to save entry.");
            return;
        }

        const saved = await res.json();
        setSubmitted(true);
        onSubmit({ entry: saved, rows });
    };

  return (
    <>
      <div className={styles.card}>
        <div className={styles.header}>
          <label className={styles.headerLabel}>
            Activities for{" "}
            <input
              className={styles.dateInput}
              type="date"
              value={date}
              onChange={(e) => onDateChange(e.target.value)}  // tells Logger to re-fetch
            />
          </label>
        </div>

       {loading ? (
    <div className={styles.loadingState}>
    <div className={styles.loadingSpinner}></div>
    <span className={styles.loadingText}>Loading activities...</span>
  </div>
) : (
  <>
    <div className={styles.rows}>
      {rows.map((row) => (
        <ActivityRow
          key={row.id}
          row={row}
          onChange={updated => updateRow(updated)}
          onRemove={() => removeRow(row.id)}
        />
      ))}
    </div>

    <div className={styles.addWrap}>
      <button
        className={styles.addBtn}
        onClick={addRow}
        aria-label="Add activity"
      >
        +
      </button>
    </div>

    <div className={styles.submitWrap}>
      <button
        className={styles.submitBtn}
        onClick={handleSubmit}
        disabled={submitted}
        style={{
          opacity: submitted ? 0.5 : 1,
          cursor: submitted ? "not-allowed" : "pointer"
        }}
      >
        {submitted ? "Submitted" : "Submit"}
      </button>
    </div>
    </>
      )}
  </div>
    </>
  );
}
