"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/header/header";
import Logger from "@/components/logger/logger";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    console.log("LOGIN CLICKED");
    const loggedIn = localStorage.getItem("loggedIn");

    if (!loggedIn) {
      router.push("/auth"); 
    }
  }, []);

  return (
    <>
      <Header />
      <Logger />
    </>
  );
}