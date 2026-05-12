"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Table,
  Card,
  Form,
  Alert,
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
import {
  laChiTaiKhoanBenhNhan,
  laChiTaiKhoanBacSiXemLichHomNay,
  laCoTuDongBaoVangLichHen,
} from "@/lib/roles";
import { consumeLandingBookingDraft } from "@/lib/landingBookingDraft";
import {
  GIAI_DOAN_LICH_HEN_LABEL,
  type GiaiDoanLichHen,
} from "@/lib/dashboardLichHenLinks";
import {
  formatNgayDdMmYyyy,
  formatNgayDdMmYyyyCoThu,
  formatThangMmYyyyLabel,
  formatGioHen,
} from "@/lib/formatInstantVi";

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

const MS_15_PHUT = 15 * 60 * 1000;

function thoiDiemGioHenMs(ngayHen: string, gioHen?: string | null): number {
  const t = normalizeTime(gioHen ?? "00:00");
  const [y, m, d] = ngayHen.split("-").map(Number);
  if (!y || !m || !d) return NaN;
  const [hh, mm] = t.split(":").map(Number);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return NaN;
  return new Date(y, m - 1, d, hh, mm, 0, 0).getTime();
}

function formatKhoangThoiGianBangTiengViet(tongGiay: number): string {
  const s = Math.max(0, Math.floor(tongGiay));
  if (s === 0) return "0 giây";
  const ngay = Math.floor(s / 86400);
  const gio = Math.floor((s % 86400) / 3600);
  const phut = Math.floor((s % 3600) / 60);
  const giay = s % 60;
  const parts: string[] = [];
  if (ngay > 0) parts.push(`${ngay} ngày`);
  if (gio > 0) parts.push(`${gio} giờ`);
  if (phut > 0) parts.push(`${phut} phút`);
  if (giay > 0 || parts.length === 0) parts.push(`${giay} giây`);
  return parts.join(" ");
}

function noiDungCotChoQuaGioHen(a: LichHen, dongHo: number) {
  void dongHo;
  if (a.trangThai !== "DA_DAT" || !a.ngayHen || !a.gioHen) {
    return <span className="text-muted small">—</span>;
  }
  const t0 = thoiDiemGioHenMs(a.ngayHen, a.gioHen);
  if (Number.isNaN(t0)) {
    return <span className="text-muted small">—</span>;
  }
  const now = Date.now();
  const hanBaoVang = t0 + MS_15_PHUT;
  if (now <= t0) {
    const sec = Math.max(0, Math.ceil((t0 - now) / 1000));
    return (
      <span className="text-secondary small">
        Đến giờ hẹn · còn {formatKhoangThoiGianBangTiengViet(sec)}
      </span>
    );
  }
  if (now < hanBaoVang) {
    const secTre = Math.floor((now - t0) / 1000);
    const secConLai = Math.max(0, Math.ceil((hanBaoVang - now) / 1000));
    return (
      <span className="text-warning small fw-semibold">
        Trễ {formatKhoangThoiGianBangTiengViet(secTre)} — còn{" "}
        {formatKhoangThoiGianBangTiengViet(secConLai)} đến báo vắng
      </span>
    );
  }
  return (
    <span className="text-danger small fw-semibold">
      Khách không đến
    </span>
  );
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
  const datePart = ymd.includes("T") ? ymd.split("T")[0]! : ymd;
  const parts = datePart.split("-").map(Number);
  const [y, m, d] = parts;
  if (!y || !m || !d) return { line1: ymd, line2: "" };
  const dt = new Date(y, m - 1, d);
  if (Number.isNaN(dt.getTime())) return { line1: ymd, line2: "" };
  const weekday = dt.toLocaleDateString("vi-VN", { weekday: "long" });
  const cap = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  return { line1: cap, line2: formatNgayDdMmYyyy(datePart) };
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
  const { user, loading, setUser } = useAuth();
  const router = useRouter();
  const userRef = useRef(user);
  userRef.current = user;
  const [list, setList] = useState<LichHen[]>([]);
  const listRef = useRef<LichHen[]>([]);
  const tuDongVangDaXuLy = useRef(new Set<number>());
  const [from, setFrom] = useState(() => new Date().toISOString().slice(0, 10));
  const [to, setTo] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });
  const [error, setError] = useState("");
  const [listTick, setListTick] = useState(0);
  const [dongHoBang, setDongHoBang] = useState(0);

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
  const [slotsTheoBacSi, setSlotsTheoBacSi] = useState<Record<number, SlotThongTin[]>>({});
  const [kheGioHomNayTick, setKheGioHomNayTick] = useState(0);
  const [chuyenKhoa, setChuyenKhoa] = useState<ChuyenKhoa[]>([]);
  const [locChuyenKhoaId, setLocChuyenKhoaId] = useState("");

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
    setAppointmentDate(isoDateLocal(new Date()));
    setAppointmentTime("");
    setNote("");
    setModalError("");
    setLocBenhNhan("");
    setLocBacSi("");
    setLocDichVu("");
    setLocChuyenKhoaId("");
    setSlotsTheoBacSi({});
  }, [maBenhNhanParam]);

  useEffect(() => {
    if (user && laChiTaiKhoanBacSiXemLichHomNay(user)) return;
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
  }, [user, resetDatLichForm]);

  const chiTaiKhoanBn = useMemo(
    () => !!user && laChiTaiKhoanBenhNhan(user),
    [user],
  );

  const chiBacSiHomNay = useMemo(
    () => !!user && laChiTaiKhoanBacSiXemLichHomNay(user),
    [user],
  );

  const userCoMaBacSiHopLe = useMemo(
    () => !!(user?.maBacSi != null && user.maBacSi > 0),
    [user],
  );

  const [homNayMaBacSiDuPhong, setHomNayMaBacSiDuPhong] = useState<
    number | undefined
  >(undefined);
  const [homNayDaThuDuPhongMaBacSi, setHomNayDaThuDuPhongMaBacSi] =
    useState(false);

  useEffect(() => {
    if (!chiBacSiHomNay || !user) {
      setHomNayMaBacSiDuPhong(undefined);
      setHomNayDaThuDuPhongMaBacSi(false);
      return;
    }
    if (userCoMaBacSiHopLe) {
      setHomNayMaBacSiDuPhong(undefined);
      setHomNayDaThuDuPhongMaBacSi(true);
      return;
    }
    setHomNayDaThuDuPhongMaBacSi(false);
    let cancelled = false;
    doctorsApi
      .list()
      .then((list) => {
        if (cancelled) return;
        const arr = Array.isArray(list) ? list : [];
        const id =
          arr.length === 1 &&
          arr[0]?.id != null &&
          Number(arr[0].id) > 0
            ? Number(arr[0].id)
            : undefined;
        setHomNayMaBacSiDuPhong(id);
        if (id != null) {
          const prev = userRef.current;
          if (prev && (prev.maBacSi == null || prev.maBacSi < 1)) {
            setUser({ ...prev, maBacSi: id });
          }
          try {
            const raw = localStorage.getItem("user");
            if (raw) {
              const parsed = JSON.parse(raw) as Record<string, unknown>;
              if (parsed && typeof parsed === "object") {
                localStorage.setItem(
                  "user",
                  JSON.stringify({ ...parsed, maBacSi: id }),
                );
              }
            }
          } catch {
          }
        }
      })
      .catch(() => {
        if (!cancelled) setHomNayMaBacSiDuPhong(undefined);
      })
      .finally(() => {
        if (!cancelled) setHomNayDaThuDuPhongMaBacSi(true);
      });
    return () => {
      cancelled = true;
    };
  }, [chiBacSiHomNay, user, userCoMaBacSiHopLe, setUser]);

  const coCotChoQuaGio = useMemo(
    () => !!user && !chiTaiKhoanBn && laCoTuDongBaoVangLichHen(user),
    [user, chiTaiKhoanBn],
  );

  const openDatLichModal = useCallback(() => {
    if (user && laChiTaiKhoanBacSiXemLichHomNay(user)) return;
    resetDatLichForm();
    setShowDatLich(true);
  }, [resetDatLichForm, user]);

  useEffect(() => {
    if (!loading && !user) router.replace("/dang-nhap");
  }, [user, loading, router]);

  useEffect(() => {
    if (searchParams.get("datLich") !== "1" || !user) return;
    if (laChiTaiKhoanBacSiXemLichHomNay(user)) return;
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
    if (user && laChiTaiKhoanBacSiXemLichHomNay(user)) return;
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
  }, [searchParams, user]);

  useEffect(() => {
    if (!user || !laChiTaiKhoanBacSiXemLichHomNay(user)) return;
    const t = isoDateLocal(new Date());
    setFrom(t);
    setTo(t);
    setViewMode("bang");
  }, [user]);

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
    if (chiBacSiHomNay) {
      if (!homNayDaThuDuPhongMaBacSi) {
        setError("");
        return;
      }
      const maBacSiTaiLich =
        user.maBacSi != null && user.maBacSi > 0
          ? user.maBacSi
          : homNayMaBacSiDuPhong;
      if (maBacSiTaiLich == null || maBacSiTaiLich < 1) {
        setError(
          "Tài khoản chưa liên kết hồ sơ bác sĩ. Vui lòng liên hệ quản trị.",
        );
        setList([]);
        return;
      }
      const today = isoDateLocal(new Date());
      appointmentsApi
        .byDoctor(maBacSiTaiLich, today)
        .then((rows) => {
          setError("");
          setList(Array.isArray(rows) ? rows : []);
        })
        .catch((e) => setError(e.message));
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const size = 100;
        const merged: LichHen[] = [];
        for (let page = 0; page < 100; page++) {
          const r = await appointmentsApi.list(from, to, page, size);
          if (cancelled) return;
          merged.push(...(r.content ?? []));
          const hetTrang =
            r.last === true ||
            (r.content?.length ?? 0) < size ||
            (r.totalPages != null && page + 1 >= r.totalPages);
          if (hetTrang) break;
        }
        if (!cancelled) {
          setError("");
          setList(merged);
        }
      } catch (e: unknown) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Lỗi tải lịch");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    user,
    from,
    to,
    listTick,
    chiTaiKhoanBn,
    chiBacSiHomNay,
    homNayDaThuDuPhongMaBacSi,
    homNayMaBacSiDuPhong,
  ]);

  useEffect(() => {
    listRef.current = list;
  }, [list]);

  useEffect(() => {
    if (!coCotChoQuaGio) return;
    const id = window.setInterval(() => setDongHoBang((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, [coCotChoQuaGio]);

  useEffect(() => {
    if (!user || !laCoTuDongBaoVangLichHen(user)) return;

    const chayTuDongBaoVang = () => {
      const rows = listRef.current;
      const now = Date.now();
      const canGui: number[] = [];
      for (const a of rows) {
        if (!a.id || a.trangThai !== "DA_DAT") continue;
        if (!a.ngayHen || !a.gioHen) continue;
        const t0 = thoiDiemGioHenMs(a.ngayHen, a.gioHen);
        if (Number.isNaN(t0)) continue;
        if (now <= t0 + MS_15_PHUT) continue;
        if (tuDongVangDaXuLy.current.has(a.id)) continue;
        canGui.push(a.id);
      }
      if (canGui.length === 0) return;
      for (const id of canGui) tuDongVangDaXuLy.current.add(id);
      void Promise.all(
        canGui.map((id) =>
          appointmentsApi
            .updateStatus(id, "VANG", { notifySuccess: false })
            .then(() => {
              setList((prev) =>
                prev.map((x) =>
                  x.id === id ? { ...x, trangThai: "VANG" } : x,
                ),
              );
              return true as const;
            })
            .catch(() => {
              tuDongVangDaXuLy.current.delete(id);
              return false as const;
            }),
        ),
      ).then((ketQua) => {
        const n = ketQua.filter(Boolean).length;
        if (n > 0) {
          notify.info(
            n === 1
              ? "Đã tự động chuyển 1 lịch sang « Không đến » (quá 15 phút sau giờ hẹn, chưa tiếp nhận)."
              : `Đã tự động chuyển ${n} lịch sang « Không đến » (quá 15 phút sau giờ hẹn, chưa tiếp nhận).`,
            "Báo vắng tự động",
          );
        }
      });
    };

    chayTuDongBaoVang();
    const timer = window.setInterval(chayTuDongBaoVang, 3000);
    return () => window.clearInterval(timer);
  }, [user]);

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

    return () => {
      cancelled = true;
    };
  }, [showDatLich, user, chiTaiKhoanBn]);

  const benhNhanDuocChon = useMemo(() => {
    return patients.filter((p) => p.id != null);
  }, [patients]);

  const benhNhanSauLoc = useMemo(() => {
    const q = locBenhNhan.trim().toLowerCase();
    if (!q) return benhNhanDuocChon;
    return benhNhanDuocChon.filter(
      (p) =>
        (p.hoTen ?? "").toLowerCase().includes(q) ||
        (p.soDienThoai ?? "").replace(/\s/g, "").includes(q.replace(/\s/g, "")),
    );
  }, [benhNhanDuocChon, locBenhNhan]);

  const dichVuDaChon = useMemo(() => {
    if (!serviceId) return undefined;
    return services.find((x) => String(x.id) === serviceId);
  }, [serviceId, services]);

  const bacSiCoCaTheoNgay = useMemo(() => {
    const today = isoDateLocal(new Date());
    const laHomNay = appointmentDate === today;
    const now = Date.now();
    const out: Record<number, boolean> = {};
    for (const d of doctors) {
      const id = d.id;
      if (id == null) continue;
      const numId = Number(id);
      if (Number.isNaN(numId)) continue;
      const raw = slotsTheoBacSi[numId] ?? [];
      const slots =
        laHomNay && appointmentDate
          ? raw.filter((s) => {
              const t = thoiDiemGioHenMs(appointmentDate, s.gio);
              return !Number.isNaN(t) && t > now;
            })
          : raw;
      out[numId] = slots.length > 0;
    }
    void kheGioHomNayTick;
    return out;
  }, [doctors, slotsTheoBacSi, appointmentDate, kheGioHomNayTick]);

  const bacSiSauLoc = useMemo(() => {
    const q = locBacSi.trim().toLowerCase();
    let ds = doctors.filter((d) => {
      if (!appointmentDate || isDangTaiCaKham) return false;
      return bacSiCoCaTheoNgay[d.id] === true;
    });
    const maDvCk = dichVuDaChon?.maChuyenKhoa;
    if (maDvCk != null && !Number.isNaN(Number(maDvCk))) {
      ds = ds.filter((d) => Number(d.maChuyenKhoa) === Number(maDvCk));
    }
    if (!q) return ds;
    return ds.filter((d) => {
      const ck = (d.tenChuyenKhoa ?? d.chuyenMon ?? "").toLowerCase();
      return (d.hoTen ?? "").toLowerCase().includes(q) || ck.includes(q);
    });
  }, [
    doctors,
    locBacSi,
    bacSiCoCaTheoNgay,
    appointmentDate,
    isDangTaiCaKham,
    dichVuDaChon,
  ]);

  const dichVuSauLoc = useMemo(() => {
    const q = locDichVu.trim().toLowerCase();
    const maCkHienTai = locChuyenKhoaId ? Number(locChuyenKhoaId) : undefined;
    let base = services;
    if (maCkHienTai != null && !Number.isNaN(maCkHienTai)) {
      base = services.filter(
        (s) =>
          s.maChuyenKhoa == null ||
          Number(s.maChuyenKhoa) === maCkHienTai,
      );
    }
    if (!q) return base;
    return base.filter((s) => {
      const ten = (s.ten ?? "").toLowerCase();
      const gia = s.gia != null ? String(s.gia) : "";
      return ten.includes(q) || gia.includes(q);
    });
  }, [services, locDichVu, locChuyenKhoaId]);

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
    const g =
      s.gia != null ? ` — ${s.gia.toLocaleString("vi-VN")}đ` : "";
    const ck = s.tenChuyenKhoa ? ` [${s.tenChuyenKhoa}]` : "";
    return `${s.ten}${ck}${g}`;
  }, [serviceId, services]);

  const slotsDaChon = useMemo(() => {
    const ma = Number(doctorId);
    if (!ma || Number.isNaN(ma)) return [];
    const raw = slotsTheoBacSi[ma] ?? [];
    const today = isoDateLocal(new Date());
    if (!appointmentDate || appointmentDate !== today) return raw;
    const now = Date.now();
    void kheGioHomNayTick;
    return raw.filter((s) => {
      const t = thoiDiemGioHenMs(appointmentDate, s.gio);
      return !Number.isNaN(t) && t > now;
    });
  }, [doctorId, slotsTheoBacSi, appointmentDate, kheGioHomNayTick]);

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
    return formatThangMmYyyyLabel(calendarMonthYm);
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
  const bangColSpan = chiTaiKhoanBn ? 6 : coCotChoQuaGio ? 8 : 7;

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
    const todayLocal = isoDateLocal(new Date());
    if (appointmentDate < todayLocal) {
      setModalError("Không thể đặt lịch cho ngày quá khứ.");
      return;
    }
    if (
      appointmentDate === todayLocal &&
      appointmentTime
    ) {
      const tSlot = thoiDiemGioHenMs(appointmentDate, appointmentTime);
      if (!Number.isNaN(tSlot) && tSlot <= Date.now()) {
        setModalError(
          "Khung giờ này đã qua trong hôm nay. Vui lòng chọn giờ khác hoặc ngày khác.",
        );
        return;
      }
    }
    if (!appointmentTime) {
      setModalError("Vui lòng chọn giờ khám.");
      return;
    }
    const pid = Number(patientId);
    if (chiTaiKhoanBn && !Number.isNaN(pid)) {
      const isTrung = list.some(
        (a) =>
          a.maBenhNhan === pid &&
          a.ngayHen === appointmentDate &&
          normalizeTime(a.gioHen) === appointmentTime,
      );
      if (isTrung) {
        setModalError(
          "Bạn đã có lịch ở thời gian này. Vui lòng chọn thời gian khác.",
        );
        return;
      }
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
      for (const item of result as BacSiSlotKhaDung[]) {
        slotsMap[item.maBacSi] = (item.slots ?? []).map((s) => ({
          gio: normalizeTime(s.gio),
          tong: s.soLuongDaDat ?? 0,
          sucChua: s.sucChua ?? SO_LUONG_TOI_DA_MOI_GIO,
        }));
      }
      setSlotsTheoBacSi(slotsMap);
    };
    taiCaTheoNgay()
      .catch(() => {
        if (!cancelled) {
          setSlotsTheoBacSi({});
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
    if (!serviceId || !locChuyenKhoaId) return;
    const s = services.find((x) => String(x.id) === serviceId);
    if (!s || s.maChuyenKhoa == null) return;
    if (Number(s.maChuyenKhoa) !== Number(locChuyenKhoaId)) {
      setServiceId("");
    }
  }, [locChuyenKhoaId, serviceId, services]);

  useEffect(() => {
    if (!showDatLich || !appointmentDate) return;
    if (appointmentDate !== isoDateLocal(new Date())) return;
    const id = window.setInterval(
      () => setKheGioHomNayTick((n) => n + 1),
      30_000,
    );
    return () => window.clearInterval(id);
  }, [showDatLich, appointmentDate]);

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
      csvEscape(formatNgayDdMmYyyy(a.ngayHen ?? "")),
      csvEscape(formatGioHen(a.gioHen)),
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
        title={
          chiTaiKhoanBn
            ? "Lịch khám của bạn"
            : chiBacSiHomNay
              ? "Lịch khám hôm nay"
              : "Lịch khám"
        }
        subtitle={
          chiTaiKhoanBn
            ? "Xem lịch đã đặt, theo dõi trạng thái và đặt thêm lịch mới khi bạn cần."
            : chiBacSiHomNay
              ? "Chỉ hiển thị lượt khám trong ngày hôm nay. Đặt hoặc chỉnh lịch qua tài khoản lễ tân hoặc quản trị."
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
          {!chiTaiKhoanBn && !chiBacSiHomNay && (
            <Button
              className="btn-service-export d-inline-flex align-items-center gap-2"
              onClick={handleExportCsv}
            >
              <i className="bi bi-filetype-csv" aria-hidden />
              Export CSV
            </Button>
          )}
          {!chiBacSiHomNay && (
            <Button
              variant="primary"
              className="d-inline-flex align-items-center gap-2 rounded-pill px-3"
              onClick={openDatLichModal}
            >
              <i className="bi bi-plus-lg" aria-hidden />
              Đặt lịch mới
            </Button>
          )}
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
                  <div className="patient-portal-lichen__view-field">
                    <span
                      className="patient-portal-lichen__view-caption"
                      id="patient-lich-view-mode-label"
                    >
                      Cách xem
                    </span>
                    <div
                      className="patient-portal-lichen__view-rail"
                      role="group"
                      aria-labelledby="patient-lich-view-mode-label"
                    >
                      <button
                        type="button"
                        className={`patient-portal-lichen__view-tab${
                          viewMode === "bang" ? " is-active" : ""
                        }`}
                        aria-pressed={viewMode === "bang"}
                        onClick={() => setViewMode("bang")}
                      >
                        <i className="bi bi-list-ul" aria-hidden />
                        Danh sách
                      </button>
                      <button
                        type="button"
                        className={`patient-portal-lichen__view-tab${
                          viewMode === "lich" ? " is-active" : ""
                        }`}
                        aria-pressed={viewMode === "lich"}
                        onClick={() => {
                          setViewMode("lich");
                          const b = monthBoundsFromYm(from.slice(0, 7));
                          setFrom(b.from);
                          setTo(b.to);
                        }}
                      >
                        <i className="bi bi-calendar3" aria-hidden />
                        Lịch tháng
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : chiBacSiHomNay ? (
            <div className="d-flex flex-wrap gap-3 align-items-end">
              <div className="text-muted small mb-2 mb-sm-0">
                <span className="fw-semibold text-body">Ngày xem:</span>{" "}
                {formatNgayDdMmYyyyCoThu(from)}
              </div>
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
                <div
                  className="d-flex gap-2 flex-wrap align-items-center"
                  role="group"
                  aria-label="Chế độ xem lịch khám"
                >
                  <Button
                    type="button"
                    variant={viewMode === "bang" ? "primary" : "outline-primary"}
                    size="sm"
                    className="d-inline-flex align-items-center gap-1 rounded-3"
                    onClick={() => setViewMode("bang")}
                  >
                    <i className="bi bi-list-ul" aria-hidden />
                    Danh sách
                  </Button>
                  <Button
                    type="button"
                    variant={viewMode === "lich" ? "primary" : "outline-primary"}
                    size="sm"
                    className="d-inline-flex align-items-center gap-1 rounded-3"
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
                </div>
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
                className="btn-clinic-clear-filter"
                onClick={() => setLocGiaiDoan("")}
              >
                <i className="bi bi-arrow-counterclockwise" aria-hidden />
                Bỏ lọc luồng
              </Button>
            </div>
          ) : null}
        </Card.Body>
      </Card>
      {viewMode === "lich" && !chiBacSiHomNay ? (
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
                  {coCotChoQuaGio ? (
                    <th className="text-nowrap" style={{ minWidth: "11rem" }}>
                      Theo dõi giờ hẹn
                    </th>
                  ) : null}
                  <th>Trạng thái</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {danhSachLoc.map((a) => {
                  const metaBang = metaTrangThaiLichHen(a.trangThai);
                  return (
                  <tr key={a.id}>
                    <td>{formatNgayDdMmYyyy(a.ngayHen)}</td>
                    <td>{formatGioHen(a.gioHen)}</td>
                    {!chiTaiKhoanBn && <td>{a.tenBenhNhan}</td>}
                    <td>{a.tenBacSi}</td>
                    <td>{a.tenDichVu}</td>
                    {coCotChoQuaGio ? (
                      <td className="text-nowrap small">
                        {noiDungCotChoQuaGioHen(a, dongHoBang)}
                      </td>
                    ) : null}
                    <td>
                      <span
                        className={`lich-hen-status-tag lich-hen-status-tag--${metaBang.slug}`}
                      >
                        <i className={`bi ${metaBang.icon}`} aria-hidden />
                        {metaBang.label}
                      </span>
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
                  );
                })}
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
        <Modal.Header
          closeButton={!submitting}
          className="lich-hen-dat-lich__header border-0"
        >
          <Modal.Title as="h5" className="lich-hen-dat-lich__title">
            <i className="bi bi-calendar-check me-2" aria-hidden />
            Đặt lịch khám
          </Modal.Title>
        </Modal.Header>
        <Form noValidate onSubmit={handleDatLichSubmit}>
          <Modal.Body className="lich-hen-dat-lich__body pt-2">
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
            <div className="lich-hen-dat-lich__grid">
              {chiTaiKhoanBn ? (
              <Form.Group className="mb-3 lich-hen-dat-lich__span-2">
                <Form.Label id="label-dat-bn">Bệnh nhân</Form.Label>
                <div className="form-control-plaintext py-1" aria-labelledby="label-dat-bn">
                  {chonBenhNhanLabel}
                </div>
              </Form.Group>
            ) : (
              <Form.Group className="mb-3 lich-hen-dat-lich__span-2">
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
            <Form.Group className="mb-3 lich-hen-dat-lich__span-2">
              <Form.Control
                type="date"
                min={todayStr}
                value={appointmentDate}
                onChange={(e) => {
                  setAppointmentDate(e.target.value);
                  setDoctorId("");
                  setAppointmentTime("");
                }}
              />
              <Form.Text className="text-muted">
                Chọn ngày từ hôm nay — hệ thống chỉ hiển thị bác sĩ có lịch trực (cố định hoặc ngoại lệ) trong ngày đó.
                {appointmentDate === todayStr ? (
                  <> Nếu chọn hôm nay, các khung giờ đã qua sẽ không hiển thị.</>
                ) : null}
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label id="label-loc-ck-dat-lich">Chuyên khoa</Form.Label>
              <Form.Select
                aria-labelledby="label-loc-ck-dat-lich"
                value={locChuyenKhoaId}
                onChange={(e) => {
                  setLocChuyenKhoaId(e.target.value);
                  setDoctorId("");
                  setAppointmentTime("");
                }}
              >
                <option value="">Tất cả chuyên khoa</option>
                {chuyenKhoa.map((ck) => (
                  <option key={ck.id} value={String(ck.id)}>
                    {ck.tenChuyenKhoa}
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">
                Lọc dịch vụ và ca làm việc theo chuyên khoa. Đổi chuyên khoa sẽ bỏ chọn bác sĩ và giờ; dịch vụ
                chỉ thuộc chuyên khoa khác cũng bị bỏ chọn.
              </Form.Text>
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
                          : locChuyenKhoaId
                            ? "Không có dịch vụ phù hợp chuyên khoa đã chọn (hoặc không khớp tìm kiếm)."
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
                            if (
                              s.maChuyenKhoa != null &&
                              !Number.isNaN(Number(s.maChuyenKhoa))
                            ) {
                              setLocChuyenKhoaId(String(s.maChuyenKhoa));
                              setDoctorId("");
                              setAppointmentTime("");
                            }
                          }}
                        >
                          {s.ten}
                          {s.tenChuyenKhoa ? ` [${s.tenChuyenKhoa}]` : ""} —{" "}
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
            <Form.Group className="mb-3 lich-hen-dat-lich__span-2">
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
                              : dichVuDaChon?.maChuyenKhoa != null
                                ? "Không có bác sĩ phù hợp dịch vụ / chuyên khoa hoặc chưa có ca trong ngày này."
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
            <Form.Group className="mb-3 lich-hen-dat-lich__span-2">
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
                        {appointmentDate === todayStr
                          ? "Không còn khung giờ còn lại hôm nay (các giờ đã qua được ẩn) hoặc đã đầy. Thử ngày khác."
                          : "Không có khung giờ hợp lệ trong ngày này."}
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
            <Form.Group className="mb-0 mt-3 lich-hen-dat-lich__span-2">
              <Form.Label>Ghi chú</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Tuỳ chọn"
              />
            </Form.Group>
            </div>
          </Modal.Body>
          <Modal.Footer className="clinic-modal-footer bac-si-modal-footer clinic-modal-footer-actions border-top">
            <Button
              type="button"
              className="btn-modal-dismiss"
              disabled={submitting}
              onClick={() => setShowDatLich(false)}
            >
              <i className="bi bi-x-lg me-2" aria-hidden />
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
