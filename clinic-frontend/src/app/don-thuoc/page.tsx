"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Alert, Button, Card, Form, Pagination, Table } from "react-bootstrap";
import { useAuth } from "@/lib/useAuth";
import { thuocApi, type DonThuocChiTietBangKe } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { catTrang, tongSoTrangClient } from "@/lib/phanTrangClient";

export default function DonThuocPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [error, setError] = useState("");
  const [rows, setRows] = useState<DonThuocChiTietBangKe[]>([]);
  const [trang, setTrang] = useState(0);
  const [kichThuoc, setKichThuoc] = useState(20);

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

  const tongTrang = tongSoTrangClient(rows.length, kichThuoc);
  const dongTrang = useMemo(
    () => catTrang(rows, trang, kichThuoc),
    [rows, trang, kichThuoc],
  );

  useEffect(() => {
    setTrang(0);
  }, [rows.length, kichThuoc]);

  if (loading) return null;
  if (!user) return null;
  if (!user.cacVaiTro.includes("QUAN_TRI")) return null;

  return (
    <div>
      <PageHeader
        title="Đơn thuốc"
        subtitle="Chi tiết đơn thuốc theo hồ sơ khám."
      >
        <div className="d-flex gap-2 flex-wrap align-items-center">
          <Form.Group className="mb-0">
            <Form.Label className="small text-muted mb-1">Số dòng / trang</Form.Label>
            <Form.Select
              size="sm"
              style={{ minWidth: "5.5rem" }}
              value={kichThuoc}
              onChange={(e) =>
                setKichThuoc(Number(e.target.value) || 20)
              }
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </Form.Select>
          </Form.Group>
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
                {dongTrang.map((d) => (
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
          {rows.length > 0 ? (
            <Card.Footer className="d-flex flex-wrap align-items-center justify-content-between gap-2 py-3">
              <div className="small text-muted">
                {rows.length} dòng khớp lọc · trang {trang + 1}/{tongTrang}
              </div>
              <Pagination className="mb-0 flex-wrap">
                <Pagination.Prev
                  disabled={trang <= 0}
                  onClick={() => setTrang((p) => Math.max(0, p - 1))}
                />
                <Pagination.Item active className="user-select-none">
                  {trang + 1} / {tongTrang}
                </Pagination.Item>
                <Pagination.Next
                  disabled={trang >= tongTrang - 1}
                  onClick={() =>
                    setTrang((p) => Math.min(tongTrang - 1, p + 1))
                  }
                />
              </Pagination>
            </Card.Footer>
          ) : null}
        </Card.Body>
      </Card>
    </div>
  );
}

