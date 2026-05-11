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
  ButtonGroup,
  Dropdown,
} from "react-bootstrap";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import {
  appointmentsApi,
  patientsApi,
  doctorsApi,
  servicesApi,
  chuyenKhoaApi,
  type LichHen,
  type BenhNhan,
  type BacSi,
  type DichVu,
  type ChuyenKhoa,
  type BacSiSlotKhaDung,
} from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { LoadingState } from "@/components/LoadingState";
import { notify } from "@/lib/notify";
import {
  LICH_HEN_STATUS_LABEL as STATUS_LABEL,
  metaTrangThaiLichHen,
} from "@/lib/lichHenStatus";
import { laChiTaiKhoanBenhNhan } from "@/lib/roles";
import { consumeLandingBookingDraft } from "@/lib/landingBookingDraft";
import {
  GIAI_DOAN_LICH_HEN_LABEL,
  type GiaiDoanLichHen,
} from "@/lib/dashboardLichHenLinks";

const TRANG_THAI_CO_LICH_DANG_XU_LY = new Set([
  "DA_DAT",
  "DA_TIEP_NHAN",
  "DANG_KHAM",
  "XET_NGHIEM",
  "DA_KE_DON",
  "CHO_THANH_TOAN",
]);
const SO_LUONG_TOI_DA_MOI_GIO = 10;

const GIAI_DOAN_FROM_URL = new Set([
  "CHO_TIEP_NHAN",
  "TRONG_KHAM",
  "SAU_KHAM",
  "HOAN_TAT",
  "HUY_VANG",
]);
type SlotThongTin = {
  gio: string;
  tong: number;
  sucChua: number;
};

function normalizeTime(value?: string): string {
  if (!value) return "00:00";
  return value.slice(0, 5);
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function isoDateLocal(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function formatNgayKhamPatient(ymd?: string | null): {
  line1: string;
  line2: string;
} {
  if (!ymd) return { line1: "—", line2: "" };
  const parts = ymd.split("-").map(Number);
  const [y, m, d] = parts;
  if (!y || !m || !d) return { line1: ymd, line2: "" };
  const dt = new Date(y, m - 1, d);
  return {
    line1: dt.toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }),
    line2: dt.toLocaleDateString("vi-VN", { year: "numeric" }),
  };
}

function monthBoundsFromYm(ym: string): { from: string; to: string } {
  const [y, m] = ym.split("-").map(Number);
  if (!y || !m || m < 1 || m > 12) {
    const t = new Date();
    return monthBoundsFromYm(`${t.getFullYear()}-${pad2(t.getMonth() + 1)}`);
  }
  const last = new Date(y, m, 0).getDate();
  return { from: `${y}-${pad2(m)}-01`, to: `${y}-${pad2(m)}-${pad2(last)}` };
}

function buildMonthGrid(
  year: number,
  monthIndex0: number,
): { dateStr: string; inMonth: boolean }[] {
  const first = new Date(year, monthIndex0, 1);
  const mondayOffset = (first.getDay() + 6) % 7;
  const start = new Date(year, monthIndex0, 1 - mondayOffset);
  const grid: { dateStr: string; inMonth: boolean }[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    grid.push({
      dateStr: isoDateLocal(d),
      inMonth: d.getMonth() === monthIndex0,
    });
  }
  return grid;
}

const LICH_HEN_CAL_WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"] as const;

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
  const [appointmentTime, setAppointmentTime] = useState("");
  const [note, setNote] = useState("");
  const [modalError, setModalError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isDangTaiCaKham, setIsDangTaiCaKham] = useState(false);
  const [bacSiCoCaTheoNgay, setBacSiCoCaTheoNgay] = useState<Record<number, boolean>>({});
  const [slotsTheoBacSi, setSlotsTheoBacSi] = useState<Record<number, SlotThongTin[]>>({});
  const [chuyenKhoa, setChuyenKhoa] = useState<ChuyenKhoa[]>([]);
  const [locChuyenKhoaId, setLocChuyenKhoaId] = useState("");

  const [maBenhNhanKhongThemLich, setMaBenhNhanKhongThemLich] = useState<
    Set<number>
  >(() => new Set());
  const [locBenhNhan, setLocBenhNhan] = useState("");
  const [locBacSi, setLocBacSi] = useState("");
  const [locDichVu, setLocDichVu] = useState("");
  const [timBacSiTrang, setTimBacSiTrang] = useState("");
  const [locTrangThaiBang, setLocTrangThaiBang] = useState("");
  const [locGiaiDoan, setLocGiaiDoan] = useState("");
  const [viewMode, setViewMode] = useState<"bang" | "lich">("bang");

  const resetDatLichForm = useCallback(() => {
    setPatientId(maBenhNhanParam ? String(Number(maBenhNhanParam)) : "");
    setDoctorId("");
    setServiceId("");
    setAppointmentDate(new Date().toISOString().slice(0, 10));
    setAppointmentTime("");
    setNote("");
    setModalError("");
    setLocBenhNhan("");
    setLocBacSi("");
    setLocDichVu("");
    setLocChuyenKhoaId("");
    setBacSiCoCaTheoNgay({});
    setSlotsTheoBacSi({});
  }, [maBenhNhanParam]);

  useEffect(() => {
    const draft = consumeLandingBookingDraft();
    if (!draft) return;
    resetDatLichForm();
    queueMicrotask(() => {
      if (draft.need.trim()) setNote(draft.need.trim());
    });
    setShowDatLich(true);
    notify.info(
      "Đã nhập ô « Ghi chú » từ form đặt lịch nhanh trên trang chủ. Chọn bệnh nhân, bác sĩ và giờ trước khi gửi.",
      "Từ landing",
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- một lần khi mount; có draft thì mở modal
  }, []);

  const chiTaiKhoanBn = useMemo(
    () => !!user && laChiTaiKhoanBenhNhan(user),
    [user],
  );

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
    if (!user || !chiTaiKhoanBn || !user.maBenhNhan || maBenhNhanParam)
      return;
    router.replace(
      `/lich-hen?maBenhNhan=${encodeURIComponent(String(user.maBenhNhan))}`,
      { scroll: false },
    );
  }, [user, chiTaiKhoanBn, maBenhNhanParam, router]);

  useEffect(() => {
    const tu = searchParams.get("tuNgay");
    const den = searchParams.get("denNgay");
    const tt = searchParams.get("trangThai");
    const gd = searchParams.get("giaiDoan");
    if (tu && den) {
      setFrom(tu);
      setTo(den);
    }
    if (tt) {
      setLocTrangThaiBang(tt);
      setLocGiaiDoan("");
    } else if (gd && GIAI_DOAN_FROM_URL.has(gd)) {
      setLocGiaiDoan(gd);
      setLocTrangThaiBang("");
    } else {
      setLocGiaiDoan("");
    }
  }, [searchParams]);

  useEffect(() => {
    if (!user) return;
    if (chiTaiKhoanBn && !user.maBenhNhan) {
      setError(
        "Tài khoản chưa liên kết hồ sơ bệnh nhân. Vui lòng liên hệ quầy lễ tân.",
      );
      setList([]);
      return;
    }
    if (chiTaiKhoanBn && user.maBenhNhan) {
      appointmentsApi
        .byPatient(user.maBenhNhan)
        .then((rows) => setList(Array.isArray(rows) ? rows : []))
        .catch((e) => setError(e.message));
      return;
    }
    appointmentsApi
      .list(from, to, 0, 100)
      .then((r) => setList(r.content))
      .catch((e) => setError(e.message));
  }, [user, from, to, listTick, chiTaiKhoanBn]);

  useEffect(() => {
    if (!showDatLich || !user) return;
    let cancelled = false;
    if (chiTaiKhoanBn && user.maBenhNhan) {
      patientsApi
        .get(user.maBenhNhan)
        .then((p) => {
          if (!cancelled) {
            setPatients([p]);
            setPatientId(String(p.id ?? user.maBenhNhan));
          }
        })
        .catch(() => {
          if (!cancelled) setPatients([]);
        });
    } else {
      patientsApi
        .list(0, 500)
        .then((r) => {
          if (!cancelled) setPatients(r.content ?? []);
        })
        .catch(() => {});
    }
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
    chuyenKhoaApi
      .danhSach()
      .then((rows) => {
        if (!cancelled) setChuyenKhoa(rows ?? []);
      })
      .catch(() => {});

    const tu = new Date();
    tu.setDate(tu.getDate() - 14);
    const den = new Date();
    den.setFullYear(den.getFullYear() + 1);
    const tuStr = tu.toISOString().slice(0, 10);
    const denStr = den.toISOString().slice(0, 10);
    const fetchBlocked = chiTaiKhoanBn && user.maBenhNhan
      ? appointmentsApi.byPatient(user.maBenhNhan)
      : appointmentsApi.list(tuStr, denStr, 0, 5000).then((r) => r.content ?? []);

    Promise.resolve(fetchBlocked)
      .then((rows) => {
        if (cancelled) return;
        const arr = Array.isArray(rows) ? rows : [];
        const blocked = new Set<number>();
        for (const a of arr) {
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
  }, [showDatLich, user, chiTaiKhoanBn]);

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
    const ds = doctors.filter((d) => {
      if (!appointmentDate || isDangTaiCaKham) return false;
      return bacSiCoCaTheoNgay[d.id] === true;
    });
    if (!q) return ds;
    return ds.filter((d) => {
      const ck = (d.tenChuyenKhoa ?? d.chuyenMon ?? "").toLowerCase();
      return (d.hoTen ?? "").toLowerCase().includes(q) || ck.includes(q);
    });
  }, [doctors, locBacSi, bacSiCoCaTheoNgay, appointmentDate, isDangTaiCaKham]);

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

  const slotsDaChon = useMemo(() => {
    const ma = Number(doctorId);
    if (!ma || Number.isNaN(ma)) return [];
    return slotsTheoBacSi[ma] ?? [];
  }, [doctorId, slotsTheoBacSi]);

  const appointmentTimeLabel = useMemo(() => {
    if (!appointmentTime) return "— Chọn khung giờ —";
    const slot = slotsDaChon.find((x) => x.gio === appointmentTime);
    if (!slot) return appointmentTime;
    const con = slot.sucChua - slot.tong;
    return `${slot.gio} — đã đặt ${slot.tong}/${slot.sucChua}${con > 0 ? ` (còn ${con})` : ""}`;
  }, [appointmentTime, slotsDaChon]);

  const danhSachLoc = useMemo(() => {
    let rows = list.filter(
      (a) =>
        !maBenhNhanParam ||
        a.maBenhNhan === Number(maBenhNhanParam),
    );
    if (chiTaiKhoanBn && user?.maBenhNhan) {
      rows = rows.filter((a) => {
        const d = a.ngayHen;
        if (!d) return false;
        return d >= from && d <= to;
      });
    }
    const q = timBacSiTrang.trim().toLowerCase();
    if (q) {
      rows = rows.filter((a) =>
        (a.tenBacSi ?? "").toLowerCase().includes(q),
      );
    }
    if (locGiaiDoan) {
      const gd = locGiaiDoan;
      rows = rows.filter((a) => {
        const tth = a.trangThai ?? "";
        if (gd === "CHO_TIEP_NHAN") return tth === "DA_DAT";
        if (gd === "TRONG_KHAM") {
          return (
            tth === "DA_TIEP_NHAN" ||
            tth === "DANG_KHAM" ||
            tth === "XET_NGHIEM"
          );
        }
        if (gd === "SAU_KHAM") {
          return tth === "DA_KE_DON" || tth === "CHO_THANH_TOAN";
        }
        if (gd === "HOAN_TAT") return tth === "DA_THANH_TOAN";
        if (gd === "HUY_VANG") return tth === "HUY" || tth === "VANG";
        return true;
      });
    } else if (locTrangThaiBang) {
      rows = rows.filter((a) => (a.trangThai ?? "") === locTrangThaiBang);
    }
    return rows;
  }, [
    list,
    maBenhNhanParam,
    timBacSiTrang,
    locTrangThaiBang,
    locGiaiDoan,
    chiTaiKhoanBn,
    user?.maBenhNhan,
    from,
    to,
  ]);

  const lichTheoNgay = useMemo(() => {
    const map = new Map<string, LichHen[]>();
    for (const a of danhSachLoc) {
      const d = a.ngayHen;
      if (!d) continue;
      if (!map.has(d)) map.set(d, []);
      map.get(d)!.push(a);
    }
    for (const arr of Array.from(map.values())) {
      arr.sort((x: LichHen, y: LichHen) =>
        normalizeTime(x.gioHen).localeCompare(normalizeTime(y.gioHen)),
      );
    }
    return map;
  }, [danhSachLoc]);

  const calendarMonthYm = useMemo(() => from.slice(0, 7), [from]);

  const calendarGrid = useMemo(() => {
    const [y, m] = calendarMonthYm.split("-").map(Number);
    if (!y || !m) return buildMonthGrid(new Date().getFullYear(), new Date().getMonth());
    return buildMonthGrid(y, m - 1);
  }, [calendarMonthYm]);

  const calendarTitle = useMemo(() => {
    const [y, m] = calendarMonthYm.split("-").map(Number);
    if (!y || !m) return "";
    return new Date(y, m - 1, 1).toLocaleDateString("vi-VN", {
      month: "long",
      year: "numeric",
    });
  }, [calendarMonthYm]);

  const shiftCalendarMonth = (delta: number) => {
    const [y, m] = calendarMonthYm.split("-").map(Number);
    if (!y || !m) return;
    const d = new Date(y, m - 1 + delta, 1);
    const nextYm = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
    const b = monthBoundsFromYm(nextYm);
    setFrom(b.from);
    setTo(b.to);
  };

  const patientLichQuickRange = useCallback(
    (mode: "near" | "month" | "wide") => {
      const t = new Date();
      const fromD = new Date(t);
      const toD = new Date(t);
      if (mode === "near") {
        fromD.setDate(t.getDate() - 1);
        toD.setDate(t.getDate() + 14);
      } else if (mode === "month") {
        fromD.setDate(t.getDate() - 2);
        toD.setDate(t.getDate() + 45);
      } else {
        fromD.setMonth(t.getMonth() - 3);
        toD.setMonth(t.getMonth() + 6);
      }
      setFrom(isoDateLocal(fromD));
      setTo(isoDateLocal(toD));
    },
    [],
  );

  const todayStr = isoDateLocal(new Date());
  const bangColSpan = chiTaiKhoanBn ? 6 : 7;

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
    if (!appointmentDate) {
      setModalError("Vui lòng chọn ngày khám.");
      return;
    }
    if (!appointmentTime) {
      setModalError("Vui lòng chọn giờ khám.");
      return;
    }
    const pid = Number(patientId);
    if (!Number.isNaN(pid) && maBenhNhanKhongThemLich.has(pid)) {
      setModalError(
        "Bệnh nhân này đã có lịch đang xử lý — không thể đặt thêm.",
      );
      return;
    }
    const slotDaChon = slotsDaChon.find((s) => s.gio === appointmentTime);
    if (slotDaChon && slotDaChon.tong >= slotDaChon.sucChua) {
      setModalError("Khung giờ này đã đủ số lượng. Vui lòng chọn khung giờ khác.");
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

  useEffect(() => {
    if (!showDatLich || !appointmentDate) {
      setBacSiCoCaTheoNgay({});
      setSlotsTheoBacSi({});
      return;
    }
    let cancelled = false;
    setIsDangTaiCaKham(true);
    const taiCaTheoNgay = async () => {
      const maChuyenKhoa = locChuyenKhoaId ? Number(locChuyenKhoaId) : undefined;
      const result = await appointmentsApi.slotKhaDungTheoNgay(appointmentDate, maChuyenKhoa);
      if (cancelled) return;
      const slotsMap: Record<number, SlotThongTin[]> = {};
      const caHopLeMap: Record<number, boolean> = {};
      for (const item of result as BacSiSlotKhaDung[]) {
        slotsMap[item.maBacSi] = (item.slots ?? []).map((s) => ({
          gio: normalizeTime(s.gio),
          tong: s.soLuongDaDat ?? 0,
          sucChua: s.sucChua ?? SO_LUONG_TOI_DA_MOI_GIO,
        }));
        caHopLeMap[item.maBacSi] = (item.slots ?? []).length > 0;
      }
      setSlotsTheoBacSi(slotsMap);
      setBacSiCoCaTheoNgay(caHopLeMap);
    };
    taiCaTheoNgay()
      .catch(() => {
        if (!cancelled) {
          setSlotsTheoBacSi({});
          setBacSiCoCaTheoNgay({});
        }
      })
      .finally(() => {
        if (!cancelled) setIsDangTaiCaKham(false);
      });
    return () => {
      cancelled = true;
    };
  }, [showDatLich, appointmentDate, locChuyenKhoaId]);

  useEffect(() => {
    if (!doctorId) {
      setAppointmentTime("");
      return;
    }
    const slotConCho = slotsDaChon.filter((s) => s.tong < s.sucChua);
    if (slotConCho.length === 0) {
      setAppointmentTime("");
      return;
    }
    if (!slotConCho.some((s) => s.gio === appointmentTime)) {
      setAppointmentTime(slotConCho[0].gio);
    }
  }, [doctorId, slotsDaChon, appointmentTime]);

  useEffect(() => {
    if (doctorId && bacSiCoCaTheoNgay[Number(doctorId)] === false) {
      setDoctorId("");
      setAppointmentTime("");
      setModalError("Bác sĩ đã chọn không có ca làm việc trong ngày này. Vui lòng chọn bác sĩ khác.");
    }
  }, [doctorId, bacSiCoCaTheoNgay]);

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

  const hoaDonTheoHoSoHref =
    user.maBenhNhan != null
      ? `/hoa-don?maBenhNhan=${encodeURIComponent(String(user.maBenhNhan))}`
      : "/hoa-don";

  return (
    <div
      className={`lich-hen-page${chiTaiKhoanBn ? " patient-portal-lichen" : ""}`}
    >
      <PageHeader
        title={chiTaiKhoanBn ? "Lịch khám của bạn" : "Lịch khám"}
        subtitle={
          chiTaiKhoanBn
            ? "Xem lịch đã đặt, theo dõi trạng thái và đặt thêm lịch mới khi bạn cần."
            : "Lọc ngày, tìm bác sĩ, trạng thái — xem và mở chi tiết từng lượt khám."
        }
      >
        <div className="d-flex flex-wrap gap-2 align-items-center">
          {chiTaiKhoanBn && (
            <>
              <Link
                href="/benh-nhan"
                className="btn btn-sm btn-light border rounded-pill d-inline-flex align-items-center gap-2"
              >
                <i className="bi bi-person-circle" aria-hidden />
                Hồ sơ của tôi
              </Link>
              <Link
                href={hoaDonTheoHoSoHref}
                className="btn btn-sm btn-light border rounded-pill d-inline-flex align-items-center gap-2"
              >
                <i className="bi bi-receipt" aria-hidden />
                Hóa đơn
              </Link>
            </>
          )}
          {!chiTaiKhoanBn && (
            <Button
              className="btn-service-export d-inline-flex align-items-center gap-2"
              onClick={handleExportCsv}
            >
              <i className="bi bi-filetype-csv" aria-hidden />
              Export CSV
            </Button>
          )}
          <Button
            variant="primary"
            className="d-inline-flex align-items-center gap-2 rounded-pill px-3"
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
      <Card
        className={`mb-3 card--static border-0 shadow-sm${
          chiTaiKhoanBn ? " patient-portal-lichen__filters" : ""
        }`}
      >
        <Card.Body>
          {chiTaiKhoanBn ? (
            <>
              <p className="patient-portal-lichen__lead text-muted mb-0">
                Chọn khoảng thời gian theo{" "}
                <strong className="text-body">ngày khám</strong>. Bạn có thể
                gõ tên bác sĩ hoặc mở phần trạng thái nếu cần lọc sâu hơn.
              </p>
              <div className="patient-portal-lichen__presets">
                <Button
                  type="button"
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => patientLichQuickRange("near")}
                >
                  ~2 tuần
                </Button>
                <Button
                  type="button"
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => patientLichQuickRange("month")}
                >
                  ~1,5 tháng
                </Button>
                <Button
                  type="button"
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => patientLichQuickRange("wide")}
                >
                  Nửa năm
                </Button>
              </div>
              <div className="patient-portal-lichen__filter-grid">
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
                <Form.Group className="patient-portal-lichen__filter-span-2">
                  <Form.Label>Tìm theo bác sĩ</Form.Label>
                  <Form.Control
                    type="search"
                    placeholder="Gõ tên bác sĩ…"
                    value={timBacSiTrang}
                    onChange={(e) => setTimBacSiTrang(e.target.value)}
                    autoComplete="off"
                    aria-label="Tìm theo bác sĩ"
                  />
                </Form.Group>
                <div className="patient-portal-lichen__filter-view patient-portal-lichen__filter-span-2">
                  <details className="patient-portal-lichen__advanced">
                    <summary>Lọc theo trạng thái (tuỳ chọn)</summary>
                    <Form.Group className="mb-0 mt-2">
                      <Form.Select
                        value={locTrangThaiBang}
                        onChange={(e) => {
                          setLocTrangThaiBang(e.target.value);
                          setLocGiaiDoan("");
                        }}
                        aria-label="Lọc theo trạng thái"
                      >
                        <option value="">Mọi trạng thái</option>
                        {(
                          Object.keys(STATUS_LABEL) as Array<
                            keyof typeof STATUS_LABEL
                          >
                        ).map((key) => (
                          <option key={key} value={key}>
                            {STATUS_LABEL[key]}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </details>
                  <Form.Group className="mb-0">
                    <Form.Label className="d-block">Hiển thị</Form.Label>
                    <ButtonGroup aria-label="Chế độ xem lịch khám">
                      <Button
                        type="button"
                        variant={
                          viewMode === "bang" ? "primary" : "outline-primary"
                        }
                        size="sm"
                        className="d-inline-flex align-items-center gap-1"
                        onClick={() => setViewMode("bang")}
                      >
                        <i className="bi bi-list-ul" aria-hidden />
                        Danh sách
                      </Button>
                      <Button
                        type="button"
                        variant={
                          viewMode === "lich" ? "primary" : "outline-primary"
                        }
                        size="sm"
                        className="d-inline-flex align-items-center gap-1"
                        onClick={() => {
                          setViewMode("lich");
                          const b = monthBoundsFromYm(from.slice(0, 7));
                          setFrom(b.from);
                          setTo(b.to);
                        }}
                      >
                        <i className="bi bi-calendar3" aria-hidden />
                        Lịch tháng
                      </Button>
                    </ButtonGroup>
                  </Form.Group>
                </div>
              </div>
            </>
          ) : (
            <div className="d-flex flex-wrap gap-3 align-items-end justify-content-between">
              <div className="d-flex flex-wrap gap-3 align-items-end flex-grow-1">
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
                    onChange={(e) => {
                      setLocTrangThaiBang(e.target.value);
                      setLocGiaiDoan("");
                    }}
                    aria-label="Lọc theo trạng thái"
                  >
                    <option value="">Tất cả trạng thái</option>
                    {(
                      Object.keys(STATUS_LABEL) as Array<
                        keyof typeof STATUS_LABEL
                      >
                    ).map((key) => (
                      <option key={key} value={key}>
                        {STATUS_LABEL[key]}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>
              <Form.Group className="mb-0">
                <Form.Label className="d-block">Hiển thị</Form.Label>
                <ButtonGroup aria-label="Chế độ xem lịch khám">
                  <Button
                    type="button"
                    variant={viewMode === "bang" ? "primary" : "outline-primary"}
                    size="sm"
                    className="d-inline-flex align-items-center gap-1"
                    onClick={() => setViewMode("bang")}
                  >
                    <i className="bi bi-list-ul" aria-hidden />
                    Danh sách
                  </Button>
                  <Button
                    type="button"
                    variant={viewMode === "lich" ? "primary" : "outline-primary"}
                    size="sm"
                    className="d-inline-flex align-items-center gap-1"
                    onClick={() => {
                      setViewMode("lich");
                      const b = monthBoundsFromYm(from.slice(0, 7));
                      setFrom(b.from);
                      setTo(b.to);
                    }}
                  >
                    <i className="bi bi-calendar3" aria-hidden />
                    Lịch tháng
                  </Button>
                </ButtonGroup>
              </Form.Group>
            </div>
          )}
          {locGiaiDoan && GIAI_DOAN_FROM_URL.has(locGiaiDoan) ? (
            <div className="d-flex flex-wrap align-items-center gap-2 mt-3 pt-3 border-top small">
              <span className="text-primary fw-semibold">
                <i className="bi bi-funnel me-1" aria-hidden />
                Lọc luồng từ bảng điều khiển:{" "}
                {GIAI_DOAN_LICH_HEN_LABEL[locGiaiDoan as GiaiDoanLichHen]}
              </span>
              <Button
                type="button"
                variant="outline-secondary"
                size="sm"
                onClick={() => setLocGiaiDoan("")}
              >
                Bỏ lọc luồng
              </Button>
            </div>
          ) : null}
        </Card.Body>
      </Card>
      {viewMode === "lich" ? (
        <Card
          className={`card--static border-0 shadow-sm overflow-hidden lich-hen-cal-card${
            chiTaiKhoanBn ? " patient-portal-lichen__cal-shell" : ""
          }`}
        >
          <Card.Body className="p-0">
            <div className="lich-hen-cal-toolbar px-3 py-3 border-bottom d-flex flex-wrap align-items-center gap-3">
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <Button
                  type="button"
                  variant="outline-secondary"
                  size="sm"
                  aria-label="Tháng trước"
                  onClick={() => shiftCalendarMonth(-1)}
                >
                  <i className="bi bi-chevron-left" aria-hidden />
                </Button>
                <h2 className="h5 mb-0 fw-semibold lich-hen-cal-title">
                  {calendarTitle}
                </h2>
                <Button
                  type="button"
                  variant="outline-secondary"
                  size="sm"
                  aria-label="Tháng sau"
                  onClick={() => shiftCalendarMonth(1)}
                >
                  <i className="bi bi-chevron-right" aria-hidden />
                </Button>
              </div>
              <Button
                type="button"
                variant="outline-primary"
                size="sm"
                className="ms-md-auto"
                onClick={() => {
                  const b = monthBoundsFromYm(
                    isoDateLocal(new Date()).slice(0, 7),
                  );
                  setFrom(b.from);
                  setTo(b.to);
                }}
              >
                <i className="bi bi-calendar-event me-1" aria-hidden />
                Tháng này
              </Button>
            </div>
            <div className="lich-hen-cal-grid-wrap px-2 pb-3 pt-2">
              <div className="lich-hen-cal-weekdays" aria-hidden>
                {LICH_HEN_CAL_WEEKDAYS.map((w) => (
                  <div key={w} className="lich-hen-cal-weekday">
                    {w}
                  </div>
                ))}
              </div>
              <div className="lich-hen-cal-cells">
                {calendarGrid.map((cell) => {
                  const items = lichTheoNgay.get(cell.dateStr) ?? [];
                  const isToday = cell.dateStr === todayStr;
                  const dayNum = Number(cell.dateStr.slice(8, 10));
                  return (
                    <div
                      key={cell.dateStr}
                      className={[
                        "lich-hen-cal-cell",
                        !cell.inMonth ? "lich-hen-cal-cell--fade" : "",
                        isToday ? "lich-hen-cal-cell--today" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <div className="lich-hen-cal-daynum">{dayNum}</div>
                      <div className="lich-hen-cal-events">
                        {items.slice(0, 4).map((a) => {
                          const meta = metaTrangThaiLichHen(a.trangThai);
                          const chipMain = chiTaiKhoanBn
                            ? (a.tenBacSi ?? "—")
                            : (a.tenBenhNhan ?? a.tenBacSi ?? "—");
                          return (
                            <Link
                              key={a.id}
                              href={`/lich-hen/${a.id}`}
                              className={[
                                "lich-hen-cal-chip",
                                TRANG_THAI_CO_LICH_DANG_XU_LY.has(
                                  a.trangThai ?? "",
                                )
                                  ? ""
                                  : "lich-hen-cal-chip--muted",
                              ]
                                .filter(Boolean)
                                .join(" ")}
                              title={[
                                normalizeTime(a.gioHen),
                                a.tenBenhNhan,
                                a.tenBacSi,
                                a.tenDichVu,
                                meta.label,
                              ]
                                .filter(Boolean)
                                .join(" · ")}
                            >
                              <span className="lich-hen-cal-chip__time">
                                {normalizeTime(a.gioHen)}
                              </span>
                              <span className="lich-hen-cal-chip__main text-truncate">
                                {chipMain}
                              </span>
                              <span
                                className={`lich-hen-cal-status-dot lich-hen-cal-status-dot--${meta.slug}`}
                                title={meta.label}
                                aria-hidden
                              />
                            </Link>
                          );
                        })}
                        {items.length > 4 ? (
                          <div className="lich-hen-cal-more text-muted">
                            +{items.length - 4} lịch
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card.Body>
        </Card>
      ) : chiTaiKhoanBn ? (
        <div className="patient-portal-lichen__list">
          {danhSachLoc.map((a) => {
            const meta = metaTrangThaiLichHen(a.trangThai);
            const { line1, line2 } = formatNgayKhamPatient(a.ngayHen);
            return (
              <Card
                key={a.id}
                className="patient-portal-appt-card card--static border-0 shadow-sm"
              >
                <Card.Body>
                  <div className="patient-portal-appt-card__top">
                    <div className="patient-portal-appt-card__when">
                      <span className="patient-portal-appt-card__date">
                        {line1}
                      </span>
                      {line2 ? (
                        <span className="text-muted small">{line2}</span>
                      ) : null}
                      <span className="patient-portal-appt-card__time">
                        <i className="bi bi-clock me-1" aria-hidden />
                        {normalizeTime(a.gioHen)}
                      </span>
                    </div>
                    <span
                      className={`lich-hen-status-tag lich-hen-status-tag--${meta.slug}`}
                    >
                      <i className={`bi ${meta.icon}`} aria-hidden />
                      {meta.label}
                    </span>
                  </div>
                  <div className="patient-portal-appt-card__doctor">
                    {a.tenBacSi ?? "Bác sĩ"}
                  </div>
                  <div className="patient-portal-appt-card__service">
                    <i
                      className="bi bi-heart-pulse me-1 text-primary"
                      aria-hidden
                    />
                    {a.tenDichVu ?? "—"}
                  </div>
                  <div className="patient-portal-appt-card__actions">
                    <Link
                      href={`/lich-hen/${a.id}`}
                      className="btn btn-sm btn-primary"
                    >
                      <i className="bi bi-arrow-right-circle me-1" aria-hidden />
                      Xem chi tiết lịch
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            );
          })}
          {danhSachLoc.length === 0 ? (
            <Card className="card--static border-0 shadow-sm text-center text-muted">
              <Card.Body className="py-5 px-3">
                Chưa có lịch khám trong khoảng thời gian này. Bạn có thể thử các
                nút khoảng nhanh phía trên, mở rộng từ ngày / đến ngày, hoặc{" "}
                <Button
                  type="button"
                  variant="link"
                  className="p-0 align-baseline"
                  onClick={openDatLichModal}
                >
                  đặt lịch mới
                </Button>
                .
              </Card.Body>
            </Card>
          ) : null}
        </div>
      ) : (
        <Card className="card--static border-0 shadow-sm overflow-hidden">
          <div className="table-responsive">
            <Table responsive hover className="mb-0 align-middle">
              <thead>
                <tr>
                  <th>Ngày</th>
                  <th>Giờ</th>
                  {!chiTaiKhoanBn && <th>Bệnh nhân</th>}
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
                    {!chiTaiKhoanBn && <td>{a.tenBenhNhan}</td>}
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
                    <td
                      colSpan={bangColSpan}
                      className="text-center text-muted py-4"
                    >
                      Không có lịch khám khớp bộ lọc.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </Table>
          </div>
        </Card>
      )}

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
        <Form noValidate onSubmit={handleDatLichSubmit}>
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
            {chiTaiKhoanBn ? (
              <Form.Group className="mb-3">
                <Form.Label id="label-dat-bn">Bệnh nhân</Form.Label>
                <div className="form-control-plaintext py-1" aria-labelledby="label-dat-bn">
                  {chonBenhNhanLabel}
                </div>
              </Form.Group>
            ) : (
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
            )}
            <Form.Group className="mb-3">
              <Form.Label className="required">Ngày khám</Form.Label>
              <Form.Control
                type="date"
                value={appointmentDate}
                onChange={(e) => {
                  setAppointmentDate(e.target.value);
                  setDoctorId("");
                  setAppointmentTime("");
                }}
              />
              <Form.Text className="text-muted">
                Chọn ngày trước — chỉ hiển thị bác sĩ có lịch trực (cố định hoặc ngoại lệ) trong ngày đó.
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label id="label-loc-ck-dat-lich">Chuyên khoa (lọc bác sĩ)</Form.Label>
              <Form.Select
                aria-labelledby="label-loc-ck-dat-lich"
                value={locChuyenKhoaId}
                onChange={(e) => {
                  setLocChuyenKhoaId(e.target.value);
                  setDoctorId("");
                  setAppointmentTime("");
                }}
                className="mb-3"
              >
                <option value="">Tất cả chuyên khoa</option>
                {chuyenKhoa.map((ck) => (
                  <option key={ck.id} value={String(ck.id)}>
                    {ck.tenChuyenKhoa}
                  </option>
                ))}
              </Form.Select>
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
                    {isDangTaiCaKham && (
                      <div className="px-2 py-2 text-muted small">
                        Đang tải ca làm việc theo ngày đã chọn...
                      </div>
                    )}
                    {bacSiSauLoc.length === 0 ? (
                      <div className="px-2 py-3 text-muted small text-center">
                        {!appointmentDate
                          ? "Chọn ngày khám."
                          : isDangTaiCaKham
                            ? "Đang tải…"
                            : doctors.length === 0
                              ? "Chưa có bác sĩ trong hệ thống."
                              : "Không có bác sĩ nào có ca làm việc trong ngày này."}
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
            <Form.Group className="mb-3">
              <Form.Label className="required">Giờ khám</Form.Label>
              <Dropdown className="bac-si-ck-dropdown w-100">
                <Dropdown.Toggle
                  variant="outline-secondary"
                  id="dropdown-dat-gio-kham"
                  className="w-100 text-start d-flex justify-content-between align-items-center"
                >
                  <span className="text-truncate me-2 flex-grow-1">
                    {appointmentTimeLabel}
                  </span>
                </Dropdown.Toggle>
                <Dropdown.Menu className="bac-si-ck-dropdown__menu w-100 shadow-sm pt-2 px-2 pb-2">
                  <div
                    className="bac-si-ck-dropdown__list border rounded"
                    style={{ maxHeight: 220, overflowY: "auto" }}
                  >
                    {!doctorId ? (
                      <div className="px-2 py-3 text-muted small text-center">
                        Chọn bác sĩ trước khi chọn giờ khám.
                      </div>
                    ) : slotsDaChon.length === 0 ? (
                      <div className="px-2 py-3 text-muted small text-center">
                        Không có khung giờ hợp lệ trong ngày này.
                      </div>
                    ) : (
                      slotsDaChon.map((slot) => {
                        const daDay = slot.tong >= slot.sucChua;
                        const conCho = slot.sucChua - slot.tong;
                        return (
                          <Dropdown.Item
                            key={slot.gio}
                            active={slot.gio === appointmentTime}
                            disabled={daDay}
                            onClick={() => {
                              setAppointmentTime(slot.gio);
                            }}
                          >
                            {slot.gio} — đã đặt {slot.tong}/{slot.sucChua}
                            {!daDay ? ` (còn ${conCho})` : " — Đã đầy"}
                          </Dropdown.Item>
                        );
                      })
                    )}
                  </div>
                </Dropdown.Menu>
              </Dropdown>
            </Form.Group>
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
          <Modal.Footer className="clinic-modal-footer bac-si-modal-footer clinic-modal-footer-actions border-top">
            <Button
              variant="outline-secondary"
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
