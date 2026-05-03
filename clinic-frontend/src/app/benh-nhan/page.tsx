"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Table,
  Button,
  Form,
  Card,
  Pagination,
  Alert,
  Modal,
  Row,
  Col,
} from "react-bootstrap";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import {
  patientsApi,
  appointmentsApi,
  type BenhNhan,
  type BenhNhanDanhSachLoc,
  type LichHen,
} from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { LoadingState } from "@/components/LoadingState";
import { laChiTaiKhoanBenhNhan } from "@/lib/roles";
import {
  PatientRecordFormFields,
  emptyPatientForm,
} from "@/components/PatientRecordFormFields";

function hienThiGioiTinh(ma?: string) {
  switch (ma) {
    case "NAM":
      return "Nam";
    case "NU":
      return "Nữ";
    case "KHAC":
      return "Khác";
    default:
      return "—";
  }
}

function TagGioiTinh({ ma }: { ma?: string }) {
  if (!ma)
    return <span className="text-muted">—</span>;
  const cfg =
    ma === "NAM"
      ? {
          label: "Nam",
          className:
            "bg-primary-subtle text-primary-emphasis border border-primary-subtle",
        }
      : ma === "NU"
        ? {
            label: "Nữ",
            className:
              "bg-danger-subtle text-danger-emphasis border border-danger-subtle",
          }
        : ma === "KHAC"
          ? {
              label: "Khác",
              className:
                "bg-secondary-subtle text-secondary-emphasis border border-secondary-subtle",
            }
          : null;
  if (!cfg)
    return (
      <span className="badge rounded-pill bg-light text-dark border">
        {ma}
      </span>
    );
  return (
    <span className={`badge rounded-pill ${cfg.className}`}>{cfg.label}</span>
  );
}

function TagNhomMau({ nhom }: { nhom?: string }) {
  if (!nhom) return <span className="text-muted">—</span>;
  const map: Record<string, string> = {
    A: "bg-danger-subtle text-danger-emphasis border border-danger-subtle",
    B: "bg-primary-subtle text-primary-emphasis border border-primary-subtle",
    AB: "bg-success-subtle text-success-emphasis border border-success-subtle",
    O: "bg-warning-subtle text-warning-emphasis border border-warning-subtle",
  };
  const cls =
    map[nhom] ??
    "bg-secondary-subtle text-secondary-emphasis border border-secondary-subtle";
  return (
    <span className={`badge rounded-pill ${cls}`}>{nhom}</span>
  );
}

function BenhNhanPageInner() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [list, setList] = useState<BenhNhan[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [listTick, setListTick] = useState(0);
  const [filterTen, setFilterTen] = useState("");
  const [filterTenDebounced, setFilterTenDebounced] = useState("");
  const [filterTrangThaiHoSo, setFilterTrangThaiHoSo] =
    useState<BenhNhanDanhSachLoc["trangThaiHoSo"]>("hoat-dong");
  const [filterGioiTinh, setFilterGioiTinh] = useState("");
  const [filterNhomMau, setFilterNhomMau] = useState("");
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createForm, setCreateForm] = useState<Partial<BenhNhan>>(() =>
    emptyPatientForm(),
  );

  const [showEdit, setShowEdit] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<BenhNhan>>({});
  const [editLoading, setEditLoading] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState("");
  const [visitHistory, setVisitHistory] = useState<LichHen[]>([]);
  const [showConfirmAnHoSo, setShowConfirmAnHoSo] = useState(false);
  const [showConfirmHienThiLai, setShowConfirmHienThiLai] = useState(false);

  const size = 10;

  const refreshList = () => setListTick((t) => t + 1);

  const closeEditModal = () => {
    if (editSubmitting) return;
    setShowEdit(false);
    setEditId(null);
    setEditForm({});
    setVisitHistory([]);
    setEditError("");
    setEditLoading(false);
    setShowConfirmAnHoSo(false);
    setShowConfirmHienThiLai(false);
  };

  const openEditModal = (id: number) => {
    setEditError("");
    setShowConfirmAnHoSo(false);
    setShowConfirmHienThiLai(false);
    setEditId(id);
    setShowEdit(true);
  };

  const locQuery = (): BenhNhanDanhSachLoc => ({
    ten: filterTenDebounced || undefined,
    trangThaiHoSo: filterTrangThaiHoSo,
    gioiTinh: filterGioiTinh || undefined,
    nhomMau: filterNhomMau || undefined,
  });

  useEffect(() => {
    const id = setTimeout(() => {
      const v = filterTen.trim();
      setFilterTenDebounced((prev) => {
        if (prev === v) return prev;
        setPage(0);
        return v;
      });
    }, 400);
    return () => clearTimeout(id);
  }, [filterTen]);

  useEffect(() => {
    if (!loading && !user) router.replace("/dang-nhap");
  }, [user, loading, router]);

  useEffect(() => {
    const sua = searchParams.get("sua");
    if (!sua || !user) return;
    const id = Number(sua);
    if (!Number.isFinite(id) || id < 1) return;
    setEditError("");
    setEditId(id);
    setShowEdit(true);
    router.replace("/benh-nhan", { scroll: false });
  }, [searchParams, user, router]);

  useEffect(() => {
    if (!showEdit || editId == null || !user) return;
    let cancelled = false;
    setEditLoading(true);
    setEditError("");
    setEditForm({});
    setVisitHistory([]);
    patientsApi
      .get(editId)
      .then((p) => {
        if (cancelled) return;
        setEditForm(p);
        setEditLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        setEditError(e instanceof Error ? e.message : "Không tải được hồ sơ");
        setEditLoading(false);
      });
    appointmentsApi
      .byPatient(editId)
      .then((v) => {
        if (cancelled) return;
        setVisitHistory(Array.isArray(v) ? v : []);
      })
      .catch(() => {
        if (cancelled) return;
        setVisitHistory([]);
      });
    return () => {
      cancelled = true;
    };
  }, [showEdit, editId, user]);

  useEffect(() => {
    if (!user) return;
    if (laChiTaiKhoanBenhNhan(user)) {
      setList([]);
      setTotal(0);
      return;
    }
    patientsApi
      .list(page, size, locQuery())
      .then((r) => {
        setList(r.content);
        setTotal(r.totalElements);
      })
      .catch((e) => setError(e.message));
  }, [
    user,
    page,
    size,
    listTick,
    filterTenDebounced,
    filterTrangThaiHoSo,
    filterGioiTinh,
    filterNhomMau,
  ]);

  useEffect(() => {
    if (!user || !laChiTaiKhoanBenhNhan(user) || user.maBenhNhan == null)
      return;
    if (searchParams.get("sua")) return;
    router.replace(`/benh-nhan?sua=${user.maBenhNhan}`, { scroll: false });
  }, [user, router, searchParams]);

  const clearFilters = () => {
    setFilterTen("");
    setFilterTenDebounced("");
    setFilterTrangThaiHoSo("hoat-dong");
    setFilterGioiTinh("");
    setFilterNhomMau("");
    setPage(0);
  };

  const exportCsv = () => {
    const rows = [
      [
        "Ho ten",
        "Ngay sinh",
        "Gioi tinh",
        "Nhom mau",
        "So dien thoai",
        "Email",
        "Nghe nghiep",
        "Dia chi",
        "Trang thai",
      ],
      ...list.map((p) => [
        p.hoTen ?? "",
        p.ngaySinh ?? "",
        hienThiGioiTinh(p.gioiTinh),
        p.nhomMau ?? "",
        p.soDienThoai ?? "",
        p.thuDienTu ?? "",
        p.ngheNghiep ?? "",
        p.diaChi ?? "",
        p.hoatDong === false ? "Da an" : "Hoat dong",
      ]),
    ];
    const csv = rows
      .map((row) =>
        row.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(","),
      )
      .join("\n");
    const blob = new Blob([`\uFEFF${csv}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const now = new Date();
    const pad2 = (n: number) => String(n).padStart(2, "0");
    const file = `benh-nhan-${now.getFullYear()}${pad2(now.getMonth() + 1)}${pad2(
      now.getDate(),
    )}-${pad2(now.getHours())}${pad2(now.getMinutes())}.csv`;
    const a = document.createElement("a");
    a.href = url;
    a.download = file;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.hoTen?.trim()) {
      setError("Họ tên là bắt buộc.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await patientsApi.create(createForm);
      setShowCreate(false);
      setCreateForm(emptyPatientForm());
      setFilterTen("");
      setFilterTenDebounced("");
      setPage(0);
      refreshList();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Không tạo được bệnh nhân");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId == null) return;
    if (!editForm.hoTen?.trim()) {
      setEditError("Họ tên là bắt buộc.");
      return;
    }
    setEditError("");
    setEditSubmitting(true);
    try {
      await patientsApi.update(editId, editForm);
      closeEditModal();
      refreshList();
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : "Không cập nhật được");
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleConfirmAnHoSo = async () => {
    if (editId == null) return;
    setEditError("");
    setEditSubmitting(true);
    try {
      await patientsApi.delete(editId);
      setShowConfirmAnHoSo(false);
      closeEditModal();
      refreshList();
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : "Không ẩn được hồ sơ");
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleConfirmHienThiLai = async () => {
    if (editId == null) return;
    if (!editForm.hoTen?.trim()) {
      setEditError("Họ tên là bắt buộc.");
      return;
    }
    setEditError("");
    setEditSubmitting(true);
    try {
      const capNhat = await patientsApi.update(editId, {
        ...editForm,
        hoatDong: true,
      });
      setEditForm(capNhat);
      setShowConfirmHienThiLai(false);
      refreshList();
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : "Không hiển thị lại được hồ sơ");
    } finally {
      setEditSubmitting(false);
    }
  };

  if (loading) return <LoadingState />;
  if (!user) return null;

  const chiTaiKhoanBn = laChiTaiKhoanBenhNhan(user);
  const chiTaiKhoanBnLienKet = chiTaiKhoanBn && user.maBenhNhan != null;

  return (
    <div>
      <PageHeader
        title={chiTaiKhoanBn ? "Hồ sơ của tôi" : "Bệnh nhân"}
        subtitle={
          chiTaiKhoanBn
            ? "Xem và cập nhật thông tin liên hệ của bạn."
            : "Danh sách hồ sơ đang hoạt động. Tìm theo tên hoặc mở chi tiết để chỉnh sửa."
        }
      >
        {!chiTaiKhoanBn && (
          <div className="d-flex gap-2">
            <Button className="btn-service-export" onClick={exportCsv}>
              <i className="bi bi-filetype-csv me-2" aria-hidden />
              Export CSV
            </Button>
            <Button
              variant="primary"
              className="d-inline-flex align-items-center gap-2"
              onClick={() => setShowCreate(true)}
            >
              <i className="bi bi-person-plus" aria-hidden />
              Thêm bệnh nhân
            </Button>
          </div>
        )}
      </PageHeader>

      {error && (
        <Alert variant="danger" onClose={() => setError("")} dismissible>
          {error}
        </Alert>
      )}

      {chiTaiKhoanBn && !chiTaiKhoanBnLienKet && (
        <Alert variant="warning" className="mb-3">
          Tài khoản của bạn chưa được liên kết với hồ sơ bệnh nhân trong hệ thống.
          Vui lòng liên hệ quầy lễ tân để được hỗ trợ.
        </Alert>
      )}

      {chiTaiKhoanBnLienKet && (
        <Alert variant="light" className="border mb-3">
          Form chỉnh sửa hồ sơ sẽ mở tự động. Nếu đã đóng, nhấn{" "}
          <Button
            size="sm"
            variant="primary"
            className="mx-1"
            type="button"
            onClick={() => user.maBenhNhan != null && openEditModal(user.maBenhNhan)}
          >
            Mở hồ sơ
          </Button>
          để xem lại.
        </Alert>
      )}

      {!chiTaiKhoanBn && (
      <Card className="mb-3 card--static border-0 shadow-sm">
        <Card.Body className="p-3">
          <Row className="g-2">
            <Col md={6} lg={3}>
              <Form.Select
                value={filterTrangThaiHoSo ?? "hoat-dong"}
                onChange={(e) => {
                  setFilterTrangThaiHoSo(
                    e.target.value as BenhNhanDanhSachLoc["trangThaiHoSo"],
                  );
                  setPage(0);
                }}
              >
                <option value="hoat-dong">Hồ sơ đang hoạt động</option>
                <option value="an">Hồ sơ đã ẩn</option>
                <option value="tat-ca">Tất cả hồ sơ</option>
              </Form.Select>
            </Col>
            <Col md={6} lg={2}>
              <Form.Select
                value={filterGioiTinh}
                onChange={(e) => {
                  setFilterGioiTinh(e.target.value);
                  setPage(0);
                }}
              >
                <option value="">Mọi giới tính</option>
                <option value="NAM">Nam</option>
                <option value="NU">Nữ</option>
                <option value="KHAC">Khác</option>
              </Form.Select>
            </Col>
            <Col md={6} lg={2}>
              <Form.Select
                value={filterNhomMau}
                onChange={(e) => {
                  setFilterNhomMau(e.target.value);
                  setPage(0);
                }}
              >
                <option value="">Mọi nhóm máu</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="AB">AB</option>
                <option value="O">O</option>
              </Form.Select>
            </Col>
            <Col md={12} lg={4}>
              <Form.Control
                placeholder="Tìm theo tên..."
                value={filterTen}
                onChange={(e) => setFilterTen(e.target.value)}
              />
            </Col>
            <Col md={6} lg={1} className="d-flex align-items-stretch">
              <Button
                variant="secondary"
                className="w-100"
                type="button"
                onClick={clearFilters}
              >
                <i className="bi bi-arrow-counterclockwise me-1" aria-hidden />
                Xóa lọc
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      )}

      {!chiTaiKhoanBn && (
        <Card className="card--static border-0 shadow-sm overflow-hidden">
        <div className="table-responsive">
          <Table responsive hover className="mb-0 align-middle">
            <thead>
              <tr>
                <th>Họ tên</th>
                <th>Ngày sinh</th>
                <th>Giới tính</th>
                <th>Nhóm máu</th>
                <th>SĐT</th>
                <th>Email</th>
                <th>Nghề nghiệp</th>
                <th>Địa chỉ</th>
                <th>Trạng thái</th>
                <th className="text-end">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id}>
                  <td className="fw-medium">{p.hoTen}</td>
                  <td className="text-nowrap">{p.ngaySinh || "—"}</td>
                  <td className="text-nowrap">
                    <TagGioiTinh ma={p.gioiTinh} />
                  </td>
                  <td className="text-nowrap">
                    <TagNhomMau nhom={p.nhomMau} />
                  </td>
                  <td className="text-nowrap">{p.soDienThoai || "—"}</td>
                  <td className="text-muted small">
                    {p.thuDienTu ? (
                      <span
                        className="text-truncate d-inline-block align-bottom"
                        style={{ maxWidth: "11rem" }}
                        title={p.thuDienTu}
                      >
                        {p.thuDienTu}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="text-muted small">
                    {p.ngheNghiep ? (
                      <span
                        className="text-truncate d-inline-block align-bottom"
                        style={{ maxWidth: "9rem" }}
                        title={p.ngheNghiep}
                      >
                        {p.ngheNghiep}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="text-muted small">
                    {p.diaChi ? (
                      <span
                        className="text-truncate d-inline-block align-bottom"
                        style={{ maxWidth: "14rem" }}
                        title={p.diaChi}
                      >
                        {p.diaChi}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    {p.hoatDong === false ? (
                      <span className="badge bg-secondary">Đã ẩn</span>
                    ) : (
                      <span className="badge bg-success-subtle text-success-emphasis border border-success-subtle">
                        Hoạt động
                      </span>
                    )}
                  </td>
                  <td className="text-end text-nowrap">
                    <Button
                      size="sm"
                      variant="primary"
                      className="me-1 btn-action-edit"
                      onClick={() => p.id != null && openEditModal(p.id)}
                    >
                      <i className="bi bi-pencil me-1" aria-hidden />
                      Sửa
                    </Button>
                    <Link
                      href={`/lich-hen?maBenhNhan=${p.id}`}
                      className="btn btn-sm btn-info btn-action-calendar"
                    >
                      <i className="bi bi-calendar3 me-1" aria-hidden />
                      Lịch
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        {total > size && (
          <Card.Footer className="bg-light border-top py-3">
            <Pagination className="mb-0 justify-content-center">
              <Pagination.Prev
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              />
              <Pagination.Item active>
                {page + 1} / {Math.ceil(total / size)}
              </Pagination.Item>
              <Pagination.Next
                disabled={page >= Math.ceil(total / size) - 1}
                onClick={() => setPage((p) => p + 1)}
              />
            </Pagination>
          </Card.Footer>
        )}
      </Card>
      )}

      <Modal
        show={showCreate}
        onHide={() => !submitting && setShowCreate(false)}
        centered
        size="xl"
        dialogClassName="patient-create-modal-dialog"
        contentClassName="patient-create-modal"
      >
        <Modal.Header closeButton className="border-0 pb-2">
          <div className="d-flex align-items-start gap-3 w-100 pe-1">
            <div className="patient-create-modal__icon" aria-hidden>
              <i className="bi bi-person-heart" />
            </div>
            <div className="min-w-0 flex-grow-1">
              <Modal.Title as="h5" className="patient-create-modal__title mb-1">
                Thêm bệnh nhân
              </Modal.Title>
              <p className="patient-create-modal__subtitle mb-0">
                Điền thông tin hồ sơ. Chỉ{" "}
                <span className="text-danger fw-semibold">họ tên</span> là bắt
                buộc — các mục khác có thể bỏ trống.
              </p>
            </div>
          </div>
        </Modal.Header>
        <Form onSubmit={handleCreate}>
          <Modal.Body className="patient-create-modal__body pt-0">
            <PatientRecordFormFields
              form={createForm}
              setForm={setCreateForm}
            />
          </Modal.Body>
          <Modal.Footer className="patient-create-modal__footer">
            <Button
              variant="light"
              className="border"
              onClick={() => setShowCreate(false)}
              disabled={submitting}
            >
              <i className="bi bi-x-lg me-2" aria-hidden />
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="px-4"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden
                  />
                  Đang lưu…
                </>
              ) : (
                <>
                  <i className="bi bi-check2-circle me-2" aria-hidden />
                  Lưu hồ sơ
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal
        show={showEdit}
        onHide={closeEditModal}
        centered
        size="xl"
        dialogClassName="patient-create-modal-dialog"
        contentClassName="patient-create-modal"
        backdrop={editSubmitting ? "static" : true}
        keyboard={!editSubmitting}
      >
        <Modal.Header closeButton={!editSubmitting} className="border-0 pb-2">
          <div className="d-flex align-items-start gap-3 w-100 pe-1">
            <div className="patient-create-modal__icon" aria-hidden>
              <i className="bi bi-pencil-square" />
            </div>
            <div className="min-w-0 flex-grow-1">
              <Modal.Title as="h5" className="patient-create-modal__title mb-1">
                Cập nhật bệnh nhân
              </Modal.Title>
              <p className="patient-create-modal__subtitle mb-0">
                Chỉnh sửa hồ sơ và lưu.{" "}
                <span className="text-danger fw-semibold">Họ tên</span> là bắt
                buộc.
              </p>
            </div>
          </div>
        </Modal.Header>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Body className="patient-create-modal__body pt-0">
            {editError && (
              <Alert
                variant="danger"
                className="mb-3 py-2"
                dismissible
                onClose={() => setEditError("")}
              >
                {editError}
              </Alert>
            )}
            {editLoading ? (
              <div className="text-center py-5 text-muted">
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                />
                Đang tải hồ sơ…
              </div>
            ) : (
              <>
                <PatientRecordFormFields
                  form={editForm}
                  setForm={setEditForm}
                />
                {visitHistory.length > 0 && (
                  <section className="patient-create-modal__section mt-1">
                    <div className="patient-create-modal__section-title">
                      Lịch sử khám
                    </div>
                    <div className="table-responsive rounded border">
                      <Table responsive size="sm" className="mb-0 align-middle">
                        <thead className="table-light">
                          <tr>
                            <th>Ngày</th>
                            <th>Giờ</th>
                            <th>Bác sĩ</th>
                            <th>Dịch vụ</th>
                            <th>Trạng thái</th>
                            <th className="text-end"> </th>
                          </tr>
                        </thead>
                        <tbody>
                          {visitHistory.map((a) => (
                            <tr key={a.id}>
                              <td className="text-nowrap">{a.ngayHen}</td>
                              <td className="text-nowrap">{a.gioHen}</td>
                              <td>{a.tenBacSi}</td>
                              <td>{a.tenDichVu}</td>
                              <td>{a.trangThai}</td>
                              <td className="text-end text-nowrap">
                                <Link
                                  href={`/lich-hen/${a.id}`}
                                  className="btn btn-sm btn-outline-primary"
                                >
                                  Chi tiết
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </section>
                )}
              </>
            )}
          </Modal.Body>
          <Modal.Footer className="patient-create-modal__footer d-flex flex-wrap gap-2 justify-content-between">
            <div className="d-flex flex-wrap gap-2">
              <Button
                variant="light"
                className="border"
                type="button"
                onClick={closeEditModal}
                disabled={editSubmitting}
              >
                <i className="bi bi-x-lg me-2" aria-hidden />
                Hủy
              </Button>
              {editForm.hoatDong === false ? (
                <Button
                  type="button"
                  variant="outline-success"
                  disabled={editLoading || editSubmitting}
                  onClick={() => setShowConfirmHienThiLai(true)}
                >
                  <i className="bi bi-eye me-2" aria-hidden />
                  Hiển thị lại hồ sơ
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline-danger"
                  disabled={editLoading || editSubmitting}
                  onClick={() => setShowConfirmAnHoSo(true)}
                >
                  <i className="bi bi-eye-slash me-2" aria-hidden />
                  Ẩn hồ sơ
                </Button>
              )}
            </div>
            <Button
              type="submit"
              variant="primary"
              className="px-4"
              disabled={editLoading || editSubmitting}
            >
              {editSubmitting ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden
                  />
                  Đang lưu…
                </>
              ) : (
                <>
                  <i className="bi bi-check2-circle me-2" aria-hidden />
                  Lưu thay đổi
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal
        show={showConfirmAnHoSo}
        onHide={() => !editSubmitting && setShowConfirmAnHoSo(false)}
        centered
        backdrop="static"
        keyboard={!editSubmitting}
      >
        <Modal.Header closeButton={!editSubmitting}>
          <Modal.Title as="h6" className="mb-0">
            Ẩn hồ sơ bệnh nhân?
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="small">
          <p className="text-muted mb-0">
            Hồ sơ sẽ không còn hiển thị trong danh sách mặc định. Bạn có thể tìm lại khi lọc{" "}
            <strong>Tất cả hồ sơ</strong> hoặc <strong>Hồ sơ đã ẩn</strong>.
          </p>
        </Modal.Body>
        <Modal.Footer className="border-top">
          <Button
            variant="light"
            className="border"
            type="button"
            disabled={editSubmitting}
            onClick={() => setShowConfirmAnHoSo(false)}
          >
            Hủy
          </Button>
          <Button
            type="button"
            variant="danger"
            disabled={editSubmitting}
            onClick={handleConfirmAnHoSo}
          >
            {editSubmitting ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden
                />
                Đang xử lý…
              </>
            ) : (
              <>
                <i className="bi bi-eye-slash me-2" aria-hidden />
                Ẩn hồ sơ
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showConfirmHienThiLai}
        onHide={() => !editSubmitting && setShowConfirmHienThiLai(false)}
        centered
        backdrop="static"
        keyboard={!editSubmitting}
      >
        <Modal.Header closeButton={!editSubmitting}>
          <Modal.Title as="h6" className="mb-0">
            Hiển thị lại hồ sơ?
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="small">
          <p className="text-muted mb-0">
            Hồ sơ sẽ xuất hiện trở lại trong danh sách <strong>Hồ sơ đang hoạt động</strong> và lọc mặc định.
          </p>
        </Modal.Body>
        <Modal.Footer className="border-top">
          <Button
            variant="light"
            className="border"
            type="button"
            disabled={editSubmitting}
            onClick={() => setShowConfirmHienThiLai(false)}
          >
            Hủy
          </Button>
          <Button
            type="button"
            variant="success"
            disabled={editSubmitting}
            onClick={handleConfirmHienThiLai}
          >
            {editSubmitting ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden
                />
                Đang xử lý…
              </>
            ) : (
              <>
                <i className="bi bi-eye me-2" aria-hidden />
                Hiển thị lại
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default function PatientsPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <BenhNhanPageInner />
    </Suspense>
  );
}
