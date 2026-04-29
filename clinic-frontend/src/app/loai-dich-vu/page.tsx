"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Card, Form, Table } from "react-bootstrap";
import Link from "next/link";
import { serviceTypesApi, type LoaiDichVu } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";

export default function ServiceTypesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [list, setList] = useState<LoaiDichVu[]>([]);
  const [tenLoaiDichVu, setTenLoaiDichVu] = useState("");
  const [dangSuaId, setDangSuaId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [tenLoaiDichVuError, setTenLoaiDichVuError] = useState("");

  const napDuLieu = async () => {
    try {
      const data = await serviceTypesApi.list();
      setList(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Không tải được loại dịch vụ");
    }
  };

  useEffect(() => {
    if (!loading && !user) router.replace("/dang-nhap");
    if (user && !user.cacVaiTro.includes("QUAN_TRI")) {
      router.replace("/bang-dieu-khien");
    }
  }, [loading, router, user]);

  useEffect(() => {
    if (!user?.cacVaiTro.includes("QUAN_TRI")) return;
    napDuLieu();
  }, [user]);

  const resetForm = () => {
    setTenLoaiDichVu("");
    setDangSuaId(null);
    setTenLoaiDichVuError("");
  };

  const validateTenLoaiDichVu = (value: string): string => {
    const ten = value.trim();
    if (!ten) return "Vui lòng nhập tên loại dịch vụ.";
    if (ten.length < 3) return "Tên loại dịch vụ cần tối thiểu 3 ký tự.";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const loiTen = validateTenLoaiDichVu(tenLoaiDichVu);
    setTenLoaiDichVuError(loiTen);
    if (loiTen) return;
    const ten = tenLoaiDichVu.trim();
    try {
      if (dangSuaId) {
        await serviceTypesApi.update(dangSuaId, { tenLoaiDichVu: ten });
      } else {
        await serviceTypesApi.create({ tenLoaiDichVu: ten });
      }
      resetForm();
      await napDuLieu();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Không lưu được loại dịch vụ");
    }
  };

  const handleEdit = (item: LoaiDichVu) => {
    setDangSuaId(item.id);
    setTenLoaiDichVu(item.tenLoaiDichVu);
    setTenLoaiDichVuError("");
  };

  const handleDelete = async (id: number) => {
    setError("");
    try {
      await serviceTypesApi.delete(id);
      await napDuLieu();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Không xóa được loại dịch vụ");
    }
  };

  if (!user?.cacVaiTro.includes("QUAN_TRI")) return null;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Quản lý loại dịch vụ</h2>
        <Button as={Link} href="/dich-vu" variant="outline-primary">
          <i className="bi bi-hospital me-2" aria-hidden />
          Đến trang dịch vụ
        </Button>
      </div>

      <Card className="mb-4">
        <Card.Body>
          <Form onSubmit={handleSubmit} noValidate className="d-flex gap-2 flex-wrap">
            <Form.Control
              placeholder="Ví dụ: Khám tổng quát, Cận lâm sàng..."
              value={tenLoaiDichVu}
              onChange={(e) => {
                const value = e.target.value;
                setTenLoaiDichVu(value);
                if (tenLoaiDichVuError) {
                  setTenLoaiDichVuError(validateTenLoaiDichVu(value));
                }
              }}
              isInvalid={Boolean(tenLoaiDichVuError)}
            />
            <Form.Control.Feedback type="invalid">
              {tenLoaiDichVuError}
            </Form.Control.Feedback>
            <Button type="submit">
              <i className={`bi ${dangSuaId ? "bi-check2-circle" : "bi-plus-circle"} me-2`} aria-hidden />
              {dangSuaId ? "Cập nhật" : "Thêm loại"}
            </Button>
            {dangSuaId ? (
              <Button type="button" variant="secondary" onClick={resetForm}>
                Hủy sửa
              </Button>
            ) : null}
          </Form>
        </Card.Body>
      </Card>

      {error ? <Alert variant="danger">{error}</Alert> : null}

      <Card>
        <Table responsive hover className="mb-0">
          <thead>
            <tr>
              <th>Loại dịch vụ</th>
              <th className="text-end">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {list.map((item) => (
              <tr key={item.id}>
                <td>{item.tenLoaiDichVu}</td>
                <td className="text-end">
                  <Button
                    size="sm"
                    variant="outline-primary"
                    className="me-2"
                    onClick={() => handleEdit(item)}
                  >
                    Sửa
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => handleDelete(item.id)}
                  >
                    Xóa
                  </Button>
                </td>
              </tr>
            ))}
            {list.length === 0 ? (
              <tr>
                <td colSpan={2} className="text-center text-muted py-4">
                  Chưa có loại dịch vụ nào.
                </td>
              </tr>
            ) : null}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
