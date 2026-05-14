"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, Table, Button, Form, Alert, Modal } from "react-bootstrap";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import { invoicesApi, type HoaDon, type PayOsTaoLinkPhanHoi } from "@/lib/api";
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

  const [payOsNenPoll, setPayOsNenPoll] = useState(false);
  const daMoPayOsSession = useRef(false);
  const payOsPollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const payOsPollDeadlineRef = useRef(0);

  const remainingOfHoaDon = useCallback((u: HoaDon) => {
    const tong = Number(u.tongTien);
    const da = Number(u.soTienDaTra);
    return (
      (Number.isFinite(tong) ? tong : 0) - (Number.isFinite(da) ? da : 0)
    );
  }, []);

  const clearPayOsPoll = useCallback(() => {
    if (payOsPollTimerRef.current != null) {
      clearInterval(payOsPollTimerRef.current);
      payOsPollTimerRef.current = null;
    }
    payOsPollDeadlineRef.current = 0;
    setPayOsNenPoll(false);
  }, []);

  const startPayOsPoll = useCallback(() => {
    clearPayOsPoll();
    const deadline = Date.now() + 120_000;
    payOsPollDeadlineRef.current = deadline;
    setPayOsNenPoll(true);
    const tick = async () => {
      if (Date.now() > payOsPollDeadlineRef.current) {
        clearPayOsPoll();
        return;
      }
      try {
        const u = await invoicesApi.syncPayOs(id);
        setInv(u);
        setError("");
        if (remainingOfHoaDon(u) <= 0.000001) {
          clearPayOsPoll();
        }
      } catch {
        // PayOS chưa PAID / API tạm lỗi — tiếp tục hỏi tới hết hạn (webhook không tới localhost).
      }
    };
    void tick();
    payOsPollTimerRef.current = setInterval(() => void tick(), 2500);
  }, [id, clearPayOsPoll, remainingOfHoaDon]);

  useEffect(() => {
    return () => clearPayOsPoll();
  }, [clearPayOsPoll]);

  useEffect(() => {
    setPayOs(null);
    daMoPayOsSession.current = false;
    clearPayOsPoll();
  }, [id, clearPayOsPoll]);

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
    if (q === "cancel") {
      router.replace(`/hoa-don/${id}`);
      return;
    }
    if (q !== "success") return;
    router.replace(`/hoa-don/${id}`);
    startPayOsPoll();
  }, [user, id, router, startPayOsPoll]);

  useEffect(() => {
    if (!user || !id || typeof document === "undefined") return;
    let lastAt = 0;
    const gapMs = 4000;
    const onVis = () => {
      if (document.visibilityState !== "visible") return;
      if (!daMoPayOsSession.current) return;
      const now = Date.now();
      if (now - lastAt < gapMs) return;
      lastAt = now;
      void invoicesApi
        .syncPayOs(id)
        .then((u) => {
          setInv(u);
          setError("");
        })
        .catch(() => {});
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [user, id]);

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
      clearPayOsPoll();
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

  const taiPayOs = async (tabDaGiuCho: Window | null) => {
    setPayOsLoading(true);
    setError("");
    try {
      const link = await invoicesApi.createPayOsLink(id);
      setPayOs(link);
      daMoPayOsSession.current = true;
      const url = link.checkoutUrl?.trim();
      if (url) {
        if (tabDaGiuCho && !tabDaGiuCho.closed) {
          tabDaGiuCho.location.href = url;
        } else {
          window.open(url, "_blank", "noopener,noreferrer");
        }
      }
      startPayOsPoll();
    } catch (e: unknown) {
      if (tabDaGiuCho && !tabDaGiuCho.closed) {
        tabDaGiuCho.close();
      }
      setError(e instanceof Error ? e.message : "Lỗi PayOS");
    } finally {
      setPayOsLoading(false);
    }
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
          <Alert
            variant="danger"
            dismissible
            onClose={() => setError("")}
            className="no-print"
          >
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
            <Card.Header className="bg-primary py-3 fw-semibold">
              <i className="bi bi-credit-card me-2" aria-hidden />
              Thanh toán
            </Card.Header>
            <Card.Body>
              {payOsNenPoll ? (
                <p className="small text-muted mb-2">
                  <i className="bi bi-arrow-repeat me-1" aria-hidden />
                  Đang hỏi PayOS định kỳ (tối đa ~2 phút). Trên localhost webhook thường
                  không tới — hệ thống dùng API PayOS; khi thanh toán xong, số tiền đã trả sẽ
                  cập nhật tự động.
                </p>
              ) : null}
              <div className="d-flex flex-wrap gap-2 align-items-center">
                {hienGhiNhanThuCong ? (
                  <Button
                    type="button"
                    variant="outline-primary"
                    className="d-inline-flex align-items-center gap-2"
                    disabled={payOsLoading}
                    onClick={() => {
                      setPayAmount(formatVndInput(remaining));
                      setShowPayment(true);
                    }}
                  >
                    <i className="bi bi-cash-stack" aria-hidden />
                    Ghi nhận thanh toán
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="primary"
                  className="d-inline-flex align-items-center gap-2"
                  disabled={payOsLoading}
                  onClick={() => {
                    const tab =
                      typeof window !== "undefined"
                        ? window.open(
                            "about:blank",
                            "_blank",
                            "noopener,noreferrer",
                          )
                        : null;
                    void taiPayOs(tab);
                  }}
                >
                  <i className="bi bi-box-arrow-up-right" aria-hidden />
                  {payOsLoading
                    ? "Đang mở PayOS…"
                    : payOs
                      ? "Thanh toán online qua PayOS (link mới)"
                      : "Thanh toán online qua PayOS"}
                </Button>
              </div>
              {payOs ? (
                <p className="small text-muted mt-3 mb-0">
                  Link gần nhất: {payOs.amount.toLocaleString("vi-VN")}đ
                  {payOs.accountNumber || payOs.accountName ? (
                    <>
                      {" "}
                      ·{" "}
                      {payOs.accountNumber ? `STK ${payOs.accountNumber}` : ""}
                      {payOs.accountNumber && payOs.accountName ? " — " : ""}
                      {payOs.accountName ?? ""}
                    </>
                  ) : null}
                  {" · "}
                  <a
                    href={payOs.checkoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Mở lại PayOS
                  </a>
                </p>
              ) : null}
              {!hienGhiNhanThuCong ? (
                <p className="text-muted small mb-0 mt-3">
                  Ghi nhận tại quầy: cần tài khoản quản trị, lễ tân hoặc thu
                  ngân.
                </p>
              ) : null}
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
      <Modal show={showPayment} onHide={() => setShowPayment(false)} centered>
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
          <Button type="button" variant="primary" onClick={submitPayment}>
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
