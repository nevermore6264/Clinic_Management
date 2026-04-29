"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Table, Button, Card, Form, Alert } from "react-bootstrap";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import { invoicesApi, type HoaDon } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { LoadingState } from "@/components/LoadingState";

export default function InvoicesPage() {
  const searchParams = useSearchParams();
  const maBenhNhanParam = searchParams.get("maBenhNhan");
  const { user, loading } = useAuth();
  const router = useRouter();
  const [list, setList] = useState<HoaDon[]>([]);
  const [from, setFrom] = useState(() => new Date().toISOString().slice(0, 10));
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) router.replace("/dang-nhap");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    invoicesApi
      .list(from, to, 0, 100)
      .then((r) => setList(r.content))
      .catch((e) => setError(e.message));
  }, [user, from, to]);

  if (loading) return <LoadingState />;
  if (!user) return null;

  return (
    <div>
      <PageHeader
        title="Hóa đơn & thanh toán"
        subtitle="Danh sách hóa đơn theo khoảng thời gian. Mở chi tiết để ghi nhận thanh toán."
      >
        <Button
          as={Link}
          href="/lich-hen"
          variant="outline-primary"
          className="d-inline-flex align-items-center gap-2"
        >
          <i className="bi bi-calendar-check" aria-hidden />
          Chọn lịch hẹn để lập hóa đơn
        </Button>
      </PageHeader>
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      <Card className="mb-3 card--static border-0 shadow-sm">
        <Card.Body>
          <div className="d-flex flex-wrap gap-3 align-items-end">
            <Form.Group>
              <Form.Label>Từ ngày</Form.Label>
              <Form.Control
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Đến ngày</Form.Label>
              <Form.Control
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </Form.Group>
          </div>
        </Card.Body>
      </Card>
      <Card className="card--static border-0 shadow-sm overflow-hidden">
        <div className="table-responsive">
        <Table responsive hover className="mb-0 align-middle">
          <thead>
            <tr>
              <th>Mã HĐ</th>
              <th>Bệnh nhân</th>
              <th>Tổng tiền</th>
              <th>Đã thanh toán</th>
              <th>Trạng thái</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {list
              .filter(
                (inv) =>
                  !maBenhNhanParam ||
                  inv.maBenhNhan === Number(maBenhNhanParam),
              )
              .map((inv) => (
                <tr key={inv.id}>
                  <td>{inv.soHoaDon}</td>
                  <td>{inv.tenBenhNhan}</td>
                  <td>{inv.tongTien?.toLocaleString("vi-VN")}đ</td>
                  <td>{inv.soTienDaTra?.toLocaleString("vi-VN")}đ</td>
                  <td>{inv.trangThai}</td>
                  <td className="text-end">
                    <Button
                      size="sm"
                      variant="outline-primary"
                      as={Link}
                      href={`/hoa-don/${inv.id}`}
                    >
                      <i className="bi bi-eye me-1" />
                      Chi tiết
                    </Button>
                  </td>
                </tr>
              ))}
          </tbody>
        </Table>
        </div>
      </Card>
    </div>
  );
}
