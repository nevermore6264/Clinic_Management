import { notify, notifyMessageByMethod } from "@/lib/notify";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081/api";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

type ApiOptions = RequestInit & {
  notifySuccess?: boolean;
  notifySuccessMessage?: string;
  notifyError?: boolean;
};

export async function api<T>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const token = getToken();
  const {
    notifySuccess = true,
    notifySuccessMessage,
    notifyError = true,
    ...requestOptions
  } = options;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(requestOptions.headers as Record<string, string>),
  };
  if (token)
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;

  const method = (requestOptions.method || "GET").toUpperCase();
  const res = await fetch(`${API_BASE}${path}`, { ...requestOptions, headers });
  const raw = await res.text();
  if (!res.ok) {
    const message = raw || `HTTP ${res.status}`;
    if (notifyError && typeof window !== "undefined") {
      notify.error(message);
    }
    throw new Error(message);
  }
  if (
    notifySuccess &&
    typeof window !== "undefined" &&
    ["POST", "PUT", "PATCH", "DELETE"].includes(method)
  ) {
    notify.success(notifySuccessMessage || notifyMessageByMethod[method]);
  }
  if (res.status === 204 || res.status === 205) return undefined as T;
  if (!raw.trim()) return undefined as T;
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error("Phản hồi từ máy chủ không phải JSON hợp lệ.");
  }
}

export interface TrangSpring<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  last?: boolean;
  first?: boolean;
}

export const authApi = {
  doiMatKhau: (matKhauHienTai: string, matKhauMoi: string) =>
    api<void>("/xac-thuc/doi-mat-khau", {
      method: "PUT",
      body: JSON.stringify({ matKhauHienTai, matKhauMoi }),
    }),
};

export interface ThongTinNguoiDungDto {
  id: number;
  tenDangNhap: string;
  hoTen?: string;
  thuDienTu?: string;
  soDienThoai?: string;
  hoatDong: boolean;
  cacVaiTro: string[];
}

export const nguoiDungApi = {
  danhSach: () => api<ThongTinNguoiDungDto[]>("/nguoi-dung"),
  tao: (data: {
    tenDangNhap: string;
    matKhau: string;
    hoTen?: string;
    thuDienTu?: string;
    soDienThoai?: string;
    cacVaiTro: string[];
  }) =>
    api<ThongTinNguoiDungDto>("/nguoi-dung", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  capNhat: (
    id: number,
    data: {
      hoTen: string;
      thuDienTu?: string;
      soDienThoai?: string;
      cacVaiTro: string[];
    },
  ) =>
    api<ThongTinNguoiDungDto>(`/nguoi-dung/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  khoa: (id: number) =>
    api<void>(`/nguoi-dung/${id}/khoa`, {
      method: "PATCH",
    }),
  moKhoa: (id: number) =>
    api<void>(`/nguoi-dung/${id}/mo-khoa`, {
      method: "PATCH",
    }),
};

export type BenhNhanDanhSachLoc = {
  ten?: string;
  trangThaiHoSo?: "tat-ca" | "hoat-dong" | "an";
  gioiTinh?: string;
  nhomMau?: string;
};

export const benhNhanApi = {
  danhSach: (page = 0, size = 10, loc?: BenhNhanDanhSachLoc) => {
    const q = new URLSearchParams();
    q.set("page", String(page));
    q.set("size", String(size));
    if (loc?.ten) q.set("ten", loc.ten);
    if (loc?.trangThaiHoSo === "tat-ca" || loc?.trangThaiHoSo === "an") {
      q.set("trangThaiHoSo", loc.trangThaiHoSo);
    }
    if (loc?.gioiTinh) q.set("gioiTinh", loc.gioiTinh);
    if (loc?.nhomMau) q.set("nhomMau", loc.nhomMau);
    return api<TrangSpring<BenhNhan>>(`/benh-nhan?${q.toString()}`);
  },
  timKiem: (ten: string) =>
    api<BenhNhan[]>(`/benh-nhan/tim-kiem?ten=${encodeURIComponent(ten)}`),
  layTheoMa: (id: number) => api<BenhNhan>(`/benh-nhan/${id}`),
  tao: (data: Partial<BenhNhan>) =>
    api<BenhNhan>("/benh-nhan", { method: "POST", body: JSON.stringify(data) }),
  capNhat: (id: number, data: Partial<BenhNhan>) =>
    api<BenhNhan>(`/benh-nhan/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  xoa: (id: number) => api<void>(`/benh-nhan/${id}`, { method: "DELETE" }),
};

export const bacSiApi = {
  danhSach: () => api<BacSi[]>("/bac-si"),
  danhSachTatCa: () => api<BacSi[]>("/bac-si?tatCa=true"),
  layTheoMa: (id: number) => api<BacSi>(`/bac-si/${id}`),
  tao: (data: {
    maNguoiDung?: number;
    hoTen?: string;
    maChuyenKhoa?: number;
    bangCap?: string;
    gioiThieu?: string;
    quaTrinhCongTac?: string;
    thanhTichDatDuoc?: string;
  }) =>
    api<BacSi>("/bac-si", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  capNhat: (
    id: number,
    data: {
      maChuyenKhoa?: number | null;
      bangCap?: string;
      hoatDong: boolean;
      hoTen?: string;
      gioiThieu?: string;
      quaTrinhCongTac?: string;
      thanhTichDatDuoc?: string;
    },
  ) =>
    api<BacSi>(`/bac-si/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

export interface ChuyenKhoa {
  id: number;
  tenChuyenKhoa: string;
}

export const chuyenKhoaApi = {
  danhSach: () => api<ChuyenKhoa[]>("/chuyen-khoa"),
  tao: (data: { tenChuyenKhoa: string }) =>
    api<ChuyenKhoa>("/chuyen-khoa", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  capNhat: (id: number, data: { tenChuyenKhoa: string }) =>
    api<ChuyenKhoa>(`/chuyen-khoa/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  xoa: (id: number) => api<void>(`/chuyen-khoa/${id}`, { method: "DELETE" }),
};

export const dichVuApi = {
  danhSach: () => api<DichVu[]>("/dich-vu"),
  layTheoMa: (id: number) => api<DichVu>(`/dich-vu/${id}`),
  tao: (data: Partial<DichVu>) =>
    api<DichVu>("/dich-vu", { method: "POST", body: JSON.stringify(data) }),
  capNhat: (id: number, data: Partial<DichVu>) =>
    api<DichVu>(`/dich-vu/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  xoa: (id: number) => api<void>(`/dich-vu/${id}`, { method: "DELETE" }),
};

export const loaiDichVuApi = {
  danhSach: () => api<LoaiDichVu[]>("/loai-dich-vu"),
  layTheoMa: (id: number) => api<LoaiDichVu>(`/loai-dich-vu/${id}`),
  tao: (data: Partial<LoaiDichVu>) =>
    api<LoaiDichVu>("/loai-dich-vu", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  capNhat: (id: number, data: Partial<LoaiDichVu>) =>
    api<LoaiDichVu>(`/loai-dich-vu/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  xoa: (id: number) => api<void>(`/loai-dich-vu/${id}`, { method: "DELETE" }),
};

export const lichHenApi = {
  danhSach: (tuNgay: string, denNgay: string, page = 0, size = 20) =>
    api<TrangSpring<LichHen>>(
      `/lich-hen?tuNgay=${tuNgay}&denNgay=${denNgay}&page=${page}&size=${size}`,
    ),
  theoBenhNhan: (maBenhNhan: number) =>
    api<LichHen[]>(`/lich-hen/benh-nhan/${maBenhNhan}`),
  theoBacSiVaNgay: (maBacSi: number, ngay: string) =>
    api<LichHen[]>(`/lich-hen/bac-si/${maBacSi}?ngay=${ngay}`),
  slotKhaDungTheoNgay: (ngay: string, maChuyenKhoa?: number) => {
    let q = `/lich-hen/slot-kha-dung?ngay=${encodeURIComponent(ngay)}`;
    if (maChuyenKhoa != null) q += `&maChuyenKhoa=${maChuyenKhoa}`;
    return api<BacSiSlotKhaDung[]>(q);
  },
  layTheoMa: (id: number) => api<LichHen>(`/lich-hen/${id}`),
  tao: (data: Partial<LichHen>) =>
    api<LichHen>("/lich-hen", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  capNhat: (id: number, data: Partial<LichHen>) =>
    api<LichHen>(`/lich-hen/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  capNhatTrangThai: (id: number, trangThai: string, opts?: ApiOptions) =>
    api<LichHen>(`/lich-hen/${id}/trang-thai?trangThai=${trangThai}`, {
      method: "PATCH",
      ...opts,
    }),
  lichSuTrangThai: (id: number) =>
    api<LichSuTrangThaiLichHen[]>(`/lich-hen/${id}/lich-su-trang-thai`),
};

export const hoSoKhamApi = {
  theoBenhNhan: (maBenhNhan: number) =>
    api<HoSoKham[]>(`/ho-so-kham/benh-nhan/${maBenhNhan}`),
  theoLichHen: async (maLichHen: number): Promise<HoSoKham | null> => {
    try {
      return await api<HoSoKham | null>(`/ho-so-kham/lich-hen/${maLichHen}`, {
        notifyError: false,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (/\b404\b/i.test(msg)) return null;
      if (typeof window !== "undefined") {
        notify.error(msg.length > 160 ? "Không tải được hồ sơ khám." : msg);
      }
      throw e;
    }
  },
  luu: (maLichHen: number, data: Partial<HoSoKham>) =>
    api<HoSoKham>(`/ho-so-kham/lich-hen/${maLichHen}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

export const thuocApi = {
  dangHoatDong: () => api<Thuoc[]>("/thuoc/dang-hoat-dong"),
  tatCa: () => api<Thuoc[]>("/thuoc"),
  timKiem: (params: {
    tuKhoa?: string;
    trangThai?: string;
    donVi?: string;
    dangBaoChe?: string;
    duongDung?: string;
    hangSanXuat?: string;
    nuocSanXuat?: string;
    tonThap?: boolean;
    hanTu?: string;
    hanDen?: string;
    giaBanTu?: string;
    giaBanDen?: string;
    page?: number;
    size?: number;
    sort?: string;
  }) => {
    const q = new URLSearchParams();
    if (params.tuKhoa) q.set("tuKhoa", params.tuKhoa);
    if (params.trangThai) q.set("trangThai", params.trangThai);
    if (params.donVi) q.set("donVi", params.donVi);
    if (params.dangBaoChe) q.set("dangBaoChe", params.dangBaoChe);
    if (params.duongDung) q.set("duongDung", params.duongDung);
    if (params.hangSanXuat) q.set("hangSanXuat", params.hangSanXuat);
    if (params.nuocSanXuat) q.set("nuocSanXuat", params.nuocSanXuat);
    if (params.tonThap === true) q.set("tonThap", "true");
    if (params.hanTu) q.set("hanTu", params.hanTu);
    if (params.hanDen) q.set("hanDen", params.hanDen);
    if (params.giaBanTu) q.set("giaBanTu", params.giaBanTu);
    if (params.giaBanDen) q.set("giaBanDen", params.giaBanDen);
    q.set("page", String(params.page ?? 0));
    q.set("size", String(params.size ?? 20));
    q.set("sort", params.sort ?? "tenThuoc,asc");
    return api<ThuocTrangTraCuu>(`/thuoc/tim-kiem?${q.toString()}`);
  },
  bangKeDonThuoc: () =>
    api<DonThuocChiTietBangKe[]>("/thuoc/bang-ke-don-thuoc"),
  layTheoMa: (id: number) => api<Thuoc>(`/thuoc/${id}`),
  tao: (data: Partial<Thuoc>) =>
    api<Thuoc>("/thuoc", { method: "POST", body: JSON.stringify(data) }),
  capNhat: (id: number, data: Partial<Thuoc>) =>
    api<Thuoc>(`/thuoc/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  xoa: (id: number) => api<void>(`/thuoc/${id}`, { method: "DELETE" }),
};

export interface PhieuChiTongHop {
  soPhieu: number;
  tongTien: number;
  tienTheoLoai: Record<string, number>;
}

export const phieuChiApi = {
  danhSach: (tuNgay?: string, denNgay?: string, page = 0, size = 20) => {
    let q = `/phieu-chi?page=${page}&size=${size}`;
    if (tuNgay) q += `&tuNgay=${tuNgay}`;
    if (denNgay) q += `&denNgay=${denNgay}`;
    return api<TrangSpring<PhieuChi>>(q);
  },
  tongHop: (tuNgay?: string, denNgay?: string) => {
    const p = new URLSearchParams();
    if (tuNgay) p.set("tuNgay", tuNgay);
    if (denNgay) p.set("denNgay", denNgay);
    const qs = p.toString();
    return api<PhieuChiTongHop>(
      qs ? `/phieu-chi/tong-hop?${qs}` : "/phieu-chi/tong-hop",
    );
  },
  layTheoMa: (id: number) => api<PhieuChi>(`/phieu-chi/${id}`),
  tao: (data: Partial<PhieuChi>) =>
    api<PhieuChi>("/phieu-chi", { method: "POST", body: JSON.stringify(data) }),
  capNhat: (id: number, data: Partial<PhieuChi>) =>
    api<PhieuChi>(`/phieu-chi/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  xoa: (id: number) => api<void>(`/phieu-chi/${id}`, { method: "DELETE" }),
  xuatCsvThang: async (thang: string): Promise<Blob> => {
    const url = `${API_BASE}/phieu-chi/xuat-csv-thang?thang=${encodeURIComponent(thang)}`;
    const token = getToken();
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error(await res.text());
    return res.blob();
  },
  taiLenAnhChungTu: async (
    file: File,
  ): Promise<{
    duongDan: string;
    tenHienThi: string;
    loaiMime: string;
    kichThuoc: number;
  }> => {
    const token = getToken();
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`${API_BASE}/phieu-chi/chung-tu-anh/tai-len`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd,
    });
    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try {
        const j = (await res.json()) as { message?: string };
        if (j.message) msg = j.message;
      } catch {}
      throw new Error(msg);
    }
    return res.json() as Promise<{
      duongDan: string;
      tenHienThi: string;
      loaiMime: string;
      kichThuoc: number;
    }>;
  },
};

export const hoaDonApi = {
  danhSach: (tuNgay: string, denNgay: string, page = 0, size = 20) =>
    api<TrangSpring<HoaDon>>(
      `/hoa-don?tuNgay=${tuNgay}&denNgay=${denNgay}&page=${page}&size=${size}`,
    ),
  theoBenhNhan: (maBenhNhan: number) =>
    api<HoaDon[]>(`/hoa-don/benh-nhan/${maBenhNhan}`),
  layTheoMa: (id: number) => api<HoaDon>(`/hoa-don/${id}`),
  tao: (maLichHen: number, chiTiet: { maDichVu: number; soLuong?: number }[]) =>
    api<HoaDon>(`/hoa-don?maLichHen=${maLichHen}`, {
      method: "POST",
      body: JSON.stringify(chiTiet),
    }),
  themThanhToan: (
    maHoaDon: number,
    data: { soTien: number; phuongThuc?: string; maThamChieu?: string },
  ) =>
    api<GiaoDichThanhToan>(`/hoa-don/${maHoaDon}/thanh-toan`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  taoPayOsLink: (maHoaDon: number) =>
    api<PayOsTaoLinkPhanHoi>(`/hoa-don/${maHoaDon}/payos`, {
      method: "POST",
    }),
};

export const baoCaoApi = {
  doanhThu: (
    tuNgay: string,
    denNgay: string,
    maBacSi?: number,
    maDichVu?: number,
  ) => {
    let path = `/bao-cao/doanh-thu?tuNgay=${encodeURIComponent(tuNgay)}&denNgay=${encodeURIComponent(denNgay)}`;
    if (maBacSi != null) path += `&maBacSi=${maBacSi}`;
    if (maDichVu != null) path += `&maDichVu=${maDichVu}`;
    return api<BaoCaoDoanhThu[]>(path);
  },
  xuatExcel: async (
    tuNgay: string,
    denNgay: string,
    maBacSi?: number,
    maDichVu?: number,
  ): Promise<Blob> => {
    let url = `${API_BASE}/bao-cao/doanh-thu/xuat-excel?tuNgay=${tuNgay}&denNgay=${denNgay}`;
    if (maBacSi != null) url += `&maBacSi=${maBacSi}`;
    if (maDichVu != null) url += `&maDichVu=${maDichVu}`;
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error(await res.text());
    return res.blob();
  },
};

export interface ThongKeBangDieuKhien {
  tongBenhNhan: number;
  lichHenHomNay: number;
  lichHenTuanNay: number;
  doanhThuHomNay: number;
  doanhThuTuanNay: number;
  tongChiHomNay?: number;
  tongChiTuanNay?: number;
  doanhThu7NgayGanNhat: BaoCaoDoanhThu[];
  lichHenChoTiepNhanHomNay?: number;
  lichHenTrongKhamHomNay?: number;
  lichHenSauKhamHomNay?: number;
  lichHenDaHoanTatHomNay?: number;
  lichHenHuyVangHomNay?: number;
  soBacSiCoLichHomNay?: number;
}

export const bangDieuKhienApi = {
  thongKe: () => api<ThongKeBangDieuKhien>("/bang-dieu-khien/thong-ke"),
};

export const dashboardApi = {
  stats: () => bangDieuKhienApi.thongKe(),
};

export interface CauHinhNhacLich {
  id?: number;
  soNgayTruoc: number;
  soGioTruoc: number;
  batThuDienTu: boolean;
}

export const cauHinhNhacLichApi = {
  lay: () => api<CauHinhNhacLich>("/cau-hinh-nhac-lich"),
  capNhat: (data: CauHinhNhacLich) =>
    api<CauHinhNhacLich>("/cau-hinh-nhac-lich", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

export const nhatKyHeThongApi = {
  danhSach: (tuNgay: string, denNgay: string, page = 0, size = 20) =>
    api<TrangSpring<NhatKyHeThongEntry>>(
      `/nhat-ky-he-thong?tuNgay=${tuNgay}&denNgay=${denNgay}&page=${page}&size=${size}`,
    ),
};

export interface TinNhanChatDto {
  id: number;
  maNguoiGui: number;
  tenNguoiGui: string;
  maNguoiNhan?: number;
  tenNguoiNhan?: string;
  noiDung: string;
  dinhKemDuongDan?: string;
  dinhKemTen?: string;
  dinhKemLoai?: string;
  maPhong: number;
  taoLuc: string;
  phanUng?: Record<string, string>;
}

export interface TroChuyenTaiLenResponse {
  duongDan: string;
  tenHienThi: string;
  loaiMime: string;
  kichThuoc: number;
}

export async function apiUploadChatFile(
  file: File,
): Promise<TroChuyenTaiLenResponse> {
  const token = getToken();
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${API_BASE}/tro-chuyen/tai-len`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: fd,
  });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const j = (await res.json()) as { message?: string };
      if (j.message) msg = j.message;
    } catch {}
    throw new Error(msg);
  }
  return res.json() as Promise<TroChuyenTaiLenResponse>;
}

export interface NguoiDungChatEntry {
  id: number;
  hoTen?: string;
  tenDangNhap: string;
}

export const troChuyenApi = {
  layLichSu: (maPhong = 1, gioiHan = 50) =>
    api<TinNhanChatDto[]>(
      `/tro-chuyen/lich-su?maPhong=${encodeURIComponent(maPhong)}&gioiHan=${gioiHan}`,
    ),
  layDoiThoai: (maDoiTuong: number, gioiHan = 120) =>
    api<TinNhanChatDto[]>(
      `/tro-chuyen/doi-thoai?maDoiTuong=${encodeURIComponent(String(maDoiTuong))}&gioiHan=${gioiHan}`,
    ),
  danhBa: () => api<NguoiDungChatEntry[]>("/tro-chuyen/danh-ba"),
};

export const lichLamViecBacSiApi = {
  theoBacSiVaNgay: (maBacSi: number, ngay: string) =>
    api<LichLamViecBacSi[]>(
      `/lich-lam-viec-bac-si/bac-si/${maBacSi}?ngay=${ngay}`,
    ),
  theoBacSiVaKhoangNgay: (maBacSi: number, tuNgay: string, denNgay: string) =>
    api<LichLamViecBacSi[]>(
      `/lich-lam-viec-bac-si/bac-si/${maBacSi}/khoang-ngay?tuNgay=${encodeURIComponent(tuNgay)}&denNgay=${encodeURIComponent(denNgay)}`,
    ),
  tao: (data: Partial<LichLamViecBacSi>) =>
    api<LichLamViecBacSi>("/lich-lam-viec-bac-si", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  capNhat: (id: number, data: Partial<LichLamViecBacSi>) =>
    api<LichLamViecBacSi>(`/lich-lam-viec-bac-si/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  xoa: (id: number, nguonBanGhi?: string) => {
    let q = `/lich-lam-viec-bac-si/${id}`;
    if (nguonBanGhi) q += `?nguon=${encodeURIComponent(nguonBanGhi)}`;
    return api<void>(q, { method: "DELETE" });
  },
};

export const lichLamViecCoDinhApi = {
  theoBacSi: (maBacSi: number) =>
    api<LichCoDinh[]>(`/lich-lam-viec-bac-si/co-dinh/bac-si/${maBacSi}`),
  tao: (data: Partial<LichCoDinh>) =>
    api<LichCoDinh>("/lich-lam-viec-bac-si/co-dinh", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  capNhat: (id: number, data: Partial<LichCoDinh>) =>
    api<LichCoDinh>(`/lich-lam-viec-bac-si/co-dinh/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  xoa: (id: number) =>
    api<void>(`/lich-lam-viec-bac-si/co-dinh/${id}`, { method: "DELETE" }),
  gieoMacDinh: (maBacSi: number, ghiDe = true) =>
    api<LichCoDinh[]>(
      `/lich-lam-viec-bac-si/co-dinh/gieo-mac-dinh/${maBacSi}?ghiDe=${ghiDe}`,
      { method: "POST" },
    ),
  gieoMacDinhTatCa: (ghiDe = false) =>
    api<{ soBacSiDaXuLy: number; ghiDe: boolean }>(
      `/lich-lam-viec-bac-si/co-dinh/gieo-mac-dinh-tat-ca?ghiDe=${ghiDe}`,
      { method: "POST" },
    ),
};

export const patientsApi = {
  ...benhNhanApi,
  list: benhNhanApi.danhSach,
  search: benhNhanApi.timKiem,
  get: benhNhanApi.layTheoMa,
  create: (data: Partial<BenhNhan> & Record<string, unknown>) =>
    benhNhanApi.tao({
      hoTen: data.hoTen ?? (data.fullName as string),
      ngaySinh: data.ngaySinh ?? (data.dateOfBirth as string),
      soDienThoai: data.soDienThoai ?? (data.phone as string),
      diaChi: data.diaChi ?? (data.address as string),
      thuDienTu: data.thuDienTu ?? (data.email as string),
      gioiTinh: data.gioiTinh ?? (data.gender as string),
      soCccd: data.soCccd ?? (data.identityNo as string),
      ngheNghiep: data.ngheNghiep ?? (data.job as string),
      nhomMau: data.nhomMau ?? (data.bloodType as string),
      tienSuBenh: data.tienSuBenh ?? (data.medicalHistory as string),
      diUng: data.diUng ?? (data.allergies as string),
      nguoiLienHe: data.nguoiLienHe ?? (data.emergencyContactName as string),
      soDienThoaiLienHe:
        data.soDienThoaiLienHe ?? (data.emergencyContactPhone as string),
      hoatDong:
        data.hoatDong !== undefined
          ? data.hoatDong
          : data.active !== undefined
            ? Boolean(data.active)
            : true,
    }),
  update: (id: number, data: Partial<BenhNhan> & Record<string, unknown>) =>
    benhNhanApi.capNhat(id, {
      hoTen: data.hoTen ?? (data.fullName as string),
      ngaySinh: data.ngaySinh ?? (data.dateOfBirth as string),
      soDienThoai: data.soDienThoai ?? (data.phone as string),
      diaChi: data.diaChi ?? (data.address as string),
      thuDienTu: data.thuDienTu ?? (data.email as string),
      gioiTinh: data.gioiTinh ?? (data.gender as string),
      soCccd: data.soCccd ?? (data.identityNo as string),
      ngheNghiep: data.ngheNghiep ?? (data.job as string),
      nhomMau: data.nhomMau ?? (data.bloodType as string),
      tienSuBenh: data.tienSuBenh ?? (data.medicalHistory as string),
      diUng: data.diUng ?? (data.allergies as string),
      nguoiLienHe: data.nguoiLienHe ?? (data.emergencyContactName as string),
      soDienThoaiLienHe:
        data.soDienThoaiLienHe ?? (data.emergencyContactPhone as string),
      hoatDong:
        data.hoatDong !== undefined
          ? data.hoatDong
          : data.active !== undefined
            ? Boolean(data.active)
            : true,
    }),
  delete: benhNhanApi.xoa,
};
export const usersApi = {
  ...nguoiDungApi,
  list: nguoiDungApi.danhSach,
  create: (data: {
    username: string;
    password: string;
    fullName?: string;
    roles: string[];
  }) =>
    nguoiDungApi.tao({
      tenDangNhap: data.username,
      matKhau: data.password,
      hoTen: data.fullName,
      cacVaiTro: data.roles,
    }),
  update: (
    id: number,
    data: {
      fullName: string;
      email?: string;
      phone?: string;
      roles: string[];
    },
  ) =>
    nguoiDungApi.capNhat(id, {
      hoTen: data.fullName,
      thuDienTu: data.email,
      soDienThoai: data.phone,
      cacVaiTro: data.roles,
    }),
  lock: nguoiDungApi.khoa,
  unlock: nguoiDungApi.moKhoa,
};
export const doctorsApi = {
  ...bacSiApi,
  list: bacSiApi.danhSach,
  listAll: bacSiApi.danhSachTatCa,
  get: bacSiApi.layTheoMa,
  create: bacSiApi.tao,
  update: bacSiApi.capNhat,
};
export const servicesApi = {
  ...dichVuApi,
  list: dichVuApi.danhSach,
  get: dichVuApi.layTheoMa,
  create: dichVuApi.tao,
  update: dichVuApi.capNhat,
  delete: dichVuApi.xoa,
};
export const serviceTypesApi = {
  ...loaiDichVuApi,
  list: loaiDichVuApi.danhSach,
  get: loaiDichVuApi.layTheoMa,
  create: loaiDichVuApi.tao,
  update: loaiDichVuApi.capNhat,
  delete: loaiDichVuApi.xoa,
};
export const appointmentsApi = {
  ...lichHenApi,
  list: lichHenApi.danhSach,
  byPatient: lichHenApi.theoBenhNhan,
  byDoctor: lichHenApi.theoBacSiVaNgay,
  get: lichHenApi.layTheoMa,
  create: (data: {
    patientId?: number;
    doctorId?: number;
    serviceId?: number;
    appointmentDate?: string;
    appointmentTime?: string;
    note?: string;
    maBenhNhan?: number;
    maBacSi?: number;
    maDichVu?: number;
    ngayHen?: string;
    gioHen?: string;
    ghiChu?: string;
  }) =>
    lichHenApi.tao({
      maBenhNhan: data.maBenhNhan ?? data.patientId!,
      maBacSi: data.maBacSi ?? data.doctorId!,
      maDichVu: data.maDichVu ?? data.serviceId!,
      ngayHen: data.ngayHen ?? data.appointmentDate!,
      gioHen: data.gioHen ?? data.appointmentTime!,
      ghiChu: data.ghiChu ?? data.note,
    }),
  update: lichHenApi.capNhat,
  updateStatus: lichHenApi.capNhatTrangThai,
  statusHistory: lichHenApi.lichSuTrangThai,
};
export const visitRecordsApi = {
  ...hoSoKhamApi,
  byPatient: hoSoKhamApi.theoBenhNhan,
  byAppointment: hoSoKhamApi.theoLichHen,
  save: (
    maLichHen: number,
    data: {
      diagnosis?: string;
      prescription?: string;
      notes?: string;
      chanDoan?: string;
      donThuoc?: string;
      ghiChu?: string;
      chiTietDonThuoc?: ChiTietDonThuoc[];
    },
  ) =>
    hoSoKhamApi.luu(maLichHen, {
      chanDoan: data.chanDoan ?? data.diagnosis,
      donThuoc: data.donThuoc ?? data.prescription,
      ghiChu: data.ghiChu ?? data.notes,
      chiTietDonThuoc: data.chiTietDonThuoc,
    }),
};
export const invoicesApi = {
  ...hoaDonApi,
  list: hoaDonApi.danhSach,
  byPatient: hoaDonApi.theoBenhNhan,
  get: hoaDonApi.layTheoMa,
  create: (
    maLichHen: number,
    items: { serviceId: number; quantity?: number }[],
  ) =>
    hoaDonApi.tao(
      maLichHen,
      items.map((i) => ({ maDichVu: i.serviceId, soLuong: i.quantity })),
    ),
  addPayment: (
    maHoaDon: number,
    data: { amount: number; method?: string; transactionRef?: string },
  ) => {
    const m = data.method || "TIEN_MAT";
    const phuongThuc =
      m === "CASH" || m === "TIEN_MAT"
        ? "TIEN_MAT"
        : m === "CARD" || m === "THE"
          ? "THE"
          : m === "BANK_TRANSFER" || m === "CHUYEN_KHOAN"
            ? "CHUYEN_KHOAN"
            : m === "ONLINE" || m === "TRUC_TUYEN"
              ? "TRUC_TUYEN"
              : m;
    return hoaDonApi.themThanhToan(maHoaDon, {
      soTien: data.amount,
      phuongThuc,
      maThamChieu: data.transactionRef,
    });
  },
  createPayOsLink: hoaDonApi.taoPayOsLink,
};
export const reportsApi = {
  ...baoCaoApi,
  revenue: baoCaoApi.doanhThu,
  exportExcel: baoCaoApi.xuatExcel,
};
export const reminderConfigApi = {
  ...cauHinhNhacLichApi,
  get: cauHinhNhacLichApi.lay,
  update: cauHinhNhacLichApi.capNhat,
};
export const auditLogsApi = {
  ...nhatKyHeThongApi,
  list: nhatKyHeThongApi.danhSach,
};
export const chatApi = {
  ...troChuyenApi,
  history: troChuyenApi.layLichSu,
  dmHistory: troChuyenApi.layDoiThoai,
  contacts: troChuyenApi.danhBa,
  uploadFile: apiUploadChatFile,
};
export const doctorSchedulesApi = {
  ...lichLamViecBacSiApi,
  byDoctor: lichLamViecBacSiApi.theoBacSiVaNgay,
  byDoctorDateRange: lichLamViecBacSiApi.theoBacSiVaKhoangNgay,
  create: lichLamViecBacSiApi.tao,
  update: lichLamViecBacSiApi.capNhat,
  delete: lichLamViecBacSiApi.xoa,
};

export type ReminderConfig = CauHinhNhacLich;

export interface BenhNhan {
  id?: number;
  hoTen: string;
  ngaySinh?: string;
  soDienThoai?: string;
  diaChi?: string;
  thuDienTu?: string;
  gioiTinh?: string;
  soCccd?: string;
  ngheNghiep?: string;
  nhomMau?: string;
  tienSuBenh?: string;
  diUng?: string;
  nguoiLienHe?: string;
  soDienThoaiLienHe?: string;
  hoatDong?: boolean;
}

export interface BacSi {
  id: number;
  maNguoiDung?: number;
  tenDangNhap?: string;
  hoTen?: string;
  maChuyenKhoa?: number;
  tenChuyenKhoa?: string;
  chuyenMon?: string;
  bangCap?: string;
  gioiThieu?: string;
  quaTrinhCongTac?: string;
  thanhTichDatDuoc?: string;
  hoatDong?: boolean;
}

export interface DichVu {
  id: number;
  maLoaiDichVu?: number;
  tenLoaiDichVu?: string;
  ten: string;
  moTa?: string;
  gia: number;
  hoatDong?: boolean;
}

export interface LoaiDichVu {
  id: number;
  tenLoaiDichVu: string;
}

export type TrangThaiLichHen = string;

export interface LichHen {
  id?: number;
  maBenhNhan: number;
  tenBenhNhan?: string;
  maBacSi: number;
  tenBacSi?: string;
  maDichVu: number;
  tenDichVu?: string;
  ngayHen: string;
  gioHen: string;
  trangThai?: TrangThaiLichHen;
  ghiChu?: string;
}

export interface SlotKhaDung {
  gio: string;
  soLuongDaDat: number;
  sucChua: number;
  daDay: boolean;
}

export interface BacSiSlotKhaDung {
  maBacSi: number;
  tenBacSi?: string;
  maChuyenKhoa?: number;
  tenChuyenKhoa?: string;
  slots: SlotKhaDung[];
}

export interface ChiTietDonThuoc {
  id?: number;
  maThuoc: number;
  tenThuoc?: string;
  soLuong?: number;
  donGia?: number;
  lieuDung?: string;
}

export interface HoSoKham {
  id?: number;
  maLichHen?: number;
  chanDoan?: string;
  donThuoc?: string;
  ghiChu?: string;
  chiTietDonThuoc?: ChiTietDonThuoc[];
}

export interface LichSuTrangThaiLichHen {
  id: number;
  maLichHen: number;
  trangThaiCu?: string;
  trangThaiMoi: string;
  maNguoiDung?: number;
  tenDangNhap?: string;
  ghiChu?: string;
  taoLuc: string;
}

export interface Thuoc {
  id?: number;
  tenThuoc: string;
  donVi?: string;
  hoatChat?: string;
  hamLuong?: string;
  dangBaoChe?: string;
  duongDung?: string;
  hangSanXuat?: string;
  nuocSanXuat?: string;
  soDangKy?: string;
  soLo?: string;
  hanSuDung?: string;
  giaNhap?: number;
  giaBan?: number;
  tonKho?: number;
  mucTonToiThieu?: number;
  chiDinh?: string;
  chongChiDinh?: string;
  tacDungPhu?: string;
  hoatDong?: boolean;
}

export interface ThuocTrangTraCuu {
  content: Thuoc[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first?: boolean;
  last?: boolean;
  empty?: boolean;
}

export interface PhieuChi {
  id?: number;
  moTa: string;
  soTien: number;
  ngayChi: string;
  loai?: string;
  chungTuThamChieu?: string;
  maNguoiTao?: number;
  tenDangNhapNguoiTao?: string;
  taoLuc?: string;
}

export interface ChiTietHoaDon {
  id?: number;
  maDichVu: number;
  tenDichVu?: string;
  donGia: number;
  soLuong: number;
  thanhTien: number;
}

export interface GiaoDichThanhToan {
  id?: number;
  soTien: number;
  phuongThuc?: string;
  maThamChieu?: string;
  lucThanhToan?: string;
}

export interface PayOsTaoLinkPhanHoi {
  checkoutUrl: string;
  qrCode: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  orderCode: number;
  description: string;
}

export interface HoaDon {
  id: number;
  maBenhNhan: number;
  tenBenhNhan?: string;
  maLichHen?: number;
  tongTien: number;
  soTienDaTra: number;
  trangThai: string;
  soHoaDon?: string;
  taoLuc?: string;
  chiTiet: ChiTietHoaDon[];
  giaoDichThanhToan: GiaoDichThanhToan[];
}

export interface LichLamViecBacSi {
  id?: number;
  maBacSi: number;
  tenBacSi?: string;
  ngayLich: string;
  khungGioBatDau?: string;
  khungGioKetThuc?: string;
  nguonBanGhi?: string;
  nghiCaNgay?: boolean;
}

export interface LichCoDinh {
  id?: number;
  maBacSi: number;
  tenBacSi?: string;
  thuTrongTuan: number;
  khungGioBatDau: string;
  khungGioKetThuc: string;
}

export interface DonThuocChiTietBangKe {
  maChiTiet: number;
  maDonThuoc?: number;
  maHoSoKham: number;
  maLichHen: number;
  tenBenhNhan?: string;
  ngayHen?: string;
  gioHen?: string;
  maThuoc: number;
  tenThuoc?: string;
  soLuong?: number;
  lieuDung?: string;
  donGia?: number;
}

export interface BaoCaoDoanhThu {
  ngay: string;
  tongDoanhThu: number;
  soLichHen?: number;
}

export interface NhatKyHeThongEntry {
  id: number;
  loaiThucThe: string;
  maThucThe: number;
  hanhDong: string;
  giaTriCu?: string;
  giaTriMoi?: string;
  maNguoiDung?: number;
  tenDangNhap?: string;
  taoLuc: string;
}

export type RevenueReport = BaoCaoDoanhThu;
export type DashboardStats = ThongKeBangDieuKhien;
