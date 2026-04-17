"use client";
import Header from "../../components/header/header";
import styles from "./loginPage.module.css";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "../../app/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError(null);
    setFieldErrors({});


    if (!password) {
      setFieldErrors({ password: "Password is required" });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ userName })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        setLoading(false);
        return;
      }

      const supabase = createClient();

      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      router.push("/statistics");
    } catch {
      setError("Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />

      <div className={styles.container}>
        <div className={styles.card}>
          <h2 className={styles.title}>Welcome Back</h2>

          <div className={styles.form}>
            <input
              type="text"
              placeholder="Username"
              className={styles.input}
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              className={`${styles.input} ${
                fieldErrors.password ? styles.inputError : ""
              }`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <p className = {styles.footer}>
              <span onClick={() => router.push("/forgot-password")}>
                Forgot your password?
              </span>
            </p>

            {fieldErrors.password && (
              <p className={styles.fieldError}>
                {fieldErrors.password}
              </p>
            )}

            {error && (
              <p className={styles.error}>{error}</p>
            )}

            <button
              className={styles.button}
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
            
            <p className={styles.footer}>
              <span onClick={() => router.push("/signup")}>
                Sign up
              </span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}