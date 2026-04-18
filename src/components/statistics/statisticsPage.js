"use client";

import Header from "@/components/header/header";
import styles from "./statistics.module.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/app/lib/supabase/client";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

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
  const [dateRange, setDateRange] = useState({
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    });
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
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const end = new Date(dateRange.endDate);
    end.setHours(0, 0, 0, 0);

    if (end > today) {
      setRawData([]);
      alert("Selected time range is in the future. Please select a valid date.");
      return;
    }
    if (!userId) return;
    const fetchData = async () => {
      try {
        const res = await fetch(
          `/api/activity?userId=${userId}&range=${range}&start=${dateRange.startDate.toISOString()}&end=${dateRange.endDate.toISOString()}`
        );
        const data = await res.json();

          if (data.length === 0) {
          setRawData([]);
          return;
        }

        setRawData(data);
      } catch {
        alert("Data could not be retrieved.");
      }
    };
    fetchData();
  }, [range, userId, dateRange]);

  // Generating the chart data.  
  function generateData(range, rawData) {
    const isCustomRange = true; // since you're using dateRange now
    const result = [];
    //Uses our time selector to pick the dates
    const anchor = dateRange.startDate || new Date();

    if (isCustomRange) {
    const result = [];

    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);

    let current = new Date(start);

    while (current <= end) {
      const dateStr = current.toISOString().split("T")[0];

      const entry = rawData.find(
        (item) => item.date.split("T")[0] === dateStr
      );

      result.push({
        date: current.getDate(), // shows 10, 11, 12...
        co2: entry ? entry.totalDayCO2 : 0,
      });

      current.setDate(current.getDate() + 1);
    }

    return result;
  }
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
        if (itemYear !== year || itemMonth - 1 !== month) return;
        result[itemDay - 1].co2 = item.totalDayCO2;
      });
    }

    if (range === "year") {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      months.forEach((m) => result.push({ date: m, co2: 0 }));

      rawData.forEach((item) => {
        const [itemYear, itemMonth] = item.date.split("-").map(Number);
        const selectedYear = anchor.getFullYear();

        if (itemYear === selectedYear) {
          result[itemMonth - 1].co2 += item.totalDayCO2;
        }
      });
    }

    return result;
  }

  const data = generateData(range, rawData);

const getDisplayLabel = () => {
  const start = dateRange.startDate.toLocaleDateString();
  const end = dateRange.endDate.toLocaleDateString();
  return `${start} - ${end}`;
};

  if (!userId) return null;

  const values = rawData.map((d) => d.totalDayCO2);

  const total = values.reduce((a, b) => a + b, 0);

  let highest = "0";
  let lowest = "0";

  if (rawData.length > 0) {
    const max = rawData.reduce((a, b) =>
      a.totalDayCO2 > b.totalDayCO2 ? a : b
    );
    const min = rawData.reduce((a, b) =>
      a.totalDayCO2 < b.totalDayCO2 ? a : b
    );

    const getDay = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-US", { weekday: "long" });

    highest = `${max.totalDayCO2.toFixed(2)} kg (${getDay(max.date)})`;
    lowest = `${min.totalDayCO2.toFixed(2)} kg (${getDay(min.date)})`;
  }

  const summaryError =
    rawData.length === 0 ? "No data available for this period." : "";

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

            <DateRange
              ranges={[dateRange]}
              onChange={(ranges) => setDateRange(ranges.selection)}
            />

            <p className={styles.displayLabel}>
              Showing: <strong>{getDisplayLabel()}</strong>
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

            <p><strong>Total:</strong> {total.toFixed(2)} kg CO₂</p>
            <p><strong>Highest:</strong> {highest}</p>
            <p><strong>Lowest:</strong> {lowest}</p>
            {summaryError && (
              <p style={{ color: "red", marginTop: "10px" }}>
                {summaryError}
              </p>
            )}

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