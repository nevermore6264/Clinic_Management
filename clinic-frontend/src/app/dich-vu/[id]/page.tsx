"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, Form, Button, Alert } from "react-bootstrap";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import {
  serviceTypesApi,
  servicesApi,
  type DichVu,
  type LoaiDichVu,
} from "@/lib/api";
import { formatVndInput, parseVndInput } from "@/lib/moneyVnd";
import {
  validateDichVuForm,
  coLoiDichVuForm,
  type DichVuFormErrors,
} from "@/lib/validateDichVuForm";

export default function EditServicePage() {
  const params = useParams();
  const id = Number(params.id);
  const { user, loading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [form, setForm] = useState<Partial<DichVu>>({});
  const [loaiDichVu, setLoaiDichVu] = useState<LoaiDichVu[]>([]);
  const [danhSachDichVu, setDanhSachDichVu] = useState<DichVu[]>([]);
  const [fieldErrors, setFieldErrors] = useState<DichVuFormErrors>({});

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

  useEffect(() => {
    if (!user?.cacVaiTro.includes("QUAN_TRI")) return;
    Promise.all([serviceTypesApi.list(), servicesApi.list()])
      .then(([loai, dichVu]) => {
        setLoaiDichVu(loai);
        setDanhSachDichVu(dichVu);
      })
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "Không tải được loại dịch vụ"),
      );
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const loi = validateDichVuForm(form, danhSachDichVu, { excludeId: id });
    setFieldErrors(loi);
    if (coLoiDichVuForm(loi)) return;
    try {
      await servicesApi.update(id, {
        ...form,
        ten: form.ten?.trim(),
        moTa: form.moTa?.trim() || "",
      });
      setFieldErrors({});
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
          <Form noValidate onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="required">Loại dịch vụ</Form.Label>
              <Form.Select
                value={form.maLoaiDichVu ?? ""}
                onChange={(e) => {
                  const maLoaiDichVu = Number(e.target.value) || undefined;
                  setForm({ ...form, maLoaiDichVu });
                  setFieldErrors((x) => {
                    const n = { ...x };
                    delete n.maLoaiDichVu;
                    delete n.ten;
                    return n;
                  });
                }}
                isInvalid={Boolean(fieldErrors.maLoaiDichVu)}
              >
                <option value="" disabled>
                  Chọn loại dịch vụ
                </option>
                {loaiDichVu.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.tenLoaiDichVu}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid" className="d-block">
                {fieldErrors.maLoaiDichVu}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="required">Tên dịch vụ</Form.Label>
              <Form.Control
                placeholder="Ví dụ: Khám tổng quát, Siêu âm..."
                value={form.ten || ""}
                onChange={(e) => {
                  setForm({ ...form, ten: e.target.value });
                  setFieldErrors((x) => {
                    const n = { ...x };
                    delete n.ten;
                    return n;
                  });
                }}
                isInvalid={Boolean(fieldErrors.ten)}
              />
              <Form.Control.Feedback type="invalid">
                {fieldErrors.ten}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Mô tả ngắn cho nhân viên và bệnh nhân (tuỳ chọn)"
                value={form.moTa || ""}
                onChange={(e) =>
                  setForm({ ...form, moTa: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="required">Đơn giá (VNĐ)</Form.Label>
              <Form.Control
                type="text"
                inputMode="numeric"
                placeholder="Ví dụ: 150.000"
                value={formatVndInput(form.gia)}
                onChange={(e) => {
                  const gia = parseVndInput(e.target.value);
                  setForm({ ...form, gia });
                  setFieldErrors((x) => {
                    const n = { ...x };
                    delete n.gia;
                    return n;
                  });
                }}
                isInvalid={Boolean(fieldErrors.gia)}
              />
              <Form.Control.Feedback type="invalid">
                {fieldErrors.gia}
              </Form.Control.Feedback>
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
            <Link href="/dich-vu" className="btn btn-secondary">
              Hủy
            </Link>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}
