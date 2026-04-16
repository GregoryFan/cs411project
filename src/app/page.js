"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/app/lib/supabase/client";
import Header from "@/components/header/header";
import Logger from "@/components/logger/logger";

export default function Home() {
  const router = useRouter();
  const [userId, setUserId] = useState(null);

  useEffect(() => {
  const supabase = createClient(); 
  
  supabase.auth.getSession().then(({ data: { session } }) => {
    console.log("session:", session);
    console.log("userId:", session?.user?.id);
    
    if (!session) {
          router.push("/auth");
        } else {
          setUserId(session.user.id);
        }
      });
    }, []);

  if (!userId) return null; 

  return (
    <>
      <Header />
      <Logger userId={userId} />
    </>
  );
}