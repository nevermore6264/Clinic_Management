"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, Form, Button, Alert } from "react-bootstrap";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import { servicesApi, type DichVu } from "@/lib/api";

export default function EditServicePage() {
  const params = useParams();
  const id = Number(params.id);
  const { user, loading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [form, setForm] = useState<Partial<DichVu>>({});

  useEffect(() => {
    if (!loading && !user) router.replace("/dang-nhap");
    if (user && !user.cacVaiTro.includes("QUAN_TRI")) router.replace("/bang-dieu-khien");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user?.cacVaiTro.includes("QUAN_TRI") || !id) return;
    servicesApi
      .get(id)
      .then(setForm)
      .catch((e) => setError(e.message));
  }, [user, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await servicesApi.update(id, form);
      router.push("/dich-vu");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Lỗi");
    }
  };

  if (!user?.cacVaiTro.includes("QUAN_TRI")) return null;
  if (id && form.ten === undefined && !error)
    return <div className="py-4">Đang tải...</div>;

  return (
    <div>
      <h2 className="mb-4">Cập nhật dịch vụ</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="required">Tên dịch vụ</Form.Label>
              <Form.Control
                value={form.ten || ""}
                onChange={(e) => setForm({ ...form, ten: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={form.moTa || ""}
                onChange={(e) =>
                  setForm({ ...form, moTa: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="required">Đơn giá (VNĐ)</Form.Label>
              <Form.Control
                type="number"
                min={0}
                step={1000}
                value={form.gia ?? ""}
                onChange={(e) =>
                  setForm({ ...form, gia: Number(e.target.value) || 0 })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                label="Đang áp dụng"
                checked={form.hoatDong !== false}
                onChange={(e) => setForm({ ...form, hoatDong: e.target.checked })}
              />
            </Form.Group>
            <Button type="submit" variant="primary">
              Lưu
            </Button>{" "}
            <Button as={Link} href="/dich-vu" variant="secondary">
              Hủy
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}
