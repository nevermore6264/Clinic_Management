"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  Button,
  Card,
  Alert,
  Form,
  Modal,
  Row,
  Col,
  Pagination,
} from "react-bootstrap";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import { formatNgayDdMmYyyy } from "@/lib/formatInstantVi";
import { thuocApi, type Thuoc, type ThuocTrangTraCuu } from "@/lib/api";
import { formatVndInputMoneyUnit, parseVndInputMoney } from "@/lib/moneyVnd";
import { LoadingState } from "@/components/LoadingState";

const BUOC_THUOC = [
  {
    index: 1,
    title: "Thông tin cơ bản",
    titleShort: "Cơ bản",
    hint: "Tên, hoạt chất, dạng thuốc",
  },
  {
    index: 2,
    title: "Kho & giá",
    titleShort: "Kho & giá",
    hint: "Lô, HSD, tồn, giá",
  },
  {
    index: 3,
    title: "Chuyên môn",
    titleShort: "Chuyên môn",
    hint: "Chỉ định, cảnh báo",
  },
] as const;

const DON_VI_OPTIONS = [
  "Viên",
  "Vỉ",
  "Hộp",
  "Chai",
  "Lọ",
  "Gói",
  "Tuýp",
  "Ống",
  "Lọ xịt",
  "Chai nhỏ giọt",
  "Ống tiêm",
  "Hộp ống",
] as const;

const DANG_BAO_CHE_OPTIONS = [
  "Viên nén",
  "Viên nang cứng",
  "Viên nang mềm",
  "Viên sủi",
  "Bột pha",
  "Sirô",
  "Thuốc nhỏ mắt",
  "Thuốc nhỏ tai",
  "Kem bôi",
  "Gel",
  "Dung dịch uống",
  "Dung dịch tiêm",
  "Viên ngậm",
  "Nước cốt",
] as const;

const HANG_SAN_XUAT_OPTIONS = [
  "DHG Pharma",
  "OPV",
  "Hasan",
  "Sanofi",
  "GSK",
  "Pfizer",
  "Novartis",
  "Traphaco",
  "Imexpharm",
  "Bidiphar",
  "Domesco",
  "Stada",
  "Mekophar",
  "Khác",
] as const;

const NUOC_SAN_XUAT_OPTIONS = [
  "Việt Nam",
  "Ấn Độ",
  "Pháp",
  "Đức",
  "Mỹ",
  "Thái Lan",
  "Hàn Quốc",
  "Nhật Bản",
  "Úc",
  "Thụy Sĩ",
  "Trung Quốc",
  "Khác",
] as const;

const empty: Thuoc = {
  tenThuoc: "",
  donVi: "",
  hoatChat: "",
  hamLuong: "",
  dangBaoChe: "",
  duongDung: "",
  hangSanXuat: "",
  nuocSanXuat: "",
  soDangKy: "",
  soLo: "",
  hanSuDung: "",
  giaNhap: 0,
  giaBan: 0,
  tonKho: 0,
  mucTonToiThieu: 0,
  chiDinh: "",
  chongChiDinh: "",
  tacDungPhu: "",
  hoatDong: true,
};

export default function ThuocPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [phanTrang, setPhanTrang] = useState<ThuocTrangTraCuu | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  const [error, setError] = useState("");
  const [tuKhoa, setTuKhoa] = useState("");
  const [tuKhoaTim, setTuKhoaTim] = useState("");
  const [boLocTrangThai, setBoLocTrangThai] = useState("tat-ca");
  const KICH_THUOC_TRANG = 20;
  const [trang, setTrang] = useState(0);
  const [sapXep, setSapXep] = useState("tenThuoc,asc");
  const [exportingCsv, setExportingCsv] = useState(false);
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState<Thuoc | null>(null);
  const [form, setForm] = useState<Thuoc>(empty);
  const [step, setStep] = useState(1);
  const [modalError, setModalError] = useState("");
  const [thuocCanXoa, setThuocCanXoa] = useState<Thuoc | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/dang-nhap");
    if (user && !user.cacVaiTro.includes("QUAN_TRI"))
      router.replace("/bang-dieu-khien");
  }, [user, loading, router]);

  useEffect(() => {
    const id = window.setTimeout(() => setTuKhoaTim(tuKhoa), 400);
    return () => window.clearTimeout(id);
  }, [tuKhoa]);

  useEffect(() => {
    setTrang(0);
  }, [tuKhoaTim, boLocTrangThai, sapXep]);

  const load = useCallback(async () => {
    if (!user?.cacVaiTro.includes("QUAN_TRI")) return;
    setLoadingList(true);
    try {
      const r = await thuocApi.timKiem({
        tuKhoa: tuKhoaTim.trim() || undefined,
        trangThai: boLocTrangThai,
        page: trang,
        size: KICH_THUOC_TRANG,
        sort: sapXep,
      });
      setPhanTrang(r);
      setError("");
    } catch (e: unknown) {
      setPhanTrang(null);
      setError(e instanceof Error ? e.message : "Lỗi");
    } finally {
      setLoadingList(false);
    }
  }, [
    user?.cacVaiTro,
    tuKhoaTim,
    boLocTrangThai,
    trang,
    sapXep,
  ]);

  useEffect(() => {
    void load();
  }, [load]);

  const openNew = () => {
    setEditing(null);
    setForm({ ...empty });
    setStep(1);
    setModalError("");
    setShow(true);
  };

  const openEdit = (t: Thuoc) => {
    setEditing(t);
    setForm({ ...t });
    setStep(1);
    setModalError("");
    setShow(true);
  };

  const dongModalThuoc = () => {
    setShow(false);
    setModalError("");
    setStep(1);
  };

  const save = async () => {
    if (!form.tenThuoc.trim()) {
      setModalError("Tên thuốc là bắt buộc.");
      return;
    }
    if ((form.giaNhap ?? 0) < 0 || (form.giaBan ?? 0) < 0) {
      setModalError("Giá nhập/giá bán không được âm.");
      return;
    }
    if ((form.tonKho ?? 0) < 0 || (form.mucTonToiThieu ?? 0) < 0) {
      setModalError("Tồn kho và mức tồn tối thiểu không được âm.");
      return;
    }
    if (form.hanSuDung) {
      const homNay = new Date().toISOString().slice(0, 10);
      if (form.hanSuDung < homNay) {
        setModalError("Hạn sử dụng không được ở quá khứ.");
        return;
      }
    }
    const gn = form.giaNhap ?? 0;
    const gb = form.giaBan ?? 0;
    if (gn > 0 && gb <= gn) {
      setModalError("Giá nhập phải nhỏ hơn giá bán.");
      return;
    }
    try {
      if (editing?.id != null) {
        await thuocApi.capNhat(editing.id, form);
      } else {
        await thuocApi.tao(form);
      }
      dongModalThuoc();
      await load();
    } catch (e: unknown) {
      setModalError(e instanceof Error ? e.message : "Lỗi");
    }
  };

  const quaBuocTiep = () => {
    setModalError("");
    if (step === 1 && !form.tenThuoc.trim()) {
      setModalError("Vui lòng nhập tên thuốc trước khi tiếp tục.");
      return;
    }
    if (step === 2) {
      if (form.hanSuDung) {
        const homNay = new Date().toISOString().slice(0, 10);
        if (form.hanSuDung < homNay) {
          setModalError("Hạn sử dụng không được ở quá khứ.");
          return;
        }
      }
      if ((form.giaNhap ?? 0) < 0 || (form.giaBan ?? 0) < 0) {
        setModalError("Giá nhập/giá bán không được âm.");
        return;
      }
      if ((form.tonKho ?? 0) < 0 || (form.mucTonToiThieu ?? 0) < 0) {
        setModalError("Tồn kho và mức tồn tối thiểu không được âm.");
        return;
      }
      const gn = form.giaNhap ?? 0;
      const gb = form.giaBan ?? 0;
      if (gn > 0 && gb <= gn) {
        setModalError("Giá nhập phải nhỏ hơn giá bán.");
        return;
      }
    }
    setStep((s) => Math.min(3, s + 1));
  };

  const chonBuocStepper = (mucTieu: number) => {
    if (mucTieu === step) return;
    setModalError("");
    if (mucTieu < step) {
      setStep(mucTieu);
      return;
    }
  };

  const ngungSuDung = async (t: Thuoc) => {
    if (!t.id) return;
    try {
      await thuocApi.capNhat(t.id, { ...t, hoatDong: false });
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi");
    }
  };

  const moLaiSuDung = async (t: Thuoc) => {
    if (!t.id) return;
    try {
      await thuocApi.capNhat(t.id, { ...t, hoatDong: true });
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi");
    }
  };

  const xoaThuoc = async () => {
    if (!thuocCanXoa?.id) return;
    try {
      await thuocApi.xoa(thuocCanXoa.id);
      setThuocCanXoa(null);
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi");
    }
  };

  const danhSachHienThi = phanTrang?.content ?? [];

  const exportCsv = async () => {
    setExportingCsv(true);
    const base = {
      tuKhoa: tuKhoaTim.trim() || undefined,
      trangThai: boLocTrangThai,
      sort: sapXep,
    };
    const collected: Thuoc[] = [];
    const size = 200;
    const maxPage = 50;
    try {
      for (let p = 0; p < maxPage; p++) {
        const r = await thuocApi.timKiem({ ...base, page: p, size });
        collected.push(...r.content);
        if (r.last || r.content.length === 0) break;
      }
      const rows = [
        [
          "Ten thuoc",
          "Hoat chat",
          "Ham luong",
          "Dang bao che",
          "Duong dung",
          "Don vi",
          "Ton kho",
          "Muc ton toi thieu",
          "Han su dung",
          "Gia ban",
          "Trang thai",
        ],
        ...collected.map((t) => [
          t.tenThuoc ?? "",
          t.hoatChat ?? "",
          t.hamLuong ?? "",
          t.dangBaoChe ?? "",
          t.duongDung ?? "",
          t.donVi ?? "",
          String(t.tonKho ?? 0),
          String(t.mucTonToiThieu ?? 0),
          t.hanSuDung?.trim() ? formatNgayDdMmYyyy(t.hanSuDung) : "",
          String(t.giaBan ?? 0),
          t.hoatDong ? "Dang dung" : "Ngung",
        ]),
      ];

      const csv = rows
        .map((row) =>
          row
            .map((value) => `"${String(value).replaceAll('"', '""')}"`)
            .join(","),
        )
        .join("\n");

      const blob = new Blob([`\uFEFF${csv}`], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const now = new Date();
      const pad2 = (n: number) => String(n).padStart(2, "0");
      const timestamp = `${now.getFullYear()}${pad2(now.getMonth() + 1)}${pad2(
        now.getDate(),
      )}-${pad2(now.getHours())}${pad2(now.getMinutes())}`;
      a.href = url;
      a.download = `thuoc-${timestamp}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi xuất CSV");
    } finally {
      setExportingCsv(false);
    }
  };

  if (!user?.cacVaiTro.includes("QUAN_TRI")) return null;

  const tongSoTrang = Math.max(1, phanTrang?.totalPages ?? 1);
  const tongPhanTu = phanTrang?.totalElements ?? 0;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Danh mục thuốc</h2>
        <div className="d-flex gap-2">
          <Button
            className="btn-service-export"
            disabled={exportingCsv}
            onClick={() => void exportCsv()}
          >
            <i className="bi bi-filetype-csv me-2" aria-hidden />
            {exportingCsv ? "Đang xuất…" : "Export CSV"}
          </Button>
          <Button onClick={openNew}>
            <i className="bi bi-capsule-pill me-2" aria-hidden />
            Thêm thuốc
          </Button>
        </div>
      </div>
      <Card className="mb-3 card--static">
        <Card.Body className="py-3">
          <Row className="g-2 align-items-end">
            <Col xs={12} md={4} lg={4}>
              <Form.Label className="small text-muted mb-1">Từ khóa</Form.Label>
              <Form.Control
                placeholder="Tên, hoạt chất, hàm lượng…"
                value={tuKhoa}
                onChange={(e) => setTuKhoa(e.target.value)}
              />
            </Col>
            <Col xs={6} md={2} lg={2}>
              <Form.Label className="small text-muted mb-1">
                Trạng thái
              </Form.Label>
              <Form.Select
                value={boLocTrangThai}
                onChange={(e) => setBoLocTrangThai(e.target.value)}
              >
                <option value="tat-ca">Tất cả</option>
                <option value="dang-dung">Đang dùng</option>
                <option value="ngung">Ngừng</option>
              </Form.Select>
            </Col>
            <Col xs={6} md={3} lg={3}>
              <Form.Label className="small text-muted mb-1">Sắp xếp</Form.Label>
              <Form.Select
                value={sapXep}
                onChange={(e) => setSapXep(e.target.value)}
              >
                <option value="tenThuoc,asc">Tên A → Z</option>
                <option value="tenThuoc,desc">Tên Z → A</option>
                <option value="giaBan,asc">Giá bán tăng dần</option>
                <option value="giaBan,desc">Giá bán giảm dần</option>
                <option value="hanSuDung,asc">HSD sớm nhất</option>
                <option value="hanSuDung,desc">HSD muộn nhất</option>
                <option value="tonKho,asc">Tồn ít nhất</option>
                <option value="tonKho,desc">Tồn nhiều nhất</option>
              </Form.Select>
            </Col>
            <Col
              xs={12}
              md={3}
              lg={3}
              className="d-flex align-items-end justify-content-end"
            >
              <Button
                variant="outline-secondary"
                size="sm"
                className="btn-clinic-clear-filter"
                onClick={() => {
                  setTuKhoa("");
                  setTuKhoaTim("");
                  setBoLocTrangThai("tat-ca");
                  setSapXep("tenThuoc,asc");
                }}
              >
                <i className="bi bi-arrow-counterclockwise" aria-hidden />
                Xóa lọc
              </Button>
            </Col>
          </Row>
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
              <th>Tên</th>
              <th>Hàm lượng</th>
              <th>Dạng bào chế</th>
              <th>Đường dùng</th>
              <th>Đơn vị</th>
              <th>Tồn kho</th>
              <th>HSD</th>
              <th>Giá bán</th>
              <th>Cảnh báo</th>
              <th>Trạng thái</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loadingList ? (
              <tr>
                <td colSpan={11} className="text-center py-5">
                  <LoadingState />
                </td>
              </tr>
            ) : danhSachHienThi.length === 0 ? (
              <tr>
                <td colSpan={11} className="text-center text-muted py-4">
                  Không có thuốc phù hợp bộ lọc hiện tại.
                </td>
              </tr>
            ) : (
              danhSachHienThi.map((t) => (
                <tr key={t.id}>
                  <td>{t.tenThuoc}</td>
                  <td>{t.hamLuong || "—"}</td>
                  <td>{t.dangBaoChe || "—"}</td>
                  <td>{t.duongDung || "—"}</td>
                  <td>{t.donVi || "—"}</td>
                  <td>{t.tonKho ?? 0}</td>
                  <td>{formatNgayDdMmYyyy(t.hanSuDung)}</td>
                  <td>
                    {(t.giaBan ?? 0) === 0
                      ? "—"
                      : formatVndInputMoneyUnit(t.giaBan)}
                  </td>
                  <td>
                    {(t.tonKho ?? 0) <= (t.mucTonToiThieu ?? 0) ? (
                      <span className="thuoc-status-tag thuoc-status-tag--warning">
                        Tồn kho thấp
                      </span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td>
                    <span
                      className={`thuoc-status-tag ${
                        t.hoatDong
                          ? "thuoc-status-tag--active"
                          : "thuoc-status-tag--inactive"
                      }`}
                    >
                      {t.hoatDong ? "Đang dùng" : "Ngừng"}
                    </span>
                  </td>
                  <td>
                    <Button
                      size="sm"
                      className="me-1 btn-action-edit"
                      onClick={() => openEdit(t)}
                    >
                      <i className="bi bi-pencil-square me-1" aria-hidden />
                      Sửa
                    </Button>
                    {t.hoatDong ? (
                      <Button
                        size="sm"
                        className="me-1 btn-thuoc-action-stop"
                        onClick={() => ngungSuDung(t)}
                      >
                        <i className="bi bi-pause-circle me-1" aria-hidden />
                        Ngừng
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="me-1 btn-thuoc-action-reopen"
                        onClick={() => moLaiSuDung(t)}
                      >
                        <i className="bi bi-arrow-clockwise me-1" aria-hidden />
                        Mở lại
                      </Button>
                    )}
                    <Button
                      size="sm"
                      className="btn-action-delete"
                      onClick={() => setThuocCanXoa(t)}
                    >
                      <i className="bi bi-trash3 me-1" aria-hidden />
                      Xóa
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
        {!loadingList && tongPhanTu > 0 ? (
          <Card.Footer className="d-flex flex-wrap align-items-center justify-content-between gap-2 py-3">
            <div className="small text-muted">
              {tongPhanTu} thuốc khớp lọc · trang {trang + 1}/{tongSoTrang}
            </div>
            <Pagination className="mb-0 flex-wrap">
              <Pagination.First
                disabled={trang <= 0}
                onClick={() => setTrang(0)}
              />
              <Pagination.Prev
                disabled={trang <= 0}
                onClick={() => setTrang((p) => Math.max(0, p - 1))}
              />
              <Pagination.Item active className="user-select-none">
                {trang + 1} / {tongSoTrang}
              </Pagination.Item>
              <Pagination.Next
                disabled={trang >= tongSoTrang - 1}
                onClick={() =>
                  setTrang((p) => Math.min(tongSoTrang - 1, p + 1))
                }
              />
              <Pagination.Last
                disabled={trang >= tongSoTrang - 1}
                onClick={() => setTrang(tongSoTrang - 1)}
              />
            </Pagination>
          </Card.Footer>
        ) : null}
      </Card>

      <div className="mt-4 d-flex justify-content-end">
        <Link
          href="/don-thuoc"
          className="btn btn-outline-primary d-inline-flex align-items-center gap-2"
        >
          <i className="bi bi-receipt me-1" aria-hidden />
          Xem đơn thuốc (chi tiết theo hồ sơ khám)
        </Link>
      </div>

      <Modal show={show} onHide={dongModalThuoc} centered size="xl" scrollable>
        <Modal.Header closeButton>
          <Modal.Title>{editing ? "Sửa thuốc" : "Thêm thuốc"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <nav className="clinic-stepper mb-4" aria-label="Các bước thêm thuốc">
            <Row className="g-3 g-md-2 align-items-stretch justify-content-center clinic-stepper__row">
              {BUOC_THUOC.map((b, i) => {
                const isActive = step === b.index;
                const isDone = step > b.index;
                const coTheLui = isDone;
                return (
                  <Col key={b.index} xs={12} md={4}>
                    <div
                      className={`clinic-stepper__cell h-100 text-center px-1 ${
                        isActive ? "clinic-stepper__cell--active" : ""
                      }`}
                    >
                      <button
                        type="button"
                        className={`clinic-stepper__node btn p-0 border-0 bg-transparent w-100 ${
                          coTheLui ? "clinic-stepper__node--clickable" : ""
                        }`}
                        onClick={() => coTheLui && chonBuocStepper(b.index)}
                        disabled={!coTheLui && !isActive}
                        aria-current={isActive ? "step" : undefined}
                      >
                        <span
                          className={`clinic-stepper__circle d-inline-flex align-items-center justify-content-center rounded-circle fw-semibold ${
                            isActive
                              ? "clinic-stepper__circle--active"
                              : isDone
                                ? "clinic-stepper__circle--done"
                                : "clinic-stepper__circle--pending"
                          }`}
                        >
                          {isDone ? (
                            <i className="bi bi-check-lg" aria-hidden />
                          ) : (
                            b.index
                          )}
                        </span>
                        <span
                          className={`d-block small mt-2 clinic-stepper__title ${
                            isActive ? "fw-semibold text-body" : "text-muted"
                          }`}
                        >
                          <span className="d-inline d-md-none">
                            {b.titleShort}
                          </span>
                          <span className="d-none d-md-inline">{b.title}</span>
                        </span>
                        <span className="d-block text-muted clinic-stepper__hint px-md-1">
                          {b.hint}
                        </span>
                      </button>
                    </div>
                  </Col>
                );
              })}
            </Row>
          </nav>
          {modalError ? (
            <Alert variant="danger" className="py-2">
              {modalError}
            </Alert>
          ) : null}

          {step === 1 && (
            <>
              <Form.Group className="mb-2">
                <Form.Label>Tên thuốc *</Form.Label>
                <Form.Control
                  placeholder="VD: Paracetamol 500mg"
                  value={form.tenThuoc}
                  onChange={(e) =>
                    setForm({ ...form, tenThuoc: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Hoạt chất</Form.Label>
                <Form.Control
                  placeholder="VD: Paracetamol"
                  value={form.hoatChat ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, hoatChat: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Hàm lượng</Form.Label>
                <Form.Control
                  placeholder="Ví dụ: 500mg"
                  value={form.hamLuong ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, hamLuong: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Dạng bào chế</Form.Label>
                <Form.Select
                  value={form.dangBaoChe ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, dangBaoChe: e.target.value })
                  }
                >
                  <option value="">-- Chọn dạng bào chế --</option>
                  {DANG_BAO_CHE_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                  {form.dangBaoChe &&
                  !DANG_BAO_CHE_OPTIONS.includes(
                    form.dangBaoChe as (typeof DANG_BAO_CHE_OPTIONS)[number],
                  ) ? (
                    <option value={form.dangBaoChe}>{form.dangBaoChe}</option>
                  ) : null}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Đường dùng</Form.Label>
                <Form.Control
                  placeholder="Uống, tiêm, bôi..."
                  value={form.duongDung ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, duongDung: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Đơn vị</Form.Label>
                <Form.Select
                  value={form.donVi ?? ""}
                  onChange={(e) => setForm({ ...form, donVi: e.target.value })}
                >
                  <option value="">-- Chọn đơn vị --</option>
                  {DON_VI_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                  {form.donVi &&
                  !DON_VI_OPTIONS.includes(
                    form.donVi as (typeof DON_VI_OPTIONS)[number],
                  ) ? (
                    <option value={form.donVi}>{form.donVi}</option>
                  ) : null}
                </Form.Select>
              </Form.Group>
            </>
          )}

          {step === 2 && (
            <>
              <Form.Group className="mb-2">
                <Form.Label>Hãng sản xuất</Form.Label>
                <Form.Select
                  value={form.hangSanXuat ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, hangSanXuat: e.target.value })
                  }
                >
                  <option value="">-- Chọn hãng sản xuất --</option>
                  {HANG_SAN_XUAT_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                  {form.hangSanXuat &&
                  !HANG_SAN_XUAT_OPTIONS.includes(
                    form.hangSanXuat as (typeof HANG_SAN_XUAT_OPTIONS)[number],
                  ) ? (
                    <option value={form.hangSanXuat}>{form.hangSanXuat}</option>
                  ) : null}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Nước sản xuất</Form.Label>
                <Form.Select
                  value={form.nuocSanXuat ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, nuocSanXuat: e.target.value })
                  }
                >
                  <option value="">-- Chọn nước sản xuất --</option>
                  {NUOC_SAN_XUAT_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                  {form.nuocSanXuat &&
                  !NUOC_SAN_XUAT_OPTIONS.includes(
                    form.nuocSanXuat as (typeof NUOC_SAN_XUAT_OPTIONS)[number],
                  ) ? (
                    <option value={form.nuocSanXuat}>{form.nuocSanXuat}</option>
                  ) : null}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Số đăng ký</Form.Label>
                <Form.Control
                  placeholder="Số đăng ký thuốc"
                  value={form.soDangKy ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, soDangKy: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Số lô</Form.Label>
                <Form.Control
                  placeholder="Mã lô (LOT)"
                  value={form.soLo ?? ""}
                  onChange={(e) => setForm({ ...form, soLo: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Hạn sử dụng</Form.Label>
                <Form.Control
                  type="date"
                  value={form.hanSuDung ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, hanSuDung: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Giá nhập</Form.Label>
                <Form.Control
                  type="text"
                  inputMode="decimal"
                  placeholder="Ví dụ: 12.000 VNĐ"
                  value={
                    (form.giaNhap ?? 0) === 0
                      ? ""
                      : formatVndInputMoneyUnit(form.giaNhap)
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      giaNhap: parseVndInputMoney(e.target.value),
                    })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Giá bán</Form.Label>
                <Form.Control
                  type="text"
                  inputMode="decimal"
                  placeholder="Ví dụ: 15.000 VNĐ"
                  value={
                    (form.giaBan ?? 0) === 0
                      ? ""
                      : formatVndInputMoneyUnit(form.giaBan)
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      giaBan: parseVndInputMoney(e.target.value),
                    })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Tồn kho</Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  placeholder="0"
                  value={form.tonKho ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, tonKho: Number(e.target.value) || 0 })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Mức tồn tối thiểu</Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  placeholder="0"
                  value={form.mucTonToiThieu ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      mucTonToiThieu: Number(e.target.value) || 0,
                    })
                  }
                />
              </Form.Group>
            </>
          )}

          {step === 3 && (
            <>
              <Form.Group className="mb-2">
                <Form.Label>Chỉ định</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="Công dụng, chỉ định lâm sàng..."
                  value={form.chiDinh ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, chiDinh: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Chống chỉ định</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="Trường hợp không được dùng thuốc..."
                  value={form.chongChiDinh ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, chongChiDinh: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Tác dụng phụ</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="Tác dụng không mong muốn (nếu có)..."
                  value={form.tacDungPhu ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, tacDungPhu: e.target.value })
                  }
                />
              </Form.Group>
              {editing && (
                <Form.Check
                  type="switch"
                  label="Đang sử dụng trong danh mục"
                  checked={form.hoatDong ?? true}
                  onChange={(e) =>
                    setForm({ ...form, hoatDong: e.target.checked })
                  }
                />
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="clinic-modal-footer-actions">
          <Button
            type="button"
            className="btn-modal-dismiss"
            onClick={dongModalThuoc}
          >
            <i className="bi bi-x-lg me-2" aria-hidden />
            Hủy
          </Button>
          {step > 1 ? (
            <Button
              type="button"
              className="btn-thuoc-wizard-back"
              variant="danger"
              onClick={() => setStep((s) => s - 1)}
            >
              <i className="bi bi-arrow-left-circle me-2" aria-hidden />
              Quay lại
            </Button>
          ) : null}
          {step < 3 ? (
            <Button
              type="button"
              className="btn-thuoc-wizard-next"
              variant="primary"
              onClick={quaBuocTiep}
            >
              Tiếp tục
              <i className="bi bi-arrow-right-circle ms-2" aria-hidden />
            </Button>
          ) : (
            <Button type="button" variant="primary" onClick={save}>
              <i className="bi bi-check2-circle me-2" aria-hidden />
              Lưu
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      <Modal
        show={!!thuocCanXoa}
        onHide={() => setThuocCanXoa(null)}
        centered
        size="sm"
      >
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa thuốc</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bạn có chắc muốn xóa thuốc{" "}
          <strong>{thuocCanXoa?.tenThuoc || "này"}</strong>?
        </Modal.Body>
        <Modal.Footer className="clinic-modal-footer-actions">
          <Button
            type="button"
            className="btn-modal-dismiss"
            onClick={() => setThuocCanXoa(null)}
          >
            <i className="bi bi-x-lg me-2" aria-hidden />
            Hủy
          </Button>
          <Button variant="danger" onClick={xoaThuoc}>
            <i className="bi bi-trash3 me-2" aria-hidden />
            Xóa thuốc
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
