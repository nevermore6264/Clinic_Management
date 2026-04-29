"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, Form, Button, Alert, Table } from "react-bootstrap";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import {
  patientsApi,
  appointmentsApi,
  type BenhNhan,
  type LichHen,
} from "@/lib/api";

export default function EditPatientPage() {
  const params = useParams();
  const id = Number(params.id);
  const { user, loading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [form, setForm] = useState<Partial<BenhNhan>>({});
  const [visitHistory, setVisitHistory] = useState<LichHen[]>([]);

  useEffect(() => {
    if (!loading && !user) router.replace("/dang-nhap");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || !id) return;
    patientsApi
      .get(id)
      .then(setForm)
      .catch((e) => setError(e.message));
    appointmentsApi
      .byPatient(id)
      .then(setVisitHistory)
      .catch(() => {});
  }, [user, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await patientsApi.update(id, form);
      router.push("/benh-nhan");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Lỗi");
    }
  };

  const handleDeactivate = async () => {
    if (
      !confirm(
        "Ẩn hồ sơ bệnh nhân này? Có thể tìm lại bằng ô tìm kiếm (chỉ hiển thị khi tìm theo tên).",
      )
    )
      return;
    setError("");
    try {
      await patientsApi.delete(id);
      router.push("/benh-nhan");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Lỗi");
    }
  };

  if (!loading && !user) return null;

  return (
    <div>
      <h2 className="mb-4">Cập nhật bệnh nhân</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="required">Họ tên</Form.Label>
              <Form.Control
                value={form.fullName || ""}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Ngày sinh</Form.Label>
              <Form.Control
                type="date"
                value={form.dateOfBirth || ""}
                onChange={(e) =>
                  setForm({ ...form, dateOfBirth: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Số điện thoại</Form.Label>
              <Form.Control
                value={form.phone || ""}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Địa chỉ</Form.Label>
              <Form.Control
                value={form.address || ""}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={form.email || ""}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </Form.Group>
            <div className="d-flex gap-2">
              <Button type="submit" variant="primary">
                Lưu
              </Button>
              <Button as={Link} href="/benh-nhan" variant="secondary">
                Hủy
              </Button>
              <Button
                type="button"
                variant="outline-danger"
                onClick={handleDeactivate}
              >
                Ẩn hồ sơ
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {visitHistory.length > 0 && (
        <Card className="mt-3">
          <Card.Header>Lịch sử khám</Card.Header>
          <Table responsive size="sm" className="mb-0">
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Giờ</th>
                <th>Bác sĩ</th>
                <th>Dịch vụ</th>
                <th>Trạng thái</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visitHistory.map((a) => (
                <tr key={a.id}>
                  <td>{a.ngayHen}</td>
                  <td>{a.gioHen}</td>
                  <td>{a.tenBacSi}</td>
                  <td>{a.tenDichVu}</td>
                  <td>{a.trangThai}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="outline-primary"
                      as={Link}
                      href={`/lich-hen/${a.id}`}
                    >
                      Chi tiết / Hồ sơ khám
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}
    </div>
  );
}
