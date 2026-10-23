'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export function CountUpValue({ value }) {
  const target = Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : 0;
  const ref = useRef(null);
  const [count, setCount] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    let frame = 0;
    let startedAt = 0;
    let visible = false;
    const duration = 780;

    const animate = (now) => {
      if (!visible) return;
      if (!startedAt) startedAt = now;
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - (1 - progress) ** 4;
      setCount(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) {
        if (reduceMotion) { setCount(target); return; }
        startedAt = 0;
        setCount(0);
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(animate);
      } else {
        cancelAnimationFrame(frame);
      }
    }, { threshold: 0.35 });

    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [target, reduceMotion]);

  return <span ref={ref} aria-label={String(target)}>{count.toLocaleString()}</span>;
}

function makePath(values, max, width, height, inset) {
  const plotWidth = width - inset * 2;
  const plotHeight = height - inset * 2;
  const points = values.map((value, index) => ({
    x: inset + (values.length <= 1 ? 0 : index * plotWidth / (values.length - 1)),
    y: height - inset - (Math.max(0, value) / max) * plotHeight,
  }));
  return points.map((point, index) => `${index ? 'L' : 'M'}${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(' ');
}

export default function DashboardActivityChart({ activity = [] }) {
  const chartRef = useRef(null);
  const [active, setActive] = useState(false);
  const reduceMotion = useReducedMotion();
  const width = 720;
  const height = 190;
  const inset = 12;
  const successes = activity.map((point) => Number(point.successes) || 0);
  const failures = activity.map((point) => Number(point.failures) || 0);
  const maximum = Math.max(1, ...successes.map((value, index) => value + failures[index]));
  const successPath = makePath(successes, maximum, width, height, inset);
  const failurePath = makePath(failures, maximum, width, height, inset);

  useEffect(() => {
    const node = chartRef.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { threshold: 0.25 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={chartRef} className="dashboard-activity-chart">
      <div className="dashboard-chart-legend" aria-hidden="true">
        <span><i className="chart-legend-success" />Successful sign-ins</span>
        <span><i className="chart-legend-failure" />Failed attempts</span>
      </div>
      <svg className="dashboard-chart-svg" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" role="img" aria-label="Daily successful and failed sign-ins during the last 30 days">
        <title>Daily authentication activity for the last 30 days</title>
        {[0.25, 0.5, 0.75, 1].map((fraction) => {
          const y = (height - inset) - (height - inset * 2) * fraction;
          return <line key={fraction} x1={inset} x2={width - inset} y1={y} y2={y} className="dashboard-chart-gridline" />;
        })}
        {activity.length > 1 && <>
          <motion.path d={successPath} className="dashboard-chart-success" initial={{ pathLength: 0 }} animate={{ pathLength: active ? 1 : 0 }} transition={{ duration: reduceMotion ? 0 : 1.05, ease: 'easeOut' }} />
          <motion.path d={failurePath} className="dashboard-chart-failure" initial={{ pathLength: 0 }} animate={{ pathLength: active ? 1 : 0 }} transition={{ duration: reduceMotion ? 0 : 0.75, delay: reduceMotion ? 0 : 0.12, ease: 'easeOut' }} />
        </>}
      </svg>
      <div className="dashboard-chart-dates" aria-hidden="true">
        <span>{activity[0]?.day || '30 days ago'}</span>
        <span>{activity[Math.floor((activity.length - 1) / 2)]?.day || '15 days ago'}</span>
        <span>{activity.at(-1)?.day || 'Today'}</span>
      </div>
      {!successes.some(Boolean) && !failures.some(Boolean) && <p className="dashboard-chart-empty">{activity.length ? 'No sign-in activity recorded in this period.' : 'Authentication history is not available yet.'}</p>}
    </div>
  );
}
