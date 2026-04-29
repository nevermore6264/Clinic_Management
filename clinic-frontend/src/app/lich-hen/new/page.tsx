"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Form, Button, Alert } from "react-bootstrap";
import { useAuth } from "@/lib/useAuth";
import {
  appointmentsApi,
  patientsApi,
  doctorsApi,
  servicesApi,
  type BenhNhan,
  type BacSi,
  type DichVu,
} from "@/lib/api";

export default function NewAppointmentPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [patients, setPatients] = useState<BenhNhan[]>([]);
  const [doctors, setDoctors] = useState<BacSi[]>([]);
  const [services, setServices] = useState<DichVu[]>([]);
  const [patientId, setPatientId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("08:00");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) router.replace("/dang-nhap");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    patientsApi
      .list(0, 500)
      .then((r) => setPatients(r.content))
      .catch(() => {});
    doctorsApi
      .list()
      .then(setDoctors)
      .catch(() => {});
    servicesApi
      .list()
      .then(setServices)
      .catch(() => {});
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await appointmentsApi.create({
        patientId: Number(patientId),
        doctorId: Number(doctorId),
        serviceId: Number(serviceId),
        appointmentDate,
        appointmentTime,
        note: note || undefined,
      });
      router.push("/lich-hen");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Lỗi");
    }
  };

  if (!loading && !user) return null;

  return (
    <div>
      <h2 className="mb-4">Đặt lịch khám</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="required">Bệnh nhân</Form.Label>
              <Form.Select
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                required
              >
                <option value="">-- Chọn bệnh nhân --</option>
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
                <option value="">-- Chọn bác sĩ --</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.hoTen} - {d.chuyenMon}
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
                <option value="">-- Chọn dịch vụ --</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.ten} - {s.gia?.toLocaleString("vi-VN")}đ
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="required">Ngày khám</Form.Label>
              <Form.Control
                type="date"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="required">Giờ khám</Form.Label>
              <Form.Control
                type="time"
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Ghi chú</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </Form.Group>
            <Button type="submit" variant="primary">
              Đặt lịch
            </Button>{" "}
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
            >
              Hủy
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}
