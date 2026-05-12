"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  Button,
  Card,
  Alert,
  Form,
  Modal,
  Row,
  Col,
  Badge,
  Pagination,
  InputGroup,
} from "react-bootstrap";
import type { CSSProperties } from "react";
import { useAuth } from "@/lib/useAuth";
import {
  phieuChiApi,
  type PhieuChi,
  type PhieuChiTongHop,
} from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";

const LOAI_OPTIONS = [
  { value: "VAT_TU", label: "Vật tư", badge: "info" as const },
  { value: "THIET_BI", label: "Thiết bị", badge: "primary" as const },
  { value: "LUONG", label: "Lương", badge: "warning" as const },
  { value: "THUE", label: "Thuế", badge: "secondary" as const },
  { value: "KHAC", label: "Khác", badge: "dark" as const },
];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function monthStartISO() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

function fmtVnd(n: number) {
  return `${Math.round(Number(n) || 0).toLocaleString("vi-VN")} đ`;
}

function fmtNgayChi(iso?: string) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString("vi-VN");
}

function parseSoTienVnd(raw: string): number {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return 0;
  const n = Number(digits);
  return Number.isFinite(n) ? Math.min(n, Number.MAX_SAFE_INTEGER) : 0;
}

function formatSoTienNhap(so: number): string {
  if (!so || so <= 0) return "";
  return Math.round(so).toLocaleString("vi-VN");
}

function thangISOHienTai(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const THANG_XUAT_CSV_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: `Tháng ${i + 1}`,
}));

function parseThangXuatCsv(iso: string): { nam: number; thang: number } {
  const m = /^(\d{4})-(\d{2})$/.exec(iso.trim());
  const d = new Date();
  const fallback = { nam: d.getFullYear(), thang: d.getMonth() + 1 };
  if (!m) return fallback;
  const nam = Number(m[1]);
  const thang = Number(m[2]);
  if (!Number.isFinite(nam) || nam < 2000 || nam > 2100) return fallback;
  if (!Number.isFinite(thang) || thang < 1 || thang > 12) return fallback;
  return { nam, thang };
}

function danhSachNamXuatCsv(namDangChon: number): number[] {
  const y = new Date().getFullYear();
  const lo = Math.min(y - 8, namDangChon);
  const hi = Math.max(y + 1, namDangChon);
  const out: number[] = [];
  for (let i = lo; i <= hi; i++) out.push(i);
  return out;
}

function StatMini({
  label,
  value,
  hint,
  icon,
  accent,
  iconBg,
  iconFg,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: string;
  accent?: string;
  iconBg?: string;
  iconFg?: string;
}) {
  return (
    <Card
      className="stat-card card--static h-100 border-0 shadow-sm phieu-chi-stat"
      style={
        {
          "--stat-accent": accent,
          "--stat-icon-bg": iconBg,
          "--stat-icon-fg": iconFg,
        } as CSSProperties
      }
    >
      <Card.Body className="p-3 p-md-4">
        <div className="d-flex justify-content-between align-items-start gap-2">
          <div className="min-w-0">
            <div className="stat-label mb-1 small">{label}</div>
            <div className="stat-value fs-4">{value}</div>
            {hint ? (
              <div className="text-muted mt-1" style={{ fontSize: "0.78rem" }}>
                {hint}
              </div>
            ) : null}
          </div>
          <div className="stat-icon flex-shrink-0">
            <i className={`bi ${icon}`} aria-hidden />
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}

export default function PhieuChiPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [list, setList] = useState<PhieuChi[]>([]);
  const [trang, setTrang] = useState(0);
  const KICH_THUOC_TRANG = 20;
  const [tongTrang, setTongTrang] = useState(1);
  const [tongHop, setTongHop] = useState<PhieuChiTongHop | null>(null);
  const [tuNgay, setTuNgay] = useState(monthStartISO);
  const [denNgay, setDenNgay] = useState(todayISO);
  const [error, setError] = useState("");
  const [thangXuatCsv, setThangXuatCsv] = useState(thangISOHienTai);
  const [dangXuatCsv, setDangXuatCsv] = useState(false);
  const [show, setShow] = useState(false);
  const [soTienNhap, setSoTienNhap] = useState("");
  const [editing, setEditing] = useState<PhieuChi | null>(null);
  const [form, setForm] = useState<PhieuChi>({
    moTa: "",
    soTien: 0,
    ngayChi: todayISO(),
    loai: "KHAC",
    chungTuThamChieu: "",
  });

  const allowed =
    user?.cacVaiTro.includes("QUAN_TRI") ||
    user?.cacVaiTro.includes("THU_NGAN");

  useEffect(() => {
    if (!loading && !user) router.replace("/dang-nhap");
    if (user && !allowed) router.replace("/bang-dieu-khien");
  }, [user, loading, router, allowed]);

  const load = useCallback(() => {
    Promise.all([
      phieuChiApi.danhSach(tuNgay, denNgay, trang, KICH_THUOC_TRANG),
      phieuChiApi.tongHop(tuNgay, denNgay),
    ])
      .then(([p, th]) => {
        setList(p.content);
        const tp = Math.max(1, p.totalPages ?? 1);
        setTongTrang(tp);
        setTongHop(th);
        if (trang >= tp) {
          setTrang(0);
        }
      })
      .catch((e) => setError(e.message));
  }, [tuNgay, denNgay, trang]);

  useEffect(() => {
    if (!allowed) return;
    load();
  }, [user, allowed, load]);

  const tongSoPhieu = tongHop?.soPhieu ?? 0;
  const tongChi = Number(tongHop?.tongTien ?? 0);

  const chiTheoLoai = useMemo(() => {
    const raw = tongHop?.tienTheoLoai;
    if (!raw) return {} as Record<string, number>;
    const m: Record<string, number> = {};
    for (const [k, v] of Object.entries(raw)) {
      m[k] = Number(v) || 0;
    }
    return m;
  }, [tongHop]);

  const topLoaiLabel = useMemo(() => {
    let max = 0;
    let key = "";
    for (const [k, v] of Object.entries(chiTheoLoai)) {
      if (v > max) {
        max = v;
        key = k;
      }
    }
    if (!key || max <= 0) return null;
    const meta = LOAI_OPTIONS.find((o) => o.value === key);
    return `${meta?.label ?? key}: ${fmtVnd(max)}`;
  }, [chiTheoLoai]);

  const applyPreset = (preset: "month" | "7d" | "30d") => {
    setTrang(0);
    const end = new Date();
    const endStr = end.toISOString().slice(0, 10);
    if (preset === "month") {
      const start = new Date(end.getFullYear(), end.getMonth(), 1);
      setTuNgay(start.toISOString().slice(0, 10));
      setDenNgay(endStr);
      return;
    }
    const days = preset === "7d" ? 7 : 30;
    const start = new Date(end);
    start.setDate(start.getDate() - days + 1);
    setTuNgay(start.toISOString().slice(0, 10));
    setDenNgay(endStr);
  };

  const openNew = () => {
    setError("");
    setEditing(null);
    setSoTienNhap("");
    setForm({
      moTa: "",
      soTien: 0,
      ngayChi: todayISO(),
      loai: "KHAC",
      chungTuThamChieu: "",
    });
    setShow(true);
  };

  const openEdit = (pc: PhieuChi) => {
    setError("");
    setEditing(pc);
    setForm({ ...pc });
    setSoTienNhap(formatSoTienNhap(Number(pc.soTien) || 0));
    setShow(true);
  };

  const save = async () => {
    const tien = Math.round(Number(form.soTien) || 0);
    if (!form.moTa?.trim()) {
      setError("Vui lòng nhập mô tả.");
      return;
    }
    if (tien <= 0) {
      setError("Số tiền phải lớn hơn 0.");
      return;
    }
    setError("");
    const payload = { ...form, soTien: tien };
    try {
      if (editing?.id != null) {
        await phieuChiApi.capNhat(editing.id, payload);
      } else {
        await phieuChiApi.tao(payload);
      }
      setShow(false);
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi");
    }
  };

  const xoa = async (id: number) => {
    if (!confirm("Xóa phiếu chi?")) return;
    try {
      await phieuChiApi.xoa(id);
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi");
    }
  };

  const { nam: namXuatCsv, thang: thangSoXuatCsv } = parseThangXuatCsv(
    thangXuatCsv
  );

  const xuatCsvKeToan = async () => {
    setDangXuatCsv(true);
    setError("");
    try {
      const blob = await phieuChiApi.xuatCsvThang(thangXuatCsv);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `phieu-chi-${thangXuatCsv}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi xuất CSV");
    } finally {
      setDangXuatCsv(false);
    }
  };

  if (!allowed) return null;

  return (
    <div className="phieu-chi-page">
      <PageHeader
        title="Phiếu chi"
        subtitle="Chi phí vận hành (theo ngày chi) — bổ sung cho doanh thu hóa đơn. Cột «Chứng từ» ghi tay số HĐ mua / phiếu nhập khi chưa có module nhập liên thông."
      >
        <div className="d-flex flex-wrap align-items-stretch align-items-md-center gap-2 justify-content-md-end">
          <div className="d-flex flex-column justify-content-center">
            <span className="small text-muted fw-semibold mb-1 d-md-none">
              Xuất file kế toán (CSV)
            </span>
            <InputGroup className="phieu-chi-csv-inputgroup">
              <Form.Select
                className="phieu-chi-csv-select-thang border-secondary-subtle"
                value={String(thangSoXuatCsv)}
                onChange={(e) => {
                  const t = Number(e.target.value);
                  setThangXuatCsv(
                    `${namXuatCsv}-${String(t).padStart(2, "0")}`
                  );
                }}
                aria-label="Chọn tháng xuất CSV"
              >
                {THANG_XUAT_CSV_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Form.Select>
              <Form.Select
                className="phieu-chi-csv-select-nam border-secondary-subtle"
                value={String(namXuatCsv)}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  setThangXuatCsv(
                    `${n}-${String(thangSoXuatCsv).padStart(2, "0")}`
                  );
                }}
                aria-label="Chọn năm xuất CSV"
              >
                {danhSachNamXuatCsv(namXuatCsv).map((yy) => (
                  <option key={yy} value={yy}>
                    Năm {yy}
                  </option>
                ))}
              </Form.Select>
              <Button
                type="button"
                variant="outline-secondary"
                className="phieu-chi-csv-btn d-inline-flex align-items-center justify-content-center gap-2 text-nowrap"
                disabled={dangXuatCsv}
                onClick={() => void xuatCsvKeToan()}
              >
                {dangXuatCsv ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden
                    />
                    Đang xuất…
                  </>
                ) : (
                  <>
                    <i className="bi bi-file-earmark-arrow-down" aria-hidden />
                    Xuất CSV
                  </>
                )}
              </Button>
            </InputGroup>
          </div>
          <Button
            className="d-inline-flex align-items-center gap-2 rounded-pill px-3"
            onClick={openNew}
          >
            <i className="bi bi-plus-lg" aria-hidden />
            Ghi phiếu chi
          </Button>
        </div>
      </PageHeader>

      <div className="phieu-chi-hero rounded-4 p-3 p-md-4 mb-4">
        <Row className="g-3 g-md-4">
          <Col xs={12} md={4}>
            <StatMini
              label="Tổng chi (đã lọc)"
              value={fmtVnd(tongChi)}
              hint={
                topLoaiLabel
                  ? `Nhiều nhất: ${topLoaiLabel}`
                  : "Chưa có dữ liệu trong khoảng"
              }
              icon="bi-graph-down-arrow"
              accent="#b91c1c"
              iconBg="rgba(248, 113, 113, 0.2)"
              iconFg="#b91c1c"
            />
          </Col>
          <Col xs={6} md={4}>
            <StatMini
              label="Số phiếu"
              value={String(tongSoPhieu)}
              hint={
                tongSoPhieu > 0
                  ? `${tongSoPhieu} phiếu chi khớp lọc · trang ${trang + 1}/${tongTrang}`
                  : "Chưa có phiếu"
              }
              icon="bi-receipt-cutoff"
              accent="#0d9488"
              iconBg="rgba(45, 212, 191, 0.2)"
              iconFg="#0f766e"
            />
          </Col>
          <Col xs={6} md={4}>
            <StatMini
              label="Trung bình / phiếu"
              value={
                tongSoPhieu > 0
                  ? fmtVnd(Math.round(tongChi / tongSoPhieu))
                  : "—"
              }
              hint={tongSoPhieu > 0 ? "Trong khoảng ngày đã chọn" : "—"}
              icon="bi-calculator"
              accent="#2563eb"
              iconBg="rgba(96, 165, 250, 0.22)"
              iconFg="#1d4ed8"
            />
          </Col>
        </Row>
      </div>

      <Card className="border-0 shadow-sm mb-4 phieu-chi-filter-card">
        <Card.Body className="p-3 p-md-4">
          <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
            <span className="small fw-semibold text-secondary text-uppercase me-1">
              Nhanh
            </span>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary rounded-pill phieu-chi-chip"
              onClick={() => applyPreset("month")}
            >
              <i className="bi bi-calendar3 me-1" aria-hidden />
              Tháng này
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary rounded-pill phieu-chi-chip"
              onClick={() => applyPreset("7d")}
            >
              7 ngày
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary rounded-pill phieu-chi-chip"
              onClick={() => applyPreset("30d")}
            >
              30 ngày
            </button>
          </div>
          <div className="row g-3 align-items-end flex-wrap">
            <div className="col-auto">
              <Form.Label className="small fw-semibold text-secondary mb-1">
                Từ ngày
              </Form.Label>
              <Form.Control
                type="date"
                value={tuNgay}
                onChange={(e) => {
                  setTuNgay(e.target.value);
                  setTrang(0);
                }}
                className="phieu-chi-date"
              />
            </div>
            <div className="col-auto">
              <Form.Label className="small fw-semibold text-secondary mb-1">
                Đến ngày
              </Form.Label>
              <Form.Control
                type="date"
                value={denNgay}
                onChange={(e) => {
                  setDenNgay(e.target.value);
                  setTrang(0);
                }}
                className="phieu-chi-date"
              />
            </div>
            <div className="col-auto">
              <Button
                variant="primary"
                className="d-inline-flex align-items-center gap-2 rounded-pill px-3"
                onClick={load}
              >
                <i className="bi bi-funnel" aria-hidden />
                Áp dụng lọc
              </Button>
            </div>
          </div>
          <div className="small text-muted mt-3 mb-0">
            <i className="bi bi-info-circle me-1" aria-hidden />
            {tongSoPhieu} bản ghi khớp khoảng thời gian · tổng chi{" "}
            <strong className="text-body">{fmtVnd(tongChi)}</strong>
          </div>
        </Card.Body>
      </Card>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Card className="border-0 shadow-sm overflow-hidden phieu-chi-table-card">
        {tongSoPhieu === 0 ? (
          <Card.Body className="text-center py-5 px-4">
            <div className="phieu-chi-empty-icon mx-auto mb-3">
              <i className="bi bi-inboxes" aria-hidden />
            </div>
            <h3 className="h5 fw-semibold mb-2">Chưa có phiếu chi</h3>
            <p className="text-muted mb-4 mx-auto" style={{ maxWidth: "26rem" }}>
              Trong khoảng ngày đã chọn chưa ghi nhận khoản chi nào. Thử mở rộng
              khoảng thời gian hoặc ghi phiếu chi mới.
            </p>
            <Button
              className="d-inline-flex align-items-center gap-2 rounded-pill px-4"
              onClick={openNew}
            >
              <i className="bi bi-plus-lg" aria-hidden />
              Ghi phiếu chi đầu tiên
            </Button>
          </Card.Body>
        ) : (
          <div className="table-responsive">
            <Table hover className="mb-0 phieu-chi-table align-middle">
              <thead className="phieu-chi-thead">
                <tr>
                  <th>Ngày</th>
                  <th className="phieu-chi-col-loai">Loại</th>
                  <th className="phieu-chi-th-chung-tu">Chứng từ</th>
                  <th>Mô tả</th>
                  <th className="text-end text-nowrap">Số tiền</th>
                  <th>Người tạo</th>
                  <th className="text-end text-nowrap">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {list.map((p) => {
                  const loaiMeta = LOAI_OPTIONS.find((o) => o.value === p.loai);
                  return (
                    <tr key={p.id}>
                      <td className="text-nowrap small fw-medium">{fmtNgayChi(p.ngayChi)}</td>
                      <td className="phieu-chi-col-loai">
                        <Badge
                          bg={loaiMeta?.badge ?? "secondary"}
                          text={
                            loaiMeta?.badge === "warning" ? "dark" : undefined
                          }
                          className="phieu-chi-loai-chip rounded-pill fw-semibold"
                        >
                          {loaiMeta?.label ?? p.loai}
                        </Badge>
                      </td>
                      <td className="phieu-chi-td-chung-tu small text-muted">
                        {p.chungTuThamChieu?.trim() ? (
                          <span
                            className="phieu-chi-chung-tu-text"
                            title={p.chungTuThamChieu}
                          >
                            {p.chungTuThamChieu}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="phieu-chi-desc">{p.moTa}</td>
                      <td className="text-end fw-semibold text-danger text-nowrap tabular-nums phieu-chi-so-tien">
                        {fmtVnd(Number(p.soTien ?? 0))}
                      </td>
                      <td className="small text-muted">
                        {p.tenDangNhapNguoiTao || "—"}
                      </td>
                      <td className="text-end text-nowrap">
                        <Button
                          size="sm"
                          className="rounded-pill me-1 btn-action-edit"
                          onClick={() => openEdit(p)}
                        >
                          <i className="bi bi-pencil-square me-1" aria-hidden />
                          Sửa
                        </Button>
                        {user?.cacVaiTro.includes("QUAN_TRI") && (
                          <Button
                            size="sm"
                            className="rounded-pill btn-action-delete"
                            onClick={() => p.id && xoa(p.id)}
                          >
                            <i className="bi bi-trash me-1" aria-hidden />
                            Xóa
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {list.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-muted py-4">
                      Không có dòng trên trang này.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </Table>
            {tongSoPhieu > 0 ? (
              <Card.Footer className="d-flex flex-wrap align-items-center justify-content-between gap-2 py-3">
                <div className="small text-muted">
                  {tongSoPhieu} phiếu chi khớp lọc · trang {trang + 1}/{tongTrang}
                </div>
                <Pagination className="mb-0 flex-wrap">
                  <Pagination.First
                    disabled={trang <= 0}
                    onClick={() => setTrang(0)}
                  />
                  <Pagination.Prev
                    disabled={trang <= 0}
                    onClick={() => setTrang((p) => Math.max(0, p - 1))}
                  />
                  <Pagination.Item active className="user-select-none">
                    {trang + 1} / {tongTrang}
                  </Pagination.Item>
                  <Pagination.Next
                    disabled={trang >= tongTrang - 1}
                    onClick={() =>
                      setTrang((p) => Math.min(tongTrang - 1, p + 1))
                    }
                  />
                  <Pagination.Last
                    disabled={trang >= tongTrang - 1}
                    onClick={() => setTrang(tongTrang - 1)}
                  />
                </Pagination>
              </Card.Footer>
            ) : null}
          </div>
        )}
      </Card>

      <Modal
        show={show}
        onHide={() => {
          setShow(false);
          setError("");
        }}
        centered
        size="lg"
        className="phieu-chi-modal"
      >
        <Modal.Header closeButton className="border-0 pb-0 phieu-chi-modal-header">
          <Modal.Title className="fw-bold">
            {editing ? (
              <>
                <i className="bi bi-pencil-square me-2 text-primary" aria-hidden />
                Sửa phiếu chi
              </>
            ) : (
              <>
                <i className="bi bi-plus-circle me-2 text-primary" aria-hidden />
                Phiếu chi mới
              </>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-3">
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Mô tả *</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={form.moTa}
              onChange={(e) => setForm({ ...form, moTa: e.target.value })}
              placeholder="Ví dụ: Mua găng tay y tế tháng 5…"
              className="rounded-3"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Chứng từ tham chiếu</Form.Label>
            <Form.Control
              value={form.chungTuThamChieu ?? ""}
              onChange={(e) =>
                setForm({ ...form, chungTuThamChieu: e.target.value })
              }
              placeholder="VD: HĐ mua 0123, phiếu nhập kho NK-2026-05…"
              className="rounded-3"
            />
            <Form.Text className="text-muted">
              Ghi tay số hóa đơn mua / phiếu nhập ngoài hệ thống — khi có module
              nhập có thể nối tự động sau.
            </Form.Text>
          </Form.Group>
          <Row className="g-3">
            <Col md={6}>
              <Form.Label className="fw-semibold">Số tiền (VNĐ) *</Form.Label>
              <InputGroup className="phieu-chi-vnd-inputgroup">
                <Form.Control
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="Ví dụ: 1.500.000"
                  value={soTienNhap}
                  onChange={(e) => {
                    const num = parseSoTienVnd(e.target.value);
                    setSoTienNhap(formatSoTienNhap(num));
                    setForm({ ...form, soTien: num });
                  }}
                  className="phieu-chi-vnd-input font-monospace rounded-start-3 rounded-end-0"
                />
                <InputGroup.Text className="rounded-end-3 rounded-start-0 border-start-0 bg-body-secondary text-muted fw-semibold small">
                  đ
                </InputGroup.Text>
              </InputGroup>
              <Form.Text className="text-muted">
                Chỉ nhập số; hệ thống tự thêm dấu phân cách hàng nghìn theo định dạng Việt Nam.
              </Form.Text>
            </Col>
            <Col md={3}>
              <Form.Label className="fw-semibold">Ngày chi *</Form.Label>
              <Form.Control
                type="date"
                value={form.ngayChi?.slice(0, 10) ?? ""}
                onChange={(e) =>
                  setForm({ ...form, ngayChi: e.target.value })
                }
                className="rounded-3"
              />
            </Col>
            <Col md={3}>
              <Form.Label className="fw-semibold">Loại</Form.Label>
              <Form.Select
                value={form.loai ?? "KHAC"}
                onChange={(e) =>
                  setForm({ ...form, loai: e.target.value })
                }
                className="rounded-3"
              >
                {LOAI_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>
          {Number(form.soTien) > 0 ? (
            <div className="mt-3 p-3 rounded-3 bg-body-secondary border phieu-chi-preview-tien">
              <span className="small text-muted text-uppercase fw-semibold me-2">
                Xem trước
              </span>
              <span className="fw-bold text-danger tabular-nums">{fmtVnd(Number(form.soTien))}</span>
            </div>
          ) : null}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 clinic-modal-footer-actions">
          <Button
            type="button"
            className="btn-modal-dismiss d-inline-flex align-items-center gap-2"
            onClick={() => setShow(false)}
          >
            <i className="bi bi-x-lg" aria-hidden />
            Hủy
          </Button>
          <Button
            variant="primary"
            className="d-inline-flex align-items-center gap-2 rounded-pill px-4"
            onClick={save}
          >
            <i className="bi bi-check2-circle" aria-hidden />
            Lưu phiếu
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
