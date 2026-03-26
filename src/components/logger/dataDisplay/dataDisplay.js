import styles from "./dataDisplay.module.css";
import {ACTIVITY_CONFIG} from "../activityConfig";

export default function DataDisplay({ entry }) {
   if (!entry) return (
    <div className={styles.card}>
      <h3 className={styles.title}>Estimated Carbon Emitted Today</h3>
      <hr className={styles.divider} />
      <p className={styles.empty}>No entries yet.</p>
    </div>
  );

  const { entry: activityEntry, rows } = entry;

  return (
    <div className={styles.card}>
        <h3 className={styles.title}>Estimated Carbon<br />Emitted Today</h3>
        <hr className={styles.divider} />

        <div className={styles.entries}>
        {rows.map((row, i) => (
          <div key={i} className={styles.entryRow}>
            <span className={styles.icon}>
              {ACTIVITY_CONFIG[row.type]?.icon ?? "?"}
            </span>
            <div className={styles.labels}>
              <span className={styles.subtype}>{row.subtype}</span>
              <span className={styles.quantity}>{row.quantity} {ACTIVITY_CONFIG[row.type]?.unit}</span>
            </div>
            <div className={styles.carbon}>
              <span className={styles.amount}>{activityEntry.activities[i].carbonImpact}</span>
              <span className={styles.unit}>kg</span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.total}>
        <span>Total:</span>
        <span>{activityEntry.totalCarbonImpact} kg</span>
      </div>
    </div>
  );
}