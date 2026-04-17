"use client";

import { useState } from "react";
import { createClient } from "@/app/lib/supabase/client";
import styles from "./forgot-password.module.css";

export default function ForgotPasswordPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSendReset = async () => {
    setError(null);
    setMessage(null);

    if (!email) {
      setError("Email is required");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setMessage("Password reset email sent! Check your inbox.");
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Forgot Password</h2>

        <div className={styles.form}>
          <input
            type="email"
            placeholder="Enter your email"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {error && <p className={styles.error}>{error}</p>}
          {message && <p className={styles.success}>{message}</p>}

          <button
            className={styles.button}
            onClick={handleSendReset}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send reset email"}
          </button>
        </div>
      </div>
    </div>
  );
}