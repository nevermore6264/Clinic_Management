"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, Form, Button, Alert, Table, Spinner } from "react-bootstrap";
import { useAuth } from "@/lib/useAuth";
import {
  invoicesApi,
  lichHenApi,
  servicesApi,
  type DichVu,
  type LichHen,
} from "@/lib/api";
import { LoadingState } from "@/components/LoadingState";
import { metaTrangThaiLichHen } from "@/lib/lichHenStatus";

function dinhDangNgayHen(ngayHen?: string) {
  if (!ngayHen) return "—";
  const d = new Date(ngayHen.includes("T") ? ngayHen : `${ngayHen}T12:00:00`);
  if (Number.isNaN(d.getTime())) return ngayHen;
  return d.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function dinhDangGioHen(gioHen?: string) {
  if (!gioHen) return "—";
  return gioHen.length >= 5 ? gioHen.slice(0, 5) : gioHen;
}

function NewInvoicePageInner() {
  const searchParams = useSearchParams();
  const maLichHenParam = searchParams.get("maLichHen");
  const { user, loading } = useAuth();
  const router = useRouter();
  const [services, setServices] = useState<DichVu[]>([]);
  const [lichHen, setLichHen] = useState<LichHen | null>(null);
  const [lichHenLoading, setLichHenLoading] = useState(false);
  const [lichHenError, setLichHenError] = useState("");
  const [items, setItems] = useState<{ serviceId: number; quantity: number }[]>(
    [],
  );
  const [error, setError] = useState("");

  const daGoiYDichVuTuLich = useRef(false);

  useEffect(() => {
    daGoiYDichVuTuLich.current = false;
    setItems([]);
  }, [maLichHenParam]);

  useEffect(() => {
    if (
      daGoiYDichVuTuLich.current ||
      !lichHen?.maDichVu ||
      services.length === 0 ||
      items.length > 0
    )
      return;
    const coTrongDanhSach = services.some((s) => s.id === lichHen.maDichVu);
    if (!coTrongDanhSach) return;
    daGoiYDichVuTuLich.current = true;
    setItems([{ serviceId: lichHen.maDichVu, quantity: 1 }]);
  }, [lichHen, services, items.length]);

  useEffect(() => {
    if (!loading && !user) router.replace("/dang-nhap");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    servicesApi
      .list()
      .then(setServices)
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!user || !maLichHenParam) {
      setLichHen(null);
      setLichHenError("");
      return;
    }
    const id = Number(maLichHenParam);
    if (Number.isNaN(id) || id <= 0) {
      setLichHen(null);
      setLichHenError("Mã lịch hẹn không hợp lệ.");
      return;
    }
    setLichHenLoading(true);
    setLichHenError("");
    lichHenApi
      .layTheoMa(id)
      .then((lh) => {
        setLichHen(lh);
      })
      .catch((e: unknown) => {
        setLichHen(null);
        setLichHenError(
          e instanceof Error ? e.message : "Không tải được thông tin lịch hẹn.",
        );
      })
      .finally(() => setLichHenLoading(false));
  }, [user, maLichHenParam]);

  const addItem = () => {
    const first = services[0];
    if (first) setItems([...items, { serviceId: first.id, quantity: 1 }]);
  };

  const updateItem = (
    index: number,
    field: "serviceId" | "quantity",
    value: number,
  ) => {
    const next = [...items];
    if (field === "serviceId") next[index].serviceId = value;
    else next[index].quantity = value;
    setItems(next);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const maLichHen = Number(maLichHenParam);
    if (!maLichHenParam || Number.isNaN(maLichHen) || maLichHen <= 0) {
      setError(
        "Thiếu mã lịch hẹn. Vui lòng tạo hóa đơn từ trang chi tiết lịch hẹn.",
      );
      return;
    }
    if (items.length === 0) {
      setError("Chọn ít nhất một dịch vụ.");
      return;
    }
    try {
      await invoicesApi.create(maLichHen, items);
      router.push("/hoa-don");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Lỗi");
    }
  };

  if (!loading && !user) return null;

  const tagMetaLichHen = metaTrangThaiLichHen(lichHen?.trangThai);

  return (
    <div className="hoa-don-new-page lich-hen-detail-page">
      <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-4">
        <h2 className="mb-0">Lập hóa đơn</h2>
        {maLichHenParam ? (
          <Form.Group className="mb-0 hoa-don-new-ma-lich">
            <Form.Label className="small text-muted mb-1">
              Mã lịch hẹn
            </Form.Label>
            <Form.Control
              readOnly
              value={maLichHenParam}
              className="fw-semibold bg-white"
              style={{ maxWidth: "14rem" }}
            />
          </Form.Group>
        ) : null}
      </div>
      {error && <Alert variant="danger">{error}</Alert>}
      {!maLichHenParam && (
        <Alert variant="warning" className="mb-3">
          Chưa có mã lịch hẹn trong đường dẫn. Hãy mở trang&nbsp;
          <a href="/lich-hen">danh sách lịch hẹn</a>, chọn một lượt khám rồi bấm
          &quot;Hóa đơn&quot;, hoặc thêm <code>?maLichHen=...</code> vào URL.
        </Alert>
      )}
      {lichHenLoading && (
        <div className="d-flex align-items-center gap-2 text-muted mb-3">
          <Spinner animation="border" size="sm" />
          Đang tải thông tin lịch hẹn…
        </div>
      )}
      {lichHenError && !lichHenLoading && (
        <Alert variant="danger" className="mb-3">
          {lichHenError}
        </Alert>
      )}
      {lichHen && !lichHenLoading && (
        <Card className="mb-3 border-0 shadow-sm bg-light">
          <Card.Body className="py-3">
            <div className="small text-uppercase text-muted fw-semibold mb-2">
              Lịch hẹn liên kết
            </div>
            <dl className="row mb-0 small">
              <dt className="col-sm-3 text-muted">Bệnh nhân</dt>
              <dd className="col-sm-9 mb-2 fw-medium">
                {lichHen.tenBenhNhan ?? "—"}
              </dd>
              <dt className="col-sm-3 text-muted">Bác sĩ</dt>
              <dd className="col-sm-9 mb-2">{lichHen.tenBacSi ?? "—"}</dd>
              <dt className="col-sm-3 text-muted">Ngày & giờ</dt>
              <dd className="col-sm-9 mb-2">
                {dinhDangNgayHen(lichHen.ngayHen)} ·{" "}
                {dinhDangGioHen(lichHen.gioHen)}
              </dd>
              <dt className="col-sm-3 text-muted">Dịch vụ đặt</dt>
              <dd className="col-sm-9 mb-2">{lichHen.tenDichVu ?? "—"}</dd>
              <dt className="col-sm-3 text-muted">Trạng thái</dt>
              <dd className="col-sm-9 mb-0">
                <span
                  className={`lich-hen-status-tag lich-hen-status-tag--${tagMetaLichHen.slug}`}
                >
                  <i className={`bi ${tagMetaLichHen.icon}`} aria-hidden />
                  {tagMetaLichHen.label}
                </span>
              </dd>
            </dl>
          </Card.Body>
        </Card>
      )}
      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <div className="mb-3">
              <Button
                type="button"
                variant="outline-primary"
                size="sm"
                className="d-inline-flex align-items-center gap-2"
                onClick={addItem}
              >
                <i className="bi bi-plus-lg" aria-hidden />
                Thêm dịch vụ
              </Button>
            </div>
            {items.length > 0 && (
              <Table size="sm" className="mb-3">
                <thead>
                  <tr>
                    <th>Dịch vụ</th>
                    <th>Số lượng</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i}>
                      <td>
                        <Form.Select
                          value={item.serviceId}
                          onChange={(e) =>
                            updateItem(i, "serviceId", Number(e.target.value))
                          }
                        >
                          {services.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.ten} - {s.gia?.toLocaleString("vi-VN")}đ
                            </option>
                          ))}
                        </Form.Select>
                      </td>
                      <td>
                        <Form.Control
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(
                              i,
                              "quantity",
                              Number(e.target.value) || 1,
                            )
                          }
                          style={{ width: 80 }}
                        />
                      </td>
                      <td className="align-middle text-center">
                        <button
                          type="button"
                          className="btn btn-sm lich-hen-remove-row-thuoc"
                          onClick={() => removeItem(i)}
                          title="Xóa dòng"
                          aria-label="Xóa dòng dịch vụ"
                        >
                          <i className="bi bi-x-lg" aria-hidden />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
            <div className="d-flex flex-wrap gap-2 pt-2 border-top mt-3">
              <Button
                type="submit"
                variant="primary"
                className="btn-bac-si-modal-primary d-inline-flex align-items-center px-4"
              >
                <i className="bi bi-receipt-cutoff me-2" aria-hidden />
                Tạo hóa đơn
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="btn-bac-si-modal-cancel d-inline-flex align-items-center"
                onClick={() => router.back()}
              >
                <i className="bi bi-x-circle me-2" aria-hidden />
                Hủy
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}

export default function NewInvoicePage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <NewInvoicePageInner />
    </Suspense>
  );
}
