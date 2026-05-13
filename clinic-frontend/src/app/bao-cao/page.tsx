"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Form, Alert, Button } from "react-bootstrap";
import { useAuth } from "@/lib/useAuth";
import { reportsApi, type RevenueReport } from "@/lib/api";
import { LoadingState } from "@/components/LoadingState";

function money(n: number) {
  return `${Math.round(n).toLocaleString("vi-VN")} đ`;
}

function isoToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function parseISODate(s: string): Date {
  const key = (s || "").slice(0, 10);
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

function formatNgayBang(s: string): string {
  try {
    return parseISODate(s).toLocaleDateString("vi-VN", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return s || "—";
  }
}

function useRevenueSeries(from: string, to: string, user: { cacVaiTro?: string[] } | null | undefined) {
  const [list, setList] = useState<RevenueReport[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    reportsApi
      .revenue(from, to, undefined, undefined)
      .then((data) => {
        setError("");
        setList(Array.isArray(data) ? data : []);
      })
      .catch((e) => setError(e.message));
  }, [user, from, to]);

  return { list, error, setError };
}

function BarChartBlock({
  title,
  subtitle,
  iconClass,
  rows,
  valueKey,
  formatValue,
  barClass,
  emptyHint,
}: {
  title: string;
  subtitle: string;
  iconClass: string;
  rows: RevenueReport[];
  valueKey: "tongDoanhThu" | "soLichHen";
  formatValue: (n: number) => string;
  barClass: string;
  emptyHint: string;
}) {
  const chartMax = useMemo(() => {
    const raw = Math.max(
      ...rows.map((r) => Number(valueKey === "tongDoanhThu" ? r.tongDoanhThu ?? 0 : r.soLichHen ?? 0)),
      0,
    );
    return raw > 0 ? raw * 1.06 : 1;
  }, [rows, valueKey]);

  return (
    <Card className="bao-cao-chart-card bao-cao-chart-card--solo card--static border-0 shadow-sm h-100">
      <Card.Header className="bao-cao-chart-card__head border-0 pb-0">
        <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap">
          <div>
            <div className="d-flex align-items-center gap-2 fw-bold fs-5 mb-1">
              <i className={`${iconClass} text-primary`} aria-hidden />
              {title}
            </div>
            <p className="small text-muted mb-0">{subtitle}</p>
          </div>
          <span className="badge rounded-pill text-bg-light border fw-semibold px-3 py-2">
            {rows.length ? `${rows.length} điểm` : "Không có dữ liệu"}
          </span>
        </div>
      </Card.Header>
      <Card.Body className="pt-3 d-flex flex-column flex-grow-1">
        {rows.length === 0 ? (
          <div className="bao-cao-chart-empty text-center py-5 px-3 flex-grow-1 d-flex flex-column justify-content-center">
            <div className="bao-cao-chart-empty__icon mx-auto mb-3">
              <i className="bi bi-graph-down" aria-hidden />
            </div>
            <p className="fw-semibold text-body mb-1">Chưa có dữ liệu</p>
            <p className="small text-muted mb-0">{emptyHint}</p>
          </div>
        ) : (
          <div className="bao-cao-chart-scroll flex-grow-1">
            <div
              className="bao-cao-bars bao-cao-bars--tall"
              role="img"
              aria-label={title}
            >
              {rows.map((r) => {
                const raw =
                  valueKey === "tongDoanhThu"
                    ? Number(r.tongDoanhThu ?? 0)
                    : Number(r.soLichHen ?? 0);
                const hPct = Math.round((raw / chartMax) * 100);
                const label = (r.ngay || "").slice(5);
                return (
                  <div key={r.ngay} className="bao-cao-bar-col">
                    <div className="bao-cao-bar-track">
                      <div
                        className={`bao-cao-bar ${barClass}`}
                        style={{ height: `${Math.max(hPct, 4)}%` }}
                        title={`${formatNgayBang(r.ngay)} — ${formatValue(raw)}`}
                      >
                        <span className="visually-hidden">
                          {formatNgayBang(r.ngay)}, {formatValue(raw)}
                        </span>
                      </div>
                    </div>
                    <div className="bao-cao-bar-meta">
                      <span className="bao-cao-bar-date">{label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

export default function ReportsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [from, setFrom] = useState(() => isoDaysAgo(29));
  const [to, setTo] = useState(() => isoToday());
  const { list, error, setError } = useRevenueSeries(from, to, user);

  useEffect(() => {
    if (!loading && !user) router.replace("/dang-nhap");
    if (
      user &&
      !user.cacVaiTro?.includes("QUAN_TRI") &&
      !user.cacVaiTro?.includes("THU_NGAN")
    )
      router.replace("/bang-dieu-khien");
  }, [user, loading, router]);

  const sortedRows = useMemo(
    () => [...list].sort((a, b) => (a.ngay || "").localeCompare(b.ngay || "")),
    [list],
  );

  const totalRevenue = useMemo(
    () => sortedRows.reduce((s, r) => s + Number(r.tongDoanhThu ?? 0), 0),
    [sortedRows],
  );

  const totalTx = useMemo(
    () => sortedRows.reduce((s, r) => s + Number(r.soLichHen ?? 0), 0),
    [sortedRows],
  );

  if (loading) return <LoadingState />;
  if (
    !user?.cacVaiTro?.includes("QUAN_TRI") &&
    !user?.cacVaiTro?.includes("THU_NGAN")
  )
    return null;

  const preset = (days: number) => {
    setFrom(isoDaysAgo(days - 1));
    setTo(isoToday());
  };

  return (
    <div className="bao-cao-page bao-cao-page--charts-only">
      {error && (
        <Alert
          variant="danger"
          dismissible
          onClose={() => setError("")}
          className="border-0 shadow-sm mb-3"
        >
          {error}
        </Alert>
      )}

      <div className="bao-cao-chart-toolbar mb-3">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="d-flex flex-wrap align-items-center gap-2">
            <span className="bao-cao-toolbar-label small text-uppercase fw-bold">
              Kỳ xem
            </span>
            <Form.Control
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="bao-cao-date-input"
            />
            <span className="text-white-50">→</span>
            <Form.Control
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="bao-cao-date-input"
            />
          </div>
          <div className="d-flex flex-wrap gap-1">
            <Button
              type="button"
              size="sm"
              variant="outline-light"
              className="rounded-pill px-3"
              onClick={() => preset(7)}
            >
              7 ngày
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline-light"
              className="rounded-pill px-3"
              onClick={() => preset(30)}
            >
              30 ngày
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline-light"
              className="rounded-pill px-3"
              onClick={() => preset(90)}
            >
              90 ngày
            </Button>
          </div>
        </div>
        <div className="d-flex flex-wrap gap-4 mt-2 small text-white-50">
          <span>
            Tổng doanh thu kỳ:{" "}
            <strong className="text-white">{money(totalRevenue)}</strong>
          </span>
          <span>
            Tổng giao dịch:{" "}
            <strong className="text-white">{totalTx.toLocaleString("vi-VN")}</strong>
          </span>
        </div>
      </div>

      <div className="bao-cao-charts-stack">
        <BarChartBlock
          title="Doanh thu theo ngày"
          subtitle="Cột theo từng ngày trong kỳ — di chuột lên cột để xem số tiền."
          iconClass="bi bi-bar-chart-line-fill"
          rows={sortedRows}
          valueKey="tongDoanhThu"
          formatValue={(n) => money(n)}
          barClass=""
          emptyHint="Thử chọn kỳ rộng hơn hoặc preset 30 / 90 ngày."
        />
        <BarChartBlock
          title="Số giao dịch theo ngày"
          subtitle="Số lượt ghi nhận trong báo cáo theo từng ngày."
          iconClass="bi bi-activity"
          rows={sortedRows}
          valueKey="soLichHen"
          formatValue={(n) => String(Math.round(n))}
          barClass="bao-cao-bar--tx"
          emptyHint="Không có lượt nào trong kỳ đã chọn."
        />
      </div>
    </div>
  );
}
