"use client";

import { useState } from "react";
import { ActivityEntry } from "@/classes/activityEntry";
import {ACTIVITY_CONFIG} from "../activityConfig";
import styles from "./dataEntry.module.css"



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
export default function DataEntry({onSubmit}){

    //List of all existing rows
    const [rows, setRows] = useState([{ id: 0, type: "", subtype: "", quantity: "" }]);
    const [nextId, setNextId] = useState(1);
    
    //Date of entry, can be set
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

    //modifying existing rows
    const updateRow = (updatedRow) => {
        //updates row based on id, should be unique so only one row changes
        setRows(rows.map(r => r.id === updatedRow.id ? updatedRow : r));
    };
    const addRow = () => {
        //adds a new row with a unique id, setting default values for input
        setRows([...rows, { id: nextId, type: "", subtype: "", quantity: "" }]);
        setNextId(nextId + 1);
    }
    const removeRow = (rowId) => {
        //filters out row with the same id as the one removed
        setRows(rows.filter(r => r.id !== rowId));
    }

    //collects all rows, builds into activities, then creates an ActivityEntry and submits that
    // to the database.
    const handleSubmit = () => {
        const activities = [];

        //going through each row
        for (const row of rows) {
            //If any of the fields are empty, alert the user and stop submission
            if (!row.type || !row.subtype || !row.quantity) {
                alert("Please fill out all fields before submitting.");
                return;
            }

            //builds the activity using the config table.
            const config = ACTIVITY_CONFIG[row.type];
            activities.push(config.build(row.subtype, parseFloat(row.quantity)));
        }
        
        //Build the activityEntry for the date.
        const entry = new ActivityEntry(activities, new Date(date));

        //TODO: Integrate with Database.
        //For now, just alert what is going to be submitted.
        alert(
        `Submitting entry:\n` +
        activities.map((a, i) => `  ${rows[i].type}: ${rows[i].subtype}, ${rows[i].quantity}`).join("\n") +
        `\nTotal carbon impact: ${entry.totalCarbonImpact}`
        );

        //Passes it back up for the logger to display
        onSubmit({ entry, rows });
    }

    return (
    <>
        <div className={styles.card}>
            {/*Header with date input*/}
            <div className={styles.header}>
                <label className={styles.headerLabel}>
                    Activities for{" "}
                    <input
                    className={styles.dateInput}
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    />
                </label>
            </div>

            {/*Displays Rows*/}
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

            {/*Add Button*/}
            <div className={styles.addWrap}>
                <button className={styles.addBtn} onClick={addRow} aria-label="Add activity"> + </button>
            </div>

            {/*Submit Button*/}
            <div className={styles.submitWrap}>
                <button className={styles.submitBtn} onClick={handleSubmit}>Submit</button>
            </div>

        </div>
    </>
    );
}