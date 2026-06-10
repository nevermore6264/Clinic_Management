export const LICH_HEN_QUY_TRINH_CHINH = [
  "DA_DAT",
  "DA_TIEP_NHAN",
  "DANG_KHAM",
  "XET_NGHIEM",
  "DA_KE_DON",
  "CHO_THANH_TOAN",
  "DA_THANH_TOAN",
] as const;

export type TrangThaiQuyTrinhChinh = (typeof LICH_HEN_QUY_TRINH_CHINH)[number];

const VAI_TRO_DUOC_CHUYEN_TOI: Record<string, readonly string[]> = {
  DA_TIEP_NHAN: ["LE_TAN"],
  DANG_KHAM: ["BAC_SI"],
  XET_NGHIEM: ["BAC_SI"],
  DA_KE_DON: ["BAC_SI"],
  CHO_THANH_TOAN: ["THU_NGAN", "LE_TAN"],
  DA_THANH_TOAN: ["THU_NGAN"],
  HUY: ["LE_TAN"],
  VANG: ["LE_TAN", "BAC_SI"],
};

export function laQuanTriLichHen(cacVaiTro?: Iterable<string> | null): boolean {
  if (!cacVaiTro) return false;
  for (const r of cacVaiTro) {
    if (r === "QUAN_TRI") return true;
  }
  return false;
}

function chiSoTrongQuyTrinh(trangThai?: string): number {
  if (!trangThai) return -1;
  return LICH_HEN_QUY_TRINH_CHINH.indexOf(trangThai as TrangThaiQuyTrinhChinh);
}

function coVaiTroChuyenToi(trangThaiMoi: string, cacVaiTro: string[]): boolean {
  const choPhep = VAI_TRO_DUOC_CHUYEN_TOI[trangThaiMoi];
  if (!choPhep?.length) return false;
  return cacVaiTro.some((r) => choPhep.includes(r));
}

export type KetQuaChuyenTrangThai = {
  allowed: boolean;
  lyDo?: string;
};

export function lichHenChoPhepChuyenTrangThai(
  trangThaiHienTai: string | undefined,
  trangThaiMoi: string,
  cacVaiTro: string[],
): KetQuaChuyenTrangThai {
  const cu = trangThaiHienTai ?? "";
  if (!cu) {
    return { allowed: false, lyDo: "Chưa xác định trạng thái hiện tại." };
  }
  if (cu === trangThaiMoi) {
    return { allowed: true };
  }
  if (cu === "DA_THANH_TOAN") {
    return {
      allowed: false,
      lyDo: "Lịch đã thanh toán — không đổi trạng thái.",
    };
  }
  if (laQuanTriLichHen(cacVaiTro)) {
    return { allowed: true };
  }

  if (trangThaiMoi === "HUY" || trangThaiMoi === "VANG") {
    if (cu !== "DA_DAT") {
      return {
        allowed: false,
        lyDo:
          "Chỉ đánh dấu hủy / không đến khi lịch còn « Đã đặt » (chưa tiếp nhận). Liên hệ quản trị nếu cần ngoại lệ.",
      };
    }
    if (!coVaiTroChuyenToi(trangThaiMoi, cacVaiTro)) {
      return {
        allowed: false,
        lyDo: "Bạn không có quyền đánh dấu trạng thái này.",
      };
    }
    return { allowed: true };
  }

  if (cu === "HUY" || cu === "VANG") {
    return {
      allowed: false,
      lyDo: "Lịch đã kết thúc (hủy / không đến). Liên hệ quản trị để xử lý ngoại lệ.",
    };
  }

  const idxCu = chiSoTrongQuyTrinh(cu);
  const idxMoi = chiSoTrongQuyTrinh(trangThaiMoi);
  if (idxCu < 0 || idxMoi < 0) {
    return {
      allowed: false,
      lyDo: "Không thể chuyển trạng thái theo quy trình.",
    };
  }
  if (idxMoi !== idxCu + 1) {
    return {
      allowed: false,
      lyDo:
        idxMoi < idxCu
          ? "Không được lùi bước trong quy trình. Liên hệ quản trị nếu cần sửa."
          : "Chỉ chuyển sang bước kế tiếp trong quy trình. Liên hệ quản trị nếu cần nhảy bước.",
    };
  }
  if (!coVaiTroChuyenToi(trangThaiMoi, cacVaiTro)) {
    return {
      allowed: false,
      lyDo: "Vai trò của bạn không được chuyển sang bước này.",
    };
  }
  return { allowed: true };
}

const TRANG_THAI_CHO_SINH_HIEU = [
  "DA_TIEP_NHAN",
  "DANG_KHAM",
  "XET_NGHIEM",
  "DA_KE_DON",
  "CHO_THANH_TOAN",
] as const;

export function lichHenChoPhepNhapSinhHieu(
  trangThai?: string,
  cacVaiTro?: string[],
): boolean {
  if (laQuanTriLichHen(cacVaiTro)) return true;
  if (
    !trangThai ||
    !TRANG_THAI_CHO_SINH_HIEU.includes(
      trangThai as (typeof TRANG_THAI_CHO_SINH_HIEU)[number],
    )
  ) {
    return false;
  }
  const roles = cacVaiTro ?? [];
  if (trangThai === "DA_TIEP_NHAN") {
    return roles.some((r) => r === "LE_TAN" || r === "BAC_SI");
  }
  return roles.some((r) => r === "BAC_SI" || r === "LE_TAN");
}

export function lichHenChoPhepNhapHoSoKham(
  trangThai?: string,
  cacVaiTro?: string[],
): boolean {
  if (laQuanTriLichHen(cacVaiTro)) return true;
  return (
    trangThai === "DANG_KHAM" ||
    trangThai === "XET_NGHIEM" ||
    trangThai === "DA_KE_DON"
  );
}

const TRANG_THAI_IN_DON_THUOC = [
  "DANG_KHAM",
  "XET_NGHIEM",
  "DA_KE_DON",
  "CHO_THANH_TOAN",
  "DA_THANH_TOAN",
] as const;

export function lichHenChoPhepInDonThuoc(
  trangThai?: string,
  cacVaiTro?: string[],
): boolean {
  const roles = cacVaiTro ?? [];
  if (!roles.some((r) => r === "BAC_SI" || r === "QUAN_TRI")) return false;
  if (laQuanTriLichHen(cacVaiTro)) {
    return trangThai !== "HUY" && trangThai !== "VANG" && trangThai !== "DA_DAT";
  }
  return TRANG_THAI_IN_DON_THUOC.includes(
    trangThai as (typeof TRANG_THAI_IN_DON_THUOC)[number],
  );
}
