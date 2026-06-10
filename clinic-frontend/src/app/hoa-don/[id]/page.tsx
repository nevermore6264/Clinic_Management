"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, Table, Button, Form, Alert, Modal } from "react-bootstrap";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import {
  invoicesApi,
  lichHenApi,
  type HoaDon,
  type LichHen,
  type PayOsTaoLinkPhanHoi,
} from "@/lib/api";
import { HoaDonStatusTag } from "@/components/HoaDonStatusTag";
import { PhuongThucThanhToanTag } from "@/components/PhuongThucThanhToanTag";
import { formatVndInput, parseVndInput } from "@/lib/moneyVnd";
import {
  formatGioHen,
  formatInstantVi,
  formatNgayGioRoRiPatient,
  formatNgayHenDayVi,
} from "@/lib/formatInstantVi";
import { laBacSiKhongXemHoaDon, laChiTaiKhoanBenhNhan } from "@/lib/roles";
import { LoadingState } from "@/components/LoadingState";

export default function InvoiceDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const { user, loading } = useAuth();
  const router = useRouter();
  const [inv, setInv] = useState<HoaDon | null>(null);
  const [lichHen, setLichHen] = useState<LichHen | null>(null);
  const [lichHenLoading, setLichHenLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("TIEN_MAT");
  const [payRef, setPayRef] = useState("");
  const [error, setError] = useState("");
  const [payOs, setPayOs] = useState<PayOsTaoLinkPhanHoi | null>(null);
  const [payOsLoading, setPayOsLoading] = useState(false);

  const [payOsNenPoll, setPayOsNenPoll] = useState(false);
  const daMoPayOsSession = useRef(false);
  const payOsDangHoiPollRef = useRef(false);
  const payOsPollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const payOsPollDeadlineRef = useRef(0);
  const payOsSyncInFlightRef = useRef(false);

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
    payOsDangHoiPollRef.current = false;
    setPayOsNenPoll(false);
  }, []);

  const syncPayOsMotLan = useCallback(async () => {
    if (payOsSyncInFlightRef.current) return null;
    payOsSyncInFlightRef.current = true;
    try {
      return await invoicesApi.syncPayOs(id);
    } finally {
      payOsSyncInFlightRef.current = false;
    }
  }, [id]);

  const startPayOsPoll = useCallback(() => {
    clearPayOsPoll();
    const deadline = Date.now() + 180_000;
    payOsPollDeadlineRef.current = deadline;
    payOsDangHoiPollRef.current = true;
    setPayOsNenPoll(true);
    const tick = async () => {
      if (Date.now() > payOsPollDeadlineRef.current) {
        clearPayOsPoll();
        return;
      }
      try {
        const u = await syncPayOsMotLan();
        if (!u) return;
        setInv(u);
        setError("");
        if (remainingOfHoaDon(u) <= 0.000001) {
          clearPayOsPoll();
        }
      } catch {
        // PayOS chưa PAID — tick sau sẽ hỏi lại.
      }
    };
    void tick();
    payOsPollTimerRef.current = setInterval(() => void tick(), 2500);
  }, [clearPayOsPoll, remainingOfHoaDon, syncPayOsMotLan]);

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
    if (!inv?.maLichHen) {
      setLichHen(null);
      setLichHenLoading(false);
      return;
    }
    setLichHenLoading(true);
    lichHenApi
      .layTheoMa(inv.maLichHen)
      .then(setLichHen)
      .catch(() => setLichHen(null))
      .finally(() => setLichHenLoading(false));
  }, [inv?.maLichHen, inv?.id]);

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
    const sync = () => {
      void syncPayOsMotLan()
        .then((u) => {
          if (!u) return;
          setInv(u);
          setError("");
          if (remainingOfHoaDon(u) <= 0.000001) {
            clearPayOsPoll();
          }
        })
        .catch(() => {});
    };
    const gapMs = () => (payOsDangHoiPollRef.current ? 2000 : 4000);
    const maybeSync = () => {
      if (!daMoPayOsSession.current && !payOsDangHoiPollRef.current) return;
      const now = Date.now();
      if (now - lastAt < gapMs()) return;
      lastAt = now;
      sync();
    };
    const onVis = () => {
      if (document.visibilityState !== "visible") return;
      maybeSync();
    };
    const onFocus = () => {
      maybeSync();
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", onFocus);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("focus", onFocus);
    };
  }, [user, id, remainingOfHoaDon, clearPayOsPoll, syncPayOsMotLan]);

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

  const taiPayOs = async () => {
    setPayOsLoading(true);
    setError("");
    try {
      const link = await invoicesApi.createPayOsLink(id);
      setPayOs(link);
      daMoPayOsSession.current = true;
      const url = link.checkoutUrl?.trim();
      if (url) {
        window.open(url, "_blank", "noopener,noreferrer");
      }
      startPayOsPoll();
    } catch (e: unknown) {
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
  const chiTaiKhoanBn = laChiTaiKhoanBenhNhan(user);
  const thoiDiemLap = formatNgayGioRoRiPatient(inv.taoLuc);

  return (
    <div
      className={`hoa-don-detail-page${
        chiTaiKhoanBn ? " patient-portal-hoadon-detail" : ""
      }`}
    >
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
        <Card
          className={`mb-3${
            chiTaiKhoanBn ? " patient-portal-hoadon-detail__summary" : ""
          }`}
        >
          <Card.Body>
            {chiTaiKhoanBn ? (
              <div className="patient-portal-hoadon-detail__times mb-3 pb-3 border-bottom">
                <div className="patient-portal-hoadon-detail__times-title small text-uppercase fw-semibold text-muted mb-2">
                  <i className="bi bi-clock-history me-1" aria-hidden />
                  Thời gian
                </div>
                <dl className="row g-2 mb-0 small patient-portal-hoadon-detail__dl">
                  <dt className="col-sm-4 col-md-3 text-muted mb-0">
                    Ngày lập hóa đơn
                  </dt>
                  <dd className="col-sm-8 col-md-9 mb-0 fw-medium">
                    {thoiDiemLap.ngay}
                  </dd>
                  <dt className="col-sm-4 col-md-3 text-muted mb-0">
                    Giờ lập hóa đơn
                  </dt>
                  <dd className="col-sm-8 col-md-9 mb-0">
                    <span className="patient-portal-hoadon-detail__time-badge">
                      {thoiDiemLap.gio}
                    </span>
                  </dd>
                  {inv.maLichHen ? (
                    <>
                      <dt className="col-sm-4 col-md-3 text-muted mb-0 pt-1">
                        Ngày khám
                      </dt>
                      <dd className="col-sm-8 col-md-9 mb-0 pt-1 fw-medium">
                        {lichHenLoading
                          ? "Đang tải…"
                          : lichHen
                            ? formatNgayHenDayVi(lichHen.ngayHen)
                            : "—"}
                      </dd>
                      <dt className="col-sm-4 col-md-3 text-muted mb-0">
                        Giờ khám
                      </dt>
                      <dd className="col-sm-8 col-md-9 mb-0">
                        {lichHenLoading ? (
                          "Đang tải…"
                        ) : lichHen ? (
                          <span className="patient-portal-hoadon-detail__time-badge">
                            {formatGioHen(lichHen.gioHen)}
                          </span>
                        ) : (
                          "—"
                        )}
                      </dd>
                    </>
                  ) : null}
                </dl>
              </div>
            ) : (
              <p className="small text-muted mb-3">
                <i className="bi bi-clock me-1" aria-hidden />
                Lập lúc:{" "}
                <strong className="text-body">
                  {inv.taoLuc ? formatInstantVi(inv.taoLuc) : "—"}
                </strong>
                {inv.maLichHen && lichHen ? (
                  <>
                    {" "}
                    · Lịch khám:{" "}
                    <strong className="text-body">
                      {formatNgayHenDayVi(lichHen.ngayHen)}{" "}
                      {formatGioHen(lichHen.gioHen)}
                    </strong>
                  </>
                ) : null}
              </p>
            )}
            <p>
              <strong>Bệnh nhân:</strong> {inv.tenBenhNhan}
            </p>
            {chiTaiKhoanBn && lichHen ? (
              <>
                <p className="mb-2">
                  <strong>Bác sĩ khám:</strong> {lichHen.tenBacSi ?? "—"}
                </p>
                <p className="mb-3">
                  <strong>Dịch vụ đặt lịch:</strong> {lichHen.tenDichVu ?? "—"}
                </p>
              </>
            ) : null}
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
                  Đang kiểm tra thanh toán với PayOS (mỗi giây). Số tiền đã trả cập nhật ngay khi
                  PayOS báo đã thanh toán — thường vài giây sau khi bạn hoàn tất; nếu chưa thấy,
                  bấm vào cửa sổ này một lần để kích hoạt cập nhật.
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
                  onClick={() => void taiPayOs()}
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
                <th className="text-center text-nowrap" style={{ width: "3rem" }}>
                  STT
                </th>
                <th>Dịch vụ</th>
                <th>Đơn giá</th>
                <th>SL</th>
                <th>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {inv.chiTiet?.map((i, idx) => (
                <tr key={i.id}>
                  <td className="text-center text-muted">{idx + 1}</td>
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
                  <th className="text-center text-nowrap" style={{ width: "3rem" }}>
                    STT
                  </th>
                  <th>Số tiền</th>
                  <th>Hình thức</th>
                  <th>Mã GD</th>
                  <th>Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {inv.giaoDichThanhToan.map((p, idx) => (
                  <tr key={p.id}>
                    <td className="text-center text-muted">{idx + 1}</td>
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
