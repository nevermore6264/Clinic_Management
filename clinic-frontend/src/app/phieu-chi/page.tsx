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
} from "react-bootstrap";
import type { CSSProperties } from "react";
import { useAuth } from "@/lib/useAuth";
import { phieuChiApi, type PhieuChi } from "@/lib/api";
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
  const [total, setTotal] = useState(0);
  const [tuNgay, setTuNgay] = useState(monthStartISO);
  const [denNgay, setDenNgay] = useState(todayISO);
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState<PhieuChi | null>(null);
  const [form, setForm] = useState<PhieuChi>({
    moTa: "",
    soTien: 0,
    ngayChi: todayISO(),
    loai: "KHAC",
  });

  const allowed =
    user?.cacVaiTro.includes("QUAN_TRI") ||
    user?.cacVaiTro.includes("THU_NGAN");

  useEffect(() => {
    if (!loading && !user) router.replace("/dang-nhap");
    if (user && !allowed) router.replace("/bang-dieu-khien");
  }, [user, loading, router, allowed]);

  const load = useCallback(() => {
    phieuChiApi
      .danhSach(tuNgay, denNgay, 0, 500)
      .then((p) => {
        setList(p.content);
        setTotal(p.totalElements);
      })
      .catch((e) => setError(e.message));
  }, [tuNgay, denNgay]);

  useEffect(() => {
    if (!allowed) return;
    load();
  }, [user, tuNgay, denNgay, allowed, load]);

  const tongChi = useMemo(
    () => list.reduce((s, p) => s + (Number(p.soTien) || 0), 0),
    [list],
  );

  const chiTheoLoai = useMemo(() => {
    const m: Record<string, number> = {};
    for (const p of list) {
      const k = p.loai ?? "KHAC";
      m[k] = (m[k] ?? 0) + (Number(p.soTien) || 0);
    }
    return m;
  }, [list]);

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
    return `${meta?.label ?? key}: ${max.toLocaleString("vi-VN")}đ`;
  }, [chiTheoLoai]);

  const applyPreset = (preset: "month" | "7d" | "30d") => {
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
    setEditing(null);
    setForm({
      moTa: "",
      soTien: 0,
      ngayChi: todayISO(),
      loai: "KHAC",
    });
    setShow(true);
  };

  const openEdit = (pc: PhieuChi) => {
    setEditing(pc);
    setForm({ ...pc });
    setShow(true);
  };

  const save = async () => {
    try {
      if (editing?.id != null) {
        await phieuChiApi.capNhat(editing.id, form);
      } else {
        await phieuChiApi.tao(form);
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

  if (!allowed) return null;

  const fmtMoney = (n: number) =>
    `${n.toLocaleString("vi-VN", { maximumFractionDigits: 0 })}đ`;

  return (
    <div className="phieu-chi-page">
      <PageHeader
        title="Phiếu chi"
        subtitle="Theo dõi chi phí vận hành phòng khám — vật tư, thiết bị, lương, thuế và các khoản khác. Khác với thu tiền bệnh nhân trên hóa đơn."
      >
        <Button
          className="d-inline-flex align-items-center gap-2 rounded-pill px-3"
          onClick={openNew}
        >
          <i className="bi bi-plus-lg" aria-hidden />
          Ghi phiếu chi
        </Button>
      </PageHeader>

      <div className="phieu-chi-hero rounded-4 p-3 p-md-4 mb-4">
        <Row className="g-3 g-md-4">
          <Col xs={12} md={4}>
            <StatMini
              label="Tổng chi (đã lọc)"
              value={fmtMoney(tongChi)}
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
              value={total}
              hint={
                total > list.length
                  ? `Hiển thị ${list.length}/${total} (giới hạn 500 dòng)`
                  : `${list.length} phiếu`
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
                list.length ? fmtMoney(Math.round(tongChi / list.length)) : "—"
              }
              hint={list.length ? "Trong khoảng ngày đã chọn" : "—"}
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
                onChange={(e) => setTuNgay(e.target.value)}
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
                onChange={(e) => setDenNgay(e.target.value)}
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
            {total} bản ghi khớp khoảng thời gian · tổng hiển thị{" "}
            <strong className="text-body">{fmtMoney(tongChi)}</strong>
          </div>
        </Card.Body>
      </Card>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Card className="border-0 shadow-sm overflow-hidden phieu-chi-table-card">
        {list.length === 0 ? (
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
                  <th>Loại</th>
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
                      <td className="text-nowrap small fw-medium">{p.ngayChi}</td>
                      <td>
                        <Badge
                          bg={loaiMeta?.badge ?? "secondary"}
                          text={
                            loaiMeta?.badge === "warning" ? "dark" : undefined
                          }
                          className="rounded-pill px-2 py-1 fw-semibold"
                        >
                          {loaiMeta?.label ?? p.loai}
                        </Badge>
                      </td>
                      <td className="phieu-chi-desc">{p.moTa}</td>
                      <td className="text-end fw-semibold text-danger text-nowrap tabular-nums">
                        {p.soTien?.toLocaleString("vi-VN")}đ
                      </td>
                      <td className="small text-muted">
                        {p.tenDangNhapNguoiTao || "—"}
                      </td>
                      <td className="text-end text-nowrap">
                        <Button
                          size="sm"
                          variant="outline-primary"
                          className="rounded-pill me-1 btn-action-edit"
                          onClick={() => openEdit(p)}
                        >
                          <i className="bi bi-pencil me-1" aria-hidden />
                          Sửa
                        </Button>
                        {user?.cacVaiTro.includes("QUAN_TRI") && (
                          <Button
                            size="sm"
                            variant="outline-danger"
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
              </tbody>
            </Table>
          </div>
        )}
      </Card>

      <Modal show={show} onHide={() => setShow(false)} centered size="lg">
        <Modal.Header closeButton className="border-0 pb-0">
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
              value={form.moTa}
              onChange={(e) => setForm({ ...form, moTa: e.target.value })}
              placeholder="Ví dụ: Mua găng tay y tế tháng 5…"
              className="rounded-3"
            />
          </Form.Group>
          <Row className="g-3">
            <Col md={4}>
              <Form.Label className="fw-semibold">Số tiền *</Form.Label>
              <Form.Control
                type="number"
                min={0}
                value={form.soTien}
                onChange={(e) =>
                  setForm({ ...form, soTien: Number(e.target.value) })
                }
                className="rounded-3"
              />
            </Col>
            <Col md={4}>
              <Form.Label className="fw-semibold">Ngày chi</Form.Label>
              <Form.Control
                type="date"
                value={form.ngayChi?.slice(0, 10) ?? ""}
                onChange={(e) =>
                  setForm({ ...form, ngayChi: e.target.value })
                }
                className="rounded-3"
              />
            </Col>
            <Col md={4}>
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
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button
            variant="outline-secondary"
            className="d-inline-flex align-items-center gap-2 rounded-pill"
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
