"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Button,
  Card,
  Dropdown,
  Form,
  Modal,
  Table,
} from "react-bootstrap";
import Link from "next/link";
import {
  api,
  bacSiApi,
  chuyenKhoaApi,
  nguoiDungApi,
  type BacSi,
  type ChuyenKhoa,
  type ThongTinNguoiDungDto,
} from "@/lib/api";
import { useAuth } from "@/lib/useAuth";

function formatCk(
  b: Pick<BacSi, "tenChuyenKhoa" | "chuyenMon">,
): string | undefined {
  return b.tenChuyenKhoa ?? b.chuyenMon;
}

export default function QuanLyBacSiPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [list, setList] = useState<BacSi[]>([]);
  const [chuyenKhoa, setChuyenKhoa] = useState<ChuyenKhoa[]>([]);
  const [nguoiDung, setNguoiDung] = useState<ThongTinNguoiDungDto[]>([]);
  const [error, setError] = useState("");

  const [showTaoMoi, setShowTaoMoi] = useState(false);
  const [showPopupTaiKhoan, setShowPopupTaiKhoan] = useState(false);
  const [tkTenDn, setTkTenDn] = useState("");
  const [tkMatKhau, setTkMatKhau] = useState("");
  const [taoHoTen, setTaoHoTen] = useState("");
  const [taoMaNguoiDung, setTaoMaNguoiDung] = useState("");
  const [taoLocCk, setTaoLocCk] = useState("");
  const [taoMaCk, setTaoMaCk] = useState("");
  const [taoBangCap, setTaoBangCap] = useState("");

  const [dangSua, setDangSua] = useState<BacSi | null>(null);
  const [maCkSua, setMaCkSua] = useState("");
  const [bangCapSua, setBangCapSua] = useState("");
  const [hoatDongSua, setHoatDongSua] = useState(true);

  const napDuLieu = useCallback(async () => {
    try {
      const [bs, ck, nd] = await Promise.all([
        bacSiApi.danhSachTatCa(),
        chuyenKhoaApi.danhSach(),
        nguoiDungApi.danhSach(),
      ]);
      setList(bs);
      setChuyenKhoa(ck);
      setNguoiDung(nd);
      setError("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Không tải được dữ liệu");
    }
  }, []);

  useEffect(() => {
    if (!loading && !user) router.replace("/dang-nhap");
    if (user && !user.cacVaiTro.includes("QUAN_TRI")) {
      router.replace("/bang-dieu-khien");
    }
  }, [loading, router, user]);

  useEffect(() => {
    if (!user?.cacVaiTro.includes("QUAN_TRI")) return;
    napDuLieu();
  }, [user, napDuLieu]);

  const maBsDaCo = useMemo(() => {
    const s = new Set<number>();
    list.forEach((b) => {
      if (b.maNguoiDung != null) s.add(b.maNguoiDung);
    });
    return s;
  }, [list]);

  const taiKhoanBsChuaGan = useMemo(() => {
    return nguoiDung.filter(
      (u) =>
        u.hoatDong && u.cacVaiTro.includes("BAC_SI") && !maBsDaCo.has(u.id),
    );
  }, [nguoiDung, maBsDaCo]);

  /** Dropdown: tài khoản chưa gắn hồ sơ + tài khoản vừa tạo (đã có hồ sơ rỗng từ backend) */
  const tuyChonTaiKhoan = useMemo(() => {
    const id = Number(taoMaNguoiDung);
    if (
      taoMaNguoiDung &&
      !Number.isNaN(id) &&
      !taiKhoanBsChuaGan.some((u) => u.id === id)
    ) {
      const them = nguoiDung.find((u) => u.id === id);
      if (them) return [...taiKhoanBsChuaGan, them];
    }
    return taiKhoanBsChuaGan;
  }, [taiKhoanBsChuaGan, taoMaNguoiDung, nguoiDung]);

  const chuyenKhoaSauLoc = useMemo(() => {
    const q = taoLocCk.trim().toLowerCase();
    if (!q) return chuyenKhoa;
    return chuyenKhoa.filter((c) => c.tenChuyenKhoa.toLowerCase().includes(q));
  }, [chuyenKhoa, taoLocCk]);

  const resetTaoMoi = () => {
    setTaoHoTen("");
    setTaoMaNguoiDung("");
    setTaoLocCk("");
    setTaoMaCk("");
    setTaoBangCap("");
  };

  const resetPopupTaiKhoan = () => {
    setTkTenDn("");
    setTkMatKhau("");
  };

  const moTaoMoi = () => {
    resetTaoMoi();
    setShowTaoMoi(true);
  };

  const dongTaoMoi = () => setShowTaoMoi(false);

  const moPopupTaiKhoan = () => {
    resetPopupTaiKhoan();
    setShowPopupTaiKhoan(true);
  };

  const dongPopupTaiKhoan = () => {
    setShowPopupTaiKhoan(false);
    resetPopupTaiKhoan();
  };

  const luuPopupTaiKhoan = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const u = tkTenDn.trim();
    const p = tkMatKhau;
    if (!u || !p) {
      setError("Vui lòng nhập tên đăng nhập và mật khẩu.");
      return;
    }
    if (p.length < 6) {
      setError("Mật khẩu tối thiểu 6 ký tự.");
      return;
    }
    try {
      const created = await api<ThongTinNguoiDungDto>("/nguoi-dung", {
        method: "POST",
        body: JSON.stringify({
          tenDangNhap: u,
          matKhau: p,
          hoTen: taoHoTen.trim() || undefined,
          cacVaiTro: ["BAC_SI"],
        }),
        notifySuccess: false,
      });
      await napDuLieu();
      setTaoMaNguoiDung(String(created.id));
      dongPopupTaiKhoan();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Không tạo được tài khoản");
    }
  };

  const luuTaoMoi = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const ht = taoHoTen.trim();
    if (!ht) {
      setError("Vui lòng nhập họ và tên.");
      return;
    }

    const idNd = Number(taoMaNguoiDung);
    if (!taoMaNguoiDung || Number.isNaN(idNd)) {
      setError("Vui lòng chọn tài khoản hoặc bấm « Tạo tài khoản ».");
      return;
    }
    const chon = nguoiDung.find((x) => x.id === idNd);
    if (!chon) {
      setError("Không tìm thấy tài khoản đã chọn.");
      return;
    }
    try {
      await api(`/nguoi-dung/${idNd}`, {
        method: "PUT",
        body: JSON.stringify({
          hoTen: ht,
          thuDienTu: chon.thuDienTu,
          soDienThoai: chon.soDienThoai,
          cacVaiTro: chon.cacVaiTro,
        }),
        notifySuccess: false,
      });
      const bsRow = list.find((b) => b.maNguoiDung === idNd);
      if (bsRow) {
        await bacSiApi.capNhat(bsRow.id, {
          maChuyenKhoa: taoMaCk ? Number(taoMaCk) : null,
          bangCap: taoBangCap.trim(),
          hoatDong: true,
        });
      } else {
        await bacSiApi.tao({
          maNguoiDung: idNd,
          maChuyenKhoa: taoMaCk ? Number(taoMaCk) : undefined,
          bangCap: taoBangCap.trim() || undefined,
        });
      }
      dongTaoMoi();
      await napDuLieu();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Không tạo được hồ sơ bác sĩ",
      );
    }
  };

  const moSua = (b: BacSi) => {
    setDangSua(b);
    setMaCkSua(b.maChuyenKhoa != null ? String(b.maChuyenKhoa) : "");
    setBangCapSua(b.bangCap ?? "");
    setHoatDongSua(Boolean(b.hoatDong));
  };

  const dongSua = () => setDangSua(null);

  const luuSua = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dangSua) return;
    setError("");
    try {
      await bacSiApi.capNhat(dangSua.id, {
        maChuyenKhoa: maCkSua ? Number(maCkSua) : null,
        bangCap: bangCapSua,
        hoatDong: hoatDongSua,
      });
      dongSua();
      await napDuLieu();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Không cập nhật được");
    }
  };

  if (!user?.cacVaiTro.includes("QUAN_TRI")) return null;

  return (
    <div className="bac-si-page">
      <div className="d-flex flex-column flex-md-row flex-wrap align-items-md-center justify-content-md-between gap-3 mb-4">
        <h2 className="mb-0">Quản lý bác sĩ</h2>
        <div className="bac-si-toolbar d-flex flex-wrap gap-2 align-items-center">
          <Button
            size="lg"
            variant="success"
            className="bac-si-toolbar-btn"
            onClick={moTaoMoi}
          >
            <i className="bi bi-person-plus-fill me-2" aria-hidden />
            Tạo bác sĩ mới
          </Button>
          <Link
            href="/chuyen-khoa"
            className="btn btn-lg btn-bacsi-chuyen-khoa bac-si-toolbar-btn"
          >
            <i className="bi bi-bookmarks me-2" aria-hidden />
            Chuyên khoa
          </Link>
          <Link
            href="/nguoi-dung"
            className="btn btn-lg btn-bacsi-tai-khoan bac-si-toolbar-btn"
          >
            <i className="bi bi-person-gear me-2" aria-hidden />
            Tài khoản
          </Link>
          <Link
            href="/lich-lam-viec-bac-si"
            className="btn btn-lg btn-bacsi-lich bac-si-toolbar-btn"
          >
            <i className="bi bi-calendar3 me-2" aria-hidden />
            Lịch làm việc
          </Link>
        </div>
      </div>

      {error ? <Alert variant="danger">{error}</Alert> : null}

      <Card>
        <Table responsive hover className="mb-0 align-middle">
          <thead>
            <tr>
              <th>Họ tên</th>
              <th>Tên đăng nhập</th>
              <th>Chuyên khoa</th>
              <th>Bằng cấp</th>
              <th className="text-center">Hoạt động</th>
              <th className="text-end">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {list.map((b) => (
              <tr key={b.id}>
                <td>{b.hoTen ?? "—"}</td>
                <td>
                  <code className="small">{b.tenDangNhap ?? "—"}</code>
                </td>
                <td>{formatCk(b) ?? "—"}</td>
                <td>{b.bangCap ?? "—"}</td>
                <td className="text-center">
                  {b.hoatDong ? (
                    <span className="text-success">
                      <i className="bi bi-check-circle-fill" aria-hidden /> Có
                    </span>
                  ) : (
                    <span className="text-muted">
                      <i className="bi bi-x-circle" aria-hidden /> Không
                    </span>
                  )}
                </td>
                <td className="text-end">
                  <Button
                    size="sm"
                    className="btn-action-edit"
                    onClick={() => moSua(b)}
                  >
                    <i className="bi bi-pencil-square me-1" aria-hidden />
                    Sửa
                  </Button>
                </td>
              </tr>
            ))}
            {list.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-muted py-4">
                  Chưa có hồ sơ bác sĩ nào.
                </td>
              </tr>
            ) : null}
          </tbody>
        </Table>
      </Card>

      <Modal
        show={showTaoMoi}
        onHide={dongTaoMoi}
        centered
        size="xl"
        dialogClassName="bac-si-modal-tao-moi"
        enforceFocus={!showPopupTaiKhoan}
      >
        <Form onSubmit={luuTaoMoi}>
          <Modal.Header closeButton>
            <Modal.Title>Tạo bác sĩ mới</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label className="required">Họ và tên</Form.Label>
              <Form.Control
                value={taoHoTen}
                onChange={(e) => setTaoHoTen(e.target.value)}
                placeholder="Nhập tên bác sĩ"
                autoComplete="name"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="required">Tài khoản</Form.Label>
              <div className="d-flex flex-wrap gap-2 align-items-stretch">
                <Form.Select
                  className="flex-grow-1"
                  style={{ minWidth: "12rem" }}
                  value={taoMaNguoiDung}
                  onChange={(e) => setTaoMaNguoiDung(e.target.value)}
                  required
                >
                  <option value="">— Chọn tài khoản —</option>
                  {tuyChonTaiKhoan.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.tenDangNhap}
                      {u.hoTen ? ` — ${u.hoTen}` : ""}
                    </option>
                  ))}
                </Form.Select>
                <Button
                  type="button"
                  variant="outline-primary"
                  className="text-nowrap"
                  onClick={moPopupTaiKhoan}
                >
                  <i className="bi bi-person-plus me-2" aria-hidden />
                  Tạo tài khoản
                </Button>
              </div>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label id="label-tao-chuyen-khoa">Chuyên khoa</Form.Label>
              <Dropdown className="bac-si-ck-dropdown w-100">
                <Dropdown.Toggle
                  variant="outline-secondary"
                  id="dropdown-tao-chuyen-khoa"
                  className="w-100 text-start d-flex justify-content-between align-items-center"
                  aria-labelledby="label-tao-chuyen-khoa"
                >
                  <span className="text-truncate me-2 flex-grow-1">
                    {taoMaCk
                      ? (chuyenKhoa.find((c) => String(c.id) === taoMaCk)
                          ?.tenChuyenKhoa ?? "Đã chọn")
                      : "— Chọn chuyên khoa —"}
                  </span>
                </Dropdown.Toggle>
                <Dropdown.Menu className="bac-si-ck-dropdown__menu w-100 shadow-sm pt-2 px-2 pb-2">
                  <Form.Control
                    size="sm"
                    type="search"
                    placeholder="Tìm trong danh sách…"
                    value={taoLocCk}
                    onChange={(e) => setTaoLocCk(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                    autoComplete="off"
                    aria-label="Lọc chuyên khoa"
                    className="mb-2"
                  />
                  <div
                    className="bac-si-ck-dropdown__list border rounded"
                    style={{ maxHeight: 220, overflowY: "auto" }}
                  >
                    <Dropdown.Item
                      className="text-muted"
                      onClick={() => {
                        setTaoMaCk("");
                        setTaoLocCk("");
                      }}
                    >
                      — Không chọn —
                    </Dropdown.Item>
                    {chuyenKhoaSauLoc.map((ck) => (
                      <Dropdown.Item
                        key={ck.id}
                        active={String(ck.id) === taoMaCk}
                        onClick={() => {
                          setTaoMaCk(String(ck.id));
                          setTaoLocCk("");
                        }}
                      >
                        {ck.tenChuyenKhoa}
                      </Dropdown.Item>
                    ))}
                  </div>
                  {taoLocCk.trim() && chuyenKhoaSauLoc.length === 0 ? (
                    <div className="small text-muted px-1 pt-2">
                      Không có chuyên khoa khớp.
                    </div>
                  ) : null}
                </Dropdown.Menu>
              </Dropdown>
            </Form.Group>
            <Form.Group className="mb-0">
              <Form.Label>Bằng cấp</Form.Label>
              <Form.Control
                value={taoBangCap}
                onChange={(e) => setTaoBangCap(e.target.value)}
                placeholder="Ví dụ: Bác sĩ đa khoa"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="clinic-modal-footer bac-si-modal-footer">
            <Button
              variant="secondary"
              type="button"
              className="btn-bac-si-modal-cancel"
              onClick={dongTaoMoi}
            >
              <i className="bi bi-x-circle me-2" aria-hidden />
              Hủy
            </Button>
            <Button
              variant="primary"
              type="submit"
              className="btn-bac-si-modal-primary px-4"
            >
              <i className="bi bi-check-circle me-2" aria-hidden />
              Tạo bác sĩ
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal
        show={showPopupTaiKhoan}
        onHide={dongPopupTaiKhoan}
        centered
        enforceFocus={false}
      >
        <Form onSubmit={luuPopupTaiKhoan}>
          <Modal.Header closeButton>
            <Modal.Title>Tạo tài khoản</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label className="required">Tên đăng nhập</Form.Label>
              <Form.Control
                value={tkTenDn}
                onChange={(e) => setTkTenDn(e.target.value)}
                placeholder="Tên đăng nhập"
                autoComplete="username"
                required
              />
            </Form.Group>
            <Form.Group className="mb-0">
              <Form.Label className="required">Mật khẩu</Form.Label>
              <Form.Control
                type="password"
                value={tkMatKhau}
                onChange={(e) => setTkMatKhau(e.target.value)}
                placeholder="Tối thiểu 6 ký tự"
                autoComplete="new-password"
                minLength={6}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="clinic-modal-footer bac-si-modal-footer">
            <Button
              variant="secondary"
              type="button"
              className="btn-bac-si-modal-cancel"
              onClick={dongPopupTaiKhoan}
            >
              <i className="bi bi-x-circle me-2" aria-hidden />
              Hủy
            </Button>
            <Button
              variant="primary"
              type="submit"
              className="btn-bac-si-modal-primary px-4"
            >
              <i className="bi bi-check-circle me-2" aria-hidden />
              Lưu tài khoản
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={Boolean(dangSua)} onHide={dongSua} centered>
        <Form onSubmit={luuSua}>
          <Modal.Header closeButton>
            <Modal.Title>
              Sửa hồ sơ — {dangSua?.hoTen ?? dangSua?.tenDangNhap}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Chuyên khoa</Form.Label>
              <Form.Select
                value={maCkSua}
                onChange={(e) => setMaCkSua(e.target.value)}
              >
                <option value="">— Không chọn —</option>
                {chuyenKhoa.map((ck) => (
                  <option key={ck.id} value={ck.id}>
                    {ck.tenChuyenKhoa}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Bằng cấp</Form.Label>
              <Form.Control
                value={bangCapSua}
                onChange={(e) => setBangCapSua(e.target.value)}
              />
            </Form.Group>
            <Form.Check
              type="switch"
              id="bs-hoat-dong"
              label="Đang hoạt động (hiển thị khi đặt lịch)"
              checked={hoatDongSua}
              onChange={(e) => setHoatDongSua(e.target.checked)}
            />
          </Modal.Body>
          <Modal.Footer className="clinic-modal-footer bac-si-modal-footer">
            <Button
              variant="secondary"
              type="button"
              className="btn-bac-si-modal-cancel"
              onClick={dongSua}
            >
              <i className="bi bi-x-circle me-2" aria-hidden />
              Hủy
            </Button>
            <Button
              variant="primary"
              type="submit"
              className="btn-bac-si-modal-primary px-4"
            >
              <i className="bi bi-check-circle me-2" aria-hidden />
              Lưu
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
