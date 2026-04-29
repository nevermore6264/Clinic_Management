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

  const voHieu = async (id: number) => {
    if (!confirm("Ngừng sử dụng thuốc này?")) return;
    try {
      await thuocApi.xoa(id);
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi");
    }
  };

  if (!user?.cacVaiTro.includes("QUAN_TRI")) return null;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Danh mục thuốc</h2>
        <Button onClick={openNew}>
          <i className="bi bi-capsule-pill me-2" aria-hidden />
          Thêm thuốc
        </Button>
      </div>
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
            {list.map((t) => (
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
                    <span className="badge text-bg-warning">Tồn kho thấp</span>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
                <td>{t.hoatDong ? "Đang dùng" : "Ngừng"}</td>
                <td>
                  <Button
                    size="sm"
                    variant="outline-primary"
                    className="me-1"
                    onClick={() => openEdit(t)}
                  >
                    <i className="bi bi-pencil-square me-1" aria-hidden />
                    Sửa
                  </Button>
                  {t.hoatDong && (
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => t.id && voHieu(t.id)}
                    >
                      <i className="bi bi-pause-circle me-1" aria-hidden />
                      Ngừng
                    </Button>
                  )}
                </td>
              </tr>
            ))}
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
                <Form.Control
                  placeholder="Viên nén, siro, tiêm..."
                  value={form.dangBaoChe ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, dangBaoChe: e.target.value })
                  }
                />
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
                <Form.Control
                  value={form.donVi ?? ""}
                  onChange={(e) => setForm({ ...form, donVi: e.target.value })}
                />
              </Form.Group>
            </>
          )}

          {step === 2 && (
            <>
              <Form.Group className="mb-2">
                <Form.Label>Hãng sản xuất</Form.Label>
                <Form.Control
                  value={form.hangSanXuat ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, hangSanXuat: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Nước sản xuất</Form.Label>
                <Form.Control
                  value={form.nuocSanXuat ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, nuocSanXuat: e.target.value })
                  }
                />
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
              variant="outline-secondary"
              onClick={() => setStep((s) => s - 1)}
            >
              <i className="bi bi-arrow-left-circle me-2" aria-hidden />
              Quay lại
            </Button>
          ) : null}
          {step < 3 ? (
            <Button variant="primary" onClick={quaBuocTiep}>
              Tiếp tục
              <i className="bi bi-arrow-right-circle ms-2" aria-hidden />
            </Button>
          ) : (
            <Button variant="primary" onClick={save}>
              <i className="bi bi-check2-circle me-2" aria-hidden />
              Lưu
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
}
