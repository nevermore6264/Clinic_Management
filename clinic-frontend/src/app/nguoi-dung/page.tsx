"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, Table, Button, Form, Alert, Modal } from "react-bootstrap";
import { useAuth } from "@/lib/useAuth";
import { patientsApi, usersApi, type BenhNhan, type ThongTinNguoiDungDto } from "@/lib/api";

const ROLES = ["QUAN_TRI", "LE_TAN", "BAC_SI", "THU_NGAN", "BENH_NHAN"];

const ROLE_LABELS: Record<string, string> = {
  QUAN_TRI: "Quản trị",
  LE_TAN: "Lễ tân",
  BAC_SI: "Bác sĩ",
  THU_NGAN: "Thu ngân",
  BENH_NHAN: "Bệnh nhân",
};

const ROLE_BADGE_CLASS: Record<string, string> = {
  QUAN_TRI: "user-role-tag--admin",
  LE_TAN: "user-role-tag--reception",
  BAC_SI: "user-role-tag--doctor",
  THU_NGAN: "user-role-tag--cashier",
  BENH_NHAN: "user-role-tag--patient",
};

export default function UsersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [list, setList] = useState<ThongTinNguoiDungDto[]>([]);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingUser, setEditingUser] = useState<ThongTinNguoiDungDto | null>(null);
  const [tuKhoa, setTuKhoa] = useState("");
  const [boLocTrangThai, setBoLocTrangThai] = useState("tat-ca");
  const [boLocVaiTro, setBoLocVaiTro] = useState("tat-ca");
  const [createForm, setCreateForm] = useState({
    username: "",
    password: "",
    fullName: "",
    role: "LE_TAN",
  });
  const [danhSachBenhNhan, setDanhSachBenhNhan] = useState<BenhNhan[]>([]);
  const [benhNhanDaChon, setBenhNhanDaChon] = useState("");
  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "LE_TAN",
  });
  const [xacNhanKhoa, setXacNhanKhoa] = useState<
    null | { loai: "khoa" | "mo"; nguoi: ThongTinNguoiDungDto }
  >(null);
  const [dangKhoa, setDangKhoa] = useState(false);

  const loadUsers = () =>
    usersApi
      .list()
      .then(setList)
      .catch((e) => setError(e.message));

  const loadPatients = () =>
    patientsApi
      .list(0, 500)
      .then((r) => setDanhSachBenhNhan(r.content ?? []))
      .catch((e) => setError(e.message));

  useEffect(() => {
    if (!loading && !user) router.replace("/dang-nhap");
    if (user && !user.cacVaiTro.includes("QUAN_TRI")) router.replace("/bang-dieu-khien");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user?.cacVaiTro.includes("QUAN_TRI")) return;
    loadUsers();
  }, [user]);

  useEffect(() => {
    if (!showCreate) return;
    loadPatients();
  }, [showCreate]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const laTaiKhoanBenhNhan = createForm.role === "BENH_NHAN";
    const benhNhanChon = danhSachBenhNhan.find((bn) => String(bn.id) === benhNhanDaChon);
    if (laTaiKhoanBenhNhan && !benhNhanChon) {
      setError("Vui lòng chọn bệnh nhân trước khi tạo tài khoản.");
      return;
    }
    try {
      await usersApi.create({
        username: createForm.username,
        password: createForm.password,
        fullName: laTaiKhoanBenhNhan
          ? benhNhanChon?.hoTen
          : createForm.fullName || undefined,
        roles: [createForm.role],
      });
      await loadUsers();
      setShowCreate(false);
      setCreateForm({
        username: "",
        password: "",
        fullName: "",
        role: "LE_TAN",
      });
      setBenhNhanDaChon("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Lỗi");
    }
  };

  const openEdit = (u: ThongTinNguoiDungDto) => {
    setEditingUser(u);
    const dauTien = u.cacVaiTro?.length ? [...u.cacVaiTro][0] : null;
    const vaiTroHienTai =
      dauTien && ROLES.includes(dauTien) ? dauTien : "LE_TAN";
    setEditForm({
      fullName: u.hoTen || "",
      email: u.thuDienTu || "",
      phone: u.soDienThoai || "",
      role: vaiTroHienTai,
    });
    setShowEdit(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser?.id) return;
    setError("");
    try {
      await usersApi.update(editingUser.id, {
        fullName: editForm.fullName,
        email: editForm.email || undefined,
        phone: editForm.phone || undefined,
        roles: [editForm.role],
      });
      await loadUsers();
      setShowEdit(false);
      setEditingUser(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Lỗi");
    }
  };

  const moHopThoaiKhoa = (u: ThongTinNguoiDungDto) => {
    if (!u.id || !u.hoatDong) return;
    if (user?.maNguoiDung != null && u.id === user.maNguoiDung) {
      setError("Không thể khóa tài khoản bạn đang đăng nhập.");
      return;
    }
    setError("");
    setXacNhanKhoa({ loai: "khoa", nguoi: u });
  };

  const moHopThoaiMoKhoa = (u: ThongTinNguoiDungDto) => {
    if (!u.id || u.hoatDong) return;
    setError("");
    setXacNhanKhoa({ loai: "mo", nguoi: u });
  };

  const dongHopThoaiKhoa = useCallback(() => {
    if (!dangKhoa) setXacNhanKhoa(null);
  }, [dangKhoa]);

  const thucHienKhoaHoacMoKhoa = async () => {
    const tacVu = xacNhanKhoa;
    if (!tacVu?.nguoi?.id) return;
    const { loai, nguoi } = tacVu;
    setDangKhoa(true);
    setError("");
    try {
      if (loai === "khoa") await usersApi.lock(nguoi.id);
      else await usersApi.unlock(nguoi.id);
      await loadUsers();
      setXacNhanKhoa(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Lỗi");
    } finally {
      setDangKhoa(false);
    }
  };

  useEffect(() => {
    if (!xacNhanKhoa) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dongHopThoaiKhoa();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [xacNhanKhoa, dongHopThoaiKhoa]);

  const danhSachLoc = list.filter((u) => {
    const keyword = tuKhoa.trim().toLocaleLowerCase();
    const text = [u.tenDangNhap, u.hoTen, u.thuDienTu, u.soDienThoai]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase();
    const khopTuKhoa = !keyword || text.includes(keyword);
    const khopTrangThai =
      boLocTrangThai === "tat-ca" ||
      (boLocTrangThai === "hoat-dong" && u.hoatDong) ||
      (boLocTrangThai === "bi-khoa" && !u.hoatDong);
    const khopVaiTro =
      boLocVaiTro === "tat-ca" || Boolean(u.cacVaiTro?.includes(boLocVaiTro));
    return khopTuKhoa && khopTrangThai && khopVaiTro;
  });

  const exportCsv = () => {
    const rows = [
      ["Ten dang nhap", "Ho ten", "Email", "So dien thoai", "Vai tro", "Trang thai"],
      ...danhSachLoc.map((u) => [
        u.tenDangNhap ?? "",
        u.hoTen ?? "",
        u.thuDienTu ?? "",
        u.soDienThoai ?? "",
        (u.cacVaiTro ?? []).join("|"),
        u.hoatDong ? "Hoat dong" : "Da khoa",
      ]),
    ];
    const csv = rows
      .map((row) => row.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const now = new Date();
    const pad2 = (n: number) => String(n).padStart(2, "0");
    const file = `nguoi-dung-${now.getFullYear()}${pad2(now.getMonth() + 1)}${pad2(
      now.getDate(),
    )}-${pad2(now.getHours())}${pad2(now.getMinutes())}.csv`;
    const a = document.createElement("a");
    a.href = url;
    a.download = file;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!user?.cacVaiTro.includes("QUAN_TRI")) return null;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Quản lý tài khoản</h2>
        <div className="d-flex gap-2">
          <Button className="btn-service-export" onClick={exportCsv}>
            <i className="bi bi-filetype-csv me-2" aria-hidden />
            Export CSV
          </Button>
          <Button variant="primary" onClick={() => setShowCreate(true)}>
            <i className="bi bi-person-plus me-2" aria-hidden />
            Tạo tài khoản
          </Button>
        </div>
      </div>
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      <Card className="mb-3 card--static">
        <Card.Body className="py-3">
          <div className="row g-2">
            <div className="col-md-5">
              <Form.Control
                placeholder="Tìm tên đăng nhập, họ tên, email, SĐT..."
                value={tuKhoa}
                onChange={(e) => setTuKhoa(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <Form.Select
                value={boLocTrangThai}
                onChange={(e) => setBoLocTrangThai(e.target.value)}
              >
                <option value="tat-ca">Tất cả trạng thái</option>
                <option value="hoat-dong">Hoạt động</option>
                <option value="bi-khoa">Đã khóa</option>
              </Form.Select>
            </div>
            <div className="col-md-3">
              <Form.Select value={boLocVaiTro} onChange={(e) => setBoLocVaiTro(e.target.value)}>
                <option value="tat-ca">Tất cả vai trò</option>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r] ?? r}
                  </option>
                ))}
              </Form.Select>
            </div>
            <div className="col-md-1 d-flex align-items-center">
              <Button
                variant="secondary"
                className="w-100"
                onClick={() => {
                  setTuKhoa("");
                  setBoLocTrangThai("tat-ca");
                  setBoLocVaiTro("tat-ca");
                }}
              >
                <i className="bi bi-arrow-counterclockwise me-2" aria-hidden />
                Xóa lọc
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>
      <Card>
        <Table responsive hover className="mb-0">
          <thead>
            <tr>
              <th>Tên đăng nhập</th>
              <th>Họ tên</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {danhSachLoc.map((u) => (
              <tr key={u.id}>
                <td>{u.tenDangNhap}</td>
                <td>{u.hoTen || "—"}</td>
                <td>
                  <div className="d-flex flex-wrap gap-1">
                    {u.cacVaiTro?.map((role) => (
                      <span
                        key={`${u.id}-${role}`}
                        className={`user-role-tag ${ROLE_BADGE_CLASS[role] ?? ""}`}
                      >
                        {ROLE_LABELS[role] ?? role}
                      </span>
                    ))}
                  </div>
                </td>
                <td>
                  <span
                    className={`user-status-tag ${
                      u.hoatDong ? "user-status-tag--active" : "user-status-tag--inactive"
                    }`}
                  >
                    {u.hoatDong ? "Hoạt động" : "Đã khóa"}
                  </span>
                </td>
                <td className="text-nowrap">
                  <Button
                    size="sm"
                    className="btn-action-edit me-2"
                    onClick={() => openEdit(u)}
                  >
                    <i className="bi bi-pencil-square me-1" aria-hidden />
                    Sửa
                  </Button>
                  {u.hoatDong ? (
                    <Button
                      size="sm"
                      className="btn-action-delete"
                      onClick={() => moHopThoaiKhoa(u)}
                      disabled={
                        user?.maNguoiDung != null && u.id === user.maNguoiDung
                      }
                      title={
                        user?.maNguoiDung != null && u.id === user.maNguoiDung
                          ? "Không thể khóa chính tài khoản đang đăng nhập"
                          : undefined
                      }
                    >
                      <i className="bi bi-lock-fill me-1" aria-hidden />
                      Khóa
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="btn-action-edit"
                      onClick={() => moHopThoaiMoKhoa(u)}
                    >
                      <i className="bi bi-unlock-fill me-1" aria-hidden />
                      Mở khóa
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            {danhSachLoc.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-muted py-4">
                  Không có tài khoản phù hợp bộ lọc hiện tại.
                </td>
              </tr>
            ) : null}
          </tbody>
        </Table>
      </Card>

      {xacNhanKhoa ? (
        <div
          className="clinic-confirm-overlay"
          role="presentation"
          onClick={dongHopThoaiKhoa}
        >
          <div
            className="clinic-confirm-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="xac-nhan-khoa-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="xac-nhan-khoa-title" className="h6 fw-bold mb-2">
              {xacNhanKhoa.loai === "khoa" ? "Khóa tài khoản?" : "Mở khóa tài khoản?"}
            </h3>
            <p className="text-muted small mb-3 mb-md-4">
              {xacNhanKhoa.loai === "khoa" ? (
                <>
                  Khóa tài khoản <strong>{xacNhanKhoa.nguoi.tenDangNhap}</strong>? Người dùng
                  sẽ không đăng nhập được cho đến khi được mở khóa.
                </>
              ) : (
                <>
                  Mở khóa tài khoản <strong>{xacNhanKhoa.nguoi.tenDangNhap}</strong>?
                </>
              )}
            </p>
            <div className="d-flex gap-2 justify-content-end flex-wrap">
              <Button
                type="button"
                variant="secondary"
                disabled={dangKhoa}
                onClick={dongHopThoaiKhoa}
              >
                Hủy
              </Button>
              <Button
                type="button"
                variant={xacNhanKhoa.loai === "khoa" ? "danger" : "primary"}
                disabled={dangKhoa}
                onClick={thucHienKhoaHoacMoKhoa}
              >
                {dangKhoa ? "Đang xử lý…" : xacNhanKhoa.loai === "khoa" ? "Khóa" : "Mở khóa"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <Modal show={showCreate} onHide={() => setShowCreate(false)} centered>
        <Modal.Header closeButton>Tạo tài khoản</Modal.Header>
        <Form onSubmit={handleCreate}>
          <Modal.Body>
            <Form.Group className="mb-2">
              <Form.Label className="required">Tên đăng nhập</Form.Label>
              <Form.Control
                value={createForm.username}
                onChange={(e) =>
                  setCreateForm({ ...createForm, username: e.target.value })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label className="required">Mật khẩu</Form.Label>
              <Form.Control
                type="password"
                value={createForm.password}
                onChange={(e) =>
                  setCreateForm({ ...createForm, password: e.target.value })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-2">
              {createForm.role === "BENH_NHAN" ? (
                <>
                  <Form.Label className="required">Chọn bệnh nhân</Form.Label>
                  <Form.Select
                    value={benhNhanDaChon}
                    onChange={(e) => setBenhNhanDaChon(e.target.value)}
                    required
                  >
                    <option value="">-- Chọn bệnh nhân --</option>
                    {danhSachBenhNhan.map((bn) => (
                      <option key={bn.id} value={bn.id}>
                        {bn.hoTen} {bn.soDienThoai ? `- ${bn.soDienThoai}` : ""}
                      </option>
                    ))}
                  </Form.Select>
                </>
              ) : (
                <>
                  <Form.Label>Họ tên</Form.Label>
                  <Form.Control
                    value={createForm.fullName}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, fullName: e.target.value })
                    }
                  />
                </>
              )}
            </Form.Group>
            <Form.Group>
              <Form.Label className="required">Vai trò</Form.Label>
              <Form.Select
                value={createForm.role}
                onChange={(e) => {
                  const role = e.target.value;
                  setCreateForm((f) => ({ ...f, role }));
                  if (role !== "BENH_NHAN") setBenhNhanDaChon("");
                }}
                required
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r] ?? r}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreate(false)}>
              <i className="bi bi-x-circle me-2" aria-hidden />
              Hủy
            </Button>
            <Button variant="primary" type="submit">
              <i className="bi bi-check2-circle me-2" aria-hidden />
              Tạo
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal
        show={showEdit}
        centered
        onHide={() => {
          setShowEdit(false);
          setEditingUser(null);
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Sửa tài khoản</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEdit}>
          <Modal.Body>
            <Form.Group className="mb-2">
              <Form.Label className="required">Họ tên</Form.Label>
              <Form.Control
                value={editForm.fullName}
                onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Email</Form.Label>
              <Form.Control
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Số điện thoại</Form.Label>
              <Form.Control
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label className="required">Vai trò</Form.Label>
              <Form.Select
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                required
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r] ?? r}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => {
                setShowEdit(false);
                setEditingUser(null);
              }}
            >
              <i className="bi bi-x-circle me-2" aria-hidden />
              Hủy
            </Button>
            <Button variant="primary" type="submit">
              <i className="bi bi-check2-circle me-2" aria-hidden />
              Lưu
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
