"use client";

import Link from "next/link";
import Header from "@/components/header/header";
import styles from "./auth.module.css";

export default function AuthPage() {
  return (
    <>
      <Header />

      <div className={styles.container}>
        <div className={styles.card}>
          <h2>Welcome to Carbon Tracker</h2>
          <p>Please log in or create an account to continue</p>

          <div className={styles.buttons}>
            <Link href="/login" className={styles.button}>
              Login
            </Link>

            <Link href="/register" className={styles.buttonAlt}>
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}