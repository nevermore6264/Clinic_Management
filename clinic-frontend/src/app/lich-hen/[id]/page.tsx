"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, Form, Button, Alert, Table } from "react-bootstrap";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import {
  appointmentsApi,
  visitRecordsApi,
  thuocApi,
  type LichHen,
  type LichSuTrangThaiLichHen,
  type ChiTietDonThuoc,
  type Thuoc,
} from "@/lib/api";

/** Quy trình trạng thái — slug dùng cho CSS tag / nút */
const STATUS_FLOW = [
  {
    value: "DA_DAT",
    label: "Đã đặt",
    icon: "bi-calendar-check",
    slug: "da-dat",
  },
  {
    value: "DA_TIEP_NHAN",
    label: "Tiếp nhận",
    icon: "bi-person-badge",
    slug: "tiep-nhan",
  },
  {
    value: "DANG_KHAM",
    label: "Đang khám",
    icon: "bi-heart-pulse",
    slug: "dang-kham",
  },
  {
    value: "XET_NGHIEM",
    label: "Xét nghiệm",
    icon: "bi-droplet",
    slug: "xet-nghiem",
  },
  {
    value: "DA_KE_DON",
    label: "Đã kê đơn",
    icon: "bi-prescription2",
    slug: "da-ke-don",
  },
  {
    value: "DA_THANH_TOAN",
    label: "Đã thanh toán",
    icon: "bi-cash-stack",
    slug: "da-thanh-toan",
  },
  {
    value: "HUY",
    label: "Đã hủy",
    icon: "bi-x-octagon",
    slug: "huy",
  },
  {
    value: "VANG",
    label: "Không đến",
    icon: "bi-person-x",
    slug: "vang",
  },
] as const;

const STATUS_LABEL: Record<string, string> = Object.fromEntries(
  STATUS_FLOW.map((s) => [s.value, s.label]),
);

function metaTrangThai(code: string | undefined) {
  const m = STATUS_FLOW.find((s) => s.value === code);
  return (
    m ?? {
      value: code ?? "",
      label: code ?? "—",
      icon: "bi-question-circle",
      slug: "unknown",
    }
  );
}

function newRow(maThuoc: number): ChiTietDonThuoc {
  return { maThuoc, soLuong: 1, lieuDung: "" };
}

export default function AppointmentDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const { user, loading } = useAuth();
  const router = useRouter();
  const [app, setApp] = useState<LichHen | null>(null);
  const [diagnosis, setDiagnosis] = useState("");
  const [prescription, setPrescription] = useState("");
  const [notes, setNotes] = useState("");
  const [rows, setRows] = useState<ChiTietDonThuoc[]>([]);
  const [thuocList, setThuocList] = useState<Thuoc[]>([]);
  const [statusLog, setStatusLog] = useState<LichSuTrangThaiLichHen[]>([]);
  const [error, setError] = useState("");

  const canEdit =
    user?.cacVaiTro.includes("BAC_SI") ||
    user?.cacVaiTro.includes("QUAN_TRI") ||
    user?.cacVaiTro.includes("LE_TAN");

  useEffect(() => {
    if (!loading && !user) router.replace("/dang-nhap");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || !id) return;
    appointmentsApi
      .get(id)
      .then(setApp)
      .catch((e) => setError(e.message));
    appointmentsApi
      .statusHistory(id)
      .then(setStatusLog)
      .catch(() => setStatusLog([]));
    visitRecordsApi
      .byAppointment(id)
      .then((r) => {
        if (r) {
          setDiagnosis(r.chanDoan || "");
          setPrescription(r.donThuoc || "");
          setNotes(r.ghiChu || "");
          if (r.chiTietDonThuoc?.length) {
            setRows(
              r.chiTietDonThuoc.map((c) => ({
                maThuoc: c.maThuoc,
                tenThuoc: c.tenThuoc,
                soLuong: c.soLuong ?? 1,
                donGia: c.donGia,
                lieuDung: c.lieuDung ?? "",
              })),
            );
          } else {
            setRows([]);
          }
        }
      })
      .catch(() => {});
  }, [user, id]);

  useEffect(() => {
    if (!user || !canEdit) return;
    thuocApi
      .dangHoatDong()
      .then((list) => {
        setThuocList(list);
        setRows((prev) => {
          if (prev.length > 0 || list.length === 0) return prev;
          return [newRow(list[0].id!)];
        });
      })
      .catch(() => {});
  }, [user, canEdit]);

  const updateStatus = async (status: string) => {
    try {
      await appointmentsApi.updateStatus(id, status);
      if (app) setApp({ ...app, trangThai: status });
      const log = await appointmentsApi.statusHistory(id);
      setStatusLog(log);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi");
    }
  };

  const saveRecord = async () => {
    try {
      const validRows = rows.filter((r) => r.maThuoc > 0);
      const saved = await visitRecordsApi.save(id, {
        diagnosis,
        prescription,
        notes,
        chiTietDonThuoc: validRows,
      });
      if (saved.chiTietDonThuoc?.length) {
        setRows(
          saved.chiTietDonThuoc.map((c) => ({
            maThuoc: c.maThuoc,
            tenThuoc: c.tenThuoc,
            soLuong: c.soLuong ?? 1,
            donGia: c.donGia,
            lieuDung: c.lieuDung ?? "",
          })),
        );
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi");
    }
  };

  const addRow = () => {
    const first = thuocList[0]?.id;
    if (first == null) return;
    setRows((r) => [...r, newRow(first)]);
  };

  const removeRow = (idx: number) => {
    setRows((r) => r.filter((_, i) => i !== idx));
  };

  const patchRow = (idx: number, patch: Partial<ChiTietDonThuoc>) => {
    setRows((r) =>
      r.map((row, i) => (i === idx ? { ...row, ...patch } : row)),
    );
  };

  if (!loading && !user) return null;
  if (!app) return <div className="py-4">Đang tải...</div>;

  const tagMeta = metaTrangThai(app.trangThai);

  return (
    <div className="lich-hen-detail-page">
      <h2 className="mb-4">Chi tiết lịch khám</h2>
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      <Card className="mb-3">
        <Card.Header className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <span>
            #{app.id} - {app.ngayHen} {app.gioHen}
          </span>
          <span
            className={`lich-hen-status-tag lich-hen-status-tag--${tagMeta.slug}`}
          >
            <i className={`bi ${tagMeta.icon}`} aria-hidden />
            {tagMeta.label}
          </span>
        </Card.Header>
        <Card.Body>
          <p>
            <strong>Bệnh nhân:</strong> {app.tenBenhNhan} (mã: {app.maBenhNhan})
          </p>
          <p>
            <strong>Bác sĩ:</strong> {app.tenBacSi}
          </p>
          <p>
            <strong>Dịch vụ:</strong> {app.tenDichVu}
          </p>
          {app.ghiChu && (
            <p>
              <strong>Ghi chú:</strong> {app.ghiChu}
            </p>
          )}
          <div className="lich-hen-flow-label mb-2 fw-semibold text-secondary">
            Cập nhật trạng thái
          </div>
          <div className="lich-hen-flow-toolbar d-flex flex-wrap gap-2">
            {STATUS_FLOW.map((s) => (
              <button
                key={s.value}
                type="button"
                className={`lich-hen-flow-btn lich-hen-flow-btn--${s.slug}${
                  app.trangThai === s.value ? " is-active" : ""
                }`}
                onClick={() => updateStatus(s.value)}
              >
                <i className={`bi ${s.icon} lich-hen-flow-btn__icon`} aria-hidden />
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        </Card.Body>
      </Card>

      {statusLog.length > 0 && (
        <Card className="mb-3">
          <Card.Header>Lịch sử trạng thái (truy vết quy trình)</Card.Header>
          <Card.Body className="p-0">
            <div className="lich-hen-status-log-scroll">
              <Table responsive hover className="mb-0 small">
                <thead>
                  <tr>
                    <th>Thời điểm</th>
                    <th>Từ</th>
                    <th>Đến</th>
                    <th>Tài khoản</th>
                  </tr>
                </thead>
                <tbody>
                  {statusLog.map((l) => (
                    <tr key={l.id}>
                      <td>
                        {l.taoLuc
                          ? new Date(l.taoLuc).toLocaleString("vi-VN")
                          : "—"}
                      </td>
                      <td>
                        {l.trangThaiCu
                          ? STATUS_LABEL[l.trangThaiCu] ?? l.trangThaiCu
                          : "—"}
                      </td>
                      <td>
                        {STATUS_LABEL[l.trangThaiMoi] ?? l.trangThaiMoi}
                      </td>
                      <td>{l.tenDangNhap || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      )}

      {canEdit ? (
        <Card>
          <Card.Header>Kết quả khám / Chẩn đoán / Đơn thuốc</Card.Header>
          <Card.Body>
            <Form.Group className="mb-3">
              <Form.Label>Chẩn đoán</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
              />
            </Form.Group>

            <h6 className="text-muted mb-2">Đơn thuốc theo danh mục</h6>
            {thuocList.length === 0 && (
              <p className="small text-muted">
                Chưa có thuốc trong danh mục. Quản trị có thể thêm tại mục{" "}
                <Link href="/thuoc">Danh mục thuốc</Link>.
              </p>
            )}
            {rows.length > 0 && (
              <Table responsive size="sm" bordered className="mb-2">
                <thead>
                  <tr>
                    <th>Thuốc</th>
                    <th style={{ width: 90 }}>Số lượng</th>
                    <th>Liều dùng / ghi chú</th>
                    <th style={{ width: 56 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => (
                    <tr key={idx}>
                      <td>
                        <Form.Select
                          value={row.maThuoc}
                          onChange={(e) =>
                            patchRow(idx, {
                              maThuoc: Number(e.target.value),
                            })
                          }
                        >
                          {thuocList.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.tenThuoc}
                              {t.donVi ? ` (${t.donVi})` : ""}
                            </option>
                          ))}
                        </Form.Select>
                      </td>
                      <td>
                        <Form.Control
                          type="number"
                          min={1}
                          value={row.soLuong ?? 1}
                          onChange={(e) =>
                            patchRow(idx, {
                              soLuong: Number(e.target.value) || 1,
                            })
                          }
                        />
                      </td>
                      <td>
                        <Form.Control
                          placeholder="VD: Sau ăn, 2 viên/lần"
                          value={row.lieuDung ?? ""}
                          onChange={(e) =>
                            patchRow(idx, { lieuDung: e.target.value })
                          }
                        />
                      </td>
                      <td className="align-middle text-center">
                        <button
                          type="button"
                          className="btn btn-sm lich-hen-remove-row-thuoc"
                          onClick={() => removeRow(idx)}
                          title="Xóa dòng"
                          aria-label="Xóa dòng thuốc"
                        >
                          <i className="bi bi-x-lg" aria-hidden />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
            <button
              type="button"
              className="btn btn-sm lich-hen-add-row-thuoc mb-3"
              onClick={addRow}
              disabled={thuocList.length === 0}
            >
              <i className="bi bi-plus-circle-fill me-2" aria-hidden />
              Thêm dòng thuốc
            </button>

            <Form.Group className="mb-3">
              <Form.Label>Ghi chú đơn thuốc (tự do)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={prescription}
                onChange={(e) => setPrescription(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Ghi chú hồ sơ</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Form.Group>
            <Button variant="primary" onClick={saveRecord}>
              <i className="bi bi-check2-circle me-2" aria-hidden />
              Lưu hồ sơ khám
            </Button>
          </Card.Body>
        </Card>
      ) : null}
      <div className="mt-3 d-flex flex-wrap gap-2 align-items-center lich-hen-detail-actions">
        <Link
          href={`/hoa-don/new?maLichHen=${id}`}
          className="btn btn-outline-primary d-inline-flex align-items-center gap-2"
        >
          <i className="bi bi-receipt" aria-hidden />
          Hóa đơn
        </Link>
        <Button
          variant="secondary"
          className="d-inline-flex align-items-center gap-2"
          onClick={() => router.back()}
        >
          <i className="bi bi-arrow-left-circle" aria-hidden />
          Quay lại
        </Button>
      </div>
    </div>
  );
}
