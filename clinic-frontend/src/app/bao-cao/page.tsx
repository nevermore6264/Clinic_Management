"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Table, Form, Alert, Button } from "react-bootstrap";
import { useAuth } from "@/lib/useAuth";
import {
  reportsApi,
  doctorsApi,
  servicesApi,
  type RevenueReport,
  type BacSi,
  type DichVu,
} from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { LoadingState } from "@/components/LoadingState";

export default function ReportsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [list, setList] = useState<RevenueReport[]>([]);
  const [doctors, setDoctors] = useState<BacSi[]>([]);
  const [services, setServices] = useState<DichVu[]>([]);
  const [from, setFrom] = useState(() => new Date().toISOString().slice(0, 10));
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [doctorId, setDoctorId] = useState<string>("");
  const [serviceId, setServiceId] = useState<string>("");
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/dang-nhap");
    if (
      user &&
      !user.cacVaiTro.includes("QUAN_TRI") &&
      !user.cacVaiTro.includes("THU_NGAN")
    )
      router.replace("/bang-dieu-khien");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    doctorsApi
      .list()
      .then(setDoctors)
      .catch(() => {});
    servicesApi
      .list()
      .then(setServices)
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const dId = doctorId ? Number(doctorId) : undefined;
    const sId = serviceId ? Number(serviceId) : undefined;
    reportsApi
      .revenue(from, to, dId, sId)
      .then(setList)
      .catch((e) => setError(e.message));
  }, [user, from, to, doctorId, serviceId]);

  const handleExport = async () => {
    setExporting(true);
    setError("");
    try {
      const blob = await reportsApi.exportExcel(
        from,
        to,
        doctorId ? Number(doctorId) : undefined,
        serviceId ? Number(serviceId) : undefined,
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bao-cao-doanh-thu-${from}-${to}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xuất Excel thất bại");
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <LoadingState />;
  if (
    !user?.cacVaiTro.includes("QUAN_TRI") &&
    !user?.cacVaiTro.includes("THU_NGAN")
  )
    return null;

  const totalRevenue = list.reduce((sum, r) => sum + (r.tongDoanhThu || 0), 0);

  return (
    <div>
      <PageHeader
        title="Báo cáo doanh thu"
        subtitle="Theo dõi doanh thu theo ngày, lọc theo bác sĩ hoặc dịch vụ, xuất Excel khi cần."
      />
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
            <Form.Group>
              <Form.Label>Bác sĩ</Form.Label>
              <Form.Select
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
              >
                <option value="">— Tất cả —</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.hoTen}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group>
              <Form.Label>Dịch vụ</Form.Label>
              <Form.Select
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
              >
                <option value="">— Tất cả —</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.ten}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Button
              variant="success"
              onClick={handleExport}
              disabled={exporting}
              className="d-inline-flex align-items-center gap-2"
            >
              <i className="bi bi-file-earmark-excel" aria-hidden />
              {exporting ? "Đang xuất..." : "Xuất Excel"}
            </Button>
          </div>
        </Card.Body>
      </Card>
      <Card className="mb-3 card--static border-0 shadow-sm">
        <Card.Body className="d-flex align-items-center gap-2 py-3">
          <i className="bi bi-cash-stack fs-4 text-primary" aria-hidden />
          <div>
            <div className="small text-muted text-uppercase fw-semibold">
              Tổng doanh thu (kỳ lọc)
            </div>
            <div className="h5 mb-0 fw-bold">
              {totalRevenue.toLocaleString("vi-VN")}đ
            </div>
          </div>
        </Card.Body>
      </Card>
      <Card className="card--static border-0 shadow-sm overflow-hidden">
        <Card.Header className="d-flex align-items-center gap-2">
          <i className="bi bi-table" aria-hidden />
          Doanh thu theo ngày
        </Card.Header>
        <div className="table-responsive">
        <Table responsive hover className="mb-0 align-middle">
          <thead>
            <tr>
              <th>Ngày</th>
              <th>Doanh thu</th>
              <th>Số giao dịch</th>
            </tr>
          </thead>
          <tbody>
            {list.map((r) => (
              <tr key={r.ngay}>
                <td>{r.ngay}</td>
                <td>{(r.tongDoanhThu || 0).toLocaleString("vi-VN")}đ</td>
                <td>{r.soLichHen ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </Table>
        </div>
      </Card>
    </div>
  );
}
