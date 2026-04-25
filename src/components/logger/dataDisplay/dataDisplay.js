import styles from "./dataDisplay.module.css";
import { ACTIVITY_CONFIG } from "../activityConfig";

export default function DataDisplay({ entry, loading }) {
  return (
    <div className={styles.card}>
      <h3 className={styles.title}>
        Estimated Carbon <br />
        Emitted
      </h3>

      <hr className={styles.divider} />

      {loading ? (
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner}></div>
          <span className={styles.loadingText}>Loading emissions...</span>
        </div>
      ) : !entry ? (
        <p className={styles.empty}>No entries yet.</p>
      ) : (
        <>
          <div className={styles.entries}>
            {entry.rows.map((row, i) => (
              <div key={i} className={styles.entryRow}>
                <span className={styles.icon}>
                  {ACTIVITY_CONFIG[row.type]?.icon ?? "?"}
                </span>

                <div className={styles.labels}>
                  <span className={styles.subtype}>{row.subtype}</span>
                  <span className={styles.quantity}>
                    {row.quantity} {ACTIVITY_CONFIG[row.type]?.unit}
                  </span>
                </div>

                <div className={styles.carbon}>
                  <span className={styles.amount}>
                    {entry.entry.activities[i].carbonImpact.toFixed(2)}
                  </span>
                  <span className= {styles.unit}> kg </span>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.total}>
            <span>Total:</span>
            <span>{(entry.entry.totalDayCO2).toFixed(2)} kg</span>
          </div>
        </>
      )}
    </div>
  );
}