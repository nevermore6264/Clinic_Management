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

function LichTabCardHeader({
  icon,
  tone = "primary",
  title,
  subtitle,
  trailing,
}: {
  icon: string;
  tone?: "primary" | "success";
  title: string;
  subtitle: ReactNode;
  trailing?: ReactNode;
}) {
  const toneClass =
    tone === "success"
      ? "bg-success-subtle text-success-emphasis"
      : "bg-primary-subtle text-primary-emphasis";
  return (
    <Card.Header className="bg-white border-bottom py-3">
      <div className="d-flex flex-column flex-xl-row gap-3 gap-xl-4 justify-content-xl-between align-items-xl-end">
        <div className="d-flex align-items-start gap-2 min-w-0 flex-grow-1">
          <span
            className={`rounded-2 p-2 d-inline-flex flex-shrink-0 align-items-center justify-content-center ${toneClass}`}
            style={{ width: 40, height: 40 }}
          >
            <i className={`bi ${icon} fs-5`} aria-hidden />
          </span>
          <div className="min-w-0 pt-xl-1">
            <span className="fw-semibold d-block text-body">{title}</span>
            <div className="small text-muted lh-sm mt-1">{subtitle}</div>
          </div>
        </div>
        {trailing != null ? (
          <div className="d-flex flex-wrap gap-2 align-items-end flex-shrink-0">
            {trailing}
          </div>
        ) : null}
      </div>
    </Card.Header>
  );
}

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

function thuHaiIsoVi(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const dt = new Date(y, m - 1, d);
  const dowJs = dt.getDay();
  const thu = dowJs === 0 ? 7 : dowJs;
  dt.setDate(dt.getDate() - (thu - 1));
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

function congNgayIso(iso: string, soNgay: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + soNgay);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
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

  const taiLichTuan = useCallback(async (maBacSi: number, ngayGoc: string) => {
    const mon = thuHaiIsoVi(ngayGoc);
    const sun = congNgayIso(mon, 6);
    const sc = await doctorSchedulesApi.byDoctorDateRange(maBacSi, mon, sun);
    setSchedules(Array.isArray(sc) ? sc : []);
  }, []);

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
        const mon = thuHaiIsoVi(date);
        const sun = congNgayIso(mon, 6);
        const [sc, ap] = await Promise.all([
          doctorSchedulesApi.byDoctorDateRange(Number(doctorId), mon, sun),
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

  const tuanBatDauTuNgay = useMemo(() => thuHaiIsoVi(date), [date]);
  const tuanChuNhatIso = useMemo(
    () => congNgayIso(tuanBatDauTuNgay, 6),
    [tuanBatDauTuNgay],
  );

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
      await taiLichTuan(Number(doctorId), date);
      setShowAdd(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi");
    }
  };

  const handleDelete = (s: LichLamViecBacSi) => {
    if (s.id == null) return;
    const ngayDong = s.ngayLich ?? date;
    const noiDungXoa =
      s.nguonBanGhi === "CO_DINH" ? (
        <>
          Bạn sắp xóa <strong>một ca trong lịch cố định theo tuần</strong> (dòng có
          tag Tuần). Hệ thống sẽ gỡ khỏi mẫu tuần — <strong>tất cả các ngày</strong>{" "}
          cùng thứ trong tuần sẽ không còn ca đó, không chỉ riêng{" "}
          <span className="text-muted">{formatNgay(ngayDong)}</span>. Thao tác{" "}
          <strong>không thể hoàn tác</strong>.
        </>
      ) : s.nguonBanGhi === "NGOAI_LE" ? (
        <>
          Bạn sắp xóa <strong>ca ngoại lệ</strong> chỉ áp dụng cho{" "}
          <span className="text-muted">{formatNgay(ngayDong)}</span>.{" "}
          <strong>Không</strong> thay đổi ca cố định theo tuần. Thao tác không thể
          hoàn tác.
        </>
      ) : (
        <>
          Bạn có chắc muốn xóa dòng lịch này không? Thao tác này không thể hoàn
          tác.
        </>
      );
    moHopXacNhan({
      tieuDe: "Xóa dòng lịch",
      noiDung: noiDungXoa,
      icon: "bi-trash3",
      nhanXacNhan: "Xóa",
      bienTheXacNhan: "danger",
      onXacNhan: async () => {
        setError("");
        setThongBao("");
        try {
          await doctorSchedulesApi.delete(s.id!, s.nguonBanGhi);
          await taiLichTuan(Number(doctorId), ngayDong);
          if (s.nguonBanGhi === "CO_DINH") {
            taiCoDinh(Number(doctorId));
          }
        } catch (e: unknown) {
          setError(e instanceof Error ? e.message : "Lỗi");
        }
      },
    });
  };

  const handleNghiCaNgay = (ngayLich: string) => {
    if (!doctorId) return;
    moHopXacNhan({
      tieuDe: "Đánh dấu nghỉ cả ngày",
      noiDung: (
        <>
          Bạn có chắc muốn đánh dấu <strong>nghỉ cả ngày</strong>{" "}
          <span className="text-muted">({formatNgay(ngayLich)})</span>? Bệnh nhân sẽ
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
            ngayLich,
            nghiCaNgay: true,
          });
          await taiLichTuan(Number(doctorId), ngayLich);
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
          fill
          justify
          className="mb-4 lich-lam-viec-bs-tabs"
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
              <LichTabCardHeader
                icon="bi-calendar-week"
                title="Ca cố định theo tuần"
                subtitle={
                  <>
                    Mẫu lặp lại mỗi tuần · Gợi ý mặc định: T2–T7, 07:30–11:30 và
                    13:00–17:00. Ca theo một ngày — tab{" "}
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 align-baseline"
                      onClick={() => setTab("ngoai-le")}
                    >
                      Ca ngoại lệ
                    </Button>
                    .
                  </>
                }
              />

              {showAddCoDinh && canEditSchedules ? (
                <div className="border-bottom bg-body-secondary bg-opacity-50 px-3 px-lg-4 py-4">
                  <div
                    className="rounded-3 border bg-white shadow-sm p-3 p-md-4 mx-auto"
                    style={{ maxWidth: 920 }}
                  >
                    <div className="d-flex align-items-start gap-3 pb-3 mb-3 border-bottom">
                      <span className="rounded-2 bg-primary text-white p-2 d-inline-flex flex-shrink-0">
                        <i className="bi bi-plus-lg" aria-hidden />
                      </span>
                      <div className="flex-grow-1 min-w-0">
                        <div className="fw-semibold text-body">Thêm ca cố định</div>
                        <div className="small text-muted">
                          Chọn thứ và khung giờ. Ca sẽ lặp lại mỗi tuần.
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline-secondary"
                        size="sm"
                        className="flex-shrink-0"
                        onClick={() => setShowAddCoDinh(false)}
                      >
                        <i className="bi bi-x-lg me-1" aria-hidden />
                        Đóng
                      </Button>
                    </div>
                    <Row className="g-3 align-items-end">
                      <Col sm={6} md={4} lg={3}>
                        <Form.Label className="small text-uppercase text-muted fw-semibold">
                          Thứ
                        </Form.Label>
                        <Form.Select
                          value={newCoDinh.thuTrongTuan}
                          onChange={(e) =>
                            setNewCoDinh({
                              ...newCoDinh,
                              thuTrongTuan: Number(e.target.value),
                            })
                          }
                          className="border-secondary-subtle"
                        >
                          {THU_TRONG_TUAN.map((t) => (
                            <option key={t} value={t}>
                              {TEN_THU[t]}
                            </option>
                          ))}
                        </Form.Select>
                      </Col>
                      <Col xs={6} md={4} lg={2}>
                        <Form.Label className="small text-uppercase text-muted fw-semibold">
                          Bắt đầu
                        </Form.Label>
                        <Form.Control
                          type="time"
                          value={newCoDinh.khungGioBatDau}
                          onChange={(e) =>
                            setNewCoDinh({
                              ...newCoDinh,
                              khungGioBatDau: e.target.value,
                            })
                          }
                          className="border-secondary-subtle"
                        />
                      </Col>
                      <Col xs={6} md={4} lg={2}>
                        <Form.Label className="small text-uppercase text-muted fw-semibold">
                          Kết thúc
                        </Form.Label>
                        <Form.Control
                          type="time"
                          value={newCoDinh.khungGioKetThuc}
                          onChange={(e) =>
                            setNewCoDinh({
                              ...newCoDinh,
                              khungGioKetThuc: e.target.value,
                            })
                          }
                          className="border-secondary-subtle"
                        />
                      </Col>
                      <Col sm="auto" className="ms-lg-auto">
                        <Button variant="primary" className="px-4" onClick={handleAddCoDinh}>
                          <i className="bi bi-check2 me-2" aria-hidden />
                          Lưu ca
                        </Button>
                      </Col>
                    </Row>
                  </div>
                </div>
              ) : null}

              {coDinhTai ? (
                <Card.Body className="text-center py-5 border-top">
                  <Spinner animation="border" className="text-primary" role="status" />
                  <div className="small text-muted mt-2">Đang tải lịch cố định…</div>
                </Card.Body>
              ) : coDinhList.length === 0 ? (
                <Card.Body className="text-center text-muted py-5 border-top">
                  <i className="bi bi-calendar-x display-6 d-block mb-2 opacity-25" aria-hidden />
                  <p className="mb-0 mx-auto" style={{ maxWidth: "26rem" }}>
                    Bác sĩ này chưa có ca cố định nào. Khởi tạo nhanh theo giờ hành chính hoặc thêm
                    từng ca thủ công.
                  </p>
                  {canEditSchedules ? (
                    <div className="d-flex flex-wrap justify-content-center gap-2 mt-4">
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
                      <Button
                        variant="primary"
                        className="d-inline-flex align-items-center gap-2"
                        onClick={() => setShowAddCoDinh(true)}
                      >
                        <i className="bi bi-plus-lg" aria-hidden />
                        Thêm ca thủ công
                      </Button>
                    </div>
                  ) : null}
                </Card.Body>
              ) : (
                <div className="lich-tuan-fd border-top px-3 px-lg-4 py-4 bg-body-secondary bg-opacity-35">
                  <div className="d-flex flex-wrap justify-content-between align-items-end gap-2 mb-3">
                    <div>
                      <div className="fw-semibold text-body">Tuần làm việc</div>
                      <div className="small text-muted">
                        Mỗi ô là một thứ; chỉnh ca trực tiếp trong ô tương ứng.
                      </div>
                    </div>
                  </div>
                  <Row className="g-3">
                    {THU_TRONG_TUAN.map((thu) => {
                      const dsCa = coDinhTheoThu[thu] ?? [];
                      const dauTuan = thu >= 1 && thu <= 5;
                      return (
                        <Col key={thu} xs={12} md={6} xxl={4}>
                          <div
                            className={`lich-tuan-fd-day rounded-3 bg-white shadow-sm h-100 overflow-hidden border ${
                              dauTuan ? "border-secondary-subtle" : "border-warning-subtle border-2"
                            }`}
                          >
                            <div
                              className={`px-3 py-2 d-flex justify-content-between align-items-center border-bottom ${
                                dauTuan
                                  ? "bg-primary-subtle bg-opacity-50"
                                  : "bg-warning-subtle bg-opacity-50"
                              }`}
                            >
                              <div className="d-flex align-items-center gap-2 min-w-0">
                                <span
                                  className={`rounded-pill small fw-semibold px-2 py-0 flex-shrink-0 ${
                                    dauTuan
                                      ? "bg-primary text-white"
                                      : "bg-warning text-dark"
                                  }`}
                                >
                                  {thu <= 6 ? `T${thu + 1}` : "CN"}
                                </span>
                                <span className="fw-semibold text-body text-truncate">
                                  {TEN_THU[thu]}
                                </span>
                              </div>
                              {canEditSchedules ? (
                                <Button
                                  variant={dauTuan ? "primary" : "outline-dark"}
                                  size="sm"
                                  className="rounded-pill px-2 px-sm-3 flex-shrink-0"
                                  onClick={() => {
                                    setNewCoDinh({
                                      thuTrongTuan: thu,
                                      khungGioBatDau: "07:30",
                                      khungGioKetThuc: "11:30",
                                    });
                                    setShowAddCoDinh(true);
                                  }}
                                  title={`Thêm ca ${TEN_THU[thu]}`}
                                >
                                  <i className="bi bi-plus-lg me-sm-1" aria-hidden />
                                  <span className="d-none d-sm-inline">Thêm ca</span>
                                </Button>
                              ) : null}
                            </div>
                            <div className="p-3">
                              {dsCa.length === 0 ? (
                                <div className="text-center text-muted small py-4 rounded-3 border border-2 border-dashed bg-body-secondary bg-opacity-50">
                                  <i className="bi bi-moon d-block fs-4 mb-2 opacity-50" aria-hidden />
                                  Nghỉ
                                </div>
                              ) : (
                                <div className="vstack gap-3">
                                  {dsCa.map((c) => (
                                    <div
                                      key={c.id}
                                      className="lich-tuan-fd-ca rounded-3 border bg-body-tertiary bg-opacity-40 p-3"
                                    >
                                      {canEditSchedules ? (
                                        <Row className="g-2 g-sm-3 align-items-end">
                                          <Col xs={6} sm={4} md={5}>
                                            <Form.Label className="small text-uppercase text-muted mb-1">
                                              Bắt đầu
                                            </Form.Label>
                                            <Form.Control
                                              size="sm"
                                              type="time"
                                              value={chuanGio(c.khungGioBatDau)}
                                              onChange={(e) =>
                                                handleCapNhatCoDinh(c, {
                                                  khungGioBatDau: e.target.value,
                                                })
                                              }
                                              className="border-secondary-subtle font-monospace"
                                            />
                                          </Col>
                                          <Col xs={6} sm={4} md={5}>
                                            <Form.Label className="small text-uppercase text-muted mb-1">
                                              Kết thúc
                                            </Form.Label>
                                            <Form.Control
                                              size="sm"
                                              type="time"
                                              value={chuanGio(c.khungGioKetThuc)}
                                              onChange={(e) =>
                                                handleCapNhatCoDinh(c, {
                                                  khungGioKetThuc: e.target.value,
                                                })
                                              }
                                              className="border-secondary-subtle font-monospace"
                                            />
                                          </Col>
                                          <Col xs={12} sm="auto" className="ms-sm-auto d-flex justify-content-end">
                                            <Button
                                              size="sm"
                                              className="btn-action-delete mt-1 mt-sm-0"
                                              onClick={() => handleDeleteCoDinh(c.id)}
                                              title="Xóa ca"
                                            >
                                              <i className="bi bi-trash me-1" aria-hidden />
                                              Xóa
                                            </Button>
                                          </Col>
                                        </Row>
                                      ) : (
                                        <div className="font-monospace fs-6 fw-semibold text-body">
                                          {chuanGio(c.khungGioBatDau)} – {chuanGio(c.khungGioKetThuc)}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </Col>
                      );
                    })}
                  </Row>
                </div>
              )}
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
            <Card className="card--static border-0 shadow-sm overflow-hidden">
              <LichTabCardHeader
                icon="bi-calendar-event"
                title="Ca ngoại lệ"
                subtitle={
                  <>
                    Bảy ô T2–CN như tab ca cố định; mỗi ô chỉ hiển thị{" "}
                    <strong>ngoại lệ / lịch cũ theo ngày</strong> (không hiển thị ca mẫu tuần).{" "}
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 align-baseline"
                      onClick={() => setTab("co-dinh")}
                    >
                      Sửa mẫu tuần
                    </Button>
                  </>
                }
              />

              <div className="lich-tuan-fd border-top px-3 px-lg-4 py-4 bg-body-secondary bg-opacity-35">
                <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-3">
                  <div>
                    <div className="fw-semibold text-body">Theo tuần (T2–CN)</div>
                    <div className="small text-muted">
                      {tenBacSiChon ? `${tenBacSiChon} · ` : ""}
                      {formatNgay(tuanBatDauTuNgay)} – {formatNgay(tuanChuNhatIso)} · chỉ ngoại lệ theo
                      từng ngày.
                    </div>
                  </div>
                  <div className="d-flex flex-wrap gap-2 align-items-end">
                    <Button
                      type="button"
                      variant="outline-secondary"
                      size="sm"
                      className="rounded-pill"
                      onClick={() => setDate(congNgayIso(date, -7))}
                    >
                      <i className="bi bi-chevron-left me-1" aria-hidden />
                      Tuần trước
                    </Button>
                    <div>
                      <Form.Label className="small text-uppercase text-muted fw-semibold mb-1 d-block">
                        Chọn ngày (nhảy tuần)
                      </Form.Label>
                      <Form.Control
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="border-secondary-subtle"
                        style={{ minWidth: "10.5rem" }}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline-secondary"
                      size="sm"
                      className="rounded-pill"
                      onClick={() => setDate(congNgayIso(date, 7))}
                    >
                      Tuần sau
                      <i className="bi bi-chevron-right ms-1" aria-hidden />
                    </Button>
                  </div>
                </div>
                {bangTai ? (
                  <div className="text-center text-muted small py-5 rounded-3 border border-2 border-dashed bg-body-secondary bg-opacity-50">
                    <Spinner
                      animation="border"
                      size="sm"
                      className="text-primary mb-2 d-block mx-auto"
                      role="status"
                    />
                    Đang tải lịch trong tuần…
                  </div>
                ) : (
                  <Row className="g-3">
                    {THU_TRONG_TUAN.map((thu) => {
                      const dayIso = congNgayIso(tuanBatDauTuNgay, thu - 1);
                      const dsNgoaiLe = schedules.filter(
                        (s) =>
                          s.ngayLich === dayIso &&
                          (s.nguonBanGhi === "NGOAI_LE" ||
                            s.nguonBanGhi === "LICH_BAC_SI_THU_VIEN"),
                      );
                      const dauTuan = thu >= 1 && thu <= 5;
                      const dangMoFormChoNgayNay = showAdd && date === dayIso;
                      const gioHanhChinhThu = coDinhList
                        .filter(
                          (c) => (c.thuTrongTuan === 0 ? 7 : c.thuTrongTuan) === thu,
                        )
                        .map((c) => ({
                          batDau: chuanGio(c.khungGioBatDau),
                          ketThuc: chuanGio(c.khungGioKetThuc),
                        }))
                        .sort((a, b) => a.batDau.localeCompare(b.batDau));
                      return (
                        <Col key={thu} xs={12} md={6} xxl={4}>
                          <div
                            className={`lich-tuan-fd-day rounded-3 bg-white shadow-sm h-100 overflow-hidden border ${
                              dayIso === date
                                ? "border-primary border-2"
                                : dauTuan
                                  ? "border-secondary-subtle"
                                  : "border-warning-subtle border-2"
                            }`}
                          >
                            <div
                              className={`px-3 py-2 d-flex justify-content-between align-items-center border-bottom ${
                                dauTuan
                                  ? "bg-primary-subtle bg-opacity-50"
                                  : "bg-warning-subtle bg-opacity-50"
                              }`}
                            >
                              <div className="d-flex flex-column min-w-0 gap-0">
                                <div className="d-flex align-items-center gap-2 min-w-0">
                                  <span
                                    className={`rounded-pill small fw-semibold px-2 py-0 flex-shrink-0 ${
                                      dauTuan ? "bg-primary text-white" : "bg-warning text-dark"
                                    }`}
                                  >
                                    {thu <= 6 ? `T${thu + 1}` : "CN"}
                                  </span>
                                  <span className="fw-semibold text-body text-truncate">
                                    {TEN_THU[thu]}
                                  </span>
                                </div>
                                <span className="small text-muted ps-0 mt-1">
                                  {formatNgay(dayIso)}
                                </span>
                              </div>
                              {canEditSchedules ? (
                                <div className="d-flex flex-column flex-sm-row gap-1 flex-shrink-0 align-items-stretch align-items-sm-center">
                                  <Button
                                    variant={dangMoFormChoNgayNay ? "outline-secondary" : "primary"}
                                    size="sm"
                                    className="rounded-pill px-2 px-sm-3"
                                    onClick={() => {
                                      setDate(dayIso);
                                      setLoiNgoaiLe("");
                                      setShowAdd(!dangMoFormChoNgayNay);
                                    }}
                                    title={`Thêm ca ngoại lệ ${formatNgay(dayIso)}`}
                                  >
                                    <i className="bi bi-plus-lg me-sm-1" aria-hidden />
                                    <span className="d-none d-sm-inline">
                                      {dangMoFormChoNgayNay ? "Đóng form" : "Thêm ca"}
                                    </span>
                                    <span className="d-sm-none">{dangMoFormChoNgayNay ? "Đóng" : "Thêm"}</span>
                                  </Button>
                                  <Button
                                    variant="outline-warning"
                                    size="sm"
                                    className="rounded-pill px-2 px-sm-3"
                                    onClick={() => handleNghiCaNgay(dayIso)}
                                    title={`Nghỉ cả ngày ${formatNgay(dayIso)}`}
                                  >
                                    <i className="bi bi-moon me-sm-1" aria-hidden />
                                    <span className="d-none d-sm-inline">Nghỉ cả ngày</span>
                                    <span className="d-sm-none">Nghỉ</span>
                                  </Button>
                                </div>
                              ) : null}
                            </div>
                            <div className="p-3">
                              {dangMoFormChoNgayNay && canEditSchedules ? (
                                <div className="mb-3 rounded-3 border border-primary-subtle bg-white p-3 shadow-sm">
                                  <div className="d-flex align-items-start gap-2 pb-2 mb-2 border-bottom">
                                    <span className="rounded-2 bg-primary text-white p-2 d-inline-flex flex-shrink-0">
                                      <i className="bi bi-plus-lg" aria-hidden />
                                    </span>
                                    <div className="flex-grow-1 min-w-0">
                                      <div className="fw-semibold text-body">Thêm ca ngoại lệ</div>
                                      <div className="small text-muted">{formatNgay(dayIso)}</div>
                                      <div className="small text-muted mt-1">
                                        Giờ hành chính {TEN_THU[thu] ?? "—"}:{" "}
                                        {gioHanhChinhThu.length === 0 ? (
                                          <em>Nghỉ (không có ca cố định)</em>
                                        ) : (
                                          gioHanhChinhThu.map((g, i) => (
                                            <span key={`${g.batDau}-${g.ketThuc}`}>
                                              {i > 0 ? ", " : ""}
                                              <span className="font-monospace">
                                                {g.batDau}–{g.ketThuc}
                                              </span>
                                            </span>
                                          ))
                                        )}
                                        . Ca ngoại lệ phải nằm <strong>ngoài</strong> các khung đó.
                                      </div>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="outline-secondary"
                                      size="sm"
                                      className="flex-shrink-0"
                                      onClick={() => {
                                        setLoiNgoaiLe("");
                                        setShowAdd(false);
                                      }}
                                    >
                                      <i className="bi bi-x-lg me-1" aria-hidden />
                                      Đóng
                                    </Button>
                                  </div>
                                  {loiNgoaiLe ? (
                                    <Alert
                                      variant="danger"
                                      className="py-2 small mb-2"
                                      dismissible
                                      onClose={() => setLoiNgoaiLe("")}
                                    >
                                      {loiNgoaiLe}
                                    </Alert>
                                  ) : null}
                                  <Row className="g-2 align-items-end">
                                    <Col xs={6} sm={5}>
                                      <Form.Label className="small text-uppercase text-muted fw-semibold mb-1">
                                        Bắt đầu
                                      </Form.Label>
                                      <Form.Control
                                        size="sm"
                                        type="time"
                                        value={newSlot.khungGioBatDau}
                                        onChange={(e) => {
                                          setLoiNgoaiLe("");
                                          setNewSlot({
                                            ...newSlot,
                                            khungGioBatDau: e.target.value,
                                          });
                                        }}
                                        isInvalid={Boolean(loiNgoaiLe)}
                                        className="border-secondary-subtle font-monospace"
                                      />
                                    </Col>
                                    <Col xs={6} sm={5}>
                                      <Form.Label className="small text-uppercase text-muted fw-semibold mb-1">
                                        Kết thúc
                                      </Form.Label>
                                      <Form.Control
                                        size="sm"
                                        type="time"
                                        value={newSlot.khungGioKetThuc}
                                        onChange={(e) => {
                                          setLoiNgoaiLe("");
                                          setNewSlot({
                                            ...newSlot,
                                            khungGioKetThuc: e.target.value,
                                          });
                                        }}
                                        isInvalid={Boolean(loiNgoaiLe)}
                                        className="border-secondary-subtle font-monospace"
                                      />
                                    </Col>
                                    <Col xs={12} sm="auto" className="ms-sm-auto">
                                      <Button
                                        variant="primary"
                                        size="sm"
                                        className="px-3"
                                        onClick={handleAddSlot}
                                      >
                                        <i className="bi bi-check2 me-1" aria-hidden />
                                        Lưu ca
                                      </Button>
                                    </Col>
                                  </Row>
                                </div>
                              ) : null}
                              {dsNgoaiLe.length === 0 && !dangMoFormChoNgayNay ? (
                                <div className="text-center text-muted small py-4 rounded-3 border border-2 border-dashed bg-body-secondary bg-opacity-50">
                                  <i
                                    className="bi bi-calendar-check d-block fs-4 mb-2 opacity-50"
                                    aria-hidden
                                  />
                                  Không có ngoại lệ.
                                  {canEditSchedules ? (
                                    <div className="mt-3">
                                      <Button
                                        variant="primary"
                                        size="sm"
                                        className="rounded-pill px-3"
                                        onClick={() => {
                                          setDate(dayIso);
                                          setLoiNgoaiLe("");
                                          setShowAdd(true);
                                        }}
                                      >
                                        <i className="bi bi-plus-lg me-1" aria-hidden />
                                        Thêm ca
                                      </Button>
                                    </div>
                                  ) : null}
                                </div>
                              ) : dsNgoaiLe.length > 0 ? (
                                <div className="vstack gap-3">
                                  {dsNgoaiLe.map((s) => (
                                    <div
                                      key={`${s.ngayLich}-${s.nguonBanGhi ?? "x"}-${s.id}`}
                                      className="lich-tuan-fd-ca rounded-3 border bg-body-tertiary bg-opacity-40 p-3"
                                    >
                                      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                                        <div className="d-flex flex-wrap align-items-center gap-2 min-w-0">
                                          <NhanNguonLich s={s} />
                                          {s.nghiCaNgay ? (
                                            <span className="text-warning-emphasis small">
                                              <i className="bi bi-slash-circle me-1" aria-hidden />
                                              Không trực cả ngày
                                            </span>
                                          ) : (
                                            <span className="font-monospace fs-6 fw-semibold text-body">
                                              {chuanGio(s.khungGioBatDau)} –{" "}
                                              {chuanGio(s.khungGioKetThuc)}
                                            </span>
                                          )}
                                        </div>
                                        {canEditSchedules ? (
                                          <Button
                                            size="sm"
                                            className="btn-action-delete"
                                            onClick={() => handleDelete(s)}
                                            title="Xóa dòng này"
                                          >
                                            <i className="bi bi-trash me-1" aria-hidden />
                                            Xóa
                                          </Button>
                                        ) : null}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </Col>
                      );
                    })}
                  </Row>
                )}
              </div>
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
            <Card className="card--static border-0 shadow-sm overflow-hidden">
              <LichTabCardHeader
                tone="success"
                icon="bi-journal-check"
                title="Lịch đã đặt"
                subtitle={
                  <>
                    Lịch hẹn bệnh nhân theo ngày (chỉ xem). Ca trực — tab{" "}
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 align-baseline"
                      onClick={() => setTab("ngoai-le")}
                    >
                      Ca ngoại lệ
                    </Button>
                    .
                  </>
                }
                trailing={
                  <>
                    <div>
                      <Form.Label className="fw-semibold small text-uppercase text-muted mb-1 d-block">
                        Ngày
                      </Form.Label>
                      <Form.Control
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="border-secondary-subtle"
                        style={{ minWidth: "11.5rem" }}
                      />
                    </div>
                    <div className="text-lg-end">
                      <div className="small text-muted text-uppercase fw-semibold">
                        Tổng trong ngày
                      </div>
                      <div className="fw-semibold fs-5 text-body">
                        {appointments.length} lượt
                      </div>
                    </div>
                  </>
                }
              />

              <div className="border-top">
                <div className="px-4 pt-3 pb-2 border-bottom d-flex flex-wrap justify-content-between align-items-center gap-2">
                  <div>
                    <div className="small text-muted text-uppercase fw-semibold mb-1">
                      Danh sách
                    </div>
                    <span className="fw-semibold text-body">Lịch hẹn</span>
                    <span className="text-muted small ms-0 ms-sm-2 d-block d-sm-inline">
                      {tenBacSiChon ? `${tenBacSiChon} · ` : ""}
                      {formatNgay(date)}
                    </span>
                  </div>
                  {bangTai ? (
                    <Spinner animation="border" size="sm" className="text-primary" />
                  ) : null}
                </div>
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
              </div>
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
