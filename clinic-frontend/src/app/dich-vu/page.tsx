"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Table, Button, Card, Alert, Modal, Form } from "react-bootstrap";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import { serviceTypesApi, servicesApi, type DichVu, type LoaiDichVu } from "@/lib/api";

export default function ServicesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [list, setList] = useState<DichVu[]>([]);
  const [loaiDichVu, setLoaiDichVu] = useState<LoaiDichVu[]>([]);
  const [error, setError] = useState("");
  const [hienModal, setHienModal] = useState(false);
  const [modalLoai, setModalLoai] = useState<"them-dich-vu" | "loai-dich-vu">(
    "them-dich-vu",
  );
  const [modalTitle, setModalTitle] = useState("");
  const [modalError, setModalError] = useState("");
  const [tenLoaiDichVu, setTenLoaiDichVu] = useState("");
  const [tenLoaiDichVuError, setTenLoaiDichVuError] = useState("");
  const [tuKhoaLoaiDichVu, setTuKhoaLoaiDichVu] = useState("");
  const [form, setForm] = useState<Partial<DichVu>>({
    maLoaiDichVu: undefined,
    ten: "",
    moTa: "",
    gia: 0,
    hoatDong: true,
  });

  useEffect(() => {
    if (!loading && !user) router.replace("/dang-nhap");
    if (user && !user.cacVaiTro.includes("QUAN_TRI")) router.replace("/bang-dieu-khien");
  }, [user, loading, router]);

  const napDuLieu = async () => {
    try {
      const [danhSachDichVu, danhSachLoai] = await Promise.all([
        servicesApi.list(),
        serviceTypesApi.list(),
      ]);
      setList(danhSachDichVu);
      setLoaiDichVu(danhSachLoai);
      setForm((prev) => ({
        ...prev,
        maLoaiDichVu:
          prev.maLoaiDichVu ?? (danhSachLoai.length > 0 ? danhSachLoai[0].id : undefined),
      }));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Không tải được dữ liệu dịch vụ");
    }
  };

  useEffect(() => {
    if (!user?.cacVaiTro.includes("QUAN_TRI")) return;
    napDuLieu();
  }, [user]);

  const moModal = (loai: "them-dich-vu" | "loai-dich-vu", title: string) => {
    setModalLoai(loai);
    setModalTitle(title);
    setModalError("");
    setTenLoaiDichVuError("");
    setHienModal(true);
  };

  const validateTenLoaiDichVu = (value: string): string => {
    const ten = value.trim();
    if (!ten) return "Vui lòng nhập tên loại dịch vụ.";
    if (ten.length < 3) return "Tên loại dịch vụ cần tối thiểu 3 ký tự.";
    const trung = loaiDichVu.some(
      (item) => item.tenLoaiDichVu.trim().toLocaleLowerCase() === ten.toLocaleLowerCase(),
    );
    if (trung) return "Tên loại dịch vụ đã tồn tại.";
    return "";
  };

  const handleThemLoaiDichVu = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");
    const loi = validateTenLoaiDichVu(tenLoaiDichVu);
    setTenLoaiDichVuError(loi);
    if (loi) return;
    try {
      await serviceTypesApi.create({ tenLoaiDichVu: tenLoaiDichVu.trim() });
      setTenLoaiDichVu("");
      await napDuLieu();
    } catch (e: unknown) {
      setModalError(e instanceof Error ? e.message : "Không thêm được loại dịch vụ");
    }
  };

  const danhSachLoaiDichVuLoc = loaiDichVu.filter((item) =>
    item.tenLoaiDichVu.toLocaleLowerCase().includes(tuKhoaLoaiDichVu.trim().toLocaleLowerCase()),
  );

  const handleThemDichVu = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");
    try {
      await servicesApi.create(form);
      setHienModal(false);
      setForm({
        maLoaiDichVu: loaiDichVu.length > 0 ? loaiDichVu[0].id : undefined,
        ten: "",
        moTa: "",
        gia: 0,
        hoatDong: true,
      });
      await napDuLieu();
    } catch (e: unknown) {
      setModalError(e instanceof Error ? e.message : "Không thêm được dịch vụ");
    }
  };

  if (!user?.cacVaiTro.includes("QUAN_TRI")) return null;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Quản lý dịch vụ & bảng giá</h2>
        <div className="d-flex gap-2">
          <Button
            as={Link}
            href="/loai-dich-vu"
            variant="outline-primary"
          >
            <i className="bi bi-tags me-2" aria-hidden />
            Đến loại dịch vụ
          </Button>
          <Button onClick={() => moModal("them-dich-vu", "Thêm dịch vụ")}>
            <i className="bi bi-plus-circle me-2" aria-hidden />
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

      <Modal
        show={hienModal}
        onHide={() => setHienModal(false)}
        size="xl"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{modalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalError ? <Alert variant="danger">{modalError}</Alert> : null}
          {modalLoai === "loai-dich-vu" ? (
            <>
              <Form onSubmit={handleThemLoaiDichVu} noValidate className="mb-3">
                <div className="d-flex align-items-start gap-2">
                  <div className="flex-grow-1">
                    <Form.Control
                      placeholder="Nhập tên loại dịch vụ"
                      value={tenLoaiDichVu}
                      onChange={(e) => {
                        const value = e.target.value;
                        setTenLoaiDichVu(value);
                        if (tenLoaiDichVuError) setTenLoaiDichVuError(validateTenLoaiDichVu(value));
                      }}
                      isInvalid={Boolean(tenLoaiDichVuError)}
                    />
                    <Form.Control.Feedback type="invalid">
                      {tenLoaiDichVuError}
                    </Form.Control.Feedback>
                  </div>
                  <Button type="submit">Thêm loại</Button>
                </div>
              </Form>
              <Form.Group className="mb-3">
                <Form.Control
                  placeholder="Tìm loại dịch vụ..."
                  value={tuKhoaLoaiDichVu}
                  onChange={(e) => setTuKhoaLoaiDichVu(e.target.value)}
                />
              </Form.Group>
              <div className="small text-muted mb-2">
                Hiển thị {danhSachLoaiDichVuLoc.length}/{loaiDichVu.length} loại
              </div>
              <div className="d-flex flex-wrap gap-2">
                {danhSachLoaiDichVuLoc.map((item) => (
                  <span key={item.id} className="badge text-bg-light border">
                    {item.tenLoaiDichVu}
                  </span>
                ))}
                {danhSachLoaiDichVuLoc.length === 0 ? (
                  <span className="text-muted small">Không tìm thấy loại dịch vụ phù hợp.</span>
                ) : null}
              </div>
            </>
          ) : (
            <Form onSubmit={handleThemDichVu}>
              <Form.Group className="mb-3">
                <Form.Label className="required">Loại dịch vụ</Form.Label>
                <Form.Select
                  value={form.maLoaiDichVu ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, maLoaiDichVu: Number(e.target.value) || undefined })
                  }
                  required
                  disabled={loaiDichVu.length === 0}
                >
                  {loaiDichVu.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.tenLoaiDichVu}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
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
                  onChange={(e) => setForm({ ...form, moTa: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="required">Đơn giá (VNĐ)</Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  step={1000}
                  value={form.gia ?? ""}
                  onChange={(e) => setForm({ ...form, gia: Number(e.target.value) || 0 })}
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
              <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" onClick={() => setHienModal(false)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={loaiDichVu.length === 0}>
                  Lưu
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}
