"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Table, Button, Card, Alert, Form, Modal } from "react-bootstrap";
import { useAuth } from "@/lib/useAuth";
import { phieuChiApi, type PhieuChi } from "@/lib/api";

const LOAI_OPTIONS = [
  { value: "VAT_TU", label: "Vật tư" },
  { value: "THIET_BI", label: "Thiết bị" },
  { value: "LUONG", label: "Lương" },
  { value: "THUE", label: "Thuế" },
  { value: "KHAC", label: "Khác" },
];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function monthStartISO() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

export default function PhieuChiPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [list, setList] = useState<PhieuChi[]>([]);
  const [total, setTotal] = useState(0);
  const [tuNgay, setTuNgay] = useState(monthStartISO);
  const [denNgay, setDenNgay] = useState(todayISO);
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState<PhieuChi | null>(null);
  const [form, setForm] = useState<PhieuChi>({
    moTa: "",
    soTien: 0,
    ngayChi: todayISO(),
    loai: "KHAC",
  });

  const allowed =
    user?.cacVaiTro.includes("QUAN_TRI") ||
    user?.cacVaiTro.includes("THU_NGAN");

  useEffect(() => {
    if (!loading && !user) router.replace("/dang-nhap");
    if (user && !allowed) router.replace("/bang-dieu-khien");
  }, [user, loading, router, allowed]);

  const load = () =>
    phieuChiApi
      .danhSach(tuNgay, denNgay)
      .then((p) => {
        setList(p.content);
        setTotal(p.totalElements);
      })
      .catch((e) => setError(e.message));

  useEffect(() => {
    if (!allowed) return;
    load();
  }, [user, tuNgay, denNgay, allowed]);

  const openNew = () => {
    setEditing(null);
    setForm({
      moTa: "",
      soTien: 0,
      ngayChi: todayISO(),
      loai: "KHAC",
    });
    setShow(true);
  };

  const openEdit = (pc: PhieuChi) => {
    setEditing(pc);
    setForm({ ...pc });
    setShow(true);
  };

  const save = async () => {
    try {
      if (editing?.id != null) {
        await phieuChiApi.capNhat(editing.id, form);
      } else {
        await phieuChiApi.tao(form);
      }
      setShow(false);
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi");
    }
  };

  const xoa = async (id: number) => {
    if (!confirm("Xóa phiếu chi?")) return;
    try {
      await phieuChiApi.xoa(id);
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi");
    }
  };

  if (!allowed) return null;

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <h2 className="mb-0">Phiếu chi</h2>
        <Button onClick={openNew}>Ghi phiếu chi</Button>
      </div>
      <Card className="mb-3">
        <Card.Body className="py-3">
          <div className="row g-2 align-items-end">
            <div className="col-auto">
              <Form.Label className="small mb-0">Từ ngày</Form.Label>
              <Form.Control
                type="date"
                value={tuNgay}
                onChange={(e) => setTuNgay(e.target.value)}
              />
            </div>
            <div className="col-auto">
              <Form.Label className="small mb-0">Đến ngày</Form.Label>
              <Form.Control
                type="date"
                value={denNgay}
                onChange={(e) => setDenNgay(e.target.value)}
              />
            </div>
            <div className="col-auto">
              <Button variant="outline-secondary" onClick={load}>
                Lọc
              </Button>
            </div>
          </div>
          <div className="small text-muted mt-2">
            {total} bản ghi trong khoảng đã lọc
          </div>
        </Card.Body>
      </Card>
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      <Card>
        <Table responsive hover className="mb-0">
          <thead>
            <tr>
              <th>Ngày</th>
              <th>Loại</th>
              <th>Mô tả</th>
              <th>Số tiền</th>
              <th>Người tạo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id}>
                <td>{p.ngayChi}</td>
                <td>
                  {LOAI_OPTIONS.find((o) => o.value === p.loai)?.label ||
                    p.loai}
                </td>
                <td>{p.moTa}</td>
                <td>{p.soTien?.toLocaleString("vi-VN")}đ</td>
                <td className="small">{p.tenDangNhapNguoiTao || "—"}</td>
                <td>
                  <Button
                    size="sm"
                    variant="primary"
                    className="me-1 btn-action-edit"
                    onClick={() => openEdit(p)}
                  >
                    Sửa
                  </Button>
                  {user?.cacVaiTro.includes("QUAN_TRI") && (
                    <Button
                      size="sm"
                      variant="danger"
                      className="btn-action-delete"
                      onClick={() => p.id && xoa(p.id)}
                    >
                      Xóa
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Modal show={show} onHide={() => setShow(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editing ? "Sửa phiếu chi" : "Phiếu chi mới"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-2">
            <Form.Label>Mô tả *</Form.Label>
            <Form.Control
              value={form.moTa}
              onChange={(e) => setForm({ ...form, moTa: e.target.value })}
            />
          </Form.Group>
          <div className="row">
            <div className="col-md-4 mb-2">
              <Form.Label>Số tiền *</Form.Label>
              <Form.Control
                type="number"
                value={form.soTien}
                onChange={(e) =>
                  setForm({ ...form, soTien: Number(e.target.value) })
                }
              />
            </div>
            <div className="col-md-4 mb-2">
              <Form.Label>Ngày chi</Form.Label>
              <Form.Control
                type="date"
                value={form.ngayChi?.slice(0, 10) ?? ""}
                onChange={(e) =>
                  setForm({ ...form, ngayChi: e.target.value })
                }
              />
            </div>
            <div className="col-md-4 mb-2">
              <Form.Label>Loại</Form.Label>
              <Form.Select
                value={form.loai ?? "KHAC"}
                onChange={(e) =>
                  setForm({ ...form, loai: e.target.value })
                }
              >
                {LOAI_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Form.Select>
            </div>
          </div>
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
