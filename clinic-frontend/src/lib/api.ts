const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081/api";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token)
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
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
};

export const benhNhanApi = {
  danhSach: (page = 0, size = 10) =>
    api<{ content: BenhNhan[]; totalElements: number }>(
      `/benh-nhan?page=${page}&size=${size}`,
    ),
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
  layTheoMa: (id: number) => api<BacSi>(`/bac-si/${id}`),
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

export const lichHenApi = {
  danhSach: (tuNgay: string, denNgay: string, page = 0, size = 20) =>
    api<{ content: LichHen[]; totalElements: number }>(
      `/lich-hen?tuNgay=${tuNgay}&denNgay=${denNgay}&page=${page}&size=${size}`,
    ),
  theoBenhNhan: (maBenhNhan: number) =>
    api<LichHen[]>(`/lich-hen/benh-nhan/${maBenhNhan}`),
  theoBacSiVaNgay: (maBacSi: number, ngay: string) =>
    api<LichHen[]>(`/lich-hen/bac-si/${maBacSi}?ngay=${ngay}`),
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
  capNhatTrangThai: (id: number, trangThai: string) =>
    api<LichHen>(`/lich-hen/${id}/trang-thai?trangThai=${trangThai}`, {
      method: "PATCH",
    }),
  lichSuTrangThai: (id: number) =>
    api<LichSuTrangThaiLichHen[]>(`/lich-hen/${id}/lich-su-trang-thai`),
};

export const hoSoKhamApi = {
  theoBenhNhan: (maBenhNhan: number) =>
    api<HoSoKham[]>(`/ho-so-kham/benh-nhan/${maBenhNhan}`),
  theoLichHen: (maLichHen: number) =>
    api<HoSoKham | null>(`/ho-so-kham/lich-hen/${maLichHen}`),
  luu: (maLichHen: number, data: Partial<HoSoKham>) =>
    api<HoSoKham>(`/ho-so-kham/lich-hen/${maLichHen}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

export const thuocApi = {
  dangHoatDong: () => api<Thuoc[]>("/thuoc/dang-hoat-dong"),
  tatCa: () => api<Thuoc[]>("/thuoc"),
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

export const phieuChiApi = {
  danhSach: (tuNgay?: string, denNgay?: string, page = 0, size = 20) => {
    let q = `/phieu-chi?page=${page}&size=${size}`;
    if (tuNgay) q += `&tuNgay=${tuNgay}`;
    if (denNgay) q += `&denNgay=${denNgay}`;
    return api<{ content: PhieuChi[]; totalElements: number }>(q);
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
};

export const hoaDonApi = {
  danhSach: (tuNgay: string, denNgay: string, page = 0, size = 20) =>
    api<{ content: HoaDon[]; totalElements: number }>(
      `/hoa-don?tuNgay=${tuNgay}&denNgay=${denNgay}&page=${page}&size=${size}`,
    ),
  theoBenhNhan: (maBenhNhan: number) =>
    api<HoaDon[]>(`/hoa-don/benh-nhan/${maBenhNhan}`),
  layTheoMa: (id: number) => api<HoaDon>(`/hoa-don/${id}`),
  tao: (maLichHen: number, chiTiet: { maDichVu: number; soLuong?: number }[]) =>
    api<HoaDon>(
      `/hoa-don?maLichHen=${maLichHen}`,
      { method: "POST", body: JSON.stringify(chiTiet) },
    ),
  themThanhToan: (
    maHoaDon: number,
    data: { soTien: number; phuongThuc?: string; maThamChieu?: string },
  ) =>
    api<GiaoDichThanhToan>(`/hoa-don/${maHoaDon}/thanh-toan`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

const API_ROOT = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";

export const baoCaoApi = {
  doanhThu: (
    tuNgay: string,
    denNgay: string,
    maBacSi?: number,
    maDichVu?: number,
  ) => {
    let url = `${API_BASE}/bao-cao/doanh-thu?tuNgay=${tuNgay}&denNgay=${denNgay}`;
    if (maBacSi != null) url += `&maBacSi=${maBacSi}`;
    if (maDichVu != null) url += `&maDichVu=${maDichVu}`;
    return api<BaoCaoDoanhThu[]>(url);
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
  doanhThu7NgayGanNhat: BaoCaoDoanhThu[];
}

export const bangDieuKhienApi = {
  thongKe: () => api<ThongKeBangDieuKhien>("/bang-dieu-khien/thong-ke"),
};

/** Giữ tương thích: gọi cùng endpoint thống kê */
export const dashboardApi = {
  stats: () => bangDieuKhienApi.thongKe(),
};

export interface CauHinhNhacLich {
  id?: number;
  soNgayTruoc: number;
  soGioTruoc: number;
  batThuDienTu: boolean;
  batTinNhan: boolean;
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
    api<{ content: NhatKyHeThongEntry[]; totalElements: number }>(
      `/nhat-ky-he-thong?tuNgay=${tuNgay}&denNgay=${denNgay}&page=${page}&size=${size}`,
    ),
};

export interface TinNhanChatDto {
  id: number;
  maNguoiGui: number;
  tenNguoiGui: string;
  noiDung: string;
  maPhong: number;
  taoLuc: string;
}

export const troChuyenApi = {
  layLichSu: (maPhong = 1, gioiHan = 50) =>
    api<TinNhanChatDto[]>(
      `/tro-chuyen/lich-su?maPhong=${encodeURIComponent(maPhong)}&gioiHan=${gioiHan}`,
    ),
};

export const lichLamViecBacSiApi = {
  theoBacSiVaNgay: (maBacSi: number, ngay: string) =>
    api<LichLamViecBacSi[]>(
      `/lich-lam-viec-bac-si/bac-si/${maBacSi}?ngay=${ngay}`,
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
  xoa: (id: number) =>
    api<void>(`/lich-lam-viec-bac-si/${id}`, { method: "DELETE" }),
};

/** Tương thích mã cũ (tên tiếng Anh) */
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
};
export const doctorsApi = {
  ...bacSiApi,
  list: bacSiApi.danhSach,
  get: bacSiApi.layTheoMa,
};
export const servicesApi = {
  ...dichVuApi,
  list: dichVuApi.danhSach,
  get: dichVuApi.layTheoMa,
  create: dichVuApi.tao,
  update: dichVuApi.capNhat,
  delete: dichVuApi.xoa,
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
};
export const doctorSchedulesApi = {
  ...lichLamViecBacSiApi,
  byDoctor: lichLamViecBacSiApi.theoBacSiVaNgay,
  create: lichLamViecBacSiApi.tao,
  update: lichLamViecBacSiApi.capNhat,
  delete: lichLamViecBacSiApi.xoa,
};

export type ReminderConfig = CauHinhNhacLich;

// Types
export interface BenhNhan {
  id?: number;
  hoTen: string;
  ngaySinh?: string;
  soDienThoai?: string;
  diaChi?: string;
  thuDienTu?: string;
  hoatDong?: boolean;
}

export interface BacSi {
  id: number;
  hoTen: string;
  chuyenMon?: string;
  bangCap?: string;
  hoatDong?: boolean;
}

export interface DichVu {
  id: number;
  ten: string;
  moTa?: string;
  gia: number;
  hoatDong?: boolean;
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
  giaBan?: number;
  hoatDong?: boolean;
}

export interface PhieuChi {
  id?: number;
  moTa: string;
  soTien: number;
  ngayChi: string;
  loai?: string;
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
  khungGioBatDau: string;
  khungGioKetThuc: string;
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
