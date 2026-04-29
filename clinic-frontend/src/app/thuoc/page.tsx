"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Table, Button, Card, Alert, Form, Modal } from "react-bootstrap";
import { useAuth } from "@/lib/useAuth";
import { thuocApi, type Thuoc } from "@/lib/api";

const empty: Thuoc = {
  tenThuoc: "",
  donVi: "",
  hoatChat: "",
  giaBan: 0,
  hoatDong: true,
};

export default function ThuocPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [list, setList] = useState<Thuoc[]>([]);
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState<Thuoc | null>(null);
  const [form, setForm] = useState<Thuoc>(empty);

  useEffect(() => {
    if (!loading && !user) router.replace("/dang-nhap");
    if (user && !user.cacVaiTro.includes("QUAN_TRI"))
      router.replace("/bang-dieu-khien");
  }, [user, loading, router]);

  const load = () =>
    thuocApi.tatCa().then(setList).catch((e) => setError(e.message));

  useEffect(() => {
    if (!user?.cacVaiTro.includes("QUAN_TRI")) return;
    load();
  }, [user]);

  const openNew = () => {
    setEditing(null);
    setForm({ ...empty });
    setShow(true);
  };

  const openEdit = (t: Thuoc) => {
    setEditing(t);
    setForm({ ...t });
    setShow(true);
  };

  const save = async () => {
    try {
      if (editing?.id != null) {
        await thuocApi.capNhat(editing.id, form);
      } else {
        await thuocApi.tao(form);
      }
      setShow(false);
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi");
    }
  };

  const voHieu = async (id: number) => {
    if (!confirm("Ngừng sử dụng thuốc này?")) return;
    try {
      await thuocApi.xoa(id);
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi");
    }
  };

  if (!user?.cacVaiTro.includes("QUAN_TRI")) return null;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Danh mục thuốc</h2>
        <Button onClick={openNew}>Thêm thuốc</Button>
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
              <th>Tên</th>
              <th>Đơn vị</th>
              <th>Hoạt chất</th>
              <th>Giá bán</th>
              <th>Trạng thái</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {list.map((t) => (
              <tr key={t.id}>
                <td>{t.tenThuoc}</td>
                <td>{t.donVi || "—"}</td>
                <td className="small text-muted">{t.hoatChat || "—"}</td>
                <td>{t.giaBan?.toLocaleString("vi-VN")}đ</td>
                <td>{t.hoatDong ? "Đang dùng" : "Ngừng"}</td>
                <td>
                  <Button
                    size="sm"
                    variant="outline-primary"
                    className="me-1"
                    onClick={() => openEdit(t)}
                  >
                    Sửa
                  </Button>
                  {t.hoatDong && (
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => t.id && voHieu(t.id)}
                    >
                      Ngừng
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Modal show={show} onHide={() => setShow(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editing ? "Sửa thuốc" : "Thêm thuốc"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-2">
            <Form.Label>Tên thuốc *</Form.Label>
            <Form.Control
              value={form.tenThuoc}
              onChange={(e) => setForm({ ...form, tenThuoc: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Đơn vị</Form.Label>
            <Form.Control
              value={form.donVi ?? ""}
              onChange={(e) => setForm({ ...form, donVi: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Hoạt chất</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={form.hoatChat ?? ""}
              onChange={(e) => setForm({ ...form, hoatChat: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Giá bán</Form.Label>
            <Form.Control
              type="number"
              value={form.giaBan ?? ""}
              onChange={(e) =>
                setForm({ ...form, giaBan: Number(e.target.value) })
              }
            />
          </Form.Group>
          {editing && (
            <Form.Check
              type="switch"
              label="Đang sử dụng trong danh mục"
              checked={form.hoatDong ?? true}
              onChange={(e) =>
                setForm({ ...form, hoatDong: e.target.checked })
              }
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShow(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={save}>
            Lưu
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
