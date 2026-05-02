"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Table, Card, Form, Alert } from "react-bootstrap";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import { invoicesApi, type HoaDon } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { LoadingState } from "@/components/LoadingState";
import { HoaDonStatusTag } from "@/components/HoaDonStatusTag";
import { daysAgoLocalYmd, todayLocalYmd } from "@/lib/dateLocal";

function InvoicesPageInner() {
  const searchParams = useSearchParams();
  const maBenhNhanParam = searchParams.get("maBenhNhan");
  const { user, loading } = useAuth();
  const router = useRouter();
  const [list, setList] = useState<HoaDon[]>([]);
  const [from, setFrom] = useState(() => daysAgoLocalYmd(30));
  const [to, setTo] = useState(todayLocalYmd);
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
        subtitle="Lọc theo ngày tạo hóa đơn."
      >
        <Link
          href="/lich-hen"
          className="btn btn-outline-primary d-inline-flex align-items-center gap-2"
        >
          <i className="bi bi-calendar-check" aria-hidden />
          Chọn lịch hẹn để lập hóa đơn
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
              <th>Mã HĐ</th>
              <th>Bệnh nhân</th>
              <th>Tổng tiền</th>
              <th>Đã thanh toán</th>
              <th>Trạng thái</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              const rows = list.filter(
                (inv) =>
                  !maBenhNhanParam ||
                  inv.maBenhNhan === Number(maBenhNhanParam),
              );
              if (rows.length === 0) {
                return (
                  <tr>
                    <td colSpan={6} className="text-muted text-center py-4">
                      {list.length === 0
                        ? "Không có hóa đơn trong khoảng ngày đã chọn. Thử mở rộng Từ ngày / Đến ngày."
                        : "Không có hóa đơn khớp bộ lọc (maBenhNhan)."}
                    </td>
                  </tr>
                );
              }
              return rows.map((inv) => (
                <tr key={inv.id}>
                  <td>{inv.soHoaDon}</td>
                  <td>{inv.tenBenhNhan}</td>
                  <td>{inv.tongTien?.toLocaleString("vi-VN")}đ</td>
                  <td>{inv.soTienDaTra?.toLocaleString("vi-VN")}đ</td>
                  <td>
                    <HoaDonStatusTag trangThai={inv.trangThai} />
                  </td>
                  <td className="text-end">
                    <Link
                      href={`/hoa-don/${inv.id}`}
                      className="btn btn-sm btn-outline-primary"
                    >
                      <i className="bi bi-eye me-1" />
                      Chi tiết
                    </Link>
                  </td>
                </tr>
              ));
            })()}
          </tbody>
        </Table>
        </div>
      </Card>
    </div>
  );
}

export default function InvoicesPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <InvoicesPageInner />
    </Suspense>
  );
}
