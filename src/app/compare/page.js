"use client"

import Header from "@/components/header/header";
import Comparisons from "@/components/compare/comparisons";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/app/lib/supabase/client";

export default function Compare() {

  const router = useRouter();
  const [userId, setUserId] = useState(null);

  useEffect(() => {
  const supabase = createClient(); 
  
  supabase.auth.getSession().then(({ data: { session } }) => {
    
    if (!session) {
          router.push("/auth");
        } else {
          setUserId(session.user.id);
        }
      });
    }, []);

  if (!userId) return null; 


  return (
  <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
    <Header />
    <Comparisons userId={userId} />
  </div>
);
}