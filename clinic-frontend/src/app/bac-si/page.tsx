"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Alert,
  Button,
  Card,
  Dropdown,
  Form,
  Modal,
  Row,
  Col,
  Pagination,
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
import { notify } from "@/lib/notify";
import { catTrang, tongSoTrangClient } from "@/lib/phanTrangClient";
import DOMPurify from "dompurify";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const RICH_TEXT_MODULES = {
  toolbar: [
    [{ header: [2, 3, false] }],
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "blockquote"],
    ["clean"],
  ],
};

const RICH_TEXT_FORMATS = [
  "header",
  "bold",
  "italic",
  "underline",
  "list",
  "bullet",
  "link",
  "blockquote",
];

function formatCk(
  b: Pick<BacSi, "tenChuyenKhoa" | "chuyenMon">,
): string | undefined {
  return b.tenChuyenKhoa ?? b.chuyenMon;
}

function sanitizeDoctorHtml(input?: string): string {
  if (!input) return "";
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "b",
      "strong",
      "i",
      "em",
      "u",
      "ul",
      "ol",
      "li",
      "a",
      "blockquote",
      "h2",
      "h3",
    ],
    ALLOWED_ATTR: ["href", "target", "rel"],
  }).trim();
}

function htmlToPlainPreview(input?: string): string {
  if (!input) return "";
  const safeHtml = sanitizeDoctorHtml(input);
  return safeHtml
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function RichTextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="bg-white border rounded">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        modules={RICH_TEXT_MODULES}
        formats={RICH_TEXT_FORMATS}
      />
    </div>
  );
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
  const [taoGioiThieu, setTaoGioiThieu] = useState("");
  const [taoQuaTrinhCongTac, setTaoQuaTrinhCongTac] = useState("");
  const [taoThanhTichDatDuoc, setTaoThanhTichDatDuoc] = useState("");

  const [dangSua, setDangSua] = useState<BacSi | null>(null);
  const [xemChiTietNoiDung, setXemChiTietNoiDung] = useState<BacSi | null>(null);
  const [maCkSua, setMaCkSua] = useState("");
  const [bangCapSua, setBangCapSua] = useState("");
  const [hoTenSua, setHoTenSua] = useState("");
  const [gioiThieuSua, setGioiThieuSua] = useState("");
  const [quaTrinhCongTacSua, setQuaTrinhCongTacSua] = useState("");
  const [thanhTichDatDuocSua, setThanhTichDatDuocSua] = useState("");
  const [hoatDongSua, setHoatDongSua] = useState(true);
  const [trang, setTrang] = useState(0);
  const [kichThuocTrang, setKichThuocTrang] = useState(10);

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

  const tongTrangBs = tongSoTrangClient(list.length, kichThuocTrang);
  const dongTrangBs = useMemo(
    () => catTrang(list, trang, kichThuocTrang),
    [list, trang, kichThuocTrang],
  );

  useEffect(() => {
    setTrang(0);
  }, [list.length, kichThuocTrang]);

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
    setTaoGioiThieu("");
    setTaoQuaTrinhCongTac("");
    setTaoThanhTichDatDuoc("");
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
    const coTaiKhoan = Boolean(taoMaNguoiDung) && !Number.isNaN(idNd);

    if (!coTaiKhoan) {
      try {
        await bacSiApi.tao({
          hoTen: ht,
          maChuyenKhoa: taoMaCk ? Number(taoMaCk) : undefined,
          bangCap: taoBangCap.trim() || undefined,
          gioiThieu: taoGioiThieu.trim() || undefined,
          quaTrinhCongTac: taoQuaTrinhCongTac.trim() || undefined,
          thanhTichDatDuoc: taoThanhTichDatDuoc.trim() || undefined,
        });
        dongTaoMoi();
        await napDuLieu();
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Không tạo được hồ sơ bác sĩ",
        );
      }
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
          gioiThieu: taoGioiThieu.trim() || undefined,
          quaTrinhCongTac: taoQuaTrinhCongTac.trim() || undefined,
          thanhTichDatDuoc: taoThanhTichDatDuoc.trim() || undefined,
        });
      } else {
        await bacSiApi.tao({
          maNguoiDung: idNd,
          maChuyenKhoa: taoMaCk ? Number(taoMaCk) : undefined,
          bangCap: taoBangCap.trim() || undefined,
          gioiThieu: taoGioiThieu.trim() || undefined,
          quaTrinhCongTac: taoQuaTrinhCongTac.trim() || undefined,
          thanhTichDatDuoc: taoThanhTichDatDuoc.trim() || undefined,
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
    setHoTenSua(b.hoTen ?? "");
    setGioiThieuSua(b.gioiThieu ?? "");
    setQuaTrinhCongTacSua(b.quaTrinhCongTac ?? "");
    setThanhTichDatDuocSua(b.thanhTichDatDuoc ?? "");
    setHoatDongSua(Boolean(b.hoatDong));
  };

  const dongSua = () => setDangSua(null);

  const luuSua = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dangSua) return;
    setError("");
    if (dangSua.maNguoiDung == null && !hoTenSua.trim()) {
      setError("Vui lòng nhập họ tên cho hồ sơ không gắn tài khoản.");
      return;
    }
    try {
      await bacSiApi.capNhat(dangSua.id, {
        maChuyenKhoa: maCkSua ? Number(maCkSua) : null,
        bangCap: bangCapSua,
        hoatDong: hoatDongSua,
        gioiThieu: gioiThieuSua.trim() || undefined,
        quaTrinhCongTac: quaTrinhCongTacSua.trim() || undefined,
        thanhTichDatDuoc: thanhTichDatDuocSua.trim() || undefined,
        ...(dangSua.maNguoiDung == null ? { hoTen: hoTenSua.trim() } : {}),
      });
      dongSua();
      await napDuLieu();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Không cập nhật được");
    }
  };

  const handleExportCsv = () => {
    if (list.length === 0) {
      notify.warning("Chưa có dữ liệu để xuất CSV");
      return;
    }
    const csvEscape = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const header = [
      "MaBacSi",
      "HoTen",
      "TenDangNhap",
      "ChuyenKhoa",
      "BangCap",
      "GioiThieu",
      "QuaTrinhCongTac",
      "ThanhTichDatDuoc",
      "HoatDong",
    ];
    const rows = list.map((b) => [
      String(b.id),
      csvEscape(b.hoTen ?? ""),
      csvEscape(b.tenDangNhap ?? ""),
      csvEscape(formatCk(b) ?? ""),
      csvEscape(b.bangCap ?? ""),
      csvEscape(b.gioiThieu ?? ""),
      csvEscape(b.quaTrinhCongTac ?? ""),
      csvEscape(b.thanhTichDatDuoc ?? ""),
      csvEscape(b.hoatDong ? "Có" : "Không"),
    ]);
    const content = [header.join(","), ...rows.map((row) => row.join(","))].join(
      "\n",
    );
    const bom = "\uFEFF";
    const blob = new Blob([bom + content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    const now = new Date();
    const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;
    anchor.href = url;
    anchor.download = `bac-si-${stamp}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  if (!user?.cacVaiTro.includes("QUAN_TRI")) return null;

  return (
    <div className="bac-si-page">
      <div className="d-flex flex-column flex-md-row flex-wrap align-items-md-center justify-content-md-between gap-3 mb-4">
        <h2 className="mb-0">Quản lý bác sĩ</h2>
        <div className="bac-si-toolbar d-flex flex-wrap gap-2 align-items-center">
          <Button
            size="lg"
            className="bac-si-toolbar-btn btn-service-export"
            onClick={handleExportCsv}
          >
            <i className="bi bi-filetype-csv me-2" aria-hidden />
            Export CSV
          </Button>
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
        <Card.Header className="d-flex flex-wrap align-items-center justify-content-between gap-2 py-2">
          <span className="small text-muted mb-0">
            {list.length} bác sĩ · trang {trang + 1}/{tongTrangBs}
          </span>
          <Form.Select
            size="sm"
            style={{ maxWidth: "8rem" }}
            value={kichThuocTrang}
            onChange={(e) =>
              setKichThuocTrang(Number(e.target.value) || 10)
            }
          >
            <option value={5}>5 / trang</option>
            <option value={10}>10 / trang</option>
            <option value={20}>20 / trang</option>
            <option value={50}>50 / trang</option>
          </Form.Select>
        </Card.Header>
        <Table responsive hover className="mb-0 align-middle">
          <thead>
            <tr>
              <th>Họ tên</th>
              <th>Tên đăng nhập</th>
              <th>Chuyên khoa</th>
              <th>Bằng cấp</th>
              <th>Giới thiệu</th>
              <th>Quá trình công tác</th>
              <th>Thành tích đạt được</th>
              <th className="text-center">Hoạt động</th>
              <th className="text-end">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {dongTrangBs.map((b) => (
              <tr key={b.id}>
                <td>{b.hoTen ?? "—"}</td>
                <td>
                  <code className="small">{b.tenDangNhap ?? "—"}</code>
                </td>
                <td>{formatCk(b) ?? "—"}</td>
                <td>{b.bangCap ?? "—"}</td>
                <td className="text-muted small" style={{ maxWidth: "16rem" }}>
                  {b.gioiThieu ? (
                    <div
                      role="button"
                      className="bac-si-rich-preview bac-si-rich-preview--clickable"
                      title={htmlToPlainPreview(b.gioiThieu)}
                      onClick={() => setXemChiTietNoiDung(b)}
                    >
                      {htmlToPlainPreview(b.gioiThieu)}
                    </div>
                  ) : "—"}
                </td>
                <td className="text-muted small" style={{ maxWidth: "16rem" }}>
                  {b.quaTrinhCongTac ? (
                    <div
                      role="button"
                      className="bac-si-rich-preview bac-si-rich-preview--clickable"
                      title={htmlToPlainPreview(b.quaTrinhCongTac)}
                      onClick={() => setXemChiTietNoiDung(b)}
                    >
                      {htmlToPlainPreview(b.quaTrinhCongTac)}
                    </div>
                  ) : "—"}
                </td>
                <td className="text-muted small" style={{ maxWidth: "16rem" }}>
                  {b.thanhTichDatDuoc ? (
                    <div
                      role="button"
                      className="bac-si-rich-preview bac-si-rich-preview--clickable"
                      title={htmlToPlainPreview(b.thanhTichDatDuoc)}
                      onClick={() => setXemChiTietNoiDung(b)}
                    >
                      {htmlToPlainPreview(b.thanhTichDatDuoc)}
                    </div>
                  ) : "—"}
                </td>
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
                <td colSpan={9} className="text-center text-muted py-4">
                  Chưa có hồ sơ bác sĩ nào.
                </td>
              </tr>
            ) : null}
          </tbody>
        </Table>
        {list.length > 0 ? (
          <Card.Footer className="d-flex flex-wrap justify-content-end py-2">
            <Pagination className="mb-0 flex-wrap">
              <Pagination.Prev
                disabled={trang <= 0}
                onClick={() => setTrang((p) => Math.max(0, p - 1))}
              />
              <Pagination.Item active className="user-select-none">
                {trang + 1} / {tongTrangBs}
              </Pagination.Item>
              <Pagination.Next
                disabled={trang >= tongTrangBs - 1}
                onClick={() =>
                  setTrang((p) => Math.min(tongTrangBs - 1, p + 1))
                }
              />
            </Pagination>
          </Card.Footer>
        ) : null}
      </Card>

      <Modal
        show={Boolean(xemChiTietNoiDung)}
        onHide={() => setXemChiTietNoiDung(null)}
        centered
        size="xl"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Nội dung hồ sơ — {xemChiTietNoiDung?.hoTen ?? xemChiTietNoiDung?.tenDangNhap}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col md={4}>
              <Card className="h-100">
                <Card.Header className="fw-semibold">Giới thiệu</Card.Header>
                <Card.Body>
                  {xemChiTietNoiDung?.gioiThieu ? (
                    <div
                      className="bac-si-rich-full"
                      dangerouslySetInnerHTML={{
                        __html: sanitizeDoctorHtml(xemChiTietNoiDung.gioiThieu),
                      }}
                    />
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100">
                <Card.Header className="fw-semibold">Quá trình công tác</Card.Header>
                <Card.Body>
                  {xemChiTietNoiDung?.quaTrinhCongTac ? (
                    <div
                      className="bac-si-rich-full"
                      dangerouslySetInnerHTML={{
                        __html: sanitizeDoctorHtml(xemChiTietNoiDung.quaTrinhCongTac),
                      }}
                    />
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100">
                <Card.Header className="fw-semibold">Thành tích đạt được</Card.Header>
                <Card.Body>
                  {xemChiTietNoiDung?.thanhTichDatDuoc ? (
                    <div
                      className="bac-si-rich-full"
                      dangerouslySetInnerHTML={{
                        __html: sanitizeDoctorHtml(xemChiTietNoiDung.thanhTichDatDuoc),
                      }}
                    />
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer className="clinic-modal-footer-actions">
          <Button
            type="button"
            className="btn-modal-dismiss"
            onClick={() => setXemChiTietNoiDung(null)}
          >
            <i className="bi bi-x-lg me-2" aria-hidden />
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showTaoMoi}
        onHide={dongTaoMoi}
        centered
        size="xl"
        dialogClassName="bac-si-modal-tao-moi"
        enforceFocus={!showPopupTaiKhoan}
      >
        <Form noValidate onSubmit={luuTaoMoi}>
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
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Tài khoản</Form.Label>
              <div className="d-flex flex-wrap gap-2 align-items-stretch">
                <Form.Select
                  className="flex-grow-1"
                  style={{ minWidth: "12rem" }}
                  value={taoMaNguoiDung}
                  onChange={(e) => setTaoMaNguoiDung(e.target.value)}
                >
                  <option value="">
                    — Không chọn (chỉ hồ sơ, không đăng nhập) —
                  </option>
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
            <Row className="g-3 mt-1">
              <Col lg={4}>
                <Form.Group>
                  <Form.Label>Giới thiệu</Form.Label>
                  <RichTextInput
                    value={taoGioiThieu}
                    onChange={setTaoGioiThieu}
                    placeholder="Nhập giới thiệu bác sĩ..."
                  />
                </Form.Group>
              </Col>
              <Col lg={4}>
                <Form.Group>
                  <Form.Label>Quá trình công tác</Form.Label>
                  <RichTextInput
                    value={taoQuaTrinhCongTac}
                    onChange={setTaoQuaTrinhCongTac}
                    placeholder="Nhập quá trình công tác..."
                  />
                </Form.Group>
              </Col>
              <Col lg={4}>
                <Form.Group>
                  <Form.Label>Thành tích đạt được</Form.Label>
                  <RichTextInput
                    value={taoThanhTichDatDuoc}
                    onChange={setTaoThanhTichDatDuoc}
                    placeholder="Nhập thành tích đạt được..."
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="clinic-modal-footer bac-si-modal-footer clinic-modal-footer-actions">
            <Button
              type="button"
              className="btn-modal-dismiss"
              onClick={dongTaoMoi}
            >
              <i className="bi bi-x-lg me-2" aria-hidden />
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
        <Form noValidate onSubmit={luuPopupTaiKhoan}>
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
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="clinic-modal-footer bac-si-modal-footer clinic-modal-footer-actions">
            <Button
              type="button"
              className="btn-modal-dismiss"
              onClick={dongPopupTaiKhoan}
            >
              <i className="bi bi-x-lg me-2" aria-hidden />
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

      <Modal
        show={Boolean(dangSua)}
        onHide={dongSua}
        centered
        size="xl"
        dialogClassName="bac-si-modal-tao-moi"
      >
        <Form noValidate onSubmit={luuSua}>
          <Modal.Header closeButton>
            <Modal.Title>
              Sửa hồ sơ — {dangSua?.hoTen ?? dangSua?.tenDangNhap}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {dangSua != null && dangSua.maNguoiDung == null ? (
              <Form.Group className="mb-3">
                <Form.Label className="required">Họ và tên</Form.Label>
                <Form.Control
                  value={hoTenSua}
                  onChange={(e) => setHoTenSua(e.target.value)}
                  placeholder="Tên hiển thị (hồ sơ chưa gắn tài khoản)"
                />
              </Form.Group>
            ) : null}
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
                placeholder="Ví dụ: Bác sĩ đa khoa"
                value={bangCapSua}
                onChange={(e) => setBangCapSua(e.target.value)}
              />
            </Form.Group>
            <Row className="g-3">
              <Col lg={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Giới thiệu</Form.Label>
                  <RichTextInput
                    value={gioiThieuSua}
                    onChange={setGioiThieuSua}
                    placeholder="Nhập giới thiệu bác sĩ..."
                  />
                </Form.Group>
              </Col>
              <Col lg={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Quá trình công tác</Form.Label>
                  <RichTextInput
                    value={quaTrinhCongTacSua}
                    onChange={setQuaTrinhCongTacSua}
                    placeholder="Nhập quá trình công tác..."
                  />
                </Form.Group>
              </Col>
              <Col lg={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Thành tích đạt được</Form.Label>
                  <RichTextInput
                    value={thanhTichDatDuocSua}
                    onChange={setThanhTichDatDuocSua}
                    placeholder="Nhập thành tích đạt được..."
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Check
              type="switch"
              id="bs-hoat-dong"
              label="Đang hoạt động (hiển thị khi đặt lịch)"
              checked={hoatDongSua}
              onChange={(e) => setHoatDongSua(e.target.checked)}
            />
          </Modal.Body>
          <Modal.Footer className="clinic-modal-footer bac-si-modal-footer clinic-modal-footer-actions">
            <Button
              type="button"
              className="btn-modal-dismiss"
              onClick={dongSua}
            >
              <i className="bi bi-x-lg me-2" aria-hidden />
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
