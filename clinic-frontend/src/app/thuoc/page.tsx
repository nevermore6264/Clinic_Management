"use client";

import { useEffect, useState } from "react";
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
} from "react-bootstrap";
import { useAuth } from "@/lib/useAuth";
import { thuocApi, type Thuoc } from "@/lib/api";

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
  const [list, setList] = useState<Thuoc[]>([]);
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState<Thuoc | null>(null);
  const [form, setForm] = useState<Thuoc>(empty);
  const [step, setStep] = useState(1);
  const [modalError, setModalError] = useState("");
  const [thuocCanXoa, setThuocCanXoa] = useState<Thuoc | null>(null);
  const [tuKhoa, setTuKhoa] = useState("");
  const [boLocTrangThai, setBoLocTrangThai] = useState("tat-ca");

  useEffect(() => {
    if (!loading && !user) router.replace("/dang-nhap");
    if (user && !user.cacVaiTro.includes("QUAN_TRI"))
      router.replace("/bang-dieu-khien");
  }, [user, loading, router]);

  const load = () =>
    thuocApi
      .tatCa()
      .then(setList)
      .catch((e) => setError(e.message));

  useEffect(() => {
    if (!user?.cacVaiTro.includes("QUAN_TRI")) return;
    load();
  }, [user]);

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
    if (
      (form.giaNhap ?? 0) > 0 &&
      (form.giaBan ?? 0) > 0 &&
      (form.giaBan ?? 0) < (form.giaNhap ?? 0)
    ) {
      setModalError("Giá bán nên lớn hơn hoặc bằng giá nhập.");
      return;
    }
    try {
      if (editing?.id != null) {
        await thuocApi.capNhat(editing.id, form);
      } else {
        await thuocApi.tao(form);
      }
      setShow(false);
      setModalError("");
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
      if (
        (form.giaNhap ?? 0) > 0 &&
        (form.giaBan ?? 0) > 0 &&
        (form.giaBan ?? 0) < (form.giaNhap ?? 0)
      ) {
        setModalError("Giá bán nên lớn hơn hoặc bằng giá nhập.");
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

  const danhSachLoc = list.filter((t) => {
    const keyword = tuKhoa.trim().toLocaleLowerCase();
    const text = [
      t.tenThuoc,
      t.hoatChat,
      t.hamLuong,
      t.dangBaoChe,
      t.duongDung,
      t.donVi,
    ]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase();

    const khopTuKhoa = !keyword || text.includes(keyword);
    const khopTrangThai =
      boLocTrangThai === "tat-ca" ||
      (boLocTrangThai === "dang-dung" ? t.hoatDong : !t.hoatDong);

    return khopTuKhoa && khopTrangThai;
  });

  const exportCsv = () => {
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
      ...danhSachLoc.map((t) => [
        t.tenThuoc ?? "",
        t.hoatChat ?? "",
        t.hamLuong ?? "",
        t.dangBaoChe ?? "",
        t.duongDung ?? "",
        t.donVi ?? "",
        String(t.tonKho ?? 0),
        String(t.mucTonToiThieu ?? 0),
        t.hanSuDung ?? "",
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

    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `thuoc-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!user?.cacVaiTro.includes("QUAN_TRI")) return null;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Danh mục thuốc</h2>
        <div className="d-flex gap-2">
          <Button className="btn-service-export" onClick={exportCsv}>
            <i className="bi bi-filetype-csv me-2" aria-hidden />
            Export CSV
          </Button>
          <Button onClick={openNew}>
            <i className="bi bi-capsule-pill me-2" aria-hidden />
            Thêm thuốc
          </Button>
        </div>
      </div>
      <Card className="mb-3 card--static">
        <Card.Body className="py-3">
          <Row className="g-2">
            <Col md={3}>
              <Form.Select
                value={boLocTrangThai}
                onChange={(e) => setBoLocTrangThai(e.target.value)}
              >
                <option value="tat-ca">Tất cả trạng thái</option>
                <option value="dang-dung">Đang dùng</option>
                <option value="ngung">Ngừng</option>
              </Form.Select>
            </Col>
            <Col md={8}>
              <Form.Control
                placeholder="Tìm tên thuốc, hoạt chất, dạng bào chế..."
                value={tuKhoa}
                onChange={(e) => setTuKhoa(e.target.value)}
              />
            </Col>
            <Col md={1} className="d-flex align-items-center">
              <Button
                variant="secondary"
                className="w-100"
                onClick={() => {
                  setTuKhoa("");
                  setBoLocTrangThai("tat-ca");
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
            {danhSachLoc.map((t) => (
              <tr key={t.id}>
                <td>{t.tenThuoc}</td>
                <td>{t.hamLuong || "—"}</td>
                <td>{t.dangBaoChe || "—"}</td>
                <td>{t.duongDung || "—"}</td>
                <td>{t.donVi || "—"}</td>
                <td>{t.tonKho ?? 0}</td>
                <td>{t.hanSuDung || "—"}</td>
                <td>{t.giaBan?.toLocaleString("vi-VN")}đ</td>
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
                    variant="primary"
                    className="me-1 btn-action-edit"
                    onClick={() => openEdit(t)}
                  >
                    <i className="bi bi-pencil-square me-1" aria-hidden />
                    Sửa
                  </Button>
                  {t.hoatDong ? (
                    <Button
                      size="sm"
                      variant="warning"
                      className="me-1 btn-thuoc-action-stop"
                      onClick={() => ngungSuDung(t)}
                    >
                      <i className="bi bi-pause-circle me-1" aria-hidden />
                      Ngừng
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="success"
                      className="me-1 btn-thuoc-action-reopen"
                      onClick={() => moLaiSuDung(t)}
                    >
                      <i className="bi bi-arrow-clockwise me-1" aria-hidden />
                      Mở lại
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="danger"
                    className="btn-action-delete"
                    onClick={() => setThuocCanXoa(t)}
                  >
                    <i className="bi bi-trash3 me-1" aria-hidden />
                    Xóa
                  </Button>
                </td>
              </tr>
            ))}
            {danhSachLoc.length === 0 ? (
              <tr>
                <td colSpan={11} className="text-center text-muted py-4">
                  Không có thuốc phù hợp bộ lọc hiện tại.
                </td>
              </tr>
            ) : null}
          </tbody>
        </Table>
      </Card>

      <Modal
        show={show}
        onHide={() => setShow(false)}
        centered
        size="xl"
        scrollable
      >
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
                  value={form.tenThuoc}
                  onChange={(e) =>
                    setForm({ ...form, tenThuoc: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Hoạt chất</Form.Label>
                <Form.Control
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
                  onChange={(e) =>
                    setForm({ ...form, donVi: e.target.value })
                  }
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
                  value={form.soDangKy ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, soDangKy: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Số lô</Form.Label>
                <Form.Control
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
                  type="number"
                  min={0}
                  value={form.giaNhap ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, giaNhap: Number(e.target.value) || 0 })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Giá bán</Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  value={form.giaBan ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, giaBan: Number(e.target.value) || 0 })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Tồn kho</Form.Label>
                <Form.Control
                  type="number"
                  min={0}
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
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShow(false)}>
            <i className="bi bi-x-circle me-2" aria-hidden />
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
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setThuocCanXoa(null)}>
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
