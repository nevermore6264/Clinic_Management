"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Alert, Button, Card, Table } from "react-bootstrap";
import { useAuth } from "@/lib/useAuth";
import { thuocApi, type DonThuocChiTietBangKe } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";

export default function DonThuocPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [error, setError] = useState("");
  const [rows, setRows] = useState<DonThuocChiTietBangKe[]>([]);

  useEffect(() => {
    if (!loading && !user) router.replace("/dang-nhap");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    if (!user.cacVaiTro.includes("QUAN_TRI")) router.replace("/bang-dieu-khien");
  }, [user, router]);

  useEffect(() => {
    if (!user?.cacVaiTro.includes("QUAN_TRI")) return;
    setError("");
    thuocApi
      .bangKeDonThuoc()
      .then((r) => setRows(Array.isArray(r) ? r : []))
      .catch((e) => setError(e instanceof Error ? e.message : "Lỗi"));
  }, [user]);

  if (loading) return null;
  if (!user) return null;
  if (!user.cacVaiTro.includes("QUAN_TRI")) return null;

  return (
    <div>
      <PageHeader
        title="Đơn thuốc"
        subtitle="Chi tiết đơn thuốc theo hồ sơ khám."
      >
        <div className="d-flex gap-2 flex-wrap">
          <Link
            href="/thuoc"
            className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-2"
          >
            <i className="bi bi-capsule me-1" aria-hidden />
            Danh mục thuốc
          </Link>
        </div>
      </PageHeader>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Card className="card--static border-0 shadow-sm overflow-hidden">
        <Card.Header className="fw-semibold">Đơn thuốc (chi tiết theo hồ sơ khám)</Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table responsive hover className="mb-0 align-middle small">
              <thead className="table-light">
                <tr>
                  <th>Ngày khám</th>
                  <th>Giờ</th>
                  <th>Bệnh nhân</th>
                  <th>Tên thuốc</th>
                  <th className="text-end">Số lượng</th>
                  <th>Liều dùng</th>
                  <th className="text-end">Đơn giá</th>
                  <th className="text-nowrap">Mã lịch</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((d) => (
                  <tr key={d.maChiTiet}>
                    <td>{d.ngayHen ?? "—"}</td>
                    <td>{d.gioHen != null ? String(d.gioHen).slice(0, 5) : "—"}</td>
                    <td>{d.tenBenhNhan ?? "—"}</td>
                    <td className="fw-medium">{d.tenThuoc ?? "—"}</td>
                    <td className="text-end">{d.soLuong ?? "—"}</td>
                    <td className="text-muted">{d.lieuDung || "—"}</td>
                    <td className="text-end">
                      {d.donGia != null
                        ? `${Number(d.donGia).toLocaleString("vi-VN")}đ`
                        : "—"}
                    </td>
                    <td>
                      <Link
                        href={`/lich-hen/${d.maLichHen}`}
                        className="text-decoration-none"
                      >
                        #{d.maLichHen}
                      </Link>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center text-muted py-4">
                      Chưa có dòng đơn thuốc nào (ghi trong hồ sơ khám sau khi khám).
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

