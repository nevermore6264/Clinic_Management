"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, Table, Button, Form, Alert, Modal } from "react-bootstrap";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import { invoicesApi, type HoaDon } from "@/lib/api";
import { HoaDonStatusTag } from "@/components/HoaDonStatusTag";
import { PhuongThucThanhToanTag } from "@/components/PhuongThucThanhToanTag";
import { formatVndInput, parseVndInput } from "@/lib/moneyVnd";
import { formatInstantVi } from "@/lib/formatInstantVi";

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

  useEffect(() => {
    if (!loading && !user) router.replace("/dang-nhap");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || !id) return;
    invoicesApi
      .get(id)
      .then(setInv)
      .catch((e) => setError(e.message));
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
      setShowPayment(false);
      setPayAmount("");
      setPayRef("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi");
    }
  };

  if (!loading && !user) return null;
  if (!inv) return <div className="py-4">Đang tải...</div>;

  const remaining = inv.tongTien - inv.soTienDaTra;

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
            <strong>Còn lại:</strong> {remaining?.toLocaleString("vi-VN")}đ
          </p>
          <p className="d-flex align-items-center flex-wrap gap-2 mb-2">
            <strong>Trạng thái:</strong>{" "}
            <HoaDonStatusTag trangThai={inv.trangThai} />
          </p>
          {remaining > 0 && (
            <Button
              variant="primary"
              className="no-print d-inline-flex align-items-center gap-2"
              onClick={() => {
                setPayAmount(formatVndInput(remaining));
                setShowPayment(true);
              }}
            >
              <i className="bi bi-cash-stack" aria-hidden />
              Ghi nhận thanh toán
            </Button>
          )}
        </Card.Body>
      </Card>
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
      <Modal show={showPayment} onHide={() => setShowPayment(false)}>
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
              value={payRef}
              onChange={(e) => setPayRef(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPayment(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={submitPayment}>
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
