"use client";
import styles from "./header.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/app/lib/supabase/client";

export default function Header() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const supabase = createClient();

    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      setUser(user);

      if (user) {
        const res = await fetch(`/api/user?userId=${user.id}`);
        const data = await res.json();

        setUserName(data?.userName ?? "");
      }
    };

    loadUser();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <nav className={styles.nav}>
      <div>
        <div className={styles.brand}>Carbon Tracker</div>

        {userName && (
          <div className={styles.subHeader}>
            Welcome, {userName}
          </div>
        )}
      </div>

      <div className={styles.links}>
        <Link className={styles.link} href="/">Record Activity</Link>
        <Link className={styles.link} href="/statistics">Statistics</Link>
        <Link className={styles.link} href="/compare">Compare</Link>

        {user ? (
          <button className={styles.link} onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <Link className={styles.link} href="/login">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}