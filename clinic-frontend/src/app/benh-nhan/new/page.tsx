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
    hoTen: "",
    ngaySinh: "",
    soDienThoai: "",
    diaChi: "",
    thuDienTu: "",
    gioiTinh: "",
    soCccd: "",
    ngheNghiep: "",
    nhomMau: "",
    tienSuBenh: "",
    diUng: "",
    nguoiLienHe: "",
    soDienThoaiLienHe: "",
    hoatDong: true,
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
                value={form.hoTen || ""}
                onChange={(e) => setForm({ ...form, hoTen: e.target.value })}
                required
              />
            </Form.Group>
            <div className="row g-3">
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Ngày sinh</Form.Label>
                  <Form.Control
                    type="date"
                    value={form.ngaySinh || ""}
                    onChange={(e) => setForm({ ...form, ngaySinh: e.target.value })}
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Số điện thoại</Form.Label>
                  <Form.Control
                    value={form.soDienThoai || ""}
                    onChange={(e) => setForm({ ...form, soDienThoai: e.target.value })}
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={form.thuDienTu || ""}
                    onChange={(e) => setForm({ ...form, thuDienTu: e.target.value })}
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Giới tính</Form.Label>
                  <Form.Select
                    value={form.gioiTinh || ""}
                    onChange={(e) => setForm({ ...form, gioiTinh: e.target.value })}
                  >
                    <option value="">-- Chọn --</option>
                    <option value="NAM">Nam</option>
                    <option value="NU">Nữ</option>
                    <option value="KHAC">Khác</option>
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Số CCCD</Form.Label>
                  <Form.Control
                    value={form.soCccd || ""}
                    onChange={(e) => setForm({ ...form, soCccd: e.target.value })}
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Nghề nghiệp</Form.Label>
                  <Form.Control
                    value={form.ngheNghiep || ""}
                    onChange={(e) => setForm({ ...form, ngheNghiep: e.target.value })}
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Nhóm máu</Form.Label>
                  <Form.Select
                    value={form.nhomMau || ""}
                    onChange={(e) => setForm({ ...form, nhomMau: e.target.value })}
                  >
                    <option value="">-- Chọn --</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="AB">AB</option>
                    <option value="O">O</option>
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Người liên hệ</Form.Label>
                  <Form.Control
                    value={form.nguoiLienHe || ""}
                    onChange={(e) => setForm({ ...form, nguoiLienHe: e.target.value })}
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>SĐT liên hệ</Form.Label>
                  <Form.Control
                    value={form.soDienThoaiLienHe || ""}
                    onChange={(e) =>
                      setForm({ ...form, soDienThoaiLienHe: e.target.value })
                    }
                  />
                </Form.Group>
              </div>
            </div>
            <Form.Group className="mb-3 mt-3">
              <Form.Label>Địa chỉ</Form.Label>
              <Form.Control
                value={form.diaChi || ""}
                onChange={(e) => setForm({ ...form, diaChi: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Tiền sử bệnh</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={form.tienSuBenh || ""}
                onChange={(e) => setForm({ ...form, tienSuBenh: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Dị ứng</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={form.diUng || ""}
                onChange={(e) => setForm({ ...form, diUng: e.target.value })}
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
