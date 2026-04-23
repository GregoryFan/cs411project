"use client";
import { useEffect, useState } from "react";
import styles from "./comparisons.module.css";


const COMPARISONS = [
  {
    key: "cow",
    entity: "A Cow",
    icon: "🐄",
    entityKg: 2500,
    sourceLabel: "EPA",
    sourceUrl: "https://www.epa.gov/ghgemissions/sources-greenhouse-gas-emissions",
    headline: (userKg, entityKg) => {
      const pct = Math.abs(Math.round(((userKg - entityKg) / entityKg) * 100));
      return userKg >= entityKg
        ? `This year, you've made ${pct}% more carbon emissions than a cow on average.`
        : `This year, you've made ${pct}% fewer carbon emissions than a cow on average.`;
    },
    subtext: (userKg, entityKg) => {
      if (userKg >= entityKg) {
        const n = Math.round(userKg / entityKg);
        return `There would need to be ${n} cow${n !== 1 ? "s" : ""} like you to match how much is being produced by cattle right now. (${userKg.toFixed(0)} kg)`;
      }
      return `You're greener than a cow! The average cow emits ${entityKg} kg/yr — you're at ${userKg.toFixed(0)} kg.`;
    },
  },
  {
    key: "flight",
    entity: "A Flight",
    icon: "✈️",
    entityKg: 900,
    sourceLabel: "ICAO",
    sourceUrl: "https://www.icao.int/environmental-protection/Carbonoffset/Pages/default.aspx",
    headline: (userKg) => {
      const flights = Math.round(userKg / 900);
      return `Your yearly footprint equals about ${flights} transatlantic flight${flights !== 1 ? "s" : ""}.`;
    },
    subtext: (userKg) =>
      `One NYC → London flight emits roughly 900 kg of CO₂. You've emitted ${userKg.toFixed(0)} kg this year — that's the equivalent of ${(userKg / 900).toFixed(1)} of those flights.`,
  },
  {
    key: "car",
    entity: "A Car Driver",
    icon: "🚗",
    entityKg: 2100,
    sourceLabel: "DOE",
    sourceUrl: "https://afdc.energy.gov/vehicles/electric_emissions.html",
    headline: (userKg, entityKg) => {
      const pct = Math.abs(Math.round(((userKg - entityKg) / entityKg) * 100));
      return userKg >= entityKg
        ? `You emit ${pct}% more CO₂ than the average car driver per year.`
        : `You emit ${pct}% less CO₂ than the average car driver per year.`;
    },
    subtext: (userKg, entityKg) =>
      `The average car emits ~${entityKg} kg CO₂/year. You're at ${userKg.toFixed(0)} kg — ${userKg < entityKg ? "below" : "above"} the average.`,
  },
  {
    key: "tree",
    entity: "Trees Needed",
    icon: "🌳",
    entityKg: 21,
    sourceLabel: "US Forest Service",
    sourceUrl: "https://www.fs.usda.gov/",
    headline: (userKg, entityKg) => {
      const trees = Math.round(userKg / entityKg);
      return `You'd need ${trees.toLocaleString()} trees to offset your annual emissions.`;
    },
    subtext: (userKg, entityKg) => {
      const trees = Math.round(userKg / entityKg);
      return `A mature tree absorbs about ${entityKg} kg of CO₂ per year. To neutralise your ${userKg.toFixed(0)} kg, you'd need a small forest of ${trees.toLocaleString()} trees.`;
    },
  },
  {
    key: "factory",
    entity: "A Small Factory",
    icon: "🏭",
    entityKg: 50000,
    sourceLabel: "IEA",
    sourceUrl: "https://www.iea.org/topics/industry",
    headline: (userKg, entityKg) => {
      const ratio = Math.round(entityKg / userKg);
      return `A small factory emits roughly ${ratio}× more CO₂ than you per year.`;
    },
    subtext: (userKg) =>
      `A small industrial facility emits around 50,000 kg CO₂/year. You're at ${userKg.toFixed(0)} kg — a fraction of that. Every bit of reduction matters.`,
  },
];

function ComparisonBars({ userKg, entityKg }) {
  const maxKg = Math.max(userKg, entityKg);
  const entityH = Math.max(16, Math.round((entityKg / maxKg) * 80));
  const userH = Math.max(16, Math.round((userKg / maxKg) * 80));

  const fmt = (kg) =>
    kg >= 1000 ? `${(kg / 1000).toFixed(1)}t` : `${Math.round(kg)}kg`;

  return (
    <div className={styles.chartWrap}>
      <div className={styles.chartInner}>
        <div className={styles.barGroup}>
          <span className={styles.barTopLabel}>{fmt(entityKg)}</span>
          <div
            className={`${styles.bar} ${styles.barEntity}`}
            style={{ height: entityH }}
          />
        </div>
        <div className={styles.barGroup}>
          <span className={styles.barTopLabel}>{fmt(userKg)}</span>
          <div
            className={`${styles.bar} ${styles.barUser}`}
            style={{ height: userH }}
          />
        </div>
      </div>
      <div className={styles.xAxis} />
      <div className={styles.barLabels}>
        <span className={styles.barBotLabel}>Entity</span>
        <span className={styles.barBotLabel}>You</span>
      </div>
    </div>
  );
}

export default function Comparisons({ userId }) {
  const [userKg, setUserKg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (!userId) return;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/activity?userId=${userId}&range=year`
        );
        if (!res.ok) throw new Error("Failed to fetch activity data");
        const entries = await res.json();

        // Sum all totalDayCO2 values across the year
        const total = entries.reduce(
          (sum, entry) => sum + (entry.totalDayCO2 ?? 0),
          0
        );
        setUserKg(total);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  const total = COMPARISONS.length;
  const c = COMPARISONS[page];

  const prev = () => setPage((p) => Math.max(0, p - 1));
  const next = () => setPage((p) => Math.min(total - 1, p + 1));

  if (loading) {
    return (
      <div className={styles.card}>
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner} />
          <div className={styles.loadingText}>Crunching your carbon numbers…</div>
        </div>
      </div>
    );
  }

  // --- Error state ---
  if (error || userKg === null) {
    return (
      <div className={styles.card}>
        <div className={styles.loadingState}>
          <span style={{ fontSize: 28 }}>😕</span>
          <div className={styles.loadingText}>
            {error ?? "No data found for this year."}
          </div>
        </div>
      </div>
    );
  }

  const prevLabel = page > 0 ? COMPARISONS[page - 1].entity : null;
  const nextLabel = page < total - 1 ? COMPARISONS[page + 1].entity : null;

  return (
    <div className={styles.card}>
      {/* Navigation row */}
      <div className={styles.navRow}>
        <button
          className={styles.navBtn}
          onClick={prev}
          disabled={page === 0}
          style={{ visibility: page === 0 ? "hidden" : "visible" }}
        >
          ‹ {prevLabel}
        </button>

        <div className={styles.dots}>
          {COMPARISONS.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === page ? styles.dotActive : ""}`}
              onClick={() => setPage(i)}
              aria-label={`Go to comparison ${i + 1}`}
            />
          ))}
        </div>

        <button
          className={styles.navBtn}
          onClick={next}
          disabled={page === total - 1}
          style={{ visibility: page === total - 1 ? "hidden" : "visible" }}
        >
          {nextLabel} ›
        </button>
      </div>

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.left}>
          <div className={styles.entityIcon}>{c.icon}</div>
          <ComparisonBars userKg={userKg} entityKg={c.entityKg} />
          <div className={styles.entityName}>{c.entity}</div>
        </div>

        <div className={styles.right}>
          <p className={styles.headline}>
            {c.headline(userKg, c.entityKg)}
          </p>
          <p className={styles.subtext}>
            {c.subtext(userKg, c.entityKg)}
          </p>
        </div>
      </div>

      {/* Source */}
      <div className={styles.sourceRow}>
        <a
          className={styles.sourceLink}
          href={c.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Source
        </a>
      </div>
    </div>
  );
}
