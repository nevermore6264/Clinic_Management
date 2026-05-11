"use client";

import { useId } from "react";

export function LoginBackgroundDecor() {
  const uid = useId().replace(/:/g, "");
  const gWave = `login-decor-wave-${uid}`;
  const gWave2 = `login-decor-wave2-${uid}`;
  const gWave3 = `login-decor-wave3-${uid}`;
  const gTop = `login-decor-top-${uid}`;
  const gRing = `login-decor-ring-${uid}`;
  const gPill = `login-decor-pill-${uid}`;

  return (
    <div className="login-bg__decor" aria-hidden>
      <div className="login-bg__mesh-layer" />
      <div className="login-bg__noise" />

      <svg
        className="login-bg__rings"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 420 420"
      >
        <defs>
          <linearGradient id={gRing} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.35" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.22" />
          </linearGradient>
        </defs>
        <circle
          cx="210"
          cy="210"
          r="198"
          fill="none"
          stroke={`url(#${gRing})`}
          strokeWidth="1.25"
          strokeDasharray="52 36"
          opacity="0.85"
        />
        <circle
          cx="210"
          cy="210"
          r="158"
          fill="none"
          stroke="rgba(59, 130, 246, 0.14)"
          strokeWidth="1.75"
          strokeDasharray="18 26"
        />
        <circle
          cx="210"
          cy="210"
          r="118"
          fill="none"
          stroke="rgba(14, 165, 233, 0.12)"
          strokeWidth="2"
          strokeDasharray="8 14"
        />
      </svg>

      <svg
        className="login-bg__wave login-bg__wave--top"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 100"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={gTop} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.14" />
            <stop offset="45%" stopColor="#60a5fa" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.11" />
          </linearGradient>
        </defs>
        <path
          fill={`url(#${gTop})`}
          d="M0,0 L1440,0 L1440,42 C1320,78 1080,18 880,46 C680,74 480,22 280,38 C140,48 0,28 0,58 Z"
        />
      </svg>

      <svg
        className="login-bg__glyph login-bg__glyph--cross"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 280 280"
      >
        <circle
          cx="140"
          cy="140"
          r="132"
          fill="none"
          stroke="rgba(37, 99, 235, 0.13)"
          strokeWidth="2"
        />
        <circle
          cx="140"
          cy="140"
          r="108"
          fill="none"
          stroke="rgba(56, 189, 248, 0.12)"
          strokeWidth="1.5"
          strokeDasharray="8 14"
        />
        <path
          d="M140 72v136M72 140h136"
          stroke="rgba(37, 99, 235, 0.16)"
          strokeWidth="20"
          strokeLinecap="round"
        />
      </svg>

      <svg
        className="login-bg__glyph login-bg__glyph--ecg"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 520 100"
      >
        <path
          d="M0 50 H72 L82 50 L92 14 L102 88 L112 50 H188 L198 50 L208 20 L220 82 L232 50 H304 L316 50 L328 12 L342 90 L354 50 H520"
          fill="none"
          stroke="rgba(37, 99, 235, 0.18)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <svg
        className="login-bg__glyph login-bg__glyph--ecg2"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 380 72"
      >
        <path
          d="M0 36 H52 L62 36 L72 8 L82 64 L92 36 H160 L172 36 L182 14 L194 58 L206 36 H380"
          fill="none"
          stroke="rgba(14, 165, 233, 0.16)"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <svg
        className="login-bg__glyph login-bg__glyph--pills"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 340 56"
      >
        <defs>
          <linearGradient id={gPill} x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.18" />
          </linearGradient>
        </defs>
        <rect
          x="4"
          y="14"
          width="100"
          height="28"
          rx="14"
          fill="none"
          stroke={`url(#${gPill})`}
          strokeWidth="1.5"
        />
        <rect
          x="120"
          y="14"
          width="100"
          height="28"
          rx="14"
          fill="none"
          stroke={`url(#${gPill})`}
          strokeWidth="1.5"
          opacity="0.75"
        />
        <rect
          x="236"
          y="14"
          width="100"
          height="28"
          rx="14"
          fill="none"
          stroke={`url(#${gPill})`}
          strokeWidth="1.5"
          opacity="0.55"
        />
        <circle cx="54" cy="28" r="5.5" fill="rgba(37, 99, 235, 0.2)" />
        <circle cx="170" cy="28" r="5.5" fill="rgba(56, 189, 248, 0.2)" />
        <circle cx="286" cy="28" r="5.5" fill="rgba(14, 165, 233, 0.18)" />
      </svg>

      <svg
        className="login-bg__wave login-bg__wave--mid"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={gWave3} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.07" />
          </linearGradient>
        </defs>
        <path
          fill={`url(#${gWave3})`}
          d="M0,80 C180,40 360,120 540,70 C720,20 900,100 1080,55 C1200,28 1320,48 1440,35 L1440,120 L0,120 Z"
        />
      </svg>

      <svg
        className="login-bg__wave login-bg__wave--bottom"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 220"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={gWave} x1="0%" y1="0%" x2="50%" y2="0%">
            <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0.16" />
            <stop offset="35%" stopColor="#2563eb" stopOpacity="0.11" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.14" />
          </linearGradient>
          <linearGradient id={gWave2} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.12" />
          </linearGradient>
        </defs>
        <path
          fill={`url(#${gWave2})`}
          opacity="0.88"
          d="M0,120 C200,180 360,60 540,100 C720,140 880,40 1080,88 C1210,118 1340,98 1440,108 L1440,220 L0,220 Z"
        />
        <path
          fill={`url(#${gWave})`}
          d="M0,148 C220,96 400,188 620,132 C820,82 980,168 1180,124 C1300,102 1380,138 1440,128 L1440,220 L0,220 Z"
        />
      </svg>

      <div className="login-bg__dots" />
      <div className="login-bg__blobs" />
      <div className="login-bg__orb login-bg__orb--warm" />
      <div className="login-bg__orb login-bg__orb--cool" />
      <div className="login-bg__shard login-bg__shard--a" />
      <div className="login-bg__shard login-bg__shard--b" />
    </div>
  );
}
