"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Table,
  Card,
  Form,
  Alert,
  Badge,
  Modal,
  Button,
  Dropdown,
} from "react-bootstrap";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import {
  appointmentsApi,
  patientsApi,
  doctorsApi,
  servicesApi,
  type LichHen,
  type BenhNhan,
  type BacSi,
  type DichVu,
} from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { LoadingState } from "@/components/LoadingState";
import { notify } from "@/lib/notify";
import { LICH_HEN_STATUS_LABEL as STATUS_LABEL } from "@/lib/lichHenStatus";

const TRANG_THAI_CO_LICH_DANG_XU_LY = new Set([
  "DA_DAT",
  "DA_TIEP_NHAN",
  "DANG_KHAM",
  "XET_NGHIEM",
  "DA_KE_DON",
]);

function AppointmentsPageInner() {
  const searchParams = useSearchParams();
  const maBenhNhanParam = searchParams.get("maBenhNhan");
  const { user, loading } = useAuth();
  const router = useRouter();
  const [list, setList] = useState<LichHen[]>([]);
  const [from, setFrom] = useState(() => new Date().toISOString().slice(0, 10));
  const [to, setTo] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });
  const [error, setError] = useState("");
  const [listTick, setListTick] = useState(0);

  const [showDatLich, setShowDatLich] = useState(false);
  const [patients, setPatients] = useState<BenhNhan[]>([]);
  const [doctors, setDoctors] = useState<BacSi[]>([]);
  const [services, setServices] = useState<DichVu[]>([]);
  const [patientId, setPatientId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("08:00");
  const [note, setNote] = useState("");
  const [modalError, setModalError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [maBenhNhanKhongThemLich, setMaBenhNhanKhongThemLich] = useState<
    Set<number>
  >(() => new Set());
  const [locBenhNhan, setLocBenhNhan] = useState("");
  const [locBacSi, setLocBacSi] = useState("");
  const [locDichVu, setLocDichVu] = useState("");
  /** Lọc danh sách trang (theo tên bác sĩ + trạng thái) */
  const [timBacSiTrang, setTimBacSiTrang] = useState("");
  const [locTrangThaiBang, setLocTrangThaiBang] = useState("");

  const resetDatLichForm = useCallback(() => {
    setPatientId(maBenhNhanParam ? String(Number(maBenhNhanParam)) : "");
    setDoctorId("");
    setServiceId("");
    setAppointmentDate(new Date().toISOString().slice(0, 10));
    setAppointmentTime("08:00");
    setNote("");
    setModalError("");
    setLocBenhNhan("");
    setLocBacSi("");
    setLocDichVu("");
  }, [maBenhNhanParam]);

  const openDatLichModal = useCallback(() => {
    resetDatLichForm();
    setShowDatLich(true);
  }, [resetDatLichForm]);

  useEffect(() => {
    if (!loading && !user) router.replace("/dang-nhap");
  }, [user, loading, router]);

  useEffect(() => {
    if (searchParams.get("datLich") !== "1" || !user) return;
    resetDatLichForm();
    setShowDatLich(true);
    const bn = searchParams.get("maBenhNhan");
    router.replace(
      bn ? `/lich-hen?maBenhNhan=${encodeURIComponent(bn)}` : "/lich-hen",
      { scroll: false },
    );
  }, [searchParams, user, router, resetDatLichForm]);

  useEffect(() => {
    if (!user) return;
    appointmentsApi
      .list(from, to, 0, 100)
      .then((r) => setList(r.content))
      .catch((e) => setError(e.message));
  }, [user, from, to, listTick]);

  useEffect(() => {
    if (!showDatLich || !user) return;
    let cancelled = false;
    patientsApi
      .list(0, 500)
      .then((r) => {
        if (!cancelled) setPatients(r.content ?? []);
      })
      .catch(() => {});
    doctorsApi
      .list()
      .then((d) => {
        if (!cancelled) setDoctors(d ?? []);
      })
      .catch(() => {});
    servicesApi
      .list()
      .then((s) => {
        if (!cancelled) setServices(s ?? []);
      })
      .catch(() => {});

    const tu = new Date();
    tu.setDate(tu.getDate() - 14);
    const den = new Date();
    den.setFullYear(den.getFullYear() + 1);
    const tuStr = tu.toISOString().slice(0, 10);
    const denStr = den.toISOString().slice(0, 10);
    appointmentsApi
      .list(tuStr, denStr, 0, 5000)
      .then((r) => {
        if (cancelled) return;
        const blocked = new Set<number>();
        for (const a of r.content ?? []) {
          const ma = a.maBenhNhan;
          const tt = a.trangThai ?? "";
          if (ma != null && TRANG_THAI_CO_LICH_DANG_XU_LY.has(tt)) {
            blocked.add(ma);
          }
        }
        setMaBenhNhanKhongThemLich(blocked);
      })
      .catch(() => {
        if (!cancelled) setMaBenhNhanKhongThemLich(new Set());
      });

    return () => {
      cancelled = true;
    };
  }, [showDatLich, user]);

  const benhNhanDuocChon = useMemo(() => {
    return patients.filter(
      (p) => p.id != null && !maBenhNhanKhongThemLich.has(p.id),
    );
  }, [patients, maBenhNhanKhongThemLich]);

  const benhNhanSauLoc = useMemo(() => {
    const q = locBenhNhan.trim().toLowerCase();
    if (!q) return benhNhanDuocChon;
    return benhNhanDuocChon.filter(
      (p) =>
        (p.hoTen ?? "").toLowerCase().includes(q) ||
        (p.soDienThoai ?? "").replace(/\s/g, "").includes(q.replace(/\s/g, "")),
    );
  }, [benhNhanDuocChon, locBenhNhan]);

  const bacSiSauLoc = useMemo(() => {
    const q = locBacSi.trim().toLowerCase();
    if (!q) return doctors;
    return doctors.filter((d) => {
      const ck = (d.tenChuyenKhoa ?? d.chuyenMon ?? "").toLowerCase();
      return (d.hoTen ?? "").toLowerCase().includes(q) || ck.includes(q);
    });
  }, [doctors, locBacSi]);

  const dichVuSauLoc = useMemo(() => {
    const q = locDichVu.trim().toLowerCase();
    if (!q) return services;
    return services.filter((s) => {
      const ten = (s.ten ?? "").toLowerCase();
      const gia = s.gia != null ? String(s.gia) : "";
      return ten.includes(q) || gia.includes(q);
    });
  }, [services, locDichVu]);

  useEffect(() => {
    if (!showDatLich) return;
    const id = Number(patientId);
    if (patientId && !Number.isNaN(id) && maBenhNhanKhongThemLich.has(id)) {
      setModalError(
        "Bệnh nhân này đã có lịch đang xử lý — hoàn thành hoặc hủy lịch cũ trước khi đặt thêm.",
      );
      setPatientId("");
    }
  }, [showDatLich, patientId, maBenhNhanKhongThemLich]);

  const chonBenhNhanLabel = useMemo(() => {
    if (!patientId) return "— Chọn bệnh nhân —";
    const p = patients.find((x) => String(x.id) === patientId);
    if (!p) return "— Chọn bệnh nhân —";
    return `${p.hoTen}${p.soDienThoai ? ` (${p.soDienThoai})` : ""}`;
  }, [patientId, patients]);

  const chonBacSiLabel = useMemo(() => {
    if (!doctorId) return "— Chọn bác sĩ —";
    const d = doctors.find((x) => String(x.id) === doctorId);
    if (!d) return "— Chọn bác sĩ —";
    const ck = d.tenChuyenKhoa ?? d.chuyenMon;
    return ck ? `${d.hoTen} — ${ck}` : d.hoTen;
  }, [doctorId, doctors]);

  const chonDichVuLabel = useMemo(() => {
    if (!serviceId) return "— Chọn dịch vụ —";
    const s = services.find((x) => String(x.id) === serviceId);
    if (!s) return "— Chọn dịch vụ —";
    return s.gia != null
      ? `${s.ten} — ${s.gia.toLocaleString("vi-VN")}đ`
      : s.ten;
  }, [serviceId, services]);

  const danhSachLoc = useMemo(() => {
    let rows = list.filter(
      (a) =>
        !maBenhNhanParam ||
        a.maBenhNhan === Number(maBenhNhanParam),
    );
    const q = timBacSiTrang.trim().toLowerCase();
    if (q) {
      rows = rows.filter((a) =>
        (a.tenBacSi ?? "").toLowerCase().includes(q),
      );
    }
    if (locTrangThaiBang) {
      rows = rows.filter((a) => (a.trangThai ?? "") === locTrangThaiBang);
    }
    return rows;
  }, [list, maBenhNhanParam, timBacSiTrang, locTrangThaiBang]);

  const handleDatLichSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");
    if (!patientId.trim()) {
      setModalError("Vui lòng chọn bệnh nhân.");
      return;
    }
    if (!doctorId.trim()) {
      setModalError("Vui lòng chọn bác sĩ.");
      return;
    }
    if (!serviceId.trim()) {
      setModalError("Vui lòng chọn dịch vụ.");
      return;
    }
    const pid = Number(patientId);
    if (!Number.isNaN(pid) && maBenhNhanKhongThemLich.has(pid)) {
      setModalError(
        "Bệnh nhân này đã có lịch đang xử lý — không thể đặt thêm.",
      );
      return;
    }
    setSubmitting(true);
    try {
      await appointmentsApi.create({
        patientId: Number(patientId),
        doctorId: Number(doctorId),
        serviceId: Number(serviceId),
        appointmentDate,
        appointmentTime,
        note: note || undefined,
      });
      setShowDatLich(false);
      setListTick((t) => t + 1);
    } catch (err: unknown) {
      setModalError(err instanceof Error ? err.message : "Không đặt được lịch");
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportCsv = () => {
    const rows = danhSachLoc;
    if (rows.length === 0) {
      notify.warning("Chưa có dữ liệu để xuất CSV");
      return;
    }
    const csvEscape = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const header = [
      "MaLichHen",
      "NgayHen",
      "GioHen",
      "TenBenhNhan",
      "TenBacSi",
      "TenDichVu",
      "TrangThai",
    ];
    const dataRows = rows.map((a) => [
      String(a.id ?? ""),
      csvEscape(a.ngayHen ?? ""),
      csvEscape(a.gioHen ?? ""),
      csvEscape(a.tenBenhNhan ?? ""),
      csvEscape(a.tenBacSi ?? ""),
      csvEscape(a.tenDichVu ?? ""),
      csvEscape(
        STATUS_LABEL[a.trangThai ?? ""] ?? (a.trangThai ?? ""),
      ),
    ]);
    const content = [header.join(","), ...dataRows.map((r) => r.join(","))].join(
      "\n",
    );
    const bom = "\uFEFF";
    const blob = new Blob([bom + content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    const now = new Date();
    const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;
    anchor.href = url;
    anchor.download = `lich-kham-${stamp}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <LoadingState />;
  if (!user) return null;

  return (
    <div className="lich-hen-page">
      <PageHeader
        title="Lịch khám"
        subtitle="Lọc ngày, tìm bác sĩ, trạng thái — xem và mở chi tiết từng lượt khám."
      >
        <div className="d-flex flex-wrap gap-2 align-items-center">
          <Button
            className="btn-service-export d-inline-flex align-items-center gap-2"
            onClick={handleExportCsv}
          >
            <i className="bi bi-filetype-csv" aria-hidden />
            Export CSV
          </Button>
          <Button
            variant="primary"
            className="d-inline-flex align-items-center gap-2"
            onClick={openDatLichModal}
          >
            <i className="bi bi-plus-lg" aria-hidden />
            Đặt lịch mới
          </Button>
        </div>
      </PageHeader>
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      <Card className="mb-3 card--static border-0 shadow-sm">
        <Card.Body>
          <div className="d-flex flex-wrap gap-3 align-items-end">
            <Form.Group>
              <Form.Label>Từ ngày</Form.Label>
              <Form.Control
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Đến ngày</Form.Label>
              <Form.Control
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="flex-grow-1" style={{ minWidth: "14rem" }}>
              <Form.Label>Tìm bác sĩ</Form.Label>
              <Form.Control
                type="search"
                placeholder="Tên bác sĩ…"
                value={timBacSiTrang}
                onChange={(e) => setTimBacSiTrang(e.target.value)}
                autoComplete="off"
                aria-label="Tìm theo bác sĩ"
              />
            </Form.Group>
            <Form.Group style={{ minWidth: "12rem" }}>
              <Form.Label>Trạng thái</Form.Label>
              <Form.Select
                value={locTrangThaiBang}
                onChange={(e) => setLocTrangThaiBang(e.target.value)}
                aria-label="Lọc theo trạng thái"
              >
                <option value="">Tất cả trạng thái</option>
                {(Object.keys(STATUS_LABEL) as Array<keyof typeof STATUS_LABEL>).map(
                  (key) => (
                    <option key={key} value={key}>
                      {STATUS_LABEL[key]}
                    </option>
                  ),
                )}
              </Form.Select>
            </Form.Group>
          </div>
        </Card.Body>
      </Card>
      <Card className="card--static border-0 shadow-sm overflow-hidden">
        <div className="table-responsive">
          <Table responsive hover className="mb-0 align-middle">
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Giờ</th>
                <th>Bệnh nhân</th>
                <th>Bác sĩ</th>
                <th>Dịch vụ</th>
                <th>Trạng thái</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {danhSachLoc.map((a) => (
                <tr key={a.id}>
                  <td>{a.ngayHen}</td>
                  <td>{a.gioHen}</td>
                  <td>{a.tenBenhNhan}</td>
                  <td>{a.tenBacSi}</td>
                  <td>{a.tenDichVu}</td>
                  <td>
                    <Badge bg="secondary">
                      {STATUS_LABEL[a.trangThai || ""] || a.trangThai}
                    </Badge>
                  </td>
                  <td className="text-end">
                    <Link
                      href={`/lich-hen/${a.id}`}
                      className="btn btn-sm btn-outline-primary"
                    >
                      <i className="bi bi-arrow-right-circle me-1" />
                      Chi tiết
                    </Link>
                  </td>
                </tr>
              ))}
              {danhSachLoc.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-4">
                    Không có lịch khám khớp bộ lọc.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </Table>
        </div>
      </Card>

      <Modal
        show={showDatLich}
        onHide={() => !submitting && setShowDatLich(false)}
        centered
        size="lg"
        enforceFocus={false}
        backdrop={submitting ? "static" : true}
        keyboard={!submitting}
      >
        <Modal.Header closeButton={!submitting}>
          <Modal.Title as="h5">Đặt lịch khám</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleDatLichSubmit}>
          <Modal.Body className="pt-2">
            {modalError && (
              <Alert
                variant="danger"
                className="py-2 mb-3"
                dismissible
                onClose={() => setModalError("")}
              >
                {modalError}
              </Alert>
            )}
            <Form.Group className="mb-3">
              <Form.Label className="required" id="label-dat-bn">
                Bệnh nhân
              </Form.Label>
              <Dropdown className="bac-si-ck-dropdown w-100">
                <Dropdown.Toggle
                  variant="outline-secondary"
                  id="dropdown-dat-benh-nhan"
                  className="w-100 text-start d-flex justify-content-between align-items-center"
                  aria-labelledby="label-dat-bn"
                >
                  <span className="text-truncate me-2 flex-grow-1">
                    {chonBenhNhanLabel}
                  </span>
                </Dropdown.Toggle>
                <Dropdown.Menu className="bac-si-ck-dropdown__menu w-100 shadow-sm pt-2 px-2 pb-2">
                  <Form.Control
                    size="sm"
                    type="search"
                    placeholder="Tìm trong danh sách…"
                    value={locBenhNhan}
                    onChange={(e) => setLocBenhNhan(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                    autoComplete="off"
                    aria-label="Lọc bệnh nhân"
                    className="mb-2"
                  />
                  <div
                    className="bac-si-ck-dropdown__list border rounded"
                    style={{ maxHeight: 220, overflowY: "auto" }}
                  >
                    {benhNhanSauLoc.length === 0 ? (
                      <div className="px-2 py-3 text-muted small text-center">
                        {benhNhanDuocChon.length === 0
                          ? "Không có bệnh nhân khả dụng (đều đang có lịch chưa kết thúc)."
                          : "Không tìm thấy tên hoặc SĐT khớp."}
                      </div>
                    ) : (
                      benhNhanSauLoc.map((p) => (
                        <Dropdown.Item
                          key={p.id}
                          active={String(p.id) === patientId}
                          onClick={() => {
                            setPatientId(String(p.id));
                            setLocBenhNhan("");
                          }}
                        >
                          {p.hoTen}
                          {p.soDienThoai ? ` (${p.soDienThoai})` : ""}
                        </Dropdown.Item>
                      ))
                    )}
                  </div>
                </Dropdown.Menu>
              </Dropdown>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="required" id="label-dat-bs">
                Bác sĩ
              </Form.Label>
              <Dropdown className="bac-si-ck-dropdown w-100">
                <Dropdown.Toggle
                  variant="outline-secondary"
                  id="dropdown-dat-bac-si"
                  className="w-100 text-start d-flex justify-content-between align-items-center"
                  aria-labelledby="label-dat-bs"
                >
                  <span className="text-truncate me-2 flex-grow-1">
                    {chonBacSiLabel}
                  </span>
                </Dropdown.Toggle>
                <Dropdown.Menu className="bac-si-ck-dropdown__menu w-100 shadow-sm pt-2 px-2 pb-2">
                  <Form.Control
                    size="sm"
                    type="search"
                    placeholder="Tìm trong danh sách…"
                    value={locBacSi}
                    onChange={(e) => setLocBacSi(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                    autoComplete="off"
                    aria-label="Lọc bác sĩ"
                    className="mb-2"
                  />
                  <div
                    className="bac-si-ck-dropdown__list border rounded"
                    style={{ maxHeight: 220, overflowY: "auto" }}
                  >
                    {bacSiSauLoc.length === 0 ? (
                      <div className="px-2 py-3 text-muted small text-center">
                        {doctors.length === 0
                          ? "Chưa có bác sĩ trong hệ thống."
                          : "Không có kết quả khớp bộ lọc."}
                      </div>
                    ) : (
                      bacSiSauLoc.map((d) => (
                        <Dropdown.Item
                          key={d.id}
                          active={String(d.id) === doctorId}
                          onClick={() => {
                            setDoctorId(String(d.id));
                            setLocBacSi("");
                          }}
                        >
                          {d.hoTen}
                          {d.tenChuyenKhoa || d.chuyenMon
                            ? ` — ${d.tenChuyenKhoa ?? d.chuyenMon}`
                            : ""}
                        </Dropdown.Item>
                      ))
                    )}
                  </div>
                </Dropdown.Menu>
              </Dropdown>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="required" id="label-dat-dv">
                Dịch vụ
              </Form.Label>
              <Dropdown className="bac-si-ck-dropdown w-100">
                <Dropdown.Toggle
                  variant="outline-secondary"
                  id="dropdown-dat-dich-vu"
                  className="w-100 text-start d-flex justify-content-between align-items-center"
                  aria-labelledby="label-dat-dv"
                >
                  <span className="text-truncate me-2 flex-grow-1">
                    {chonDichVuLabel}
                  </span>
                </Dropdown.Toggle>
                <Dropdown.Menu className="bac-si-ck-dropdown__menu w-100 shadow-sm pt-2 px-2 pb-2">
                  <Form.Control
                    size="sm"
                    type="search"
                    placeholder="Tìm trong danh sách…"
                    value={locDichVu}
                    onChange={(e) => setLocDichVu(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                    autoComplete="off"
                    aria-label="Lọc dịch vụ"
                    className="mb-2"
                  />
                  <div
                    className="bac-si-ck-dropdown__list border rounded"
                    style={{ maxHeight: 220, overflowY: "auto" }}
                  >
                    {dichVuSauLoc.length === 0 ? (
                      <div className="px-2 py-3 text-muted small text-center">
                        {services.length === 0
                          ? "Chưa có dịch vụ trong hệ thống."
                          : "Không có kết quả khớp bộ lọc."}
                      </div>
                    ) : (
                      dichVuSauLoc.map((s) => (
                        <Dropdown.Item
                          key={s.id}
                          active={String(s.id) === serviceId}
                          onClick={() => {
                            setServiceId(String(s.id));
                            setLocDichVu("");
                          }}
                        >
                          {s.ten} —{" "}
                          {s.gia != null
                            ? `${s.gia.toLocaleString("vi-VN")}đ`
                            : "—"}
                        </Dropdown.Item>
                      ))
                    )}
                  </div>
                </Dropdown.Menu>
              </Dropdown>
            </Form.Group>
            <div className="row g-3">
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="required">Ngày khám</Form.Label>
                  <Form.Control
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    required
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="required">Giờ khám</Form.Label>
                  <Form.Control
                    type="time"
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    required
                  />
                </Form.Group>
              </div>
            </div>
            <Form.Group className="mb-0 mt-3">
              <Form.Label>Ghi chú</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Tuỳ chọn"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="clinic-modal-footer bac-si-modal-footer border-top">
            <Button
              variant="secondary"
              type="button"
              className="btn-bac-si-modal-cancel"
              disabled={submitting}
              onClick={() => setShowDatLich(false)}
            >
              <i className="bi bi-x-circle me-2" aria-hidden />
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="btn-bac-si-modal-primary px-4"
              disabled={submitting}
            >
              {submitting ? (
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
                  <i className="bi bi-calendar-check me-2" aria-hidden />
                  Đặt lịch
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default function AppointmentsPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <AppointmentsPageInner />
    </Suspense>
  );
}
