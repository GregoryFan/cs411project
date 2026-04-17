"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/app/lib/supabase/client";
import styles from "./reset-password.module.css";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Optional: ensure user has valid session from reset link
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        setError("Invalid or expired reset link.");
      }
    };

    checkSession();
  }, []);

  const handleUpdatePassword = async () => {
    setError(null);
    setMessage(null);

    if (!password) {
      setError("Password is required");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setMessage("Password updated successfully!");

    // optional redirect
    setTimeout(() => {
      router.push("/login");
    }, 1500);
  };

  return (
    <div className={styles.container}>
        <div className={styles.card}>
                <h2 className={styles.title}>Reset Password</h2>

                <div className={styles.form}>

                <input
                type="password"
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                />

                <input
                type="password"
                placeholder="Confirm password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={styles.input}
                />

            {error && <p className={styles.error}>{error}</p>}
            {message && <p className={styles.success}>{message}</p>}

            <button className={styles.button}>
                Update password
            </button>
            </div>
         </div>
    </div>
  )
}