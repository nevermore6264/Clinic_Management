"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert } from "react-bootstrap";
import { useAuth } from "@/lib/useAuth";
import { reportsApi, type RevenueReport } from "@/lib/api";
import { LoadingState } from "@/components/LoadingState";
import { getLandingPublic } from "@/lib/landingPublicContent";

function formatNgayIn(s: string): string {
  try {
    const key = (s || "").slice(0, 10);
    const [y, m, d] = key.split("-").map(Number);
    return new Date(y, (m || 1) - 1, d || 1).toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return s || "—";
  }
}

function money(n: number) {
  return `${Math.round(n).toLocaleString("vi-VN")} đ`;
}

function BaoCaoPrintInner() {
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const router = useRouter();
  const lp = getLandingPublic();
  const tuNgay = searchParams.get("tuNgay") ?? "";
  const denNgay = searchParams.get("denNgay") ?? "";
  const [list, setList] = useState<RevenueReport[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) router.replace("/dang-nhap");
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading && user) {
      const ok =
        user.cacVaiTro?.includes("QUAN_TRI") ||
        user.cacVaiTro?.includes("THU_NGAN");
      if (!ok) router.replace("/bang-dieu-khien");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || !tuNgay || !denNgay) return;
    reportsApi
      .revenue(tuNgay, denNgay)
      .then((data) => setList(Array.isArray(data) ? data : []))
      .catch((e) => setError(e instanceof Error ? e.message : "Lỗi tải báo cáo"));
  }, [user, tuNgay, denNgay]);

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

  const ngayIn = useMemo(
    () =>
      new Date().toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    [],
  );

  if (loading) {
    return (
      <div className="bao-cao-print-page py-4">
        <LoadingState />
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className="bao-cao-print-page py-4 px-3 px-md-4">
      <div className="no-print bao-cao-print-toolbar mb-4">
        <div className="bao-cao-print-toolbar__inner">
          <div className="bao-cao-print-toolbar__hint">
            <i className="bi bi-file-earmark-pdf me-2 text-danger" aria-hidden />
            Xem trước báo cáo — chọn <strong>In</strong> → <strong>Lưu dưới dạng PDF</strong>{" "}
            trong hộp thoại máy in.
          </div>
          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-danger d-inline-flex align-items-center gap-2"
              onClick={() => window.print()}
            >
              <i className="bi bi-printer" aria-hidden />
              In / Lưu PDF
            </button>
            <button
              type="button"
              className="btn btn-secondary d-inline-flex align-items-center gap-2"
              onClick={() => router.back()}
            >
              <i className="bi bi-arrow-left" aria-hidden />
              Quay lại
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <Alert variant="danger">{error}</Alert>
      ) : null}

      <div id="bao-cao-print" className="bao-cao-print-sheet">
        <header className="bao-cao-print__masthead">
          <div className="bao-cao-print__brand">
            <div className="bao-cao-print__brand-icon" aria-hidden>
              <i className="bi bi-bar-chart-line-fill" />
            </div>
            <div>
              <div className="bao-cao-print__brand-name">{lp.clinicName}</div>
              <div className="bao-cao-print__brand-line">{lp.addressFull}</div>
              <div className="bao-cao-print__brand-line">ĐT: {lp.phoneDisplay}</div>
            </div>
          </div>
          <div className="bao-cao-print__doc-badge">
            <span className="bao-cao-print__doc-badge-label">Báo cáo</span>
            <span className="bao-cao-print__doc-badge-title">DOANH THU</span>
            <span className="bao-cao-print__doc-badge-meta">
              {tuNgay && denNgay
                ? `${formatNgayIn(tuNgay).split(",")[0] ?? tuNgay} → ${formatNgayIn(denNgay).split(",")[0] ?? denNgay}`
                : "—"}
            </span>
          </div>
        </header>

        <p className="bao-cao-print__meta small text-muted mb-3">
          Kỳ: <strong>{formatNgayIn(tuNgay)}</strong> đến{" "}
          <strong>{formatNgayIn(denNgay)}</strong> · Xuất lúc: {ngayIn}
        </p>

        <div className="bao-cao-print__summary row g-2 mb-3">
          <div className="col-6">
            <div className="bao-cao-print__kpi">
              <span className="bao-cao-print__kpi-label">Tổng doanh thu</span>
              <span className="bao-cao-print__kpi-value">{money(totalRevenue)}</span>
            </div>
          </div>
          <div className="col-6">
            <div className="bao-cao-print__kpi">
              <span className="bao-cao-print__kpi-label">Tổng giao dịch</span>
              <span className="bao-cao-print__kpi-value">
                {totalTx.toLocaleString("vi-VN")}
              </span>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-sm table-bordered bao-cao-print-table mb-0">
            <thead>
              <tr>
                <th className="text-center" style={{ width: "3rem" }}>
                  STT
                </th>
                <th>Ngày</th>
                <th className="text-end">Doanh thu</th>
                <th className="text-center">Giao dịch</th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-muted py-4">
                    Không có dữ liệu trong kỳ đã chọn.
                  </td>
                </tr>
              ) : (
                sortedRows.map((r, i) => (
                  <tr key={r.ngay}>
                    <td className="text-center text-muted">{i + 1}</td>
                    <td>{formatNgayIn(r.ngay ?? "")}</td>
                    <td className="text-end fw-semibold">
                      {money(Number(r.tongDoanhThu ?? 0))}
                    </td>
                    <td className="text-center">
                      {Number(r.soLichHen ?? 0).toLocaleString("vi-VN")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {sortedRows.length > 0 ? (
              <tfoot>
                <tr className="fw-bold">
                  <td colSpan={2} className="text-end">
                    Tổng cộng
                  </td>
                  <td className="text-end">{money(totalRevenue)}</td>
                  <td className="text-center">{totalTx.toLocaleString("vi-VN")}</td>
                </tr>
              </tfoot>
            ) : null}
          </table>
        </div>

        <p className="bao-cao-print__footer small text-muted mt-4 mb-0">
          Báo cáo tổng hợp từ giao dịch thanh toán trên hệ thống. Chỉ dành cho quản trị /
          thu ngân nội bộ.
        </p>
      </div>
    </div>
  );
}

export default function BaoCaoPrintPage() {
  return (
    <Suspense
      fallback={
        <div className="bao-cao-print-page py-4">
          <LoadingState label="Đang tải báo cáo…" />
        </div>
      }
    >
      <BaoCaoPrintInner />
    </Suspense>
  );
}
