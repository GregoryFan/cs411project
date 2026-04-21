"use client";

import { useEffect, useState } from "react";
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
        {config && (
          <span className={styles.unit}>
            {config.units
              ? (row.subtype ? config.units[row.subtype.toLowerCase()] ?? "" : "")
              : config.unit}
          </span>
        )}
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
   loading,
   onToast
   }) {

  const initialRows = initialEntry?.activities?.length
    ? dbActivitiesToRows(initialEntry.activities)
    : [{ id: 0, type: "", subtype: "", quantity: "" }];

  const [rows, setRows] = useState(initialRows);
  const [nextId, setNextId] = useState(initialRows.length);
  const [hasSubmitted, setHasSubmitted] = useState(!!initialEntry?.activities?.length);
  const [isEditing, setIsEditing] = useState(false);
  const [entryId, setEntryId] = useState(initialEntry?.id ?? null);

  const isLocked = hasSubmitted && !isEditing;

  const updateRow = (updatedRow) => setRows(rows.map(r => r.id === updatedRow.id ? updatedRow : r));
  const addRow = () => { setRows([...rows, { id: nextId, type: "", subtype: "", quantity: "" }]); setNextId(nextId + 1); };
  const removeRow = (rowId) => setRows(rows.filter(r => r.id !== rowId));

  useEffect(() => {
    const newRows = initialEntry?.activities?.length
      ? dbActivitiesToRows(initialEntry.activities)
      : [{ id: 0, type: "", subtype: "", quantity: "" }];
    setRows(newRows);
    setNextId(newRows.length);
    setHasSubmitted(!!initialEntry?.activities?.length);
    setIsEditing(false);
    setEntryId(initialEntry?.id ?? null);
  }, [initialEntry, date]);

  const handleSubmit = async () => {
    const activities = [];
    const activityRows = [];

    for (const row of rows) {
      if (!row.type || !row.subtype || !row.quantity) {
        onToast("Please fill out all fields before submitting.", "Error");
        return;
      }
      const config = ACTIVITY_CONFIG[row.type];
      const built = config.build(row.subtype, parseFloat(row.quantity));
      activities.push(built);
      activityRows.push(row);
    }

    const payload = {
      entryId: entryId,
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

    // Use PUT when updating an existing entry, POST when creating a new one
    const method = hasSubmitted ? "PUT" : "POST";
    const res = await fetch("/api/activity", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      onToast(hasSubmitted ? "Failed to update entry." : "Failed to save entry.", "error");
      return;
    }

    onToast(hasSubmitted ? "Entry updated!" : "Entry saved!", "success");

    const saved = await res.json();
    setEntryId(saved.id); 
    setHasSubmitted(true);
    setIsEditing(false);
    onSubmit({ entry: saved, rows });
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    // Restore rows to whatever was last saved
    const restoredRows = initialEntry?.activities?.length
      ? dbActivitiesToRows(initialEntry.activities)
      : [{ id: 0, type: "", subtype: "", quantity: "" }];
    setRows(restoredRows);
    setIsEditing(false);
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
              onChange={(e) => onDateChange(e.target.value)}
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

            {!isLocked && (
              <div className={styles.addWrap}>
                <button
                  className={styles.addBtn}
                  onClick={addRow}
                  aria-label="Add activity"
                >
                  +
                </button>
              </div>
            )}

            <div className={styles.submitWrap}>
              {isLocked ? (
                <button className={styles.submitBtn} onClick={handleEdit}>
                  Edit
                </button>
              ) : (
                <>
                  <button className={styles.submitBtn} onClick={handleSubmit}>
                    {hasSubmitted ? "Update" : "Submit"}
                  </button>
                  {hasSubmitted && (
                    <button
                      className={styles.submitBtn}
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </button>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}