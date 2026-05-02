"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Table, Button, Card, Alert, Modal, Form } from "react-bootstrap";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import {
  serviceTypesApi,
  servicesApi,
  type DichVu,
  type LoaiDichVu,
} from "@/lib/api";

function formatVndInput(value?: number) {
  if (value === undefined || value === null || Number.isNaN(value)) return "";
  return Math.max(0, Math.trunc(value)).toLocaleString("vi-VN");
}

function parseVndInput(raw: string): number | undefined {
  const digitsOnly = raw.replace(/\D/g, "");
  if (!digitsOnly) return undefined;
  return Number(digitsOnly);
}

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
  const [dangSuaId, setDangSuaId] = useState<number | null>(null);
  const [formSua, setFormSua] = useState<Partial<DichVu>>({});
  const [xoaId, setXoaId] = useState<number | null>(null);
  const [dangXoa, setDangXoa] = useState(false);
  const [tenLoaiDichVu, setTenLoaiDichVu] = useState("");
  const [tenLoaiDichVuError, setTenLoaiDichVuError] = useState("");
  const [tuKhoaLoaiDichVu, setTuKhoaLoaiDichVu] = useState("");
  const [boLocLoaiDichVu, setBoLocLoaiDichVu] = useState("");
  const [tuKhoaTenDichVu, setTuKhoaTenDichVu] = useState("");
  const [form, setForm] = useState<Partial<DichVu>>({
    maLoaiDichVu: undefined,
    ten: "",
    moTa: "",
    gia: 0,
    hoatDong: true,
  });

  useEffect(() => {
    if (!loading && !user) router.replace("/dang-nhap");
    if (user && !user.cacVaiTro.includes("QUAN_TRI"))
      router.replace("/bang-dieu-khien");
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
          prev.maLoaiDichVu ??
          (danhSachLoai.length > 0 ? danhSachLoai[0].id : undefined),
      }));
    } catch (e: unknown) {
      setError(
        e instanceof Error ? e.message : "Không tải được dữ liệu dịch vụ",
      );
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
      (item) =>
        item.tenLoaiDichVu.trim().toLocaleLowerCase() ===
        ten.toLocaleLowerCase(),
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
      setModalError(
        e instanceof Error ? e.message : "Không thêm được loại dịch vụ",
      );
    }
  };

  const danhSachLoaiDichVuLoc = loaiDichVu.filter((item) =>
    item.tenLoaiDichVu
      .toLocaleLowerCase()
      .includes(tuKhoaLoaiDichVu.trim().toLocaleLowerCase()),
  );

  const danhSachDichVuLoc = list.filter((item) => {
    const khopLoai =
      !boLocLoaiDichVu || String(item.maLoaiDichVu ?? "") === boLocLoaiDichVu;
    const khopTen = item.ten
      ?.toLocaleLowerCase()
      .includes(tuKhoaTenDichVu.trim().toLocaleLowerCase());
    return khopLoai && Boolean(khopTen);
  });
  const dichVuCanXoa = list.find((item) => item.id === xoaId);

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

  const handleExportCsv = () => {
    if (list.length === 0) {
      setError("Chưa có dữ liệu để xuất CSV.");
      return;
    }

    const csvEscape = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const header = [
      "MaDichVu",
      "LoaiDichVu",
      "TenDichVu",
      "MoTa",
      "DonGia",
      "TrangThai",
    ];
    const rows = list.map((item) => [
      String(item.id),
      csvEscape(item.tenLoaiDichVu || "Chưa phân loại"),
      csvEscape(item.ten || ""),
      csvEscape(item.moTa || ""),
      String(item.gia ?? 0),
      item.hoatDong ? "Dang ap dung" : "Ngung",
    ]);
    const content = [
      header.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");
    const bom = "\uFEFF";
    const blob = new Blob([bom + content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    const now = new Date();
    const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;
    anchor.href = url;
    anchor.download = `danh-sach-dich-vu-${stamp}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const batDauSua = (item: DichVu) => {
    setDangSuaId(item.id);
    setFormSua({
      maLoaiDichVu: item.maLoaiDichVu,
      ten: item.ten || "",
      moTa: item.moTa || "",
      gia: item.gia ?? 0,
      hoatDong: item.hoatDong !== false,
    });
  };

  const huySua = () => {
    setDangSuaId(null);
    setFormSua({});
  };

  const luuSua = async (id: number) => {
    if (!formSua.ten?.trim()) {
      setError("Tên dịch vụ không được để trống.");
      return;
    }
    if (!formSua.maLoaiDichVu) {
      setError("Vui lòng chọn loại dịch vụ.");
      return;
    }
    if (!formSua.gia || formSua.gia <= 0) {
      setError("Đơn giá phải lớn hơn 0.");
      return;
    }
    setError("");
    try {
      await servicesApi.update(id, {
        maLoaiDichVu: formSua.maLoaiDichVu,
        ten: formSua.ten.trim(),
        moTa: formSua.moTa || "",
        gia: formSua.gia,
        hoatDong: formSua.hoatDong !== false,
      });
      huySua();
      await napDuLieu();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Không cập nhật được dịch vụ");
    }
  };

  const xacNhanXoa = async () => {
    if (!xoaId) return;
    setDangXoa(true);
    setError("");
    try {
      await servicesApi.delete(xoaId);
      setXoaId(null);
      await napDuLieu();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Không xóa được dịch vụ");
    } finally {
      setDangXoa(false);
    }
  };

  if (!user?.cacVaiTro.includes("QUAN_TRI")) return null;

  return (
    <div className="service-type-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Quản lý dịch vụ & bảng giá</h2>
        <div className="d-flex gap-2">
          <Button className="btn-service-export" onClick={handleExportCsv}>
            <i className="bi bi-filetype-csv me-2" aria-hidden />
            Export CSV
          </Button>
          <Link href="/loai-dich-vu" className="btn btn-service-nav">
            <i className="bi bi-tags me-2" aria-hidden />
            Đến loại dịch vụ
          </Link>
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
      <Card className="mb-3">
        <Card.Body>
          <div className="d-flex gap-2 flex-wrap align-items-center">
            <Form.Group style={{ minWidth: 260 }}>
              <Form.Select
                value={boLocLoaiDichVu}
                onChange={(e) => setBoLocLoaiDichVu(e.target.value)}
              >
                <option value="">Tất cả loại dịch vụ</option>
                {loaiDichVu.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.tenLoaiDichVu}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="flex-grow-1" style={{ minWidth: 280 }}>
              <Form.Control
                placeholder="Nhập tên dịch vụ cần tìm..."
                value={tuKhoaTenDichVu}
                onChange={(e) => setTuKhoaTenDichVu(e.target.value)}
              />
            </Form.Group>
            <Button
              variant="secondary"
              className="align-self-center"
              onClick={() => {
                setBoLocLoaiDichVu("");
                setTuKhoaTenDichVu("");
              }}
            >
              <i className="bi bi-arrow-counterclockwise me-2" aria-hidden />
              Xóa lọc
            </Button>
          </div>
        </Card.Body>
      </Card>
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
            {danhSachDichVuLoc.map((s) => (
              <tr key={s.id}>
                <td>
                  {dangSuaId === s.id ? (
                    <Form.Select
                      size="sm"
                      value={formSua.maLoaiDichVu ?? ""}
                      onChange={(e) =>
                        setFormSua({
                          ...formSua,
                          maLoaiDichVu: Number(e.target.value) || undefined,
                        })
                      }
                    >
                      {loaiDichVu.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.tenLoaiDichVu}
                        </option>
                      ))}
                    </Form.Select>
                  ) : (
                    s.tenLoaiDichVu || "Chưa phân loại"
                  )}
                </td>
                <td>
                  {dangSuaId === s.id ? (
                    <Form.Control
                      size="sm"
                      value={formSua.ten || ""}
                      onChange={(e) =>
                        setFormSua({ ...formSua, ten: e.target.value })
                      }
                    />
                  ) : (
                    s.ten
                  )}
                </td>
                <td>
                  {dangSuaId === s.id ? (
                    <Form.Control
                      size="sm"
                      value={formSua.moTa || ""}
                      onChange={(e) =>
                        setFormSua({ ...formSua, moTa: e.target.value })
                      }
                    />
                  ) : (
                    s.moTa || "—"
                  )}
                </td>
                <td>
                  {dangSuaId === s.id ? (
                    <Form.Control
                      size="sm"
                      type="text"
                      inputMode="numeric"
                      value={formatVndInput(formSua.gia)}
                      onChange={(e) =>
                        setFormSua({
                          ...formSua,
                          gia: parseVndInput(e.target.value),
                        })
                      }
                    />
                  ) : (
                    `${s.gia?.toLocaleString("vi-VN")}đ`
                  )}
                </td>
                <td>
                  {dangSuaId === s.id ? (
                    <Form.Check
                      type="switch"
                      checked={formSua.hoatDong !== false}
                      onChange={(e) =>
                        setFormSua({ ...formSua, hoatDong: e.target.checked })
                      }
                    />
                  ) : s.hoatDong ? (
                    "Đang áp dụng"
                  ) : (
                    "Ngừng"
                  )}
                </td>
                <td>
                  {dangSuaId === s.id ? (
                    <>
                      <Button
                        size="sm"
                        className="me-2"
                        onClick={() => luuSua(s.id)}
                      >
                        <i className="bi bi-check2 me-1" aria-hidden />
                        Lưu
                      </Button>
                      <Button size="sm" variant="secondary" onClick={huySua}>
                        <i className="bi bi-x me-1" aria-hidden />
                        Hủy
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        className="btn-action-edit me-2"
                        onClick={() => batDauSua(s)}
                      >
                        <i className="bi bi-pencil-square me-1" aria-hidden />
                        Sửa
                      </Button>
                      <Button
                        size="sm"
                        className="btn-action-delete"
                        onClick={() => setXoaId(s.id)}
                      >
                        <i className="bi bi-trash me-1" aria-hidden />
                        Xóa
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {danhSachDichVuLoc.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-muted py-4">
                  Không có dịch vụ phù hợp với bộ lọc hiện tại.
                </td>
              </tr>
            ) : null}
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
                        if (tenLoaiDichVuError)
                          setTenLoaiDichVuError(validateTenLoaiDichVu(value));
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
                  <span className="text-muted small">
                    Không tìm thấy loại dịch vụ phù hợp.
                  </span>
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
                    setForm({
                      ...form,
                      maLoaiDichVu: Number(e.target.value) || undefined,
                    })
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
                  type="text"
                  inputMode="numeric"
                  placeholder="Ví dụ: 150.000"
                  value={formatVndInput(form.gia)}
                  onChange={(e) => {
                    const gia = parseVndInput(e.target.value);
                    setForm({ ...form, gia });
                  }}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  label="Đang áp dụng"
                  checked={form.hoatDong !== false}
                  onChange={(e) =>
                    setForm({ ...form, hoatDong: e.target.checked })
                  }
                />
              </Form.Group>
              <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" onClick={() => setHienModal(false)}>
                  <i className="bi bi-x-circle me-2" aria-hidden />
                  Hủy
                </Button>
                <Button type="submit" disabled={loaiDichVu.length === 0}>
                  <i className="bi bi-check2-circle me-2" aria-hidden />
                  Lưu
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>

      <Modal show={xoaId !== null} onHide={() => setXoaId(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i
              className="bi bi-exclamation-triangle-fill text-danger me-2"
              aria-hidden
            />
            Xác nhận xóa
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bạn có chắc muốn xóa dịch vụ <strong>{dichVuCanXoa?.ten}</strong>{" "}
          không?
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setXoaId(null)}
            disabled={dangXoa}
          >
            <i className="bi bi-x-circle me-2" aria-hidden />
            Hủy
          </Button>
          <Button variant="danger" onClick={xacNhanXoa} disabled={dangXoa}>
            <i className="bi bi-trash me-2" aria-hidden />
            {dangXoa ? "Đang xóa..." : "Xóa"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
