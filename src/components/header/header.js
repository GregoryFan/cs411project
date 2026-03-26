import styles from "./header.module.css";

export default function Header() {
    return (
    <nav className={styles.nav}>
      <span className={styles.brand}>Carbon Tracker</span>
      <div className={styles.links}>
        <a className={styles.link} href="#">Record Activity</a>
        <a className={styles.link} href="#">Statistics</a>
        <a className={styles.link} href="#">Compare</a>
        <a className={styles.link} href="#">Login</a>
      </div>
    </nav>
  );
}