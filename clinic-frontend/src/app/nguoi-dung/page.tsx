"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, Table, Button, Form, Alert, Modal, Pagination } from "react-bootstrap";
import { useAuth } from "@/lib/useAuth";
import {
  patientsApi,
  usersApi,
  doctorsApi,
  type BenhNhan,
  type BacSi,
  type ThongTinNguoiDungDto,
} from "@/lib/api";
import { catTrang, tongSoTrangClient } from "@/lib/phanTrangClient";

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
  const [danhSachBacSi, setDanhSachBacSi] = useState<BacSi[]>([]);
  const [benhNhanDaChon, setBenhNhanDaChon] = useState("");
  const [bacSiDaChon, setBacSiDaChon] = useState("");
  const [editBenhNhanId, setEditBenhNhanId] = useState("");
  const [editBacSiId, setEditBacSiId] = useState("");
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
  const [trang, setTrang] = useState(0);
  const KICH_THUOC_TRANG = 15;

  const [chonModal, setChonModal] = useState<
    null | "create-bn" | "create-bs" | "edit-bn" | "edit-bs"
  >(null);
  const [chonTimKiem, setChonTimKiem] = useState("");

  const danhSachChonModal = useMemo(() => {
    const q = chonTimKiem.trim().toLowerCase();
    const hop = (s: string | undefined | null) =>
      !q || (s != null && String(s).toLowerCase().includes(q));
    if (chonModal === "create-bn" || chonModal === "edit-bn") {
      return danhSachBenhNhan.filter(
        (bn) =>
          hop(bn.hoTen) ||
          hop(bn.soDienThoai) ||
          hop(bn.thuDienTu) ||
          hop(bn.diaChi),
      );
    }
    if (chonModal === "create-bs") {
      return danhSachBacSi
        .filter((bs) => !bs.maNguoiDung)
        .filter(
          (bs) =>
            hop(bs.hoTen) ||
            hop(bs.tenChuyenKhoa) ||
            hop(bs.chuyenMon),
        );
    }
    if (chonModal === "edit-bs") {
      return danhSachBacSi
        .filter(
          (bs) =>
            !bs.maNguoiDung ||
            (editingUser?.maBacSi != null && bs.id === editingUser.maBacSi),
        )
        .filter(
          (bs) =>
            hop(bs.hoTen) ||
            hop(bs.tenChuyenKhoa) ||
            hop(bs.chuyenMon),
        );
    }
    return [];
  }, [chonModal, chonTimKiem, danhSachBenhNhan, danhSachBacSi, editingUser]);

  const moChonBenhNhan = (mode: "create" | "edit") => {
    setChonTimKiem("");
    void loadPatients();
    setChonModal(mode === "create" ? "create-bn" : "edit-bn");
  };

  const moChonBacSi = (mode: "create" | "edit") => {
    setChonTimKiem("");
    void loadDoctors();
    setChonModal(mode === "create" ? "create-bs" : "edit-bs");
  };

  const dongChonModal = () => {
    setChonModal(null);
    setChonTimKiem("");
  };

  const apChonBenhNhan = (id: number) => {
    const s = String(id);
    if (chonModal === "create-bn") setBenhNhanDaChon(s);
    else if (chonModal === "edit-bn") setEditBenhNhanId(s);
    dongChonModal();
  };

  const apChonBacSi = (id: number) => {
    const s = String(id);
    if (chonModal === "create-bs") setBacSiDaChon(s);
    else if (chonModal === "edit-bs") setEditBacSiId(s);
    dongChonModal();
  };

  const nhanBenhNhanDaChon = () =>
    danhSachBenhNhan.find((bn) => String(bn.id) === benhNhanDaChon);
  const nhanBacSiDaChon = () =>
    danhSachBacSi.find((bs) => String(bs.id) === bacSiDaChon);
  const nhanBenhNhanSua = () =>
    danhSachBenhNhan.find((bn) => String(bn.id) === editBenhNhanId);
  const nhanBacSiSua = () =>
    danhSachBacSi.find((bs) => String(bs.id) === editBacSiId);

  const loadUsers = () =>
    usersApi
      .list()
      .then(setList)
      .catch((e) => setError(e.message));

  const loadPatients = () =>
    patientsApi
      .list(0, 3000)
      .then((r) => setDanhSachBenhNhan(r.content ?? []))
      .catch((e) => setError(e.message));

  const loadDoctors = () =>
    doctorsApi
      .list()
      .then(setDanhSachBacSi)
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
    if (!showCreate && !showEdit) return;
    loadPatients();
    loadDoctors();
  }, [showCreate, showEdit]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const laTaiKhoanBenhNhan = createForm.role === "BENH_NHAN";
    const laTaiKhoanBacSi = createForm.role === "BAC_SI";
    const benhNhanChon = danhSachBenhNhan.find((bn) => String(bn.id) === benhNhanDaChon);
    const bacSiChon = danhSachBacSi.find((bs) => String(bs.id) === bacSiDaChon);
    if (!createForm.username.trim()) {
      setError("Vui lòng nhập tên đăng nhập.");
      return;
    }
    if (!createForm.password.trim()) {
      setError("Vui lòng nhập mật khẩu.");
      return;
    }
    if (createForm.password.length < 6) {
      setError("Mật khẩu cần ít nhất 6 ký tự.");
      return;
    }
    if (laTaiKhoanBenhNhan && !benhNhanChon) {
      setError("Vui lòng chọn bệnh nhân trước khi tạo tài khoản.");
      return;
    }
    if (laTaiKhoanBacSi && !bacSiChon) {
      setError("Vui lòng chọn bác sĩ (hồ sơ chưa gán tài khoản) trước khi tạo.");
      return;
    }
    try {
      await usersApi.create({
        username: createForm.username,
        password: createForm.password,
        fullName: laTaiKhoanBenhNhan
          ? benhNhanChon?.hoTen
          : laTaiKhoanBacSi
            ? bacSiChon?.hoTen ?? createForm.fullName
            : createForm.fullName || undefined,
        roles: [createForm.role],
        maBenhNhan: laTaiKhoanBenhNhan ? benhNhanChon?.id : undefined,
        maBacSi: laTaiKhoanBacSi ? bacSiChon?.id : undefined,
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
      setBacSiDaChon("");
      setChonModal(null);
      setChonTimKiem("");
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
    setEditBenhNhanId(u.maBenhNhan != null ? String(u.maBenhNhan) : "");
    setEditBacSiId(u.maBacSi != null ? String(u.maBacSi) : "");
    setShowEdit(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser?.id) return;
    setError("");
    if (!editForm.fullName.trim()) {
      setError("Vui lòng nhập họ tên.");
      return;
    }
    if (editForm.role === "BENH_NHAN") {
      const maBn = editBenhNhanId.trim()
        ? Number(editBenhNhanId)
        : editingUser.maBenhNhan;
      if (maBn == null || Number.isNaN(maBn)) {
        setError("Vui lòng chọn bệnh nhân gán với tài khoản.");
        return;
      }
    }
    if (editForm.role === "BAC_SI") {
      const maBs = editBacSiId.trim()
        ? Number(editBacSiId)
        : editingUser.maBacSi;
      if (maBs == null || Number.isNaN(maBs)) {
        setError("Vui lòng chọn bác sĩ gán với tài khoản.");
        return;
      }
    }
    try {
      await usersApi.update(editingUser.id, {
        fullName: editForm.fullName,
        email: editForm.email || undefined,
        phone: editForm.phone || undefined,
        roles: [editForm.role],
        maBenhNhan:
          editForm.role === "BENH_NHAN"
            ? editBenhNhanId.trim()
              ? Number(editBenhNhanId)
              : editingUser.maBenhNhan
            : undefined,
        maBacSi:
          editForm.role === "BAC_SI"
            ? editBacSiId.trim()
              ? Number(editBacSiId)
              : editingUser.maBacSi
            : undefined,
      });
      await loadUsers();
      setShowEdit(false);
      setEditingUser(null);
      setEditBenhNhanId("");
      setEditBacSiId("");
      setChonModal(null);
      setChonTimKiem("");
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

  const tongTrang = tongSoTrangClient(danhSachLoc.length, KICH_THUOC_TRANG);
  const dongTrang = useMemo(
    () => catTrang(danhSachLoc, trang, KICH_THUOC_TRANG),
    [danhSachLoc, trang],
  );

  useEffect(() => {
    setTrang(0);
  }, [tuKhoa, boLocTrangThai, boLocVaiTro]);

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
            <div className="col-12 col-md-4">
              <Form.Control
                placeholder="Tìm tên đăng nhập, họ tên, email, SĐT..."
                value={tuKhoa}
                onChange={(e) => setTuKhoa(e.target.value)}
              />
            </div>
            <div className="col-6 col-md-2">
              <Form.Select
                value={boLocTrangThai}
                onChange={(e) => setBoLocTrangThai(e.target.value)}
              >
                <option value="tat-ca">Tất cả trạng thái</option>
                <option value="hoat-dong">Hoạt động</option>
                <option value="bi-khoa">Đã khóa</option>
              </Form.Select>
            </div>
            <div className="col-6 col-md-2">
              <Form.Select value={boLocVaiTro} onChange={(e) => setBoLocVaiTro(e.target.value)}>
                <option value="tat-ca">Tất cả vai trò</option>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r] ?? r}
                  </option>
                ))}
              </Form.Select>
            </div>
            <div className="col-12 col-md-4 d-flex align-items-end justify-content-end">
              <Button
                variant="outline-secondary"
                size="sm"
                className="btn-clinic-clear-filter"
                onClick={() => {
                  setTuKhoa("");
                  setBoLocTrangThai("tat-ca");
                  setBoLocVaiTro("tat-ca");
                  setTrang(0);
                }}
              >
                <i className="bi bi-arrow-counterclockwise" aria-hidden />
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
            {dongTrang.map((u) => (
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
        {danhSachLoc.length > 0 ? (
          <Card.Footer className="d-flex flex-wrap align-items-center justify-content-between gap-2 py-3">
            <div className="small text-muted">
              {danhSachLoc.length} tài khoản khớp lọc · trang {trang + 1}/{tongTrang}
            </div>
            <Pagination className="mb-0 flex-wrap">
              <Pagination.Prev
                disabled={trang <= 0}
                onClick={() => setTrang((p) => Math.max(0, p - 1))}
              />
              <Pagination.Item active className="user-select-none">
                {trang + 1} / {tongTrang}
              </Pagination.Item>
              <Pagination.Next
                disabled={trang >= tongTrang - 1}
                onClick={() =>
                  setTrang((p) => Math.min(tongTrang - 1, p + 1))
                }
              />
            </Pagination>
          </Card.Footer>
        ) : null}
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
                className="btn-modal-dismiss"
                disabled={dangKhoa}
                onClick={dongHopThoaiKhoa}
              >
                <i className="bi bi-x-lg me-2" aria-hidden />
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

      <Modal
        show={showCreate}
        size="xl"
        scrollable
        dialogClassName="nguoi-dung-modal-xl"
        onHide={() => {
          setShowCreate(false);
          setBenhNhanDaChon("");
          setBacSiDaChon("");
          setChonModal(null);
          setChonTimKiem("");
        }}
        centered
        enforceFocus={chonModal == null}
      >
        <Modal.Header closeButton>
          <Modal.Title>Thêm người dùng</Modal.Title>
        </Modal.Header>
        <Form noValidate onSubmit={handleCreate}>
          <Modal.Body>
            <Form.Group className="mb-2">
              <Form.Label className="required">Tên đăng nhập</Form.Label>
              <Form.Control
                placeholder="vd: bs.nguyen, le.thu"
                autoComplete="username"
                value={createForm.username}
                onChange={(e) =>
                  setCreateForm({ ...createForm, username: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label className="required">Mật khẩu</Form.Label>
              <Form.Control
                type="password"
                placeholder="Tối thiểu 6 ký tự"
                autoComplete="new-password"
                value={createForm.password}
                onChange={(e) =>
                  setCreateForm({ ...createForm, password: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-2">
              {createForm.role === "BENH_NHAN" ? (
                <>
                  <Form.Label className="required">Bệnh nhân</Form.Label>
                  <div className="d-flex flex-wrap gap-2 align-items-stretch">
                    <div className="flex-grow-1 min-w-0 px-3 py-2 small d-flex align-items-center nguoi-dung-gan-ho-so-preview">
                      <span className="text-truncate">
                        {nhanBenhNhanDaChon()
                          ? `${nhanBenhNhanDaChon()!.hoTen}${
                              nhanBenhNhanDaChon()!.soDienThoai
                                ? ` · ${nhanBenhNhanDaChon()!.soDienThoai}`
                                : ""
                            }`
                          : "Chưa chọn hồ sơ"}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="primary"
                      className="text-nowrap nguoi-dung-tim-chon-btn"
                      onClick={() => moChonBenhNhan("create")}
                    >
                      <i className="bi bi-search me-1" aria-hidden />
                      Tìm &amp; chọn
                    </Button>
                  </div>
                  <Form.Text className="text-muted small">
                    Mỗi tài khoản bệnh nhân gắn với đúng một hồ sơ. Chưa có hồ sơ thì{" "}
                    <Link
                      href="/benh-nhan"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="nguoi-dung-inline-ho-so-link"
                    >
                      sang trang Bệnh nhân
                    </Link>{" "}
                    tạo trước. Bấm «Tìm &amp; chọn» để mở danh sách (danh sách được làm mới mỗi lần mở).
                  </Form.Text>
                </>
              ) : createForm.role === "BAC_SI" ? (
                <>
                  <Form.Label className="required">Bác sĩ (chưa có tài khoản)</Form.Label>
                  <div className="d-flex flex-wrap gap-2 align-items-stretch">
                    <div className="flex-grow-1 min-w-0 px-3 py-2 small d-flex align-items-center nguoi-dung-gan-ho-so-preview">
                      <span className="text-truncate">
                        {nhanBacSiDaChon()
                          ? `${nhanBacSiDaChon()!.hoTen ?? "Bác sĩ"}${
                              nhanBacSiDaChon()!.tenChuyenKhoa ||
                              nhanBacSiDaChon()!.chuyenMon
                                ? ` · ${nhanBacSiDaChon()!.tenChuyenKhoa ?? nhanBacSiDaChon()!.chuyenMon}`
                                : ""
                            }`
                          : "Chưa chọn hồ sơ"}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="primary"
                      className="text-nowrap nguoi-dung-tim-chon-btn"
                      onClick={() => moChonBacSi("create")}
                    >
                      <i className="bi bi-search me-1" aria-hidden />
                      Tìm &amp; chọn
                    </Button>
                  </div>
                  <Form.Text className="text-muted small">
                    Chỉ hiện bác sĩ chưa có tài khoản đăng nhập. Cần người mới thì{" "}
                    <Link
                      href="/bac-si"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="nguoi-dung-inline-ho-so-link"
                    >
                      sang trang Bác sĩ
                    </Link>{" "}
                    tạo hồ sơ, rồi bấm «Tìm &amp; chọn» lại (danh sách làm mới mỗi lần mở).
                  </Form.Text>
                </>
              ) : (
                <>
                  <Form.Label>Họ tên</Form.Label>
                  <Form.Control
                    placeholder="Họ và tên đầy đủ"
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
                  if (role !== "BAC_SI") setBacSiDaChon("");
                  setChonModal(null);
                  setChonTimKiem("");
                }}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r] ?? r}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="clinic-modal-footer-actions">
            <Button
              type="button"
              className="btn-modal-dismiss"
              onClick={() => {
                setShowCreate(false);
                setBenhNhanDaChon("");
                setBacSiDaChon("");
                setChonModal(null);
                setChonTimKiem("");
              }}
            >
              <i className="bi bi-x-lg me-2" aria-hidden />
              Hủy
            </Button>
            <Button variant="primary" type="submit">
              <i className="bi bi-check2-circle me-2" aria-hidden />
              Lưu
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal
        show={showEdit}
        size="xl"
        scrollable
        dialogClassName="nguoi-dung-modal-xl"
        centered
        onHide={() => {
          setShowEdit(false);
          setEditingUser(null);
          setEditBenhNhanId("");
          setEditBacSiId("");
          setChonModal(null);
          setChonTimKiem("");
        }}
        enforceFocus={chonModal == null}
      >
        <Modal.Header closeButton>
          <Modal.Title>Sửa tài khoản</Modal.Title>
        </Modal.Header>
        <Form noValidate onSubmit={handleEdit}>
          <Modal.Body>
            <Form.Group className="mb-2">
              <Form.Label className="required">Họ tên</Form.Label>
              <Form.Control
                placeholder="Họ và tên đầy đủ"
                value={editForm.fullName}
                onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="email@example.com"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Số điện thoại</Form.Label>
              <Form.Control
                placeholder="0xxx xxx xxx"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label className="required">Vai trò</Form.Label>
              <Form.Select
                value={editForm.role}
                onChange={(e) => {
                  const role = e.target.value;
                  setEditForm({ ...editForm, role });
                  if (role !== "BENH_NHAN") setEditBenhNhanId("");
                  if (role !== "BAC_SI") setEditBacSiId("");
                  setChonModal(null);
                  setChonTimKiem("");
                }}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r] ?? r}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            {editForm.role === "BENH_NHAN" ? (
              <Form.Group className="mb-2">
                <Form.Label className="required">Gán với bệnh nhân</Form.Label>
                <div className="d-flex flex-wrap gap-2 align-items-stretch">
                  <div className="flex-grow-1 min-w-0 px-3 py-2 small d-flex align-items-center nguoi-dung-gan-ho-so-preview">
                    <span className="text-truncate">
                      {nhanBenhNhanSua()
                        ? `${nhanBenhNhanSua()!.hoTen}${
                            nhanBenhNhanSua()!.soDienThoai
                              ? ` · ${nhanBenhNhanSua()!.soDienThoai}`
                              : ""
                          }`
                        : "Chưa chọn hồ sơ"}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="primary"
                    className="text-nowrap nguoi-dung-tim-chon-btn"
                    onClick={() => moChonBenhNhan("edit")}
                  >
                    <i className="bi bi-search me-1" aria-hidden />
                    Tìm &amp; chọn
                  </Button>
                </div>
                <Form.Text className="text-muted small">
                  Chọn hồ sơ đúng với tài khoản. Đổi bằng «Tìm &amp; chọn». Thiếu hồ sơ:{" "}
                  <Link
                    href="/benh-nhan"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nguoi-dung-inline-ho-so-link"
                  >
                    Bệnh nhân
                  </Link>
                  .
                </Form.Text>
              </Form.Group>
            ) : null}
            {editForm.role === "BAC_SI" ? (
              <Form.Group className="mb-2">
                <Form.Label className="required">Gán với bác sĩ</Form.Label>
                <div className="d-flex flex-wrap gap-2 align-items-stretch">
                  <div className="flex-grow-1 min-w-0 px-3 py-2 small d-flex align-items-center nguoi-dung-gan-ho-so-preview">
                    <span className="text-truncate">
                      {nhanBacSiSua()
                        ? `${nhanBacSiSua()!.hoTen ?? "Bác sĩ"}${
                            nhanBacSiSua()!.tenChuyenKhoa ||
                            nhanBacSiSua()!.chuyenMon
                              ? ` · ${nhanBacSiSua()!.tenChuyenKhoa ?? nhanBacSiSua()!.chuyenMon}`
                              : ""
                          }`
                        : "Chưa chọn hồ sơ"}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="primary"
                    className="text-nowrap nguoi-dung-tim-chon-btn"
                    onClick={() => moChonBacSi("edit")}
                  >
                    <i className="bi bi-search me-1" aria-hidden />
                    Tìm &amp; chọn
                  </Button>
                </div>
                <Form.Text className="text-muted small">
                  Giữ bác sĩ hiện tại hoặc đổi sang người khác (chưa có tài khoản). Thêm hồ sơ:{" "}
                  <Link
                    href="/bac-si"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nguoi-dung-inline-ho-so-link"
                  >
                    Bác sĩ
                  </Link>
                  .
                </Form.Text>
              </Form.Group>
            ) : null}
          </Modal.Body>
          <Modal.Footer className="clinic-modal-footer-actions">
            <Button
              type="button"
              className="btn-modal-dismiss"
              onClick={() => {
                setShowEdit(false);
                setEditingUser(null);
                setEditBenhNhanId("");
                setEditBacSiId("");
                setChonModal(null);
                setChonTimKiem("");
              }}
            >
              <i className="bi bi-x-lg me-2" aria-hidden />
              Hủy
            </Button>
            <Button variant="primary" type="submit">
              <i className="bi bi-check2-circle me-2" aria-hidden />
              Lưu
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal
        show={chonModal != null}
        onHide={dongChonModal}
        size="lg"
        centered
        scrollable
        enforceFocus={false}
        dialogClassName="nguoi-dung-chon-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {chonModal === "create-bn" || chonModal === "edit-bn"
              ? "Chọn bệnh nhân"
              : chonModal === "create-bs" || chonModal === "edit-bs"
                ? "Chọn bác sĩ"
                : "Chọn"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-0">
          <p className="nguoi-dung-chon-modal__hint small mb-3">
            {chonModal === "create-bn" || chonModal === "edit-bn" ? (
              <>
                Gõ để lọc, bấm một dòng để chọn. Cần hồ sơ mới: nút xanh bên cạnh (mở tab mới) — lưu
                xong đóng tab và mở lại «Tìm &amp; chọn» trên form; danh sách ở đây đã được làm mới.
              </>
            ) : chonModal === "create-bs" || chonModal === "edit-bs" ? (
              <>
                Gõ để lọc, bấm một dòng để chọn. Thêm bác sĩ: nút xanh dương bên cạnh, lưu hồ sơ rồi
                mở lại «Tìm &amp; chọn» trên form.
              </>
            ) : null}
          </p>
          <div className="d-flex flex-wrap align-items-stretch mb-3 nguoi-dung-chon-modal__toolbar">
            <Form.Control
              type="search"
              className="flex-grow-1 min-w-0"
              placeholder={
                chonModal === "create-bn" || chonModal === "edit-bn"
                  ? "Tìm theo tên, SĐT, email, địa chỉ…"
                  : "Tìm theo tên, chuyên khoa…"
              }
              value={chonTimKiem}
              onChange={(e) => setChonTimKiem(e.target.value)}
              autoFocus
            />
            {chonModal === "create-bn" || chonModal === "edit-bn" ? (
              <Link
                href="/benh-nhan"
                target="_blank"
                rel="noopener noreferrer"
                className="nguoi-dung-them-ho-so-btn nguoi-dung-them-ho-so-btn--bn"
              >
                <i className="bi bi-person-plus-fill me-1" aria-hidden />
                Tạo hồ sơ bệnh nhân
              </Link>
            ) : chonModal === "create-bs" || chonModal === "edit-bs" ? (
              <Link
                href="/bac-si"
                target="_blank"
                rel="noopener noreferrer"
                className="nguoi-dung-them-ho-so-btn nguoi-dung-them-ho-so-btn--bs"
              >
                <i className="bi bi-person-badge me-1" aria-hidden />
                Tạo hồ sơ bác sĩ
              </Link>
            ) : null}
          </div>
          <div
            className="border rounded overflow-auto"
            style={{ maxHeight: "min(55vh, 520px)" }}
          >
            {chonModal === "create-bn" || chonModal === "edit-bn" ? (
              danhSachChonModal.length === 0 ? (
                <p className="text-muted small p-3 mb-0">Không có bản ghi phù hợp.</p>
              ) : (
                <Table hover responsive size="sm" className="mb-0 align-middle">
                  <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 1 }}>
                    <tr>
                      <th className="text-nowrap">#</th>
                      <th>Họ tên</th>
                      <th>SĐT</th>
                      <th>Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(danhSachChonModal as BenhNhan[]).map((bn) => (
                      <tr
                        key={bn.id ?? bn.hoTen}
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          if (bn.id != null) apChonBenhNhan(bn.id);
                        }}
                      >
                        <td className="text-muted">{bn.id}</td>
                        <td>{bn.hoTen}</td>
                        <td>{bn.soDienThoai ?? "—"}</td>
                        <td className="text-truncate" style={{ maxWidth: 220 }}>
                          {bn.thuDienTu ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )
            ) : chonModal === "create-bs" || chonModal === "edit-bs" ? (
              danhSachChonModal.length === 0 ? (
                <p className="text-muted small p-3 mb-0">Không có bản ghi phù hợp.</p>
              ) : (
                <Table hover responsive size="sm" className="mb-0 align-middle">
                  <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 1 }}>
                    <tr>
                      <th className="text-nowrap">#</th>
                      <th>Họ tên</th>
                      <th>Chuyên khoa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(danhSachChonModal as BacSi[]).map((bs) => (
                      <tr
                        key={bs.id}
                        style={{ cursor: "pointer" }}
                        onClick={() => apChonBacSi(bs.id)}
                      >
                        <td className="text-muted">{bs.id}</td>
                        <td>{bs.hoTen ?? "—"}</td>
                        <td className="text-truncate" style={{ maxWidth: 280 }}>
                          {bs.tenChuyenKhoa ?? bs.chuyenMon ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )
            ) : null}
          </div>
        </Modal.Body>
        <Modal.Footer className="clinic-modal-footer-actions">
          <Button type="button" className="btn-modal-dismiss" onClick={dongChonModal}>
            <i className="bi bi-x-lg me-2" aria-hidden />
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
