"use client";

import Header from "@/components/header/header";
import styles from "./statistics.module.css";
import { useState } from "react";
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

export default function StatisticsPage() {
  const router = useRouter();

  const [range, setRange] = useState("week");
  const [selectedTime, setSelectedTime] = useState("");

  // 📊 Different datasets for each range
  const weeklyData = [
    { date: "Mon", co2: 30 },
    { date: "Tue", co2: 50 },
    { date: "Wed", co2: 40 },
    { date: "Thu", co2: 60 },
    { date: "Fri", co2: 20 },
    { date: "Sat", co2: 10 },
    { date: "Sun", co2: 0 },
  ];

  const monthlyData = [
    { date: "Week 1", co2: 200 },
    { date: "Week 2", co2: 250 },
    { date: "Week 3", co2: 300 },
    { date: "Week 4", co2: 310 },
  ];

  const yearlyData = [
    { date: "Jan", co2: 900 },
    { date: "Feb", co2: 850 },
    { date: "Mar", co2: 1000 },
    { date: "Apr", co2: 1100 },
    { date: "May", co2: 950 },
    { date: "Jun", co2: 1200 },
  ];

  let data = weeklyData;
  let total = 210;
  let highest = 50;
  let lowest = 10;
  let percent = 15;
  let message = "lower";

  if (range === "month") {
    data = monthlyData;
    total = 1060;
    highest = 250;
    lowest = 180;
    percent = 8;
    message = "higher";
  } else if (range === "year") {
    data = yearlyData;
    total = 10900;
    highest = 3000;
    lowest = 2500;
    percent = 12;
    message = "lower";
  }

  return (
    <>
      <Header />

      <div className={styles.container}>
        <div className={styles.card}>

          {/* LEFT SIDE */}
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

            {/* 📈 LINE CHART */}
            <div className={styles.chart}>
              <ResponsiveContainer width="100%" height={300}>
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

          {/* RIGHT SIDE */}
          <div className={styles.right}>
            <h2>Summary</h2>

            <p><strong>Total:</strong> {total} kg CO₂</p>
            <p><strong>Highest:</strong> {highest} kg</p>
            <p><strong>Lowest:</strong> {lowest} kg</p>

            <p>
              This {range}, you were{" "}
              <strong style={{ color: message === "lower" ? "green" : "red" }}>
                {percent}%
              </strong>{" "}
              {message} than your average.
              {message === "lower" ? " Good job!" : " Try to reduce emissions!"}
            </p>

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