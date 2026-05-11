"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Table, Button, Form, Alert } from "react-bootstrap";
import { useAuth } from "@/lib/useAuth";
import { laChiTaiKhoanBenhNhan } from "@/lib/roles";
import {
  doctorsApi,
  doctorSchedulesApi,
  appointmentsApi,
  type BacSi,
  type LichLamViecBacSi,
  type LichHen,
} from "@/lib/api";

export default function LichLamViecBacSisPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [doctors, setDoctors] = useState<BacSi[]>([]);
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [schedules, setSchedules] = useState<LichLamViecBacSi[]>([]);
  const [appointments, setAppointments] = useState<LichHen[]>([]);
  const [error, setError] = useState("");
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
    if (!user || !doctorId || !date) return;
    setError("");
    doctorSchedulesApi
      .byDoctor(Number(doctorId), date)
      .then(setSchedules)
      .catch((e) => setError(e.message));
    appointmentsApi
      .byDoctor(Number(doctorId), date)
      .then(setAppointments)
      .catch(() => setAppointments([]));
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
      doctorSchedulesApi.byDoctor(Number(doctorId), date).then(setSchedules);
      setShowAdd(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi");
    }
  };

  const handleDelete = async (s: LichLamViecBacSi) => {
    if (s.id == null) return;
    if (!confirm("Xóa mục lịch này?")) return;
    setError("");
    try {
      await doctorSchedulesApi.delete(s.id, s.nguonBanGhi);
      if (doctorId)
        doctorSchedulesApi.byDoctor(Number(doctorId), date).then(setSchedules);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi");
    }
  };

  const handleNghiCaNgay = async () => {
    if (!doctorId) return;
    if (!confirm("Đánh dấu nghỉ cả ngày cho ngày đã chọn? (Không còn khung giờ khám)")) return;
    setError("");
    try {
      await doctorSchedulesApi.create({
        maBacSi: Number(doctorId),
        ngayLich: date,
        nghiCaNgay: true,
      });
      doctorSchedulesApi.byDoctor(Number(doctorId), date).then(setSchedules);
      setShowAdd(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi");
    }
  };

  const canEditSchedules =
    user?.cacVaiTro.includes("QUAN_TRI") || user?.cacVaiTro.includes("BAC_SI");

  return (
    <div>
      <h2 className="mb-2">Lịch bác sĩ</h2>
      <p className="text-muted small mb-4">
        Ca làm việc theo ngày lấy từ{" "}
        <strong>lịch cố định theo tuần</strong> và{" "}
        <strong>ngoại lệ (đổi giờ / nghỉ)</strong>. Thêm ca trong ngày sẽ tạo{" "}
        <strong>ngoại lệ đổi giờ</strong> — đúng với logic đặt lịch khám.
      </p>
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      <Card className="mb-3">
        <Card.Body>
          <div className="d-flex flex-wrap gap-3 align-items-end">
            <Form.Group>
              <Form.Label>Bác sĩ</Form.Label>
              <Form.Select
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
              >
                <option value="">-- Chọn bác sĩ --</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.hoTen}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group>
              <Form.Label>Ngày</Form.Label>
              <Form.Control
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </Form.Group>
            {canEditSchedules && doctorId && (
              <div className="d-flex flex-wrap gap-2">
                <Button
                  variant="outline-primary"
                  onClick={() => setShowAdd(!showAdd)}
                >
                  {showAdd ? "Đóng" : "Thêm ca (ngoại lệ)"}
                </Button>
                <Button variant="outline-warning" onClick={handleNghiCaNgay}>
                  Nghỉ cả ngày
                </Button>
              </div>
            )}
          </div>
          {showAdd && doctorId && (
            <div className="mt-3 d-flex flex-wrap gap-2 align-items-end">
              <Form.Group>
                <Form.Label>Từ giờ</Form.Label>
                <Form.Control
                  type="time"
                  value={newSlot.khungGioBatDau}
                  onChange={(e) =>
                    setNewSlot({ ...newSlot, khungGioBatDau: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Đến giờ</Form.Label>
                <Form.Control
                  type="time"
                  value={newSlot.khungGioKetThuc}
                  onChange={(e) =>
                    setNewSlot({ ...newSlot, khungGioKetThuc: e.target.value })
                  }
                />
              </Form.Group>
              <Button variant="primary" onClick={handleAddSlot}>
                Thêm
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      {doctorId && (
        <>
          <Card className="mb-3">
            <Card.Header>Ca làm việc trong ngày (cố định / ngoại lệ)</Card.Header>
            <Table size="sm" className="mb-0">
              <thead>
                <tr>
                  <th>Nguồn</th>
                  <th>Từ giờ</th>
                  <th>Đến giờ</th>
                  {canEditSchedules && <th></th>}
                </tr>
              </thead>
              <tbody>
                {schedules.map((s) => (
                  <tr key={`${s.nguonBanGhi ?? "x"}-${s.id}`}>
                    <td className="text-muted small text-nowrap">
                      {s.nguonBanGhi === "CO_DINH"
                        ? "Cố định (tuần)"
                        : s.nguonBanGhi === "NGOAI_LE"
                          ? s.nghiCaNgay
                            ? "Nghỉ (ngoại lệ)"
                            : "Đổi giờ (ngoại lệ)"
                          : s.nguonBanGhi === "LICH_BAC_SI_THU_VIEN"
                            ? "Bản ghi cũ"
                            : "—"}
                    </td>
                    {s.nghiCaNgay ? (
                      <td colSpan={2}>
                        <span className="text-warning fw-semibold">Nghỉ cả ngày</span>
                      </td>
                    ) : (
                      <>
                        <td>{s.khungGioBatDau ?? "—"}</td>
                        <td>{s.khungGioKetThuc ?? "—"}</td>
                      </>
                    )}
                    {canEditSchedules && (
                      <td>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => handleDelete(s)}
                          disabled={
                            s.nguonBanGhi === "CO_DINH" &&
                            !user?.cacVaiTro.includes("QUAN_TRI")
                          }
                          title={
                            s.nguonBanGhi === "CO_DINH" &&
                            !user?.cacVaiTro.includes("QUAN_TRI")
                              ? "Chỉ quản trị được xóa lịch cố định tuần."
                              : undefined
                          }
                        >
                          Xóa
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </Table>
            {schedules.length === 0 && (
              <Card.Body className="text-muted">Chưa có ca nào.</Card.Body>
            )}
          </Card>
          <Card>
            <Card.Header>Lịch đã đặt trong ngày</Card.Header>
            <Table size="sm" className="mb-0">
              <thead>
                <tr>
                  <th>Giờ</th>
                  <th>Bệnh nhân</th>
                  <th>Dịch vụ</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a.id}>
                    <td>{a.gioHen}</td>
                    <td>{a.tenBenhNhan}</td>
                    <td>{a.tenDichVu}</td>
                    <td>{a.trangThai}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {appointments.length === 0 && (
              <Card.Body className="text-muted">Chưa có lịch đặt.</Card.Body>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
