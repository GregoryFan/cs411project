"use client";

import Header from "@/components/header/header";
import styles from "./statistics.module.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

  const userId = "39dcd990-0a0c-4a02-a3ca-31e9aabacea1";

export default function StatisticsPage() {
  const router = useRouter();

  const [range, setRange] = useState("week");
  const [selectedTime, setSelectedTime] = useState("");
  const [rawData, setRawData] = useState([]);


  // Fetching Data from API
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(
        `/api/activity?userId=${userId}&range=${range}`
      );
      const data = await res.json();
      setRawData(data);
    };

    fetchData();
  }, [range, userId]);

  // Generating the chart data.  
  function generateData(range, rawData) {
    const result = [];

    if (range === "week") {
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

      days.forEach((d) => result.push({ date: d, co2: 0 }));

      rawData.forEach((item) => {
        const d = new Date(item.date);
        const index = (d.getDay() + 6) % 7; // Monday = 0
        result[index].co2 = item.totalDayCO2;
      });
    }

    if (range === "month") {
      const daysInMonth = new Date().getDate(); // current day

      for (let i = 1; i <= daysInMonth; i++) {
        result.push({ date: `${i}`, co2: 0 });
      }

      rawData.forEach((item) => {
        const d = new Date(item.date);
        const day = d.getDate();
        result[day - 1].co2 = item.totalDayCO2;
      });
    }

    if (range === "year") {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

      months.forEach((m) => result.push({ date: m, co2: 0 }));

      rawData.forEach((item) => {
        const d = new Date(item.date);
        const month = d.getMonth();
        result[month].co2 += item.totalDayCO2;
      });
    }

    return result;
  }

  const data = generateData(range, rawData);

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