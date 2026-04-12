"use client";
import styles from "./header.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/app/lib/supabase/client";

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const supabase = createClient();

    //get current user on load
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    //listen for auth changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <nav className={styles.nav}>
      <span className={styles.brand}>Carbon Tracker</span>
      <div className={styles.links}>
        <Link className={styles.link} href="/">Record Activity</Link>
        <Link className={styles.link} href="/statistics">Statistics</Link>
        <Link className={styles.link} href="/compare">Compare</Link>
        {user
          ? <button className={styles.link} onClick={handleLogout}>Logout</button>
          : <Link className={styles.link} href="/login">Login</Link>
        }
      </div>
    </nav>
  );
}