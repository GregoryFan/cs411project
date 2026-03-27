"use client";

import Header from "@/components/header/header";
import styles from "./statistics.module.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StatisticsPage() {
  const router = useRouter();

  const [range, setRange] = useState("week");
  const [selectedTime, setSelectedTime] = useState("");

let total = 0;
let highest = 0;
let lowest = 0;
let percent = 0;
let message = "";

if (range === "week") {
  total = 210;
  highest = 50;
  lowest = 10;
  percent = 15;
  message = "lower";
} else if (range === "month") {
  total = 1060;
  highest = 250;
  lowest = 180;
  percent = 8;
  message = "higher";
} else if (range === "year") {
  total = 10900;
  highest = 3000;
  lowest = 2500;
  percent = 12;
  message = "lower";
}

  if (range === "week") {
    percent = 15;
    message = "lower";
  } else if (range === "month") {
    percent = 8;
    message = "higher";
  } else if (range === "year") {
    percent = 12;
    message = "lower";
  }

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
              
            </div>
          </div>

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