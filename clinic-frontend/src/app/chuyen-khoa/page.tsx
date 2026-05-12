"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Badge,
  Button,
  Card,
  Form,
  Modal,
  Pagination,
  Table,
} from "react-bootstrap";
import Link from "next/link";
import { bacSiApi, chuyenKhoaApi, type BacSi, type ChuyenKhoa } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import { notify } from "@/lib/notify";
import { catTrang, tongSoTrangClient } from "@/lib/phanTrangClient";

export default function ChuyenKhoaPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [list, setList] = useState<ChuyenKhoa[]>([]);
  const [bacSi, setBacSi] = useState<BacSi[]>([]);
  const [ten, setTen] = useState("");
  const [dangSuaId, setDangSuaId] = useState<number | null>(null);
  const [tenDangSua, setTenDangSua] = useState("");
  const [error, setError] = useState("");
  const [tenError, setTenError] = useState("");
  const [tenDangSuaError, setTenDangSuaError] = useState("");
  const [mucCanXoa, setMucCanXoa] = useState<ChuyenKhoa | null>(null);
  const [dangXoa, setDangXoa] = useState(false);
  const [chuyenKhoaXemBacSi, setChuyenKhoaXemBacSi] = useState<ChuyenKhoa | null>(
    null,
  );
  const [trang, setTrang] = useState(0);
  const [kichThuocTrang, setKichThuocTrang] = useState(15);

  const napDuLieu = async () => {
    try {
      const [ck, bs] = await Promise.all([
        chuyenKhoaApi.danhSach(),
        bacSiApi.danhSachTatCa(),
      ]);
      setList(ck);
      setBacSi(bs);
      setError("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Không tải được chuyên khoa");
    }
  };

  const demBacSiTheoCk = useMemo(() => {
    const dem = new Map<number, number>();
    bacSi.forEach((b) => {
      if (b.maChuyenKhoa == null) return;
      dem.set(b.maChuyenKhoa, (dem.get(b.maChuyenKhoa) ?? 0) + 1);
    });
    return dem;
  }, [bacSi]);

  const bacSiTrongChuyenKhoa = useMemo(() => {
    if (!chuyenKhoaXemBacSi) return [];
    return bacSi
      .filter((b) => b.maChuyenKhoa === chuyenKhoaXemBacSi.id)
      .slice()
      .sort((a, b) =>
        (a.hoTen ?? a.tenDangNhap ?? "").localeCompare(
          b.hoTen ?? b.tenDangNhap ?? "",
          "vi",
          { sensitivity: "base" },
        ),
      );
  }, [bacSi, chuyenKhoaXemBacSi]);

  const tongTrangCk = tongSoTrangClient(list.length, kichThuocTrang);
  const dongTrangCk = useMemo(
    () => catTrang(list, trang, kichThuocTrang),
    [list, trang, kichThuocTrang],
  );

  useEffect(() => {
    setTrang(0);
  }, [list.length, kichThuocTrang]);

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
    setTen("");
    setTenError("");
  };

  const resetInlineEdit = () => {
    setDangSuaId(null);
    setTenDangSua("");
    setTenDangSuaError("");
  };

  const validateTen = (value: string, boQuaId: number | null): string => {
    const t = value.trim();
    if (!t) return "Vui lòng nhập tên chuyên khoa.";
    if (t.length < 3) return "Tên cần tối thiểu 3 ký tự.";
    const trung = list.some(
      (item) =>
        item.tenChuyenKhoa.trim().toLocaleLowerCase() === t.toLocaleLowerCase() &&
        item.id !== boQuaId,
    );
    if (trung) return "Tên chuyên khoa đã tồn tại.";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const loiTen = validateTen(ten, null);
    setTenError(loiTen);
    if (loiTen) return;
    try {
      await chuyenKhoaApi.tao({ tenChuyenKhoa: ten.trim() });
      resetForm();
      await napDuLieu();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Không lưu được chuyên khoa");
    }
  };

  const handleEdit = (item: ChuyenKhoa) => {
    setDangSuaId(item.id);
    setTenDangSua(item.tenChuyenKhoa);
    setTenDangSuaError("");
  };

  const handleSaveInline = async (id: number) => {
    setError("");
    const loiTen = validateTen(tenDangSua, id);
    setTenDangSuaError(loiTen);
    if (loiTen) return;
    try {
      await chuyenKhoaApi.capNhat(id, { tenChuyenKhoa: tenDangSua.trim() });
      resetInlineEdit();
      await napDuLieu();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Không cập nhật được");
    }
  };

  const handleDelete = (item: ChuyenKhoa) => {
    setError("");
    const n = demBacSiTheoCk.get(item.id) ?? 0;
    if (n > 0) {
      setError(
        `Không thể xóa "${item.tenChuyenKhoa}" vì đang có ${n} bác sĩ thuộc chuyên khoa này.`,
      );
      return;
    }
    setMucCanXoa(item);
  };

  const handleConfirmDelete = async () => {
    if (!mucCanXoa) return;
    setDangXoa(true);
    try {
      await chuyenKhoaApi.xoa(mucCanXoa.id);
      await napDuLieu();
      setMucCanXoa(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Không xóa được");
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
    const header = ["MaChuyenKhoa", "TenChuyenKhoa", "SoBacSi"];
    const rows = list.map((item) => [
      String(item.id),
      csvEscape(item.tenChuyenKhoa),
      String(demBacSiTheoCk.get(item.id) ?? 0),
    ]);
    const content = [header.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const bom = "\uFEFF";
    const blob = new Blob([bom + content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    const now = new Date();
    const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;
    anchor.href = url;
    anchor.download = `chuyen-khoa-${stamp}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  if (!user?.cacVaiTro.includes("QUAN_TRI")) return null;

  return (
    <div className="chuyen-khoa-page">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h2 className="mb-0">Quản lý chuyên khoa</h2>
        <div className="d-flex gap-2 flex-wrap">
          <Button className="btn-service-export" onClick={handleExportCsv}>
            <i className="bi bi-filetype-csv me-2" aria-hidden />
            Export CSV
          </Button>
          <Link href="/bac-si" className="btn btn-service-nav">
            <i className="bi bi-person-badge me-2" aria-hidden />
            Quản lý bác sĩ
          </Link>
        </div>
      </div>

      <Card className="mb-4">
        <Card.Body>
          <Form onSubmit={handleSubmit} noValidate>
            <div className="d-flex align-items-start gap-2 flex-wrap">
              <div className="flex-grow-1" style={{ minWidth: 220 }}>
                <Form.Control
                  placeholder="Ví dụ: Nội tổng quát, Da liễu..."
                  value={ten}
                  onChange={(e) => {
                    const value = e.target.value;
                    setTen(value);
                    if (tenError) setTenError(validateTen(value, null));
                  }}
                  isInvalid={Boolean(tenError)}
                />
                <Form.Control.Feedback type="invalid">{tenError}</Form.Control.Feedback>
              </div>
              <Button type="submit" className="text-nowrap">
                <i className="bi bi-plus-circle me-2" aria-hidden />
                Thêm chuyên khoa
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {error ? <Alert variant="danger">{error}</Alert> : null}

      <Card>
        <Card.Header className="d-flex flex-wrap align-items-center justify-content-end gap-2 py-2">
          <Form.Select
            size="sm"
            aria-label="Số dòng mỗi trang"
            style={{ maxWidth: "8rem" }}
            value={kichThuocTrang}
            onChange={(e) =>
              setKichThuocTrang(Number(e.target.value) || 15)
            }
          >
            <option value={10}>10 / trang</option>
            <option value={15}>15 / trang</option>
            <option value={25}>25 / trang</option>
          </Form.Select>
        </Card.Header>
        <Table responsive hover className="mb-0">
          <thead>
            <tr>
              <th>Tên chuyên khoa</th>
              <th className="text-center">Số bác sĩ</th>
              <th className="text-center text-nowrap">Bác sĩ</th>
              <th className="text-end">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {dongTrangCk.map((item) => (
              <tr key={item.id}>
                <td>
                  {dangSuaId === item.id ? (
                    <>
                      <Form.Control
                        placeholder="Nhập tên chuyên khoa"
                        value={tenDangSua}
                        onChange={(e) => {
                          const value = e.target.value;
                          setTenDangSua(value);
                          if (tenDangSuaError) {
                            setTenDangSuaError(validateTen(value, item.id));
                          }
                        }}
                        isInvalid={Boolean(tenDangSuaError)}
                      />
                      <Form.Control.Feedback type="invalid">
                        {tenDangSuaError}
                      </Form.Control.Feedback>
                    </>
                  ) : (
                    item.tenChuyenKhoa
                  )}
                </td>
                <td className="text-center">{demBacSiTheoCk.get(item.id) ?? 0}</td>
                <td className="text-center">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline-primary"
                    className="text-nowrap"
                    onClick={() => setChuyenKhoaXemBacSi(item)}
                    disabled={dangSuaId === item.id}
                    title="Xem danh sách bác sĩ thuộc chuyên khoa"
                  >
                    <i className="bi bi-person-lines-fill me-1" aria-hidden />
                    Xem
                  </Button>
                </td>
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
                        type="button"
                        size="sm"
                        className="btn-modal-dismiss me-2"
                        onClick={resetInlineEdit}
                      >
                        <i className="bi bi-x-lg me-1" aria-hidden />
                        Hủy
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      className="btn-action-edit me-2"
                      onClick={() => handleEdit(item)}
                    >
                      <i className="bi bi-pencil-square me-1" aria-hidden />
                      Sửa
                    </Button>
                  )}
                  <Button
                    size="sm"
                    className="btn-action-delete"
                    onClick={() => handleDelete(item)}
                    disabled={
                      dangSuaId === item.id || (demBacSiTheoCk.get(item.id) ?? 0) > 0
                    }
                    title={
                      (demBacSiTheoCk.get(item.id) ?? 0) > 0
                        ? "Không thể xóa khi còn bác sĩ thuộc chuyên khoa này"
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
                <td colSpan={4} className="text-center text-muted py-4">
                  Chưa có chuyên khoa nào.
                </td>
              </tr>
            ) : null}
          </tbody>
        </Table>
        {list.length > 0 ? (
          <Card.Footer className="d-flex flex-wrap align-items-center justify-content-between gap-2 py-3">
            <div className="small text-muted">
              {list.length} chuyên khoa khớp lọc · trang {trang + 1}/{tongTrangCk}
            </div>
            <Pagination className="mb-0 flex-wrap">
              <Pagination.Prev
                disabled={trang <= 0}
                onClick={() => setTrang((p) => Math.max(0, p - 1))}
              />
              <Pagination.Item active className="user-select-none">
                {trang + 1} / {tongTrangCk}
              </Pagination.Item>
              <Pagination.Next
                disabled={trang >= tongTrangCk - 1}
                onClick={() =>
                  setTrang((p) => Math.min(tongTrangCk - 1, p + 1))
                }
              />
            </Pagination>
          </Card.Footer>
        ) : null}
      </Card>

      <Modal
        show={Boolean(chuyenKhoaXemBacSi)}
        onHide={() => setChuyenKhoaXemBacSi(null)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title className="d-flex flex-wrap align-items-center gap-2">
            <i className="bi bi-person-badge text-primary" aria-hidden />
            Bác sĩ — {chuyenKhoaXemBacSi?.tenChuyenKhoa}
            <Badge bg="secondary" pill className="fw-normal">
              {bacSiTrongChuyenKhoa.length}
            </Badge>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-0">
          {bacSiTrongChuyenKhoa.length === 0 ? (
            <p className="text-muted mb-0">
              Chưa có bác sĩ nào gán vào chuyên khoa này. Bạn có thể gán khi{" "}
              <Link href="/bac-si">tạo hoặc sửa hồ sơ bác sĩ</Link>.
            </p>
          ) : (
            <Table responsive hover size="sm" className="mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>Họ tên</th>
                  <th>Tên đăng nhập</th>
                  <th>Bằng cấp</th>
                  <th className="text-center">Hoạt động</th>
                </tr>
              </thead>
              <tbody>
                {bacSiTrongChuyenKhoa.map((b) => (
                  <tr key={b.id}>
                    <td className="fw-semibold">{b.hoTen ?? "—"}</td>
                    <td>
                      <code className="small">{b.tenDangNhap ?? "—"}</code>
                    </td>
                    <td>{b.bangCap ?? "—"}</td>
                    <td className="text-center">
                      {b.hoatDong !== false ? (
                        <Badge bg="success">Có</Badge>
                      ) : (
                        <Badge bg="secondary">Không</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Modal.Body>
        <Modal.Footer className="clinic-modal-footer-actions justify-content-between">
          <span className="text-muted small">
            {chuyenKhoaXemBacSi
              ? `${bacSiTrongChuyenKhoa.length} bác sĩ`
              : ""}
          </span>
          <div className="d-flex flex-wrap gap-2">
            <Button
              type="button"
              className="btn-modal-dismiss"
              onClick={() => setChuyenKhoaXemBacSi(null)}
            >
              <i className="bi bi-x-lg me-2" aria-hidden />
              Đóng
            </Button>
            <Link
              href="/bac-si"
              className="btn btn-primary"
              onClick={() => setChuyenKhoaXemBacSi(null)}
            >
              <i className="bi bi-box-arrow-up-right me-2" aria-hidden />
              Quản lý bác sĩ
            </Link>
          </div>
        </Modal.Footer>
      </Modal>

      <Modal show={Boolean(mucCanXoa)} onHide={() => setMucCanXoa(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-exclamation-triangle-fill text-danger me-2" aria-hidden />
            Xác nhận xóa
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bạn có chắc muốn xóa chuyên khoa <strong>{mucCanXoa?.tenChuyenKhoa}</strong>?
        </Modal.Body>
        <Modal.Footer className="clinic-modal-footer-actions">
          <Button
            type="button"
            className="btn-modal-dismiss"
            onClick={() => setMucCanXoa(null)}
            disabled={dangXoa}
          >
            <i className="bi bi-x-lg me-2" aria-hidden />
            Hủy
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete} disabled={dangXoa}>
            <i className="bi bi-trash me-2" aria-hidden />
            {dangXoa ? "Đang xóa..." : "Xóa"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
