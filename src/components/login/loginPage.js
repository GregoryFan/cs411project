"use client";

import Header from "@/components/header/header";
import styles from "./loginPage.module.css";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = () => {
    localStorage.setItem("loggedIn", "false");

    router.push("/");
  };

  return (
    <>
      <Header />

      <div className={styles.container}>
        <div className={styles.card}>
          <h2 className={styles.title}>Welcome Back</h2>

          <div className={styles.form}>
            <input type="email" placeholder="Email" className={styles.input} />
            <input type="password" placeholder="Password" className={styles.input} />

            <button className={styles.button} onClick={handleLogin}>
              Login
            </button>

            <p className={styles.footer}>
              Don’t have an account? <span>Sign up</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}