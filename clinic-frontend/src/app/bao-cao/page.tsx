"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  Table,
  Form,
  Alert,
  Button,
  Row,
  Col,
  Badge,
} from "react-bootstrap";
import { useAuth } from "@/lib/useAuth";
import {
  reportsApi,
  doctorsApi,
  servicesApi,
  type RevenueReport,
  type BacSi,
  type DichVu,
} from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { LoadingState } from "@/components/LoadingState";

function money(n: number) {
  return `${Math.round(n).toLocaleString("vi-VN")} đ`;
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

export default function ReportsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [list, setList] = useState<RevenueReport[]>([]);
  const [doctors, setDoctors] = useState<BacSi[]>([]);
  const [services, setServices] = useState<DichVu[]>([]);
  const [from, setFrom] = useState(() => new Date().toISOString().slice(0, 10));
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [doctorId, setDoctorId] = useState<string>("");
  const [serviceId, setServiceId] = useState<string>("");
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/dang-nhap");
    if (
      user &&
      !user.cacVaiTro?.includes("QUAN_TRI") &&
      !user.cacVaiTro?.includes("THU_NGAN")
    )
      router.replace("/bang-dieu-khien");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    doctorsApi
      .list()
      .then(setDoctors)
      .catch(() => {});
    servicesApi
      .list()
      .then(setServices)
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const dId = doctorId ? Number(doctorId) : undefined;
    const sId = serviceId ? Number(serviceId) : undefined;
    reportsApi
      .revenue(from, to, dId, sId)
      .then((data) => {
        setError("");
        setList(Array.isArray(data) ? data : []);
      })
      .catch((e) => setError(e.message));
  }, [user, from, to, doctorId, serviceId]);

  const handleExport = async () => {
    setExporting(true);
    setError("");
    try {
      const blob = await reportsApi.exportExcel(
        from,
        to,
        doctorId ? Number(doctorId) : undefined,
        serviceId ? Number(serviceId) : undefined,
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bao-cao-doanh-thu-${from}-${to}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xuất Excel thất bại");
    } finally {
      setExporting(false);
    }
  };

  const sortedRows = useMemo(
    () => [...list].sort((a, b) => (a.ngay || "").localeCompare(b.ngay || "")),
    [list],
  );

  const totalRevenue = useMemo(
    () => sortedRows.reduce((s, r) => s + Number(r.tongDoanhThu ?? 0), 0),
    [sortedRows],
  );

  const totalTransactions = useMemo(
    () => sortedRows.reduce((s, r) => s + Number(r.soLichHen ?? 0), 0),
    [sortedRows],
  );

  const dayCount = sortedRows.length;

  const avgPerDay = useMemo(
    () => (dayCount ? totalRevenue / dayCount : 0),
    [dayCount, totalRevenue],
  );

  const peak = useMemo(() => {
    let bestNgay = "";
    let bestVal = 0;
    for (const r of sortedRows) {
      const v = Number(r.tongDoanhThu ?? 0);
      if (v > bestVal) {
        bestVal = v;
        bestNgay = r.ngay || "";
      }
    }
    return { ngay: bestNgay, val: bestVal };
  }, [sortedRows]);

  const chartMax = useMemo(() => {
    const raw = Math.max(...sortedRows.map((r) => Number(r.tongDoanhThu ?? 0)), 0);
    return raw > 0 ? raw * 1.06 : 1;
  }, [sortedRows]);

  const tenBacSiLoc = useMemo(() => {
    if (!doctorId) return "";
    const d = doctors.find((x) => String(x.id) === doctorId);
    return d?.hoTen ?? "";
  }, [doctorId, doctors]);

  const tenDichVuLoc = useMemo(() => {
    if (!serviceId) return "";
    const s = services.find((x) => String(x.id) === serviceId);
    return s?.ten ?? "";
  }, [serviceId, services]);

  if (loading) return <LoadingState />;
  if (
    !user?.cacVaiTro?.includes("QUAN_TRI") &&
    !user?.cacVaiTro?.includes("THU_NGAN")
  )
    return null;

  return (
    <div className="bao-cao-page">
      <div className="bao-cao-hero mb-4">
        <div className="bao-cao-hero__glow" aria-hidden />
        <Row className="align-items-end g-3">
          <Col lg={8}>
            <PageHeader
              title="Báo cáo doanh thu"
              subtitle="So sánh theo ngày trong khoảng thời gian bạn chọn. Lọc theo bác sĩ hoặc dịch vụ để xem chi tiết — xuất Excel khi cần gửi kế toán."
            />
          </Col>
          <Col lg={4} className="text-lg-end">
            <Button
              variant="light"
              className="bao-cao-btn-excel shadow-sm fw-semibold px-4 py-2"
              onClick={handleExport}
              disabled={exporting}
            >
              <i className="bi bi-file-earmark-spreadsheet-fill me-2 text-success" aria-hidden />
              {exporting ? "Đang xuất…" : "Xuất Excel"}
            </Button>
          </Col>
        </Row>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")} className="border-0 shadow-sm">
          {error}
        </Alert>
      )}

      <Card className="bao-cao-filters card--static border-0 shadow-sm mb-4">
        <Card.Body className="p-3 p-md-4">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
            <div className="d-flex align-items-center gap-2">
              <span className="rounded-3 bg-primary-subtle text-primary p-2 d-inline-flex">
                <i className="bi bi-sliders2" aria-hidden />
              </span>
              <div>
                <div className="fw-bold text-body">Bộ lọc</div>
                <div className="small text-muted">Chọn kỳ và (tuỳ chọn) bác sĩ / dịch vụ</div>
              </div>
            </div>
            {(tenBacSiLoc || tenDichVuLoc) && (
              <div className="d-flex flex-wrap gap-1 justify-content-end">
                {tenBacSiLoc ? (
                  <Badge bg="primary" className="fw-semibold rounded-pill px-3 py-2">
                    BS: {tenBacSiLoc}
                  </Badge>
                ) : null}
                {tenDichVuLoc ? (
                  <Badge bg="info" text="dark" className="fw-semibold rounded-pill px-3 py-2">
                    DV: {tenDichVuLoc}
                  </Badge>
                ) : null}
              </div>
            )}
          </div>
          <Row className="g-3 align-items-end">
            <Col xs={12} sm={6} md={3}>
              <Form.Label className="bao-cao-filter-label small text-uppercase text-muted fw-bold">
                Từ ngày
              </Form.Label>
              <Form.Control
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="border-secondary-subtle"
              />
            </Col>
            <Col xs={12} sm={6} md={3}>
              <Form.Label className="bao-cao-filter-label small text-uppercase text-muted fw-bold">
                Đến ngày
              </Form.Label>
              <Form.Control
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="border-secondary-subtle"
              />
            </Col>
            <Col xs={12} md={3}>
              <Form.Label className="bao-cao-filter-label small text-uppercase text-muted fw-bold">
                Bác sĩ
              </Form.Label>
              <Form.Select
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                className="border-secondary-subtle"
              >
                <option value="">Tất cả bác sĩ</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.hoTen}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col xs={12} md={3}>
              <Form.Label className="bao-cao-filter-label small text-uppercase text-muted fw-bold">
                Dịch vụ
              </Form.Label>
              <Form.Select
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                className="border-secondary-subtle"
              >
                <option value="">Tất cả dịch vụ</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.ten}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <div className="dashboard-report-strip mb-4">
        <div className="dashboard-report-strip__item bao-cao-kpi bao-cao-kpi--revenue">
          <span className="dashboard-report-strip__label">Tổng doanh thu</span>
          <strong className="dashboard-report-strip__value">{money(totalRevenue)}</strong>
          <span className="bao-cao-kpi__hint">{dayCount} ngày trong kỳ</span>
        </div>
        <div className="dashboard-report-strip__item bao-cao-kpi">
          <span className="dashboard-report-strip__label">Trung bình / ngày</span>
          <strong className="dashboard-report-strip__value">{money(avgPerDay)}</strong>
          <span className="bao-cao-kpi__hint">Trên các ngày có dữ liệu</span>
        </div>
        <div className="dashboard-report-strip__item bao-cao-kpi">
          <span className="dashboard-report-strip__label">Tổng giao dịch</span>
          <strong className="dashboard-report-strip__value">
            {totalTransactions.toLocaleString("vi-VN")}
          </strong>
          <span className="bao-cao-kpi__hint">Số lượt (theo báo cáo)</span>
        </div>
        <div className="dashboard-report-strip__item bao-cao-kpi">
          <span className="dashboard-report-strip__label">Ngày cao nhất</span>
          <strong className="dashboard-report-strip__value text-primary">
            {peak.val > 0 ? money(peak.val) : "—"}
          </strong>
          <span className="bao-cao-kpi__hint">
            {peak.ngay ? formatNgayBang(peak.ngay) : "Chưa có dữ liệu"}
          </span>
        </div>
      </div>

      <Card className="bao-cao-chart-card card--static border-0 shadow-sm mb-4">
        <Card.Header className="bao-cao-chart-card__head d-flex flex-wrap align-items-center justify-content-between gap-2 border-0">
          <div className="d-flex align-items-center gap-2 fw-bold">
            <i className="bi bi-bar-chart-line-fill text-primary" aria-hidden />
            Doanh thu theo ngày
          </div>
          <span className="small text-muted">
            {sortedRows.length ? `${sortedRows.length} điểm dữ liệu` : "Chưa có dữ liệu trong kỳ"}
          </span>
        </Card.Header>
        <Card.Body className="pt-0">
          {sortedRows.length === 0 ? (
            <div className="bao-cao-chart-empty text-center py-5 px-3">
              <div className="bao-cao-chart-empty__icon mx-auto mb-3">
                <i className="bi bi-inbox" aria-hidden />
              </div>
              <p className="fw-semibold text-body mb-1">Chưa có doanh thu trong khoảng thời gian này</p>
              <p className="small text-muted mb-0">
                Thử mở rộng kỳ hoặc bỏ lọc bác sĩ / dịch vụ để xem thêm dữ liệu.
              </p>
            </div>
          ) : (
            <div className="bao-cao-chart-scroll">
              <div className="bao-cao-bars" role="img" aria-label="Biểu đồ cột doanh thu theo ngày">
                {sortedRows.map((r) => {
                  const v = Number(r.tongDoanhThu ?? 0);
                  const hPct = Math.round((v / chartMax) * 100);
                  const label = (r.ngay || "").slice(5);
                  return (
                    <div key={r.ngay} className="bao-cao-bar-col">
                      <div className="bao-cao-bar-track">
                        <div
                          className="bao-cao-bar"
                          style={{ height: `${Math.max(hPct, 4)}%` }}
                          title={`${formatNgayBang(r.ngay)} — ${money(v)}`}
                        >
                          <span className="visually-hidden">
                            {formatNgayBang(r.ngay)}, {money(v)}
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

      <Card className="bao-cao-table-card card--static border-0 shadow-sm overflow-hidden">
        <Card.Header className="bao-cao-table-card__head d-flex align-items-center gap-2 border-0">
          <i className="bi bi-table" aria-hidden />
          <span className="fw-bold">Chi tiết theo ngày</span>
        </Card.Header>
        <div className="table-responsive">
          <Table hover className="bao-cao-table mb-0 align-middle">
            <thead>
              <tr>
                <th>Ngày</th>
                <th className="text-end">Doanh thu</th>
                <th className="text-end">Giao dịch</th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((r, i) => (
                <tr key={typeof r.ngay === "string" ? r.ngay : `row-${i}`}>
                  <td>
                    <div className="fw-semibold text-body">{formatNgayBang(r.ngay)}</div>
                    <div className="small text-muted font-monospace">{(r.ngay || "").slice(0, 10)}</div>
                  </td>
                  <td className="text-end fw-bold text-body">{money(Number(r.tongDoanhThu ?? 0))}</td>
                  <td className="text-end">
                    <span className="bao-cao-tx-pill">{r.soLichHen ?? "—"}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        {sortedRows.length === 0 ? (
          <div className="text-center text-muted small py-4 border-top">Không có dòng nào để hiển thị.</div>
        ) : null}
      </Card>
    </div>
  );
}
