"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Card, Form, Modal, Table } from "react-bootstrap";
import Link from "next/link";
import { serviceTypesApi, servicesApi, type DichVu, type LoaiDichVu } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import { notify } from "@/lib/notify";

export default function ServiceTypesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [list, setList] = useState<LoaiDichVu[]>([]);
  const [danhSachDichVu, setDanhSachDichVu] = useState<DichVu[]>([]);
  const [tenLoaiDichVu, setTenLoaiDichVu] = useState("");
  const [dangSuaId, setDangSuaId] = useState<number | null>(null);
  const [tenDangSua, setTenDangSua] = useState("");
  const [error, setError] = useState("");
  const [tenLoaiDichVuError, setTenLoaiDichVuError] = useState("");
  const [tenDangSuaError, setTenDangSuaError] = useState("");
  const [mucCanXoa, setMucCanXoa] = useState<LoaiDichVu | null>(null);
  const [dangXoa, setDangXoa] = useState(false);

  const napDuLieu = async () => {
    try {
      const [loaiDichVu, dichVu] = await Promise.all([
        serviceTypesApi.list(),
        servicesApi.list(),
      ]);
      setList(loaiDichVu);
      setDanhSachDichVu(dichVu);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Không tải được loại dịch vụ");
    }
  };

  const demDichVuTheoLoai = useMemo(() => {
    const dem = new Map<number, number>();
    danhSachDichVu.forEach((dichVu) => {
      if (!dichVu.maLoaiDichVu) return;
      dem.set(dichVu.maLoaiDichVu, (dem.get(dichVu.maLoaiDichVu) ?? 0) + 1);
    });
    return dem;
  }, [danhSachDichVu]);

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
    setTenLoaiDichVuError("");
  };

  const resetInlineEdit = () => {
    setDangSuaId(null);
    setTenDangSua("");
    setTenDangSuaError("");
  };

  const validateTenLoaiDichVu = (value: string): string => {
    const ten = value.trim();
    if (!ten) return "Vui lòng nhập tên loại dịch vụ.";
    if (ten.length < 3) return "Tên loại dịch vụ cần tối thiểu 3 ký tự.";
    const tenDaTonTai = list.some(
      (item) =>
        item.tenLoaiDichVu.trim().toLocaleLowerCase() ===
          ten.toLocaleLowerCase() && item.id !== dangSuaId,
    );
    if (tenDaTonTai) return "Tên loại dịch vụ đã tồn tại.";
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
      await serviceTypesApi.create({ tenLoaiDichVu: ten });
      resetForm();
      await napDuLieu();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Không lưu được loại dịch vụ");
    }
  };

  const handleEdit = (item: LoaiDichVu) => {
    setDangSuaId(item.id);
    setTenDangSua(item.tenLoaiDichVu);
    setTenDangSuaError("");
  };

  const handleSaveInline = async (id: number) => {
    setError("");
    const loiTen = validateTenLoaiDichVu(tenDangSua);
    setTenDangSuaError(loiTen);
    if (loiTen) return;
    try {
      await serviceTypesApi.update(id, { tenLoaiDichVu: tenDangSua.trim() });
      resetInlineEdit();
      await napDuLieu();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Không cập nhật được loại dịch vụ");
    }
  };

  const handleDelete = (id: number) => {
    setError("");
    const item = list.find((x) => x.id === id);
    if (!item) return;
    const soLuongDichVu = demDichVuTheoLoai.get(item.id) ?? 0;
    if (soLuongDichVu > 0) {
      setError(
        `Không thể xóa loại dịch vụ "${item.tenLoaiDichVu}" vì đang có ${soLuongDichVu} dịch vụ thuộc loại này.`,
      );
      return;
    }
    setMucCanXoa(item);
  };

  const handleConfirmDelete = async () => {
    if (!mucCanXoa) return;
    setDangXoa(true);
    try {
      await serviceTypesApi.delete(mucCanXoa.id);
      await napDuLieu();
      setMucCanXoa(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Không xóa được loại dịch vụ");
    } finally {
      setDangXoa(false);
    }
  };

  const handleExportCsv = () => {
    if (list.length === 0) {
      notify.warning("Chưa có dữ liệu để xuất CSV");
      return;
    }

    const csvEscape = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const header = ["MaLoaiDichVu", "TenLoaiDichVu"];
    const rows = list.map((item) => [String(item.id), csvEscape(item.tenLoaiDichVu)]);
    const content = [header.join(","), ...rows.map((row) => row.join(","))].join("\n");

    const bom = "\uFEFF";
    const blob = new Blob([bom + content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    const now = new Date();
    const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;
    anchor.href = url;
    anchor.download = `loai-dich-vu-${stamp}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  if (!user?.cacVaiTro.includes("QUAN_TRI")) return null;

  return (
    <div className="service-type-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Quản lý loại dịch vụ</h2>
        <div className="d-flex gap-2">
          <Button className="btn-service-export" onClick={handleExportCsv}>
            <i className="bi bi-filetype-csv me-2" aria-hidden />
            Export CSV
          </Button>
          <Button as={Link} href="/dich-vu" className="btn-service-nav">
            <i className="bi bi-hospital me-2" aria-hidden />
            Đến trang dịch vụ
          </Button>
        </div>
      </div>

      <Card className="mb-4">
        <Card.Body>
          <Form onSubmit={handleSubmit} noValidate>
            <div className="d-flex align-items-start gap-2">
              <div className="flex-grow-1">
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
              </div>
              <Button type="submit" className="text-nowrap">
                <i className="bi bi-plus-circle me-2" aria-hidden />
                Thêm loại
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {error ? <Alert variant="danger">{error}</Alert> : null}

      <Card>
        <Table responsive hover className="mb-0">
          <thead>
            <tr>
              <th>Loại dịch vụ</th>
              <th className="text-center">Số dịch vụ</th>
              <th className="text-end">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {list.map((item) => (
              <tr key={item.id}>
                <td>
                  {dangSuaId === item.id ? (
                    <>
                      <Form.Control
                        value={tenDangSua}
                        onChange={(e) => {
                          const value = e.target.value;
                          setTenDangSua(value);
                          if (tenDangSuaError) {
                            setTenDangSuaError(validateTenLoaiDichVu(value));
                          }
                        }}
                        isInvalid={Boolean(tenDangSuaError)}
                      />
                      <Form.Control.Feedback type="invalid">
                        {tenDangSuaError}
                      </Form.Control.Feedback>
                    </>
                  ) : (
                    item.tenLoaiDichVu
                  )}
                </td>
                <td className="text-center">{demDichVuTheoLoai.get(item.id) ?? 0}</td>
                <td className="text-end">
                  {dangSuaId === item.id ? (
                    <>
                      <Button
                        size="sm"
                        variant="primary"
                        className="me-2"
                        onClick={() => handleSaveInline(item.id)}
                      >
                        <i className="bi bi-check2 me-1" aria-hidden />
                        Lưu
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="me-2"
                        onClick={resetInlineEdit}
                      >
                        <i className="bi bi-x-lg me-1" aria-hidden />
                        Hủy
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      className="btn-service-edit me-2"
                      onClick={() => handleEdit(item)}
                    >
                      <i className="bi bi-pencil-square me-1" aria-hidden />
                      Sửa
                    </Button>
                  )}
                  <Button
                    size="sm"
                    className="btn-service-delete"
                    onClick={() => handleDelete(item.id)}
                    disabled={dangSuaId === item.id || (demDichVuTheoLoai.get(item.id) ?? 0) > 0}
                    title={
                      (demDichVuTheoLoai.get(item.id) ?? 0) > 0
                        ? "Không thể xóa vì đang có dịch vụ thuộc loại này"
                        : undefined
                    }
                  >
                    <i className="bi bi-trash me-1" aria-hidden />
                    Xóa
                  </Button>
                </td>
              </tr>
            ))}
            {list.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center text-muted py-4">
                  Chưa có loại dịch vụ nào.
                </td>
              </tr>
            ) : null}
          </tbody>
        </Table>
      </Card>

      <Modal
        show={Boolean(mucCanXoa)}
        onHide={() => setMucCanXoa(null)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bạn có chắc muốn xóa loại dịch vụ{" "}
          <strong>{mucCanXoa?.tenLoaiDichVu}</strong> không?
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setMucCanXoa(null)}
            disabled={dangXoa}
          >
            Hủy
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete} disabled={dangXoa}>
            {dangXoa ? "Đang xóa..." : "Xóa"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
