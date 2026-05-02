"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Table, Card, Form, Alert, Badge } from "react-bootstrap";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import { appointmentsApi, type LichHen } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { LoadingState } from "@/components/LoadingState";

const STATUS_LABEL: Record<string, string> = {
  DA_DAT: "Đã đặt",
  DA_TIEP_NHAN: "Tiếp nhận",
  DANG_KHAM: "Đang khám",
  XET_NGHIEM: "Xét nghiệm",
  DA_KE_DON: "Đã kê đơn",
  DA_THANH_TOAN: "Đã thanh toán",
  HUY: "Đã hủy",
  VANG: "Không đến",
};

function AppointmentsPageInner() {
  const searchParams = useSearchParams();
  const maBenhNhanParam = searchParams.get("maBenhNhan");
  const { user, loading } = useAuth();
  const router = useRouter();
  const [list, setList] = useState<LichHen[]>([]);
  const [from, setFrom] = useState(() => new Date().toISOString().slice(0, 10));
  const [to, setTo] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) router.replace("/dang-nhap");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    appointmentsApi
      .list(from, to, 0, 100)
      .then((r) => setList(r.content))
      .catch((e) => setError(e.message));
  }, [user, from, to]);

  if (loading) return <LoadingState />;
  if (!user) return null;

  return (
    <div>
      <PageHeader
        title="Lịch khám"
        subtitle="Lọc theo khoảng ngày, xem trạng thái và mở chi tiết từng lượt khám."
      >
        <Link
          href="/lich-hen/new"
          className="btn btn-primary d-inline-flex align-items-center gap-2"
        >
          <i className="bi bi-plus-lg" aria-hidden />
          Đặt lịch mới
        </Link>
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
              <th>Ngày</th>
              <th>Giờ</th>
              <th>Bệnh nhân</th>
              <th>Bác sĩ</th>
              <th>Dịch vụ</th>
              <th>Trạng thái</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {list
              .filter(
                (a) =>
                  !maBenhNhanParam ||
                  a.maBenhNhan === Number(maBenhNhanParam),
              )
              .map((a) => (
                <tr key={a.id}>
                  <td>{a.ngayHen}</td>
                  <td>{a.gioHen}</td>
                  <td>{a.tenBenhNhan}</td>
                  <td>{a.tenBacSi}</td>
                  <td>{a.tenDichVu}</td>
                  <td>
                    <Badge bg="secondary">
                      {STATUS_LABEL[a.trangThai || ""] || a.trangThai}
                    </Badge>
                  </td>
                  <td className="text-end">
                    <Link
                      href={`/lich-hen/${a.id}`}
                      className="btn btn-sm btn-outline-primary"
                    >
                      <i className="bi bi-arrow-right-circle me-1" />
                      Chi tiết
                    </Link>
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

export default function AppointmentsPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <AppointmentsPageInner />
    </Suspense>
  );
}
