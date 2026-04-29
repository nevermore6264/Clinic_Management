"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Form, Button, Alert } from "react-bootstrap";
import { useAuth } from "@/lib/useAuth";
import { patientsApi, type BenhNhan } from "@/lib/api";

export default function NewPatientPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [form, setForm] = useState<Partial<BenhNhan>>({
    fullName: "",
    dateOfBirth: "",
    phone: "",
    address: "",
    email: "",
    active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await patientsApi.create(form);
      router.push("/benh-nhan");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Lỗi");
    }
  };

  if (!loading && !user) {
    router.replace("/dang-nhap");
    return null;
  }

  return (
    <div>
      <h2 className="mb-4">Thêm bệnh nhân</h2>
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
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.back()}
              >
                Hủy
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}
