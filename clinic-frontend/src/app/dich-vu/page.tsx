"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Table, Button, Card, Alert, Modal, Form, Badge, Pagination } from "react-bootstrap";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import {
  serviceTypesApi,
  servicesApi,
  type DichVu,
  type LoaiDichVu,
} from "@/lib/api";
import { formatVndInput, parseVndInput } from "@/lib/moneyVnd";
import { notify } from "@/lib/notify";
import {
  validateDichVuForm,
  coLoiDichVuForm,
  type DichVuFormErrors,
} from "@/lib/validateDichVuForm";
import { catTrang, tongSoTrangClient } from "@/lib/phanTrangClient";

function tomTatLoiSuaDichVu(loi: DichVuFormErrors): string {
  return [loi.maLoaiDichVu, loi.ten, loi.gia].filter(Boolean).join(" · ");
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
  const [themDichVuLoi, setThemDichVuLoi] = useState<DichVuFormErrors>({});
  const [suaDichVuLoi, setSuaDichVuLoi] = useState<DichVuFormErrors>({});
  const [trang, setTrang] = useState(0);
  const [kichThuocTrang, setKichThuocTrang] = useState(15);

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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const maLoai = new URLSearchParams(window.location.search).get("maLoai");
    if (maLoai != null && maLoai !== "") setBoLocLoaiDichVu(maLoai);
  }, []);

  const moModal = (loai: "them-dich-vu" | "loai-dich-vu", title: string) => {
    setModalLoai(loai);
    setModalTitle(title);
    setModalError("");
    setTenLoaiDichVuError("");
    setThemDichVuLoi({});
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

  const tongTrangDichVu = tongSoTrangClient(
    danhSachDichVuLoc.length,
    kichThuocTrang,
  );
  const dongTrangDichVu = useMemo(
    () => catTrang(danhSachDichVuLoc, trang, kichThuocTrang),
    [danhSachDichVuLoc, trang, kichThuocTrang],
  );

  useEffect(() => {
    setTrang(0);
  }, [boLocLoaiDichVu, tuKhoaTenDichVu, kichThuocTrang]);

  const dichVuCanXoa = list.find((item) => item.id === xoaId);

  const handleThemDichVu = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");
    const loi = validateDichVuForm(form, list);
    setThemDichVuLoi(loi);
    if (coLoiDichVuForm(loi)) return;
    try {
      await servicesApi.create({
        ...form,
        ten: form.ten?.trim(),
        moTa: form.moTa?.trim() || "",
      });
      setThemDichVuLoi({});
      setHienModal(false);
      setForm({
        maLoaiDichVu: loaiDichVu.length > 0 ? loaiDichVu[0].id : undefined,
        ten: "",
        moTa: "",
        gia: 0,
        hoatDong: true,
      });
      await napDuLieu();
    } catch (err: unknown) {
      setModalError(err instanceof Error ? err.message : "Không thêm được dịch vụ");
    }
  };

  const handleExportCsv = () => {
    if (list.length === 0) {
      notify.warning("Chưa có dữ liệu để xuất CSV");
      return;
    }

    const quote = (v: string | number) => {
      const s = String(v);
      if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };
    const line = (cells: (string | number)[]) => cells.map(quote).join(",");

    const now = new Date();
    const ngayXuat = now.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const sorted = [...list].sort((a, b) => {
      const loaiA = a.tenLoaiDichVu?.trim() || "Chưa phân loại";
      const loaiB = b.tenLoaiDichVu?.trim() || "Chưa phân loại";
      const x = loaiA.localeCompare(loaiB, "vi");
      if (x !== 0) return x;
      return (a.ten || "").localeCompare(b.ten || "", "vi");
    });
    const soDangApDung = sorted.filter((x) => x.hoatDong !== false).length;
    const soNgung = sorted.length - soDangApDung;

    const header = line([
      "STT",
      "Mã dịch vụ",
      "Loại dịch vụ",
      "Tên dịch vụ",
      "Mô tả",
      "Đơn giá (VNĐ)",
      "Trạng thái",
    ]);
    const dataRows = sorted.map((item, i) =>
      line([
        i + 1,
        item.id,
        item.tenLoaiDichVu || "Chưa phân loại",
        item.ten || "",
        item.moTa || "",
        item.gia ?? 0,
        item.hoatDong !== false ? "Đang áp dụng" : "Ngưng",
      ]),
    );
    const content = [
      line(["Báo cáo", "Danh sách dịch vụ & bảng giá – Phòng khám"]),
      line(["Ngày xuất", ngayXuat]),
      line(["Tổng số dịch vụ", sorted.length]),
      line(["Đang áp dụng", soDangApDung]),
      line(["Ngưng áp dụng", soNgung]),
      "",
      header,
      ...dataRows,
    ].join("\n");

    const bom = "\uFEFF";
    const blob = new Blob([bom + content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;
    anchor.href = url;
    anchor.download = `danh-sach-dich-vu-${stamp}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const batDauSua = (item: DichVu) => {
    setDangSuaId(item.id);
    setSuaDichVuLoi({});
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
    setSuaDichVuLoi({});
  };

  const luuSua = async (id: number) => {
    const loi = validateDichVuForm(formSua, list, { excludeId: id });
    if (coLoiDichVuForm(loi)) {
      setSuaDichVuLoi(loi);
      setError("");
      return;
    }
    setSuaDichVuLoi({});
    setError("");
    try {
      await servicesApi.update(id, {
        maLoaiDichVu: formSua.maLoaiDichVu,
        ten: (formSua.ten ?? "").trim(),
        moTa: formSua.moTa || "",
        gia: formSua.gia,
        hoatDong: formSua.hoatDong !== false,
      });
      huySua();
      await napDuLieu();
    } catch (e: unknown) {
      setSuaDichVuLoi({});
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
                aria-label="Lọc theo loại dịch vụ"
                title="Chọn loại để lọc danh sách"
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
            <Form.Group style={{ minWidth: "7rem" }}>
              <Form.Select
                aria-label="Số dòng mỗi trang"
                value={kichThuocTrang}
                onChange={(e) =>
                  setKichThuocTrang(Number(e.target.value) || 15)
                }
              >
                <option value={10}>10 / trang</option>
                <option value={15}>15 / trang</option>
                <option value={25}>25 / trang</option>
                <option value={50}>50 / trang</option>
              </Form.Select>
            </Form.Group>
            <Button
              variant="outline-secondary"
              className="btn-clinic-clear-filter align-self-center"
              onClick={() => {
                setBoLocLoaiDichVu("");
                setTuKhoaTenDichVu("");
                setTrang(0);
              }}
            >
              <i className="bi bi-arrow-counterclockwise" aria-hidden />
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
            {dongTrangDichVu.map((s) => (
              <Fragment key={s.id}>
                <tr>
                <td>
                  {dangSuaId === s.id ? (
                    <Form.Select
                      size="sm"
                      aria-label="Chọn loại dịch vụ"
                      title="Chọn loại dịch vụ"
                      value={formSua.maLoaiDichVu ?? ""}
                      onChange={(e) => {
                        const maLoaiDichVu = Number(e.target.value) || undefined;
                        setFormSua({
                          ...formSua,
                          maLoaiDichVu,
                        });
                        setSuaDichVuLoi((x) => {
                          const n = { ...x };
                          delete n.maLoaiDichVu;
                          delete n.ten;
                          return n;
                        });
                      }}
                      isInvalid={Boolean(suaDichVuLoi.maLoaiDichVu)}
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
                      placeholder="Tên dịch vụ"
                      value={formSua.ten || ""}
                      onChange={(e) => {
                        setFormSua({ ...formSua, ten: e.target.value });
                        setSuaDichVuLoi((x) => {
                          const n = { ...x };
                          delete n.ten;
                          return n;
                        });
                      }}
                      isInvalid={Boolean(suaDichVuLoi.ten)}
                    />
                  ) : (
                    s.ten
                  )}
                </td>
                <td>
                  {dangSuaId === s.id ? (
                    <Form.Control
                      size="sm"
                      placeholder="Mô tả (tuỳ chọn)"
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
                      placeholder="Ví dụ: 150.000"
                      value={formatVndInput(formSua.gia)}
                      onChange={(e) => {
                        setFormSua({
                          ...formSua,
                          gia: parseVndInput(e.target.value),
                        });
                        setSuaDichVuLoi((x) => {
                          const n = { ...x };
                          delete n.gia;
                          return n;
                        });
                      }}
                      isInvalid={Boolean(suaDichVuLoi.gia)}
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
                  ) : (
                    <Badge
                      bg={s.hoatDong !== false ? "success" : "secondary"}
                      pill
                      className="fw-normal text-white align-middle"
                      aria-label={
                        s.hoatDong !== false
                          ? "Trạng thái: đang áp dụng"
                          : "Trạng thái: ngừng"
                      }
                    >
                      <i
                        className={
                          s.hoatDong !== false
                            ? "bi bi-check-circle-fill me-1"
                            : "bi bi-pause-circle-fill me-1"
                        }
                        aria-hidden
                      />
                      {s.hoatDong !== false ? "Đang áp dụng" : "Ngừng"}
                    </Badge>
                  )}
                </td>
                <td>
                  {dangSuaId === s.id ? (
                    <>
                      <Button
                        type="button"
                        size="sm"
                        variant="primary"
                        className="me-2"
                        onClick={() => luuSua(s.id)}
                      >
                        <i className="bi bi-check2 me-1" aria-hidden />
                        Lưu
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        className="btn-modal-dismiss"
                        onClick={huySua}
                      >
                        <i className="bi bi-x-lg me-1" aria-hidden />
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
              {dangSuaId === s.id && coLoiDichVuForm(suaDichVuLoi) ? (
                <tr className="service-edit-error-strip" aria-live="polite">
                  <td colSpan={6}>
                    <div className="service-edit-inline-msg" role="alert">
                      <i
                        className="bi bi-exclamation-circle-fill flex-shrink-0"
                        aria-hidden
                      />
                      <span>{tomTatLoiSuaDichVu(suaDichVuLoi)}</span>
                    </div>
                  </td>
                </tr>
              ) : null}
              </Fragment>
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
        {danhSachDichVuLoc.length > 0 ? (
          <Card.Footer className="d-flex flex-wrap align-items-center justify-content-between gap-2 py-3">
            <div className="small text-muted">
              {danhSachDichVuLoc.length} dịch vụ khớp lọc · trang {trang + 1}/
              {tongTrangDichVu}
            </div>
            <Pagination className="mb-0 flex-wrap">
              <Pagination.Prev
                disabled={trang <= 0}
                onClick={() => setTrang((p) => Math.max(0, p - 1))}
              />
              <Pagination.Item active className="user-select-none">
                {trang + 1} / {tongTrangDichVu}
              </Pagination.Item>
              <Pagination.Next
                disabled={trang >= tongTrangDichVu - 1}
                onClick={() =>
                  setTrang((p) => Math.min(tongTrangDichVu - 1, p + 1))
                }
              />
            </Pagination>
          </Card.Footer>
        ) : null}
      </Card>

      <Modal
        show={hienModal}
        onHide={() => {
          setHienModal(false);
          setThemDichVuLoi({});
          setModalError("");
        }}
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
            <Form
              id="form-them-dich-vu"
              noValidate
              onSubmit={handleThemDichVu}
            >
              <Form.Group className="mb-3">
                <Form.Label className="required">Loại dịch vụ</Form.Label>
                <Form.Select
                  aria-label="Chọn loại dịch vụ"
                  title="Chọn loại dịch vụ"
                  value={form.maLoaiDichVu ?? ""}
                  onChange={(e) => {
                    const maLoaiDichVu = Number(e.target.value) || undefined;
                    setForm({ ...form, maLoaiDichVu });
                    setThemDichVuLoi((x) => {
                      const n = { ...x };
                      delete n.maLoaiDichVu;
                      delete n.ten;
                      return n;
                    });
                  }}
                  isInvalid={Boolean(themDichVuLoi.maLoaiDichVu)}
                  disabled={loaiDichVu.length === 0}
                >
                  {loaiDichVu.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.tenLoaiDichVu}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid" className="d-block">
                  {themDichVuLoi.maLoaiDichVu}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="required">Tên dịch vụ</Form.Label>
                <Form.Control
                  placeholder="Ví dụ: Khám tổng quát, Siêu âm..."
                  value={form.ten || ""}
                  onChange={(e) => {
                    setForm({ ...form, ten: e.target.value });
                    setThemDichVuLoi((x) => {
                      const n = { ...x };
                      delete n.ten;
                      return n;
                    });
                  }}
                  isInvalid={Boolean(themDichVuLoi.ten)}
                />
                <Form.Control.Feedback type="invalid">
                  {themDichVuLoi.ten}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Mô tả</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="Mô tả ngắn cho nhân viên và bệnh nhân (tuỳ chọn)"
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
                    setThemDichVuLoi((x) => {
                      const n = { ...x };
                      delete n.gia;
                      return n;
                    });
                  }}
                  isInvalid={Boolean(themDichVuLoi.gia)}
                />
                <Form.Control.Feedback type="invalid">
                  {themDichVuLoi.gia}
                </Form.Control.Feedback>
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
            </Form>
          )}
        </Modal.Body>
        {modalLoai === "them-dich-vu" ? (
          <Modal.Footer className="clinic-modal-footer-actions">
            <Button
              type="button"
              className="btn-modal-dismiss"
              onClick={() => setHienModal(false)}
            >
              <i className="bi bi-x-lg me-2" aria-hidden />
              Hủy
            </Button>
            <Button
              type="submit"
              form="form-them-dich-vu"
              className="btn-action-edit"
              disabled={loaiDichVu.length === 0}
            >
              <i className="bi bi-check2-circle me-2" aria-hidden />
              Lưu
            </Button>
          </Modal.Footer>
        ) : null}
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
        <Modal.Footer className="clinic-modal-footer-actions">
          <Button
            type="button"
            className="btn-modal-dismiss"
            onClick={() => setXoaId(null)}
            disabled={dangXoa}
          >
            <i className="bi bi-x-lg me-2" aria-hidden />
            Hủy
          </Button>
          <Button
            type="button"
            className="btn-action-delete"
            onClick={xacNhanXoa}
            disabled={dangXoa}
          >
            <i className="bi bi-trash me-1" aria-hidden />
            {dangXoa ? "Đang xóa..." : "Xóa"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
