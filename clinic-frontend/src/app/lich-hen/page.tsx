"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Table, Card, Form, Alert, Badge, Modal, Button } from "react-bootstrap";
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

const STATUS_LABEL: Record<string, string> = {
  DA_DAT: "Đã đặt",
  DA_TIEP_NHAN: "Tiếp nhận",
  DANG_KHAM: "Đang khám",
  XET_NGHIEM: "Xét nghiệm",
  DA_KE_DON: "Đã kê đơn",
  DA_THANH_TOAN: "Đã thanh toán",
  HUY: "Đã hủy",
  VANG: "Không đến",
};

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

  const resetDatLichForm = useCallback(() => {
    setPatientId(maBenhNhanParam ? String(Number(maBenhNhanParam)) : "");
    setDoctorId("");
    setServiceId("");
    setAppointmentDate(new Date().toISOString().slice(0, 10));
    setAppointmentTime("08:00");
    setNote("");
    setModalError("");
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
    return () => {
      cancelled = true;
    };
  }, [showDatLich, user]);

  const handleDatLichSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");
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

  if (loading) return <LoadingState />;
  if (!user) return null;

  return (
    <div>
      <PageHeader
        title="Lịch khám"
        subtitle="Lọc theo khoảng ngày, xem trạng thái và mở chi tiết từng lượt khám."
      >
        <Button
          variant="primary"
          className="d-inline-flex align-items-center gap-2"
          onClick={openDatLichModal}
        >
          <i className="bi bi-plus-lg" aria-hidden />
          Đặt lịch mới
        </Button>
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
            {list
              .filter(
                (a) =>
                  !maBenhNhanParam ||
                  a.maBenhNhan === Number(maBenhNhanParam),
              )
              .map((a) => (
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
          </tbody>
        </Table>
        </div>
      </Card>

      <Modal
        show={showDatLich}
        onHide={() => !submitting && setShowDatLich(false)}
        centered
        size="lg"
        backdrop={submitting ? "static" : true}
        keyboard={!submitting}
      >
        <Modal.Header closeButton={!submitting}>
          <Modal.Title as="h5">Đặt lịch khám</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleDatLichSubmit}>
          <Modal.Body className="pt-2">
            {modalError && (
              <Alert variant="danger" className="py-2 mb-3" dismissible onClose={() => setModalError("")}>
                {modalError}
              </Alert>
            )}
            <Form.Group className="mb-3">
              <Form.Label className="required">Bệnh nhân</Form.Label>
              <Form.Select
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                required
              >
                <option value="">— Chọn bệnh nhân —</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.hoTen} {p.soDienThoai ? `(${p.soDienThoai})` : ""}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="required">Bác sĩ</Form.Label>
              <Form.Select
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                required
              >
                <option value="">— Chọn bác sĩ —</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.hoTen}
                    {(d.tenChuyenKhoa || d.chuyenMon)
                      ? ` — ${d.tenChuyenKhoa ?? d.chuyenMon}`
                      : ""}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="required">Dịch vụ</Form.Label>
              <Form.Select
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                required
              >
                <option value="">— Chọn dịch vụ —</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.ten} — {s.gia != null ? `${s.gia.toLocaleString("vi-VN")}đ` : ""}
                  </option>
                ))}
              </Form.Select>
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
          <Modal.Footer className="border-top bg-light">
            <Button
              variant="light"
              className="border"
              type="button"
              disabled={submitting}
              onClick={() => setShowDatLich(false)}
            >
              Hủy
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden />
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
