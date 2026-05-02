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
      setError("Thiếu mã lịch hẹn. Vui lòng tạo hóa đơn từ trang chi tiết lịch hẹn.");
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

  return (
    <div>
      <h2 className="mb-4">Lập hóa đơn</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {!maLichHenParam && (
        <Alert variant="warning" className="mb-3">
          Chưa có mã lịch hẹn trong đường dẫn. Hãy mở trang&nbsp;
          <a href="/lich-hen">danh sách lịch hẹn</a>, chọn một lượt khám rồi bấm
          &quot;Hóa đơn&quot;, hoặc thêm{" "}
          <code>?maLichHen=...</code> vào URL.
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
              <dd className="col-sm-9 mb-2">
                {lichHen.tenDichVu ?? "—"}
              </dd>
              <dt className="col-sm-3 text-muted">Trạng thái</dt>
              <dd className="col-sm-9 mb-0">
                <span className="badge bg-secondary-subtle text-secondary-emphasis rounded-pill">
                  {lichHen.trangThai ?? "—"}
                </span>
              </dd>
            </dl>
          </Card.Body>
        </Card>
      )}
      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="required">Mã lịch hẹn</Form.Label>
              <Form.Control value={maLichHenParam ?? ""} readOnly />
              <Form.Text className="text-muted">
                Hóa đơn được gắn trực tiếp với lịch hẹn theo yêu cầu mới.
              </Form.Text>
            </Form.Group>
            <div className="mb-3">
              <Button
                type="button"
                variant="outline-primary"
                size="sm"
                onClick={addItem}
              >
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
                      <td>
                        <Button
                          type="button"
                          variant="outline-danger"
                          size="sm"
                          onClick={() => removeItem(i)}
                        >
                          Xóa
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
            <Button type="submit" variant="primary">
              Tạo hóa đơn
            </Button>{" "}
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
            >
              Hủy
            </Button>
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
