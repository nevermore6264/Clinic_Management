"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "react-bootstrap";
import type { BaoCaoDoanhThu } from "@/lib/api";

function money(n: number) {
  return `${Math.round(n).toLocaleString("vi-VN")}đ`;
}

function parseNgay(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function normalizeSevenDayRevenue(series: BaoCaoDoanhThu[]): BaoCaoDoanhThu[] {
  const byDay = new Map<string, BaoCaoDoanhThu>();
  for (const r of series) {
    const key = (r.ngay || "").slice(0, 10);
    if (key) byDay.set(key, r);
  }
  const out: BaoCaoDoanhThu[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const key = localDateKey(d);
    const hit = byDay.get(key);
    out.push(hit ?? { ngay: key, tongDoanhThu: 0, soLichHen: 0 });
  }
  return out;
}

type Props = {
  series: BaoCaoDoanhThu[];
  doanhThuTuanNay: number;
};

export function DashboardRevenueCharts({ series, doanhThuTuanNay }: Props) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const filled = useMemo(() => normalizeSevenDayRevenue(series), [series]);

  const { values, max, total, avg, peak, peakLabel } = useMemo(() => {
    const vals = filled.map((r) => Number(r.tongDoanhThu) || 0);
    const mx = Math.max(...vals, 1);
    const tot = vals.reduce((a, b) => a + b, 0);
    const av = vals.length ? tot / vals.length : 0;
    let pi = 0;
    for (let i = 1; i < vals.length; i++) {
      if (vals[i] > vals[pi]) pi = i;
    }
    const pl = filled[pi]?.ngay?.slice(5) ?? "—";
    return {
      values: vals,
      max: mx,
      total: tot,
      avg: av,
      peak: vals[pi] ?? 0,
      peakLabel: pl,
    };
  }, [filled]);

  const pad = 8;
  const w = 100;
  const h = 42;
  const innerW = w - pad * 2;
  const innerH = h - pad * 2;

  const points = useMemo(() => {
    const n = values.length;
    if (n === 0) return "";
    if (n === 1) {
      const y = pad + innerH - (values[0] / max) * innerH;
      return `${pad},${y} ${pad + innerW},${y}`;
    }
    return values
      .map((v, i) => {
        const x = pad + (i / (n - 1)) * innerW;
        const y = pad + innerH - (v / max) * innerH;
        return `${x},${y}`;
      })
      .join(" ");
  }, [values, max, innerW, innerH, pad]);

  const areaD = useMemo(() => {
    const n = values.length;
    if (n === 0) return "";
    const baseY = pad + innerH;
    if (n === 1) {
      const x = pad + innerW / 2;
      const y = pad + innerH - (values[0] / max) * innerH;
      return `M ${pad} ${baseY} L ${x} ${y} L ${pad + innerW} ${baseY} Z`;
    }
    const top = values
      .map((v, i) => {
        const x = pad + (i / (n - 1)) * innerW;
        const y = pad + innerH - (v / max) * innerH;
        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
    return `${top} L ${pad + innerW} ${baseY} L ${pad} ${baseY} Z`;
  }, [values, max, innerW, innerH, pad]);

  const lichValues = useMemo(
    () => filled.map((r) => Number(r.soLichHen) || 0),
    [filled],
  );
  const maxLich = useMemo(() => Math.max(...lichValues, 1), [lichValues]);

  return (
    <div className="mb-4">
      <Card className="dashboard-chart-card card--static border-0 shadow-sm h-100">
        <Card.Header className="d-flex flex-wrap align-items-center justify-content-between gap-2 py-3 border-0 bg-transparent">
          <div className="d-flex align-items-center gap-2 fw-bold">
            <i className="bi bi-graph-up-arrow text-primary" aria-hidden />
            Doanh thu 7 ngày
          </div>
          <Link href="/bao-cao" className="btn btn-sm btn-outline-primary">
            Báo cáo chi tiết
            <i className="bi bi-arrow-right-short ms-1" aria-hidden />
          </Link>
        </Card.Header>
        <Card.Body className="pt-0">
          <div className="dashboard-report-strip mb-3">
            <div className="dashboard-report-strip__item">
              <span className="dashboard-report-strip__label">Tổng 7 ngày</span>
              <strong className="dashboard-report-strip__value">
                {money(total)}
              </strong>
            </div>
            <div className="dashboard-report-strip__item">
              <span className="dashboard-report-strip__label">
                Trung bình / ngày
              </span>
              <strong className="dashboard-report-strip__value">
                {money(avg)}
              </strong>
            </div>
            <div className="dashboard-report-strip__item">
              <span className="dashboard-report-strip__label">
                Cao nhất ({peakLabel})
              </span>
              <strong className="dashboard-report-strip__value">
                {money(peak)}
              </strong>
            </div>
            <div className="dashboard-report-strip__item">
              <span className="dashboard-report-strip__label">
                Tuần này (CN–T7)
              </span>
              <strong className="dashboard-report-strip__value text-primary">
                {money(doanhThuTuanNay)}
              </strong>
            </div>
          </div>

          <div className="dashboard-chart-wrap mb-3">
            <svg
              viewBox={`0 0 ${w} ${h}`}
              className="dashboard-line-svg"
              preserveAspectRatio="none"
              role="img"
              aria-label="Biểu đồ đường doanh thu 7 ngày"
            >
              <defs>
                <linearGradient id="dashRevFill" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="rgb(37, 99, 235)"
                    stopOpacity="0.22"
                  />
                  <stop
                    offset="100%"
                    stopColor="rgb(37, 99, 235)"
                    stopOpacity="0.02"
                  />
                </linearGradient>
              </defs>
              {[0, 0.25, 0.5, 0.75, 1].map((t) => (
                <line
                  key={t}
                  x1={pad}
                  x2={w - pad}
                  y1={pad + innerH * (1 - t)}
                  y2={pad + innerH * (1 - t)}
                  stroke="rgba(15, 23, 42, 0.06)"
                  strokeWidth="0.35"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
              <path d={areaD} fill="url(#dashRevFill)" />
              <polyline
                fill="none"
                stroke="rgb(37, 99, 235)"
                strokeWidth="1.1"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
                vectorEffect="non-scaling-stroke"
              />
              {values.map((v, i) => {
                const n = values.length;
                const x =
                  n === 1
                    ? pad + innerW / 2
                    : pad + (i / Math.max(1, n - 1)) * innerW;
                const y = pad + innerH - (v / max) * innerH;
                const active = hoverIdx === i;
                return (
                  <circle
                    key={filled[i].ngay}
                    cx={x}
                    cy={y}
                    r={active ? 1.8 : 1.15}
                    fill="#fff"
                    stroke="rgb(37, 99, 235)"
                    strokeWidth="0.65"
                    className="dashboard-line-dot"
                    onMouseEnter={() => setHoverIdx(i)}
                    onMouseLeave={() => setHoverIdx(null)}
                  />
                );
              })}
            </svg>
            {hoverIdx != null && filled[hoverIdx] && (
              <div className="dashboard-chart-tooltip" role="status">
                <strong>{filled[hoverIdx].ngay}</strong>
                <span>{money(Number(filled[hoverIdx].tongDoanhThu) || 0)}</span>
                {filled[hoverIdx].soLichHen != null ? (
                  <span className="text-muted small">
                    {filled[hoverIdx].soLichHen} giao dịch TT
                  </span>
                ) : null}
              </div>
            )}
          </div>

          <div className="dashboard-bar-row" role="list">
            {filled.map((r, i) => {
              const v = Number(r.tongDoanhThu) || 0;
              const pct = Math.max(6, (v / max) * 100);
              const label = r.ngay?.slice(5) ?? "";
              const dow = parseNgay(r.ngay).toLocaleDateString("vi-VN", {
                weekday: "short",
              });
              return (
                <div
                  key={r.ngay}
                  className="dashboard-bar-cell"
                  role="listitem"
                  onMouseEnter={() => setHoverIdx(i)}
                  onMouseLeave={() => setHoverIdx(null)}
                >
                  <div
                    className="dashboard-bar-pillar"
                    style={{ height: `${pct}%` }}
                    title={`${r.ngay}: ${money(v)}`}
                  />
                  <span className="dashboard-bar-meta" title={r.ngay}>
                    <abbr title={dow} className="text-decoration-none">
                      {label}
                    </abbr>
                  </span>
                </div>
              );
            })}
          </div>

          {lichValues.some((x) => x > 0) && (
            <div className="dashboard-lich-subchart mt-4 pt-3 border-top">
              <div className="small fw-bold text-secondary mb-2">
                <i className="bi bi-receipt me-1" aria-hidden />
                Giao dịch thanh toán / ngày (7 ngày)
              </div>
              <div className="dashboard-lich-bars">
                {filled.map((r, i) => {
                  const c = lichValues[i] || 0;
                  const pct = Math.max(4, (c / maxLich) * 100);
                  return (
                    <div
                      key={`l-${r.ngay}`}
                      className="dashboard-lich-cell"
                      onMouseEnter={() => setHoverIdx(i)}
                      onMouseLeave={() => setHoverIdx(null)}
                    >
                      <div
                        className="dashboard-lich-pillar"
                        style={{ height: `${pct}%` }}
                        title={`${r.ngay}: ${c} giao dịch`}
                      />
                      <span className="dashboard-lich-val">
                        {c > 0 ? c : "—"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
