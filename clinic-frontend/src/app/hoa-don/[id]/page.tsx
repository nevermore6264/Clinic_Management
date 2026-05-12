"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, Table, Button, Form, Alert, Modal } from "react-bootstrap";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import {
  invoicesApi,
  type HoaDon,
  type PayOsTaoLinkPhanHoi,
} from "@/lib/api";
import { HoaDonStatusTag } from "@/components/HoaDonStatusTag";
import { PhuongThucThanhToanTag } from "@/components/PhuongThucThanhToanTag";
import { formatVndInput, parseVndInput } from "@/lib/moneyVnd";
import { formatInstantVi } from "@/lib/formatInstantVi";
import { laBacSiKhongXemHoaDon } from "@/lib/roles";
import { LoadingState } from "@/components/LoadingState";

export default function InvoiceDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const { user, loading } = useAuth();
  const router = useRouter();
  const [inv, setInv] = useState<HoaDon | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("TIEN_MAT");
  const [payRef, setPayRef] = useState("");
  const [error, setError] = useState("");
  const [payOs, setPayOs] = useState<PayOsTaoLinkPhanHoi | null>(null);
  const [payOsLoading, setPayOsLoading] = useState(false);

  useEffect(() => {
    setPayOs(null);
  }, [id]);

  useEffect(() => {
    if (!loading && !user) router.replace("/dang-nhap");
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading && user && laBacSiKhongXemHoaDon(user)) {
      router.replace("/bang-dieu-khien");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || !id) return;
    if (laBacSiKhongXemHoaDon(user)) return;
    invoicesApi
      .get(id)
      .then(setInv)
      .catch((e) => setError(e.message));
  }, [user, id]);

  useEffect(() => {
    if (!user || !id || typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    const q = sp.get("payos");
    if (q === "success") {
      invoicesApi
        .get(id)
        .then(setInv)
        .catch((e) => setError(e.message));
      router.replace(`/hoa-don/${id}`);
    } else if (q === "cancel") {
      router.replace(`/hoa-don/${id}`);
    }
  }, [user, id, router]);

  const submitPayment = async () => {
    const amount = parseVndInput(payAmount);
    if (amount === undefined || amount <= 0) {
      setError("Nhập số tiền hợp lệ.");
      return;
    }
    try {
      await invoicesApi.addPayment(id, {
        amount,
        method: payMethod,
        transactionRef: payRef || undefined,
      });
      const updated = await invoicesApi.get(id);
      setInv(updated);
      setShowPayment(false);
      setPayAmount("");
      setPayRef("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi");
    }
  };

  const coTheGhiNhanThuCong =
    user?.cacVaiTro?.some((r) =>
      ["QUAN_TRI", "LE_TAN", "THU_NGAN"].includes(r),
    ) ?? false;

  const taiPayOs = async () => {
    setPayOsLoading(true);
    setError("");
    try {
      const link = await invoicesApi.createPayOsLink(id);
      setPayOs(link);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi PayOS");
    } finally {
      setPayOsLoading(false);
    }
  };

  const qrPayOsSrc = (qr: string) => {
    if (!qr) return "";
    if (qr.startsWith("data:")) return qr;
    return `data:image/png;base64,${qr}`;
  };

  if (loading) return <LoadingState />;
  if (!user) return null;
  if (laBacSiKhongXemHoaDon(user)) return <LoadingState />;
  if (!inv) return <div className="py-4">Đang tải...</div>;

  const tongTien = Number(inv.tongTien);
  const daTra = Number(inv.soTienDaTra);
  const remaining =
    (Number.isFinite(tongTien) ? tongTien : 0) -
    (Number.isFinite(daTra) ? daTra : 0);
  const conNo = remaining > 0.000001;

  const hienGhiNhanThuCong = conNo && coTheGhiNhanThuCong;

  return (
    <div className="hoa-don-detail-page">
      <div className="hoa-don-printable">
      <h2 className="mb-4">Hóa đơn {inv.soHoaDon}</h2>
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")} className="no-print">
          {error}
        </Alert>
      )}
      <Card className="mb-3">
        <Card.Body>
          <p>
            <strong>Bệnh nhân:</strong> {inv.tenBenhNhan}
          </p>
          <p>
            <strong>Tổng tiền:</strong>{" "}
            {inv.tongTien?.toLocaleString("vi-VN")}đ
          </p>
          <p>
            <strong>Đã thanh toán:</strong>{" "}
            {inv.soTienDaTra?.toLocaleString("vi-VN")}đ
          </p>
          <p>
            <strong>Còn lại:</strong>{" "}
            {Number.isFinite(remaining)
              ? remaining.toLocaleString("vi-VN")
              : "—"}
            đ
          </p>
          <p className="d-flex align-items-center flex-wrap gap-2 mb-0">
            <strong>Trạng thái:</strong>{" "}
            <HoaDonStatusTag trangThai={inv.trangThai} />
          </p>
        </Card.Body>
      </Card>

      {!conNo && (
        <Alert variant="secondary" className="no-print mb-3">
          Hóa đơn không còn số tiền cần thanh toán.
        </Alert>
      )}

      {conNo && (
        <Card className="no-print mb-3 border-primary border-2">
          <Card.Header className="bg-primary text-white py-3 fw-semibold">
            <i className="bi bi-credit-card me-2" aria-hidden />
            Thanh toán
          </Card.Header>
          <Card.Body>
            <div className="mb-4 pb-4 border-bottom">
              <p className="fw-semibold mb-2">Trực tuyến (PayOS)</p>
                <p className="text-muted small mb-3">
                  Tạo mã QR hoặc link để khách quét / thanh toán PayOS. Sau khi
                  PayOS xác nhận, hệ thống tự ghi nhận (webhook).
                </p>
                <Button
                  variant="primary"
                  className="d-inline-flex align-items-center gap-2"
                  disabled={payOsLoading}
                  onClick={() => void taiPayOs()}
                >
                  <i className="bi bi-qr-code-scan" aria-hidden />
                  {payOsLoading
                    ? "Đang tạo link…"
                    : payOs
                      ? "Tạo QR / link mới"
                      : "Tạo QR / link thanh toán"}
                </Button>
                {payOs && (
                  <div className="mt-3">
                    {payOs.qrCode ? (
                      <img
                        src={qrPayOsSrc(payOs.qrCode)}
                        alt="Mã QR PayOS"
                        className="d-block mb-2 border rounded bg-white p-1"
                        width={220}
                        height={220}
                      />
                    ) : null}
                    <p className="small text-muted mb-1">
                      Số tiền: {payOs.amount.toLocaleString("vi-VN")}đ
                    </p>
                    {(payOs.accountNumber || payOs.accountName) && (
                      <p className="small mb-2">
                        {payOs.accountNumber
                          ? `STK: ${payOs.accountNumber}`
                          : null}
                        {payOs.accountNumber && payOs.accountName ? " — " : null}
                        {payOs.accountName || null}
                      </p>
                    )}
                    <Button
                      variant="success"
                      className="d-inline-flex align-items-center gap-2"
                      href={payOs.checkoutUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="bi bi-box-arrow-up-right" aria-hidden />
                      Mở trang thanh toán PayOS
                    </Button>
                  </div>
                )}
              </div>

            {hienGhiNhanThuCong && (
              <div>
                <p className="fw-semibold mb-2">Tại quầy (ghi nhận tay)</p>
                <p className="text-muted small mb-3">
                  Dùng khi thu tiền mặt / thẻ / chuyển khoản tại phòng khám.
                </p>
                <Button
                  variant="outline-primary"
                  className="d-inline-flex align-items-center gap-2"
                  onClick={() => {
                    setPayAmount(formatVndInput(remaining));
                    setShowPayment(true);
                  }}
                >
                  <i className="bi bi-cash-stack" aria-hidden />
                  Ghi nhận thanh toán
                </Button>
              </div>
            )}

            {!hienGhiNhanThuCong && (
              <p className="text-muted small mb-0 mt-2">
                Ghi nhận tiền mặt/thẻ/chuyển khoản tại quầy: cần tài khoản quản
                trị, lễ tân hoặc thu ngân.
              </p>
            )}
          </Card.Body>
        </Card>
      )}

      <Card className="mb-3">
        <Card.Header>Chi tiết dịch vụ</Card.Header>
        <Table size="sm" className="mb-0">
          <thead>
            <tr>
              <th>Dịch vụ</th>
              <th>Đơn giá</th>
              <th>SL</th>
              <th>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {inv.chiTiet?.map((i) => (
              <tr key={i.id}>
                <td>{i.tenDichVu}</td>
                <td>{i.donGia?.toLocaleString("vi-VN")}đ</td>
                <td>{i.soLuong}</td>
                <td>{i.thanhTien?.toLocaleString("vi-VN")}đ</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
      {inv.giaoDichThanhToan?.length > 0 && (
        <Card>
          <Card.Header>Lịch sử thanh toán</Card.Header>
          <Table size="sm" className="mb-0">
            <thead>
              <tr>
                <th>Số tiền</th>
                <th>Hình thức</th>
                <th>Mã GD</th>
                <th>Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {inv.giaoDichThanhToan.map((p) => (
                <tr key={p.id}>
                  <td>{p.soTien?.toLocaleString("vi-VN")}đ</td>
                  <td>
                    <PhuongThucThanhToanTag phuongThuc={p.phuongThuc} />
                  </td>
                  <td>{p.maThamChieu || "—"}</td>
                  <td className="text-nowrap">
                    {formatInstantVi(p.lucThanhToan)}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}
      </div>
      <Modal
        show={showPayment}
        onHide={() => setShowPayment(false)}
        centered
      >
        <Modal.Header closeButton>Ghi nhận thanh toán</Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-2">
            <Form.Label>Số tiền (VNĐ)</Form.Label>
            <Form.Control
              type="text"
              inputMode="numeric"
              autoComplete="off"
              spellCheck={false}
              value={payAmount}
              onChange={(e) => {
                const n = parseVndInput(e.target.value);
                setPayAmount(n === undefined ? "" : formatVndInput(n));
              }}
              placeholder={formatVndInput(remaining)}
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Hình thức</Form.Label>
            <Form.Select
              value={payMethod}
              onChange={(e) => setPayMethod(e.target.value)}
            >
              <option value="TIEN_MAT">Tiền mặt</option>
              <option value="THE">Thẻ</option>
              <option value="CHUYEN_KHOAN">Chuyển khoản</option>
              <option value="TRUC_TUYEN">Trực tuyến</option>
            </Form.Select>
          </Form.Group>
          <Form.Group>
            <Form.Label>Mã giao dịch (nếu có)</Form.Label>
            <Form.Control
              placeholder="Mã giao dịch ngân hàng / cổng thanh toán"
              value={payRef}
              onChange={(e) => setPayRef(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="clinic-modal-footer-actions">
          <Button
            type="button"
            className="btn-modal-dismiss"
            onClick={() => setShowPayment(false)}
          >
            <i className="bi bi-x-lg me-2" aria-hidden />
            Hủy
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={submitPayment}
          >
            <i className="bi bi-check2-circle me-2" aria-hidden />
            Xác nhận
          </Button>
        </Modal.Footer>
      </Modal>
      <div className="no-print mt-3 d-flex flex-wrap gap-2">
        <Link
          href={`/hoa-don/${id}/print`}
          className="btn btn-primary d-inline-flex align-items-center gap-2"
        >
          <i className="bi bi-printer" aria-hidden />
          In hóa đơn
        </Link>
        <Link
          href="/hoa-don"
          className="btn btn-secondary d-inline-flex align-items-center gap-2"
        >
          <i className="bi bi-arrow-left" aria-hidden />
          Quay lại
        </Link>
      </div>
    </div>
  );
}
