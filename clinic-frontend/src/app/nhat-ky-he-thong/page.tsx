"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Table, Form, Alert } from "react-bootstrap";
import { useAuth } from "@/lib/useAuth";
import { auditLogsApi, type NhatKyHeThongEntry } from "@/lib/api";

export default function NhatKyHeThongsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [list, setList] = useState<NhatKyHeThongEntry[]>([]);
  const [from, setFrom] = useState(() => new Date().toISOString().slice(0, 10));
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) router.replace("/dang-nhap");
    if (user && !user.cacVaiTro.includes("QUAN_TRI")) router.replace("/bang-dieu-khien");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user?.cacVaiTro.includes("QUAN_TRI")) return;
    auditLogsApi
      .list(from, to, 0, 100)
      .then((r) => setList(r.content))
      .catch((e) => setError(e.message));
  }, [user, from, to]);

  if (!user?.cacVaiTro.includes("QUAN_TRI")) return null;

  return (
    <div>
      <h2 className="mb-4">Nhật ký hoạt động</h2>
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      <Card className="mb-3">
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
      <Card>
        <Table responsive size="sm" className="mb-0">
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>Người thao tác</th>
              <th>Đối tượng</th>
              <th>Hành động</th>
              <th>Trước / Sau</th>
            </tr>
          </thead>
          <tbody>
            {list.map((l) => (
              <tr key={l.id}>
                <td>
                  {l.taoLuc
                    ? new Date(l.taoLuc).toLocaleString("vi-VN")
                    : "—"}
                </td>
                <td>{l.tenDangNhap ?? "—"}</td>
                <td>
                  {l.loaiThucThe}#{l.maThucThe}
                </td>
                <td>{l.hanhDong}</td>
                <td className="small text-muted">
                  {l.giaTriCu && (
                    <span className="text-danger">{l.giaTriCu}</span>
                  )}
                  {l.giaTriCu && l.giaTriMoi && " → "}
                  {l.giaTriMoi && <span>{l.giaTriMoi}</span>}
                  {!l.giaTriCu && !l.giaTriMoi && "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        {list.length === 0 && (
          <Card.Body className="text-muted">Không có bản ghi.</Card.Body>
        )}
      </Card>
    </div>
  );
}
