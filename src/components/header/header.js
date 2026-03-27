import styles from "./header.module.css";
import Link from "next/link";

export default function Header() {
    return (
    <nav className={styles.nav}>
      <span className={styles.brand}>Carbon Tracker</span>
      <div className={styles.links}>
        <Link className={styles.link} href="/logger">Record Activity</Link>
        <Link className={styles.link} href="/statistics">Statistics</Link>
        <Link className={styles.link} href="/compare">Compare</Link>
        <Link className={styles.link} href="/login">Login</Link>
      </div>
    </nav>
  );
}