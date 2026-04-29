"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Table, Button, Card, Alert } from "react-bootstrap";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import { servicesApi, type DichVu } from "@/lib/api";

export default function ServicesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [list, setList] = useState<DichVu[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) router.replace("/dang-nhap");
    if (user && !user.cacVaiTro.includes("QUAN_TRI")) router.replace("/bang-dieu-khien");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user?.cacVaiTro.includes("QUAN_TRI")) return;
    servicesApi
      .list()
      .then(setList)
      .catch((e) => setError(e.message));
  }, [user]);

  if (!user?.cacVaiTro.includes("QUAN_TRI")) return null;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Quản lý dịch vụ & bảng giá</h2>
        <div className="d-flex gap-2">
          <Button as={Link} href="/loai-dich-vu" variant="outline-primary">
            Quản lý loại dịch vụ
          </Button>
          <Button as={Link} href="/dich-vu/new">
            Thêm dịch vụ
          </Button>
        </div>
      </div>
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      <Card>
        <Table responsive hover className="mb-0">
          <thead>
            <tr>
              <th>Loại dịch vụ</th>
              <th>Tên dịch vụ</th>
              <th>Mô tả</th>
              <th>Đơn giá</th>
              <th>Trạng thái</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {list.map((s) => (
              <tr key={s.id}>
                <td>{s.tenLoaiDichVu || "Chưa phân loại"}</td>
                <td>{s.ten}</td>
                <td>{s.moTa || "—"}</td>
                <td>{s.gia?.toLocaleString("vi-VN")}đ</td>
                <td>{s.hoatDong ? "Đang áp dụng" : "Ngừng"}</td>
                <td>
                  <Button
                    size="sm"
                    variant="outline-primary"
                    as={Link}
                    href={`/dich-vu/${s.id}`}
                  >
                    Sửa
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
