"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
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
  Tabs,
  Tab,
  Modal,
} from "react-bootstrap";
import { useAuth } from "@/lib/useAuth";
import { laChiTaiKhoanBenhNhan } from "@/lib/roles";
import { PageHeader } from "@/components/PageHeader";
import { LICH_HEN_STATUS_LABEL } from "@/lib/lichHenStatus";
import {
  doctorsApi,
  doctorSchedulesApi,
  lichLamViecCoDinhApi,
  appointmentsApi,
  type BacSi,
  type LichLamViecBacSi,
  type LichCoDinh,
  type LichHen,
} from "@/lib/api";

const TEN_THU: Record<number, string> = {
  1: "Thứ 2",
  2: "Thứ 3",
  3: "Thứ 4",
  4: "Thứ 5",
  5: "Thứ 6",
  6: "Thứ 7",
  7: "Chủ nhật",
};

const THU_TRONG_TUAN: number[] = [1, 2, 3, 4, 5, 6, 7];

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

function chuanGio(t?: string) {
  if (!t) return "—";
  return t.length >= 5 ? t.slice(0, 5) : t;
}

function thuTuNgayIso(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return 0;
  const dow = new Date(y, m - 1, d).getDay();
  return dow === 0 ? 7 : dow;
}

function hmsToPhut(t?: string): number {
  if (!t) return -1;
  const [h, m] = t.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return -1;
  return h * 60 + m;
}

function chongLan(a1: string, a2: string, b1: string, b2: string): boolean {
  const A1 = hmsToPhut(a1);
  const A2 = hmsToPhut(a2);
  const B1 = hmsToPhut(b1);
  const B2 = hmsToPhut(b2);
  if (A1 < 0 || A2 < 0 || B1 < 0 || B2 < 0) return false;
  return A1 < B2 && B1 < A2;
}

export default function LichLamViecBacSisPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [doctors, setDoctors] = useState<BacSi[]>([]);
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [tab, setTab] = useState<"co-dinh" | "ngoai-le" | "lich-dat">(
    "co-dinh",
  );
  const [schedules, setSchedules] = useState<LichLamViecBacSi[]>([]);
  const [appointments, setAppointments] = useState<LichHen[]>([]);
  const [coDinhList, setCoDinhList] = useState<LichCoDinh[]>([]);
  const [error, setError] = useState("");
  const [thongBao, setThongBao] = useState("");
  const [bangTai, setBangTai] = useState(false);
  const [coDinhTai, setCoDinhTai] = useState(false);
  const [dangGieo, setDangGieo] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newSlot, setNewSlot] = useState({
    khungGioBatDau: "08:00",
    khungGioKetThuc: "09:00",
  });
  const [showAddCoDinh, setShowAddCoDinh] = useState(false);
  const [newCoDinh, setNewCoDinh] = useState({
    thuTrongTuan: 1,
    khungGioBatDau: "07:30",
    khungGioKetThuc: "11:30",
  });

  type XacNhanState = {
    tieuDe: string;
    noiDung: ReactNode;
    icon?: string;
    nhanXacNhan?: string;
    bienTheXacNhan?: "primary" | "danger" | "warning" | "success";
    onXacNhan: () => Promise<void> | void;
  };
  const [xacNhan, setXacNhan] = useState<XacNhanState | null>(null);
  const [dangXacNhan, setDangXacNhan] = useState(false);

  const moHopXacNhan = useCallback((opts: XacNhanState) => {
    setXacNhan(opts);
  }, []);
  const dongHopXacNhan = useCallback(() => {
    if (!dangXacNhan) setXacNhan(null);
  }, [dangXacNhan]);
  const chayXacNhan = useCallback(async () => {
    if (!xacNhan) return;
    setDangXacNhan(true);
    try {
      await xacNhan.onXacNhan();
      setXacNhan(null);
    } finally {
      setDangXacNhan(false);
    }
  }, [xacNhan]);

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

  const taiCoDinh = useCallback(async (maBacSi: number) => {
    setCoDinhTai(true);
    try {
      const data = await lichLamViecCoDinhApi.theoBacSi(maBacSi);
      setCoDinhList(Array.isArray(data) ? data : []);
    } catch (e: unknown) {
      setError(
        e instanceof Error ? e.message : "Không tải được lịch cố định",
      );
      setCoDinhList([]);
    } finally {
      setCoDinhTai(false);
    }
  }, []);

  useEffect(() => {
    if (!user || !doctorId) {
      setCoDinhList([]);
      return;
    }
    taiCoDinh(Number(doctorId));
  }, [user, doctorId, taiCoDinh]);

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

  const [loiNgoaiLe, setLoiNgoaiLe] = useState("");

  const thuTrongTuanHomNay = useMemo(() => thuTuNgayIso(date), [date]);

  const gioHanhChinhHomNay = useMemo(() => {
    const dsThu = thuTrongTuanHomNay;
    return coDinhList
      .filter(
        (c) =>
          (c.thuTrongTuan === 0 ? 7 : c.thuTrongTuan) === dsThu,
      )
      .map((c) => ({
        batDau: chuanGio(c.khungGioBatDau),
        ketThuc: chuanGio(c.khungGioKetThuc),
      }))
      .sort((a, b) => a.batDau.localeCompare(b.batDau));
  }, [coDinhList, thuTrongTuanHomNay]);

  const handleAddSlot = async () => {
    if (!doctorId) return;
    setLoiNgoaiLe("");
    if (
      !newSlot.khungGioBatDau ||
      !newSlot.khungGioKetThuc ||
      newSlot.khungGioBatDau >= newSlot.khungGioKetThuc
    ) {
      setLoiNgoaiLe("Giờ bắt đầu phải trước giờ kết thúc.");
      return;
    }
    const trung = gioHanhChinhHomNay.find((g) =>
      chongLan(
        newSlot.khungGioBatDau,
        newSlot.khungGioKetThuc,
        g.batDau,
        g.ketThuc,
      ),
    );
    if (trung) {
      setLoiNgoaiLe(
        `Ca ngoại lệ chồng với giờ hành chính ${trung.batDau}–${trung.ketThuc}. Ngoại lệ chỉ được tạo ngoài khung giờ hành chính.`,
      );
      return;
    }
    setError("");
    setThongBao("");
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

  const handleDelete = (s: LichLamViecBacSi) => {
    if (s.id == null) return;
    moHopXacNhan({
      tieuDe: "Xóa dòng lịch",
      noiDung: (
        <>
          Bạn có chắc muốn xóa dòng lịch này không? Thao tác này không thể hoàn
          tác.
        </>
      ),
      icon: "bi-trash3",
      nhanXacNhan: "Xóa",
      bienTheXacNhan: "danger",
      onXacNhan: async () => {
        setError("");
        setThongBao("");
        try {
          await doctorSchedulesApi.delete(s.id!, s.nguonBanGhi);
          const sc = await doctorSchedulesApi.byDoctor(Number(doctorId), date);
          setSchedules(Array.isArray(sc) ? sc : []);
          if (s.nguonBanGhi === "CO_DINH") {
            taiCoDinh(Number(doctorId));
          }
        } catch (e: unknown) {
          setError(e instanceof Error ? e.message : "Lỗi");
        }
      },
    });
  };

  const handleNghiCaNgay = () => {
    if (!doctorId) return;
    moHopXacNhan({
      tieuDe: "Đánh dấu nghỉ cả ngày",
      noiDung: (
        <>
          Bạn có chắc muốn đánh dấu <strong>nghỉ cả ngày</strong>{" "}
          <span className="text-muted">({formatNgay(date)})</span>? Bệnh nhân sẽ
          không đặt được lịch trong ngày này.
        </>
      ),
      icon: "bi-moon",
      nhanXacNhan: "Nghỉ cả ngày",
      bienTheXacNhan: "warning",
      onXacNhan: async () => {
        setError("");
        setThongBao("");
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
      },
    });
  };

  const handleAddCoDinh = async () => {
    if (!doctorId) return;
    setError("");
    setThongBao("");
    try {
      await lichLamViecCoDinhApi.tao({
        maBacSi: Number(doctorId),
        thuTrongTuan: newCoDinh.thuTrongTuan,
        khungGioBatDau: newCoDinh.khungGioBatDau,
        khungGioKetThuc: newCoDinh.khungGioKetThuc,
      });
      await taiCoDinh(Number(doctorId));
      setShowAddCoDinh(false);
      setNewCoDinh({
        thuTrongTuan: newCoDinh.thuTrongTuan,
        khungGioBatDau: "07:30",
        khungGioKetThuc: "11:30",
      });
      setThongBao("Đã thêm ca cố định.");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi");
    }
  };

  const handleDeleteCoDinh = (id?: number) => {
    if (id == null) return;
    moHopXacNhan({
      tieuDe: "Xóa ca cố định",
      noiDung: <>Bạn có chắc muốn xóa ca cố định này không?</>,
      icon: "bi-trash3",
      nhanXacNhan: "Xóa",
      bienTheXacNhan: "danger",
      onXacNhan: async () => {
        setError("");
        setThongBao("");
        try {
          await lichLamViecCoDinhApi.xoa(id);
          await taiCoDinh(Number(doctorId));
        } catch (e: unknown) {
          setError(e instanceof Error ? e.message : "Lỗi");
        }
      },
    });
  };

  const handleGieoMacDinh = () => {
    if (!doctorId) return;
    moHopXacNhan({
      tieuDe: "Áp giờ hành chính mặc định",
      noiDung: (
        <>
          Áp giờ hành chính mặc định cho{" "}
          <strong>{tenBacSiChon ?? "bác sĩ này"}</strong>? Toàn bộ ca cố định
          hiện tại sẽ bị <strong>ghi đè</strong> bằng khung mặc định:
          <ul className="mt-2 mb-0">
            <li>Thứ 2 – Thứ 7</li>
            <li>Sáng 07:30 – 11:30</li>
            <li>Chiều 13:00 – 17:00</li>
          </ul>
        </>
      ),
      icon: "bi-magic",
      nhanXacNhan: "Áp giờ hành chính",
      bienTheXacNhan: "primary",
      onXacNhan: async () => {
        setError("");
        setThongBao("");
        setDangGieo(true);
        try {
          await lichLamViecCoDinhApi.gieoMacDinh(Number(doctorId), true);
          await taiCoDinh(Number(doctorId));
          setThongBao("Đã áp giờ hành chính mặc định.");
        } catch (e: unknown) {
          setError(e instanceof Error ? e.message : "Lỗi");
        } finally {
          setDangGieo(false);
        }
      },
    });
  };

  const handleCapNhatCoDinh = async (
    item: LichCoDinh,
    patch: Partial<LichCoDinh>,
  ) => {
    if (item.id == null) return;
    setError("");
    setThongBao("");
    try {
      await lichLamViecCoDinhApi.capNhat(item.id, { ...item, ...patch });
      await taiCoDinh(Number(doctorId));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi");
    }
  };

  const canEditSchedules =
    user?.cacVaiTro.includes("QUAN_TRI") || user?.cacVaiTro.includes("BAC_SI");

  const tenBacSiChon = doctors.find((d) => String(d.id) === doctorId)?.hoTen;

  const coDinhTheoThu = useMemo(() => {
    const map: Record<number, LichCoDinh[]> = {};
    for (const thu of THU_TRONG_TUAN) {
      map[thu] = [];
    }
    for (const c of coDinhList) {
      const thu = c.thuTrongTuan === 0 ? 7 : c.thuTrongTuan;
      if (map[thu]) map[thu].push(c);
    }
    for (const thu of THU_TRONG_TUAN) {
      map[thu].sort((a, b) => a.khungGioBatDau.localeCompare(b.khungGioBatDau));
    }
    return map;
  }, [coDinhList]);

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
        subtitle="Quản lý ca cố định theo tuần và các ngoại lệ trong ngày."
      />

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")} className="shadow-sm">
          {error}
        </Alert>
      )}
      {thongBao && (
        <Alert variant="success" dismissible onClose={() => setThongBao("")} className="shadow-sm">
          {thongBao}
        </Alert>
      )}

      <Card className="mb-4 card--static border-0 shadow-sm">
        <Card.Body className="p-4">
          <Row className="g-3 align-items-end">
            <Col md={8} lg={6}>
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
            {doctorId ? (
              <Col md={4} lg={6} className="text-md-end">
                <div className="small text-muted">Bác sĩ đang chọn</div>
                <div className="fw-semibold">{tenBacSiChon ?? "—"}</div>
              </Col>
            ) : null}
          </Row>
        </Card.Body>
      </Card>

      {!doctorId ? (
        <Card className="card--static border-0 shadow-sm border border-2 border-dashed">
          <Card.Body className="text-center py-5 px-4">
            <div
              className="rounded-circle bg-primary-subtle d-inline-flex align-items-center justify-content-center mb-3 mx-auto text-primary-emphasis"
              style={{ width: 72, height: 72 }}
            >
              <i className="bi bi-calendar3-week fs-2" aria-hidden />
            </div>
            <h5 className="fw-semibold mb-2">Chưa chọn bác sĩ</h5>
            <p className="text-muted mb-0 mx-auto" style={{ maxWidth: "28rem" }}>
              Chọn bác sĩ ở trên để xem ca cố định theo tuần và các ca trong ngày.
            </p>
          </Card.Body>
        </Card>
      ) : (
        <Tabs
          activeKey={tab}
          onSelect={(k) =>
            setTab((k as "co-dinh" | "ngoai-le" | "lich-dat") || "co-dinh")
          }
          id="lich-lam-viec-tabs"
          className="mb-3"
        >
          <Tab
            eventKey="co-dinh"
            title={
              <span>
                <i className="bi bi-calendar-week me-2" aria-hidden />
                Ca cố định theo tuần
              </span>
            }
          >
            <Card className="card--static border-0 shadow-sm overflow-hidden">
              <Card.Header className="bg-white border-bottom py-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
                <div className="d-flex align-items-center gap-2">
                  <span className="rounded-2 bg-primary-subtle text-primary p-2 d-inline-flex">
                    <i className="bi bi-calendar-week" aria-hidden />
                  </span>
                  <div>
                    <span className="fw-semibold d-block">Ca cố định theo tuần</span>
                    <span className="small text-muted">
                      Mặc định: T2–T7 · 07:30–11:30 và 13:00–17:00
                    </span>
                  </div>
                </div>
                {canEditSchedules ? (
                  <div className="d-flex flex-wrap gap-2">
                    <Button
                      variant={showAddCoDinh ? "outline-secondary" : "primary"}
                      className="d-inline-flex align-items-center gap-2"
                      onClick={() => setShowAddCoDinh(!showAddCoDinh)}
                    >
                      <i className="bi bi-plus-lg" aria-hidden />
                      {showAddCoDinh ? "Đóng form" : "Thêm ca"}
                    </Button>
                    <Button
                      variant="outline-primary"
                      className="d-inline-flex align-items-center gap-2"
                      onClick={handleGieoMacDinh}
                      disabled={dangGieo}
                    >
                      {dangGieo ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        <i className="bi bi-magic" aria-hidden />
                      )}
                      Áp giờ hành chính mặc định
                    </Button>
                  </div>
                ) : null}
              </Card.Header>

              {showAddCoDinh && canEditSchedules ? (
                <div className="p-3 border-bottom bg-body-secondary bg-opacity-50">
                  <Row className="g-3 align-items-end">
                    <Col sm={4} md={3}>
                      <Form.Label className="small">Thứ trong tuần</Form.Label>
                      <Form.Select
                        value={newCoDinh.thuTrongTuan}
                        onChange={(e) =>
                          setNewCoDinh({
                            ...newCoDinh,
                            thuTrongTuan: Number(e.target.value),
                          })
                        }
                      >
                        {THU_TRONG_TUAN.map((t) => (
                          <option key={t} value={t}>
                            {TEN_THU[t]}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                    <Col sm={4} md={3}>
                      <Form.Label className="small">Bắt đầu</Form.Label>
                      <Form.Control
                        type="time"
                        value={newCoDinh.khungGioBatDau}
                        onChange={(e) =>
                          setNewCoDinh({
                            ...newCoDinh,
                            khungGioBatDau: e.target.value,
                          })
                        }
                      />
                    </Col>
                    <Col sm={4} md={3}>
                      <Form.Label className="small">Kết thúc</Form.Label>
                      <Form.Control
                        type="time"
                        value={newCoDinh.khungGioKetThuc}
                        onChange={(e) =>
                          setNewCoDinh({
                            ...newCoDinh,
                            khungGioKetThuc: e.target.value,
                          })
                        }
                      />
                    </Col>
                    <Col sm="auto">
                      <Button variant="primary" className="px-4" onClick={handleAddCoDinh}>
                        <i className="bi bi-check2 me-2" aria-hidden />
                        Lưu ca
                      </Button>
                    </Col>
                  </Row>
                </div>
              ) : null}

              <div className="table-responsive">
                <Table hover className="mb-0 align-middle">
                  <thead className="table-light">
                    <tr className="small text-uppercase text-muted">
                      <th className="border-0 ps-4" style={{ width: 140 }}>
                        Thứ
                      </th>
                      <th className="border-0">Các ca trong ngày</th>
                      {canEditSchedules ? (
                        <th className="border-0 text-end pe-4" style={{ width: "1%" }}>
                          Thao tác
                        </th>
                      ) : null}
                    </tr>
                  </thead>
                  <tbody>
                    {THU_TRONG_TUAN.map((thu) => {
                      const dsCa = coDinhTheoThu[thu] ?? [];
                      return (
                        <tr key={thu}>
                          <td className="ps-4 fw-semibold text-body">{TEN_THU[thu]}</td>
                          <td>
                            {dsCa.length === 0 ? (
                              <span className="text-muted fst-italic">Nghỉ</span>
                            ) : (
                              <div className="d-flex flex-wrap gap-2">
                                {dsCa.map((c) => (
                                  <span
                                    key={c.id}
                                    className="badge rounded-pill bg-primary-subtle text-primary-emphasis border border-primary-subtle fw-normal font-monospace"
                                  >
                                    {chuanGio(c.khungGioBatDau)} – {chuanGio(c.khungGioKetThuc)}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                          {canEditSchedules ? (
                            <td className="text-end pe-4 text-nowrap">
                              <Button
                                size="sm"
                                variant="outline-primary"
                                className="me-2"
                                onClick={() => {
                                  setNewCoDinh({
                                    thuTrongTuan: thu,
                                    khungGioBatDau: "07:30",
                                    khungGioKetThuc: "11:30",
                                  });
                                  setShowAddCoDinh(true);
                                }}
                                title={`Thêm ca cho ${TEN_THU[thu]}`}
                              >
                                <i className="bi bi-plus-lg" aria-hidden />
                              </Button>
                            </td>
                          ) : null}
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>

              {canEditSchedules && coDinhList.length > 0 ? (
                <div className="border-top">
                  <div className="px-4 pt-3 pb-1 small text-muted fw-semibold text-uppercase">
                    Quản lý chi tiết
                  </div>
                  <div className="table-responsive">
                    <Table hover size="sm" className="mb-0 align-middle">
                      <thead className="table-light">
                        <tr className="small text-uppercase text-muted">
                          <th className="border-0 ps-4">Thứ</th>
                          <th className="border-0">Bắt đầu</th>
                          <th className="border-0">Kết thúc</th>
                          <th className="border-0 text-end pe-4" style={{ width: "1%" }}>
                            Thao tác
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {coDinhList.map((c) => (
                          <tr key={c.id}>
                            <td className="ps-4">
                              <Form.Select
                                size="sm"
                                value={c.thuTrongTuan === 0 ? 7 : c.thuTrongTuan}
                                onChange={(e) =>
                                  handleCapNhatCoDinh(c, {
                                    thuTrongTuan: Number(e.target.value),
                                  })
                                }
                                style={{ minWidth: 110 }}
                              >
                                {THU_TRONG_TUAN.map((t) => (
                                  <option key={t} value={t}>
                                    {TEN_THU[t]}
                                  </option>
                                ))}
                              </Form.Select>
                            </td>
                            <td>
                              <Form.Control
                                size="sm"
                                type="time"
                                value={chuanGio(c.khungGioBatDau)}
                                onChange={(e) =>
                                  handleCapNhatCoDinh(c, {
                                    khungGioBatDau: e.target.value,
                                  })
                                }
                                style={{ maxWidth: 130 }}
                              />
                            </td>
                            <td>
                              <Form.Control
                                size="sm"
                                type="time"
                                value={chuanGio(c.khungGioKetThuc)}
                                onChange={(e) =>
                                  handleCapNhatCoDinh(c, {
                                    khungGioKetThuc: e.target.value,
                                  })
                                }
                                style={{ maxWidth: 130 }}
                              />
                            </td>
                            <td className="text-end pe-4">
                              <Button
                                size="sm"
                                variant="outline-danger"
                                onClick={() => handleDeleteCoDinh(c.id)}
                              >
                                <i className="bi bi-trash3" aria-hidden />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </div>
              ) : null}

              {!coDinhTai && coDinhList.length === 0 ? (
                <Card.Body className="text-center text-muted py-5 border-top">
                  <i className="bi bi-calendar-x display-6 d-block mb-2 opacity-25" aria-hidden />
                  Bác sĩ này chưa có ca cố định nào. Bấm{" "}
                  <strong>“Áp giờ hành chính mặc định”</strong> để khởi tạo nhanh, hoặc thêm thủ
                  công.
                </Card.Body>
              ) : null}
              {coDinhTai ? (
                <Card.Body className="text-center py-4 border-top">
                  <Spinner animation="border" size="sm" className="text-primary" />
                </Card.Body>
              ) : null}
            </Card>
          </Tab>

          <Tab
            eventKey="ngoai-le"
            title={
              <span>
                <i className="bi bi-calendar-event me-2" aria-hidden />
                Ca ngoại lệ
              </span>
            }
          >
            <Card className="mb-4 card--static border-0 shadow-sm">
              <Card.Body className="p-4">
                <Row className="g-3 align-items-end">
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
                  {canEditSchedules ? (
                    <Col lg={8} className="d-flex flex-wrap gap-2 justify-content-lg-end pt-lg-4">
                      <Button
                        variant={showAdd ? "outline-secondary" : "primary"}
                        className="d-inline-flex align-items-center gap-2"
                        onClick={() => {
                          setLoiNgoaiLe("");
                          setShowAdd(!showAdd);
                        }}
                      >
                        <i className="bi bi-plus-lg" aria-hidden />
                        {showAdd ? "Đóng form" : "Thêm ca ngoại lệ"}
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

                {showAdd && canEditSchedules ? (
                  <div className="mt-4 p-3 rounded-3 border bg-body-secondary bg-opacity-50">
                    <div className="fw-semibold small mb-2 text-muted">
                      <i className="bi bi-clock-history me-2" aria-hidden />
                      Thêm ca ngoại lệ cho ngày {formatNgay(date)}
                    </div>
                    <div className="small text-muted mb-3">
                      <i className="bi bi-info-circle me-2" aria-hidden />
                      Giờ hành chính {TEN_THU[thuTrongTuanHomNay] ?? "—"}:{" "}
                      {gioHanhChinhHomNay.length === 0 ? (
                        <em>Nghỉ (không có ca cố định)</em>
                      ) : (
                        gioHanhChinhHomNay.map((g, i) => (
                          <span key={`${g.batDau}-${g.ketThuc}`}>
                            {i > 0 ? ", " : ""}
                            <span className="font-monospace">
                              {g.batDau}–{g.ketThuc}
                            </span>
                          </span>
                        ))
                      )}
                      . Ca ngoại lệ phải nằm <strong>ngoài</strong> các khung này.
                    </div>
                    {loiNgoaiLe ? (
                      <Alert
                        variant="danger"
                        className="py-2 small mb-3"
                        dismissible
                        onClose={() => setLoiNgoaiLe("")}
                      >
                        {loiNgoaiLe}
                      </Alert>
                    ) : null}
                    <Row className="g-3 align-items-end">
                      <Col sm={4} md={3}>
                        <Form.Label className="small">Bắt đầu</Form.Label>
                        <Form.Control
                          type="time"
                          value={newSlot.khungGioBatDau}
                          onChange={(e) => {
                            setLoiNgoaiLe("");
                            setNewSlot({ ...newSlot, khungGioBatDau: e.target.value });
                          }}
                          isInvalid={Boolean(loiNgoaiLe)}
                        />
                      </Col>
                      <Col sm={4} md={3}>
                        <Form.Label className="small">Kết thúc</Form.Label>
                        <Form.Control
                          type="time"
                          value={newSlot.khungGioKetThuc}
                          onChange={(e) => {
                            setLoiNgoaiLe("");
                            setNewSlot({ ...newSlot, khungGioKetThuc: e.target.value });
                          }}
                          isInvalid={Boolean(loiNgoaiLe)}
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

            <Card className="card--static border-0 shadow-sm overflow-hidden">
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
                  <i
                    className="bi bi-inbox display-6 d-block mb-2 opacity-25"
                    aria-hidden
                  />
                  Không có ca cho ngày này.
                </Card.Body>
              ) : null}
            </Card>
          </Tab>

          <Tab
            eventKey="lich-dat"
            title={
              <span>
                <i className="bi bi-journal-check me-2" aria-hidden />
                Lịch đã đặt
                {appointments.length > 0 ? (
                  <Badge
                    bg="success-subtle"
                    text="success-emphasis"
                    pill
                    className="ms-2 fw-normal border border-success-subtle"
                  >
                    {appointments.length}
                  </Badge>
                ) : null}
              </span>
            }
          >
            <Card className="mb-4 card--static border-0 shadow-sm">
              <Card.Body className="p-4">
                <Row className="g-3 align-items-end">
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
                  <Col md={6} lg={8} className="text-md-end">
                    <div className="small text-muted">Tổng lịch hẹn trong ngày</div>
                    <div className="fw-semibold fs-5">
                      {appointments.length} lượt
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Card className="card--static border-0 shadow-sm overflow-hidden">
              <Card.Header className="bg-white border-bottom py-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
                <div className="d-flex align-items-center gap-2">
                  <span className="rounded-2 bg-success-subtle text-success p-2 d-inline-flex">
                    <i className="bi bi-journal-check" aria-hidden />
                  </span>
                  <div>
                    <span className="fw-semibold d-block">Lịch đã đặt</span>
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
                      <th className="border-0 ps-4">Giờ</th>
                      <th className="border-0">Bệnh nhân</th>
                      <th className="border-0 d-none d-md-table-cell">Dịch vụ</th>
                      <th className="border-0 pe-4">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((a) => (
                      <tr key={a.id}>
                        <td className="ps-4 text-nowrap font-monospace">
                          {a.gioHen != null ? String(a.gioHen).slice(0, 5) : "—"}
                        </td>
                        <td>
                          <span className="fw-medium">{a.tenBenhNhan ?? "—"}</span>
                          <div className="d-md-none text-muted mt-1 small">
                            {a.tenDichVu ?? "—"}
                          </div>
                        </td>
                        <td className="d-none d-md-table-cell text-muted">
                          {a.tenDichVu ?? "—"}
                        </td>
                        <td className="pe-4 text-nowrap">
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
                  <i
                    className="bi bi-calendar-x display-6 d-block mb-2 opacity-25"
                    aria-hidden
                  />
                  Chưa có lịch đặt cho ngày này.
                </Card.Body>
              ) : null}
            </Card>
          </Tab>
        </Tabs>
      )}

      <Modal
        show={Boolean(xacNhan)}
        onHide={dongHopXacNhan}
        centered
        backdrop={dangXacNhan ? "static" : true}
        keyboard={!dangXacNhan}
      >
        <Modal.Header closeButton={!dangXacNhan}>
          <Modal.Title>
            {xacNhan?.icon ? (
              <i className={`bi ${xacNhan.icon} me-2`} aria-hidden />
            ) : (
              <i className="bi bi-question-circle me-2" aria-hidden />
            )}
            {xacNhan?.tieuDe}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>{xacNhan?.noiDung}</Modal.Body>
        <Modal.Footer className="clinic-modal-footer-actions">
          <Button
            type="button"
            className="btn-modal-dismiss"
            onClick={dongHopXacNhan}
            disabled={dangXacNhan}
          >
            <i className="bi bi-x-lg me-2" aria-hidden />
            Hủy
          </Button>
          <Button
            type="button"
            variant={xacNhan?.bienTheXacNhan ?? "primary"}
            onClick={chayXacNhan}
            disabled={dangXacNhan}
          >
            {dangXacNhan ? (
              <>
                <Spinner
                  animation="border"
                  size="sm"
                  className="me-2"
                  role="status"
                />
                Đang xử lý…
              </>
            ) : (
              <>
                <i
                  className={`bi ${
                    xacNhan?.bienTheXacNhan === "danger"
                      ? "bi-trash3"
                      : xacNhan?.bienTheXacNhan === "warning"
                      ? "bi-moon"
                      : "bi-check2"
                  } me-2`}
                  aria-hidden
                />
                {xacNhan?.nhanXacNhan ?? "Xác nhận"}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
