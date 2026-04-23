"use client";

import Header from "@/components/header/header";
import styles from "./statistics.module.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/app/lib/supabase/client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";


export default function StatisticsPage() {
  const [userId, setUserId] = useState(null);
  const router = useRouter();

  const [range, setRange] = useState("week");
  const [selectedTime, setSelectedTime] = useState(new Date().toISOString().split("T")[0]);
  const [rawData, setRawData] = useState([]);

  //Get User id, they should have one (they would be redirected if they weren't logged in.)
  useEffect(() => {
  const supabase = createClient();
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (!session) router.push("/auth");
    else setUserId(session.user.id);
    });
  }, []);


  // Fetching Data from API
   useEffect(() => {
    if (!userId) return;
    const fetchData = async () => {
      const res = await fetch(
        `/api/activity?userId=${userId}&range=${range}&date=${selectedTime}`
      );
      const data = await res.json();
      setRawData(data);
    };
    fetchData();
  }, [range, userId, selectedTime]);

  // Generating the chart data.  
  function generateData(range, rawData) {
    const result = [];
    //Uses our time selector to pick the dates
    const anchor = selectedTime ? new Date(selectedTime + "T12:00:00") : new Date();

    if (range === "week") {
      const dayOfWeek = (anchor.getDay() + 6) % 7; 
      const monday = new Date(anchor);
      monday.setDate(anchor.getDate() - dayOfWeek);

      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      days.forEach((d, i) => {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        result.push({ date: d, co2: 0, fullDate: date.toISOString().split("T")[0] });
      });

      rawData.forEach((item) => {
        const slot = result.find((r) => r.fullDate === item.date.split("T")[0]);
        if (slot) slot.co2 = item.totalDayCO2;
      });
    }

    if (range === "month") {
      const year = anchor.getFullYear();
      const month = anchor.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      for (let i = 1; i <= daysInMonth; i++) {
        result.push({ date: `${i}`, co2: 0 });
      }

      rawData.forEach((item) => {
       const dateStr = item.date.split("T")[0];
       const [itemYear, itemMonth, itemDay] = dateStr.split("-").map(Number);
        // Skip if this entry doesn't belong to the displayed month/year
        if (itemYear !== year || itemMonth - 1 !== month) return;
        result[itemDay - 1].co2 = item.totalDayCO2;
      });
    }

    if (range === "year") {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      months.forEach((m) => result.push({ date: m, co2: 0 }));

      rawData.forEach((item) => {
        const [, month] = item.date.split("-").map(Number);
        result[month - 1].co2 += item.totalDayCO2;
      });
    }

    return result;
  }

  const data = generateData(range, rawData);

  function getDisplayLabel(range, selectedTime) {
    const anchor = selectedTime ? new Date(selectedTime + "T12:00:00") : new Date();

    if (range === "week") {
      const dayOfWeek = (anchor.getDay() + 6) % 7;
      const monday = new Date(anchor);
      monday.setDate(anchor.getDate() - dayOfWeek);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      const fmt = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      return `Week of ${fmt(monday)} – ${fmt(sunday)}`;
    }

    if (range === "month") {
      return anchor.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    }

    if (range === "year") {
      return `${anchor.getFullYear()}`;
    }
  }

  if (!userId) return null;

  // Creating the Sumamry portion
  const values = rawData.map((d) => d.totalDayCO2);
  const total = values.reduce((a, b) => a + b, 0);
  const highest = values.length ? Math.max(...values) : 0;
  const lowest = values.length ? Math.min(...values) : 0;

  return (
    <>
      <Header />

      <div className={styles.container}>
        <div className={styles.card}>

          <div className={styles.left}>
            <h3>Carbon Emission Makeup</h3>

            <div className={styles.controls}>
              <button
                className={range === "week" ? styles.active : ""}
                onClick={() => setRange("week")}
              >
                Weekly
              </button>

              <button
                className={range === "month" ? styles.active : ""}
                onClick={() => setRange("month")}
              >
                Monthly
              </button>

              <button
                className={range === "year" ? styles.active : ""}
                onClick={() => setRange("year")}
              >
                Yearly
              </button>
            </div>

            <input
              type="date"
              className={styles.datePicker}
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
            />

            <p className={styles.displayLabel}>
              Showing: <strong>{getDisplayLabel(range, selectedTime)}</strong>
            </p>

            <div className={styles.chart}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="co2"
                    stroke="#2e7d6b"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className={styles.right}>
            <h2>Summary</h2>

            <p><strong>Total:</strong> {total} kg CO₂</p>
            <p><strong>Highest:</strong> {highest} kg</p>
            <p><strong>Lowest:</strong> {lowest} kg</p>

            <button
              className={styles.returnButton}
              onClick={() => router.push("/")}
            >
              Return to Dashboard
            </button>
          </div>

        </div>
      </div>
    </>
  );
}