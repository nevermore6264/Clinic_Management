"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  Table,
  Button,
  Form,
  Alert,
  Row,
  Col,
  Badge,
  Spinner,
} from "react-bootstrap";
import { useAuth } from "@/lib/useAuth";
import { laChiTaiKhoanBenhNhan } from "@/lib/roles";
import { PageHeader } from "@/components/PageHeader";
import { LICH_HEN_STATUS_LABEL } from "@/lib/lichHenStatus";
import {
  doctorsApi,
  doctorSchedulesApi,
  appointmentsApi,
  type BacSi,
  type LichLamViecBacSi,
  type LichHen,
} from "@/lib/api";

function NhanNguonLich({ s }: { s: LichLamViecBacSi }) {
  if (s.nguonBanGhi === "CO_DINH") {
    return (
      <span className="badge rounded-pill bg-primary-subtle text-primary-emphasis border border-primary-subtle fw-normal">
        Tuần
      </span>
    );
  }
  if (s.nguonBanGhi === "NGOAI_LE") {
    if (s.nghiCaNgay) {
      return (
        <span className="badge rounded-pill bg-warning-subtle text-warning-emphasis border border-warning-subtle fw-normal">
          Nghỉ
        </span>
      );
    }
    return (
      <span className="badge rounded-pill bg-info-subtle text-info-emphasis border border-info-subtle fw-normal">
        Ngoại lệ
      </span>
    );
  }
  if (s.nguonBanGhi === "LICH_BAC_SI_THU_VIEN") {
    return (
      <span className="badge rounded-pill bg-secondary-subtle text-secondary-emphasis border border-secondary-subtle fw-normal">
        Cũ
      </span>
    );
  }
  return (
    <span className="badge rounded-pill bg-light text-muted border fw-normal">—</span>
  );
}

function formatNgay(iso: string) {
  try {
    const [y, m, d] = iso.split("-").map(Number);
    if (!y || !m || !d) return iso;
    return new Date(y, m - 1, d).toLocaleDateString("vi-VN", {
      weekday: "short",
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function LichLamViecBacSisPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [doctors, setDoctors] = useState<BacSi[]>([]);
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [schedules, setSchedules] = useState<LichLamViecBacSi[]>([]);
  const [appointments, setAppointments] = useState<LichHen[]>([]);
  const [error, setError] = useState("");
  const [bangTai, setBangTai] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newSlot, setNewSlot] = useState({
    khungGioBatDau: "08:00",
    khungGioKetThuc: "09:00",
  });

  useEffect(() => {
    if (!loading && !user) router.replace("/dang-nhap");
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading && user && laChiTaiKhoanBenhNhan(user)) {
      router.replace("/bang-dieu-khien");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    doctorsApi
      .list()
      .then(setDoctors)
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!user || !doctorId || !date) {
      setSchedules([]);
      setAppointments([]);
      setBangTai(false);
      return;
    }
    let cancelled = false;
    setBangTai(true);
    setError("");
    (async () => {
      try {
        const [sc, ap] = await Promise.all([
          doctorSchedulesApi.byDoctor(Number(doctorId), date),
          appointmentsApi.byDoctor(Number(doctorId), date).catch(() => [] as LichHen[]),
        ]);
        if (cancelled) return;
        setSchedules(Array.isArray(sc) ? sc : []);
        setAppointments(Array.isArray(ap) ? ap : []);
      } catch (e: unknown) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Không tải được dữ liệu");
          setSchedules([]);
          setAppointments([]);
        }
      } finally {
        if (!cancelled) setBangTai(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, doctorId, date]);

  const handleAddSlot = async () => {
    if (!doctorId) return;
    setError("");
    try {
      await doctorSchedulesApi.create({
        maBacSi: Number(doctorId),
        ngayLich: date,
        khungGioBatDau: newSlot.khungGioBatDau,
        khungGioKetThuc: newSlot.khungGioKetThuc,
      });
      const sc = await doctorSchedulesApi.byDoctor(Number(doctorId), date);
      setSchedules(Array.isArray(sc) ? sc : []);
      setShowAdd(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi");
    }
  };

  const handleDelete = async (s: LichLamViecBacSi) => {
    if (s.id == null) return;
    if (!confirm("Xóa dòng lịch này?")) return;
    setError("");
    try {
      await doctorSchedulesApi.delete(s.id, s.nguonBanGhi);
      const sc = await doctorSchedulesApi.byDoctor(Number(doctorId), date);
      setSchedules(Array.isArray(sc) ? sc : []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi");
    }
  };

  const handleNghiCaNgay = async () => {
    if (!doctorId) return;
    if (!confirm("Đánh dấu nghỉ cả ngày? Bệnh nhân sẽ không đặt được lịch trong ngày này."))
      return;
    setError("");
    try {
      await doctorSchedulesApi.create({
        maBacSi: Number(doctorId),
        ngayLich: date,
        nghiCaNgay: true,
      });
      const sc = await doctorSchedulesApi.byDoctor(Number(doctorId), date);
      setSchedules(Array.isArray(sc) ? sc : []);
      setShowAdd(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi");
    }
  };

  const canEditSchedules =
    user?.cacVaiTro.includes("QUAN_TRI") || user?.cacVaiTro.includes("BAC_SI");

  const tenBacSiChon = doctors.find((d) => String(d.id) === doctorId)?.hoTen;

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" className="text-primary" role="status" />
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className="lich-lam-viec-bs-page">
      <PageHeader
        title="Lịch trực bác sĩ"
        subtitle="Chọn bác sĩ và ngày — xem ca trực và lịch hẹn đã đặt."
      />

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")} className="shadow-sm">
          {error}
        </Alert>
      )}

      <Card className="mb-4 card--static border-0 shadow-sm">
        <Card.Body className="p-4">
          <Row className="g-3 align-items-end">
            <Col md={6} lg={5}>
              <Form.Label className="fw-semibold small text-uppercase text-muted">
                Bác sĩ
              </Form.Label>
              <Form.Select
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                className="border-secondary-subtle"
              >
                <option value="">Chọn bác sĩ…</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.hoTen}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={6} lg={4}>
              <Form.Label className="fw-semibold small text-uppercase text-muted">
                Ngày
              </Form.Label>
              <Form.Control
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border-secondary-subtle"
              />
            </Col>
            {canEditSchedules && doctorId ? (
              <Col lg={3} className="d-flex flex-wrap gap-2 justify-content-lg-end pt-lg-4">
                <Button
                  variant={showAdd ? "outline-secondary" : "primary"}
                  className="d-inline-flex align-items-center gap-2"
                  onClick={() => setShowAdd(!showAdd)}
                >
                  <i className="bi bi-plus-lg" aria-hidden />
                  {showAdd ? "Đóng form" : "Thêm ngoại lệ"}
                </Button>
                <Button
                  variant="outline-warning"
                  className="d-inline-flex align-items-center gap-2"
                  onClick={handleNghiCaNgay}
                >
                  <i className="bi bi-moon" aria-hidden />
                  Nghỉ cả ngày
                </Button>
              </Col>
            ) : null}
          </Row>

          {showAdd && doctorId && canEditSchedules ? (
            <div className="mt-4 p-3 rounded-3 border bg-body-secondary bg-opacity-50">
              <div className="fw-semibold small mb-3 text-muted">
                <i className="bi bi-clock-history me-2" aria-hidden />
                Khung giờ ngoại lệ trong ngày {formatNgay(date)}
              </div>
              <Row className="g-3 align-items-end">
                <Col sm={4} md={3}>
                  <Form.Label className="small">Bắt đầu</Form.Label>
                  <Form.Control
                    type="time"
                    value={newSlot.khungGioBatDau}
                    onChange={(e) =>
                      setNewSlot({ ...newSlot, khungGioBatDau: e.target.value })
                    }
                  />
                </Col>
                <Col sm={4} md={3}>
                  <Form.Label className="small">Kết thúc</Form.Label>
                  <Form.Control
                    type="time"
                    value={newSlot.khungGioKetThuc}
                    onChange={(e) =>
                      setNewSlot({ ...newSlot, khungGioKetThuc: e.target.value })
                    }
                  />
                </Col>
                <Col sm="auto">
                  <Button variant="primary" className="px-4" onClick={handleAddSlot}>
                    <i className="bi bi-check2 me-2" aria-hidden />
                    Lưu
                  </Button>
                </Col>
              </Row>
            </div>
          ) : null}
        </Card.Body>
      </Card>

      {!doctorId ? (
        <Card className="card--static border-0 shadow-sm border border-2 border-dashed">
          <Card.Body className="text-center py-5 px-4">
            <div className="rounded-circle bg-primary-subtle d-inline-flex align-items-center justify-content-center mb-3 mx-auto text-primary-emphasis" style={{ width: 72, height: 72 }}>
              <i className="bi bi-calendar3-week fs-2" aria-hidden />
            </div>
            <h5 className="fw-semibold mb-2">Chưa chọn bác sĩ</h5>
            <p className="text-muted mb-0 mx-auto" style={{ maxWidth: "28rem" }}>
              Chọn bác sĩ và ngày ở trên để xem ca trực và danh sách lịch hẹn.
            </p>
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-4">
          <Col lg={7}>
            <Card className="card--static border-0 shadow-sm h-100 overflow-hidden">
              <Card.Header className="bg-white border-bottom py-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
                <div className="d-flex align-items-center gap-2">
                  <span className="rounded-2 bg-primary-subtle text-primary p-2 d-inline-flex">
                    <i className="bi bi-calendar-week" aria-hidden />
                  </span>
                  <div>
                    <span className="fw-semibold d-block">Ca trong ngày</span>
                    <span className="small text-muted">
                      {tenBacSiChon ? `${tenBacSiChon} · ` : ""}
                      {formatNgay(date)}
                    </span>
                  </div>
                </div>
                {bangTai ? (
                  <Spinner animation="border" size="sm" className="text-primary" />
                ) : null}
              </Card.Header>
              <div className="table-responsive">
                <Table hover className="mb-0 align-middle">
                  <thead className="table-light">
                    <tr className="small text-uppercase text-muted">
                      <th className="border-0 ps-4">Loại</th>
                      <th className="border-0">Bắt đầu</th>
                      <th className="border-0">Kết thúc</th>
                      {canEditSchedules ? (
                        <th className="border-0 text-end pe-4" style={{ width: "1%" }}>
                          Thao tác
                        </th>
                      ) : null}
                    </tr>
                  </thead>
                  <tbody>
                    {schedules.map((s) => (
                      <tr key={`${s.nguonBanGhi ?? "x"}-${s.id}`}>
                        <td className="ps-4">
                          <NhanNguonLich s={s} />
                        </td>
                        {s.nghiCaNgay ? (
                          <td colSpan={2} className="text-warning-emphasis">
                            <i className="bi bi-slash-circle me-2" aria-hidden />
                            Không trực cả ngày
                          </td>
                        ) : (
                          <>
                            <td className="font-monospace">{s.khungGioBatDau ?? "—"}</td>
                            <td className="font-monospace">{s.khungGioKetThuc ?? "—"}</td>
                          </>
                        )}
                        {canEditSchedules ? (
                          <td className="text-end pe-4">
                            <Button
                              size="sm"
                              variant="outline-danger"
                              className="btn-action-delete"
                              onClick={() => handleDelete(s)}
                              disabled={
                                s.nguonBanGhi === "CO_DINH" &&
                                !user?.cacVaiTro.includes("QUAN_TRI")
                              }
                              title={
                                s.nguonBanGhi === "CO_DINH" &&
                                !user?.cacVaiTro.includes("QUAN_TRI")
                                  ? "Chỉ quản trị viên xóa lịch tuần cố định"
                                  : undefined
                              }
                            >
                              <i className="bi bi-trash3" aria-hidden />
                            </Button>
                          </td>
                        ) : null}
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              {!bangTai && schedules.length === 0 ? (
                <Card.Body className="text-center text-muted py-5 border-top">
                  <i className="bi bi-inbox display-6 d-block mb-2 opacity-25" aria-hidden />
                  Không có ca cho ngày này.
                </Card.Body>
              ) : null}
            </Card>
          </Col>

          <Col lg={5}>
            <Card className="card--static border-0 shadow-sm h-100 overflow-hidden">
              <Card.Header className="bg-white border-bottom py-3 d-flex align-items-center gap-2">
                <span className="rounded-2 bg-success-subtle text-success p-2 d-inline-flex">
                  <i className="bi bi-journal-check" aria-hidden />
                </span>
                <div>
                  <span className="fw-semibold d-block">Lịch đã đặt</span>
                  <span className="small text-muted">{appointments.length} lượt</span>
                </div>
              </Card.Header>
              <div className="table-responsive">
                <Table hover className="mb-0 align-middle small">
                  <thead className="table-light">
                    <tr className="small text-uppercase text-muted">
                      <th className="border-0 ps-3">Giờ</th>
                      <th className="border-0">Bệnh nhân</th>
                      <th className="border-0 d-none d-md-table-cell">Dịch vụ</th>
                      <th className="border-0 pe-3">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((a) => (
                      <tr key={a.id}>
                        <td className="ps-3 text-nowrap font-monospace">
                          {a.gioHen != null ? String(a.gioHen).slice(0, 5) : "—"}
                        </td>
                        <td>
                          <span className="fw-medium">{a.tenBenhNhan ?? "—"}</span>
                          <div className="d-md-none text-muted mt-1">{a.tenDichVu ?? "—"}</div>
                        </td>
                        <td className="d-none d-md-table-cell text-muted">
                          {a.tenDichVu ?? "—"}
                        </td>
                        <td className="pe-3 text-nowrap">
                          <Badge bg="secondary" className="fw-normal">
                            {LICH_HEN_STATUS_LABEL[a.trangThai ?? ""] ?? a.trangThai ?? "—"}
                          </Badge>
                          {a.id != null ? (
                            <Link
                              href={`/lich-hen/${a.id}`}
                              className="btn btn-link btn-sm p-0 ms-2 align-baseline"
                            >
                              Chi tiết
                            </Link>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              {appointments.length === 0 ? (
                <Card.Body className="text-center text-muted py-5 border-top">
                  <i className="bi bi-calendar-x display-6 d-block mb-2 opacity-25" aria-hidden />
                  Chưa có lịch đặt.
                </Card.Body>
              ) : null}
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
}
