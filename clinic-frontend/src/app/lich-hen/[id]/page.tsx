"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, Form, Button, Alert, Table } from "react-bootstrap";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import {
  appointmentsApi,
  visitRecordsApi,
  thuocApi,
  invoicesApi,
  servicesApi,
  type LichHen,
  type LichSuTrangThaiLichHen,
  type ChiTietDonThuoc,
  type ChiTietDichVuKham,
  type DichVu,
  type Thuoc,
} from "@/lib/api";
import {
  LICH_HEN_STATUS_FLOW as STATUS_FLOW,
  LICH_HEN_STATUS_LABEL as STATUS_LABEL,
  lichHenChoPhepLapHoaDon,
  lichHenHienNutHoaDon,
  lichHenKhoaDoiTrangThai,
  metaTrangThaiLichHen as metaTrangThai,
} from "@/lib/lichHenStatus";
import {
  laQuanTriLichHen,
  lichHenChoPhepChuyenTrangThai,
  lichHenChoPhepNhapHoSoKham,
  lichHenChoPhepNhapSinhHieu,
  lichHenChoPhepInDonThuoc,
} from "@/lib/lichHenQuyTrinh";
import { laBacSiKhongXemHoaDon, laChiTaiKhoanBenhNhan, laNhanVien } from "@/lib/roles";
import { formatGioHen, formatNgayDdMmYyyy } from "@/lib/formatInstantVi";
import { formatVndInputMoneyUnit } from "@/lib/moneyVnd";
import { ThuocChonModal } from "@/components/ThuocChonModal";
import { DichVuPhatSinhKham } from "@/components/DichVuPhatSinhKham";
import {
  SinhHieuBanDauPanel,
  sinhHieuSangPayload,
  sinhHieuTuHoSo,
  type SinhHieuState,
} from "@/components/SinhHieuBanDauPanel";

function newRow(maThuoc: number): ChiTietDonThuoc {
  return { maThuoc, soLuong: 1, lieuDung: "" };
}

function thuocCatalogTheoMa(list: Thuoc[], maThuoc: number): Thuoc | undefined {
  return list.find((x) => x.id === maThuoc);
}

function oCell(s?: string | null): string {
  const t = s?.trim();
  return t ? t : "—";
}

export default function AppointmentDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const { user, loading } = useAuth();
  const router = useRouter();
  const [app, setApp] = useState<LichHen | null>(null);
  const [diagnosis, setDiagnosis] = useState("");
  const [prescription, setPrescription] = useState("");
  const [notes, setNotes] = useState("");
  const [sinhHieu, setSinhHieu] = useState<SinhHieuState>(() =>
    sinhHieuTuHoSo(null),
  );
  const [rows, setRows] = useState<ChiTietDonThuoc[]>([]);
  const [dichVuRows, setDichVuRows] = useState<ChiTietDichVuKham[]>([]);
  const [dichVuList, setDichVuList] = useState<DichVu[]>([]);
  const [thuocList, setThuocList] = useState<Thuoc[]>([]);
  const daGoiYDichVuTuLich = useRef(false);
  const [thuocModalRow, setThuocModalRow] = useState<number | null>(null);
  const [statusLog, setStatusLog] = useState<LichSuTrangThaiLichHen[]>([]);
  const [maHoaDonLienKet, setMaHoaDonLienKet] = useState<number | null>(null);
  const [error, setError] = useState("");

  const vaiTroUser = user?.cacVaiTro ?? [];
  const isAdmin = laQuanTriLichHen(vaiTroUser);

  const canEditMedical =
    !!user &&
    (user.cacVaiTro.includes("BAC_SI") ||
      user.cacVaiTro.includes("QUAN_TRI") ||
      user.cacVaiTro.includes("LE_TAN"));

  const canUpdateAppointmentStatus =
    !!user &&
    laNhanVien(user) &&
    (user.cacVaiTro.includes("BAC_SI") ||
      user.cacVaiTro.includes("QUAN_TRI") ||
      user.cacVaiTro.includes("LE_TAN") ||
      user.cacVaiTro.includes("THU_NGAN"));

  useEffect(() => {
    if (!loading && !user) router.replace("/dang-nhap");
  }, [user, loading, router]);

  useEffect(() => {
    daGoiYDichVuTuLich.current = false;
    setDichVuRows([]);
  }, [id]);

  useEffect(() => {
    if (!user || !id) return;
    appointmentsApi
      .get(id)
      .then(setApp)
      .catch((e) => setError(e.message));
    appointmentsApi
      .statusHistory(id)
      .then(setStatusLog)
      .catch(() => setStatusLog([]));
    visitRecordsApi
      .byAppointment(id)
      .then((r) => {
        if (r) {
          setDiagnosis(r.chanDoan || "");
          setPrescription(r.donThuoc || "");
          setNotes(r.ghiChu || "");
          setSinhHieu(sinhHieuTuHoSo(r));
          if (r.chiTietDonThuoc?.length) {
            setRows(
              r.chiTietDonThuoc.map((c) => ({
                maThuoc: c.maThuoc,
                tenThuoc: c.tenThuoc,
                soLuong: c.soLuong ?? 1,
                donGia: c.donGia,
                lieuDung: c.lieuDung ?? "",
              })),
            );
          } else {
            setRows([]);
          }
          if (r.chiTietDichVu?.length) {
            daGoiYDichVuTuLich.current = true;
            setDichVuRows(
              r.chiTietDichVu.map((c) => ({
                id: c.id,
                maDichVu: c.maDichVu,
                tenDichVu: c.tenDichVu,
                tenLoaiDichVu: c.tenLoaiDichVu,
                soLuong: c.soLuong ?? 1,
                donGia: c.donGia,
              })),
            );
          }
        }
      })
      .catch(() => {});
  }, [user, id]);

  useEffect(() => {
    if (!user || !canEditMedical) return;
    servicesApi
      .list()
      .then(setDichVuList)
      .catch(() => {});
    thuocApi
      .dangHoatDong()
      .then((list) => {
        setThuocList(list);
        setRows((prev) => {
          if (prev.length > 0 || list.length === 0) return prev;
          return [newRow(list[0].id!)];
        });
      })
      .catch(() => {});
  }, [user, canEditMedical]);

  useEffect(() => {
    if (
      daGoiYDichVuTuLich.current ||
      !app?.maDichVu ||
      dichVuList.length === 0 ||
      dichVuRows.length > 0
    ) {
      return;
    }
    const dv = dichVuList.find((s) => s.id === app.maDichVu);
    if (!dv) return;
    daGoiYDichVuTuLich.current = true;
    setDichVuRows([
      {
        maDichVu: dv.id,
        tenDichVu: dv.ten,
        tenLoaiDichVu: dv.tenLoaiDichVu,
        soLuong: 1,
        donGia: dv.gia,
      },
    ]);
  }, [app, dichVuList, dichVuRows.length]);

  useEffect(() => {
    if (!user || !id || !app?.trangThai || !lichHenHienNutHoaDon(app.trangThai)) {
      setMaHoaDonLienKet(null);
      return;
    }
    if (laBacSiKhongXemHoaDon(user)) {
      setMaHoaDonLienKet(null);
      return;
    }
    invoicesApi
      .byAppointment(id)
      .then((hd) => setMaHoaDonLienKet(hd.id ?? null))
      .catch(() => setMaHoaDonLienKet(null));
  }, [user, id, app?.trangThai]);

  const updateStatus = async (status: string) => {
    if (!canUpdateAppointmentStatus) {
      setError("Bạn không có quyền cập nhật trạng thái lịch hẹn.");
      return;
    }
    if (app && lichHenKhoaDoiTrangThai(app.trangThai)) {
      setError(
        "Lịch đã thanh toán — không thể đổi trạng thái. Mở hóa đơn để xem hoặc in.",
      );
      return;
    }
    const kiemTra = lichHenChoPhepChuyenTrangThai(
      app?.trangThai,
      status,
      vaiTroUser,
    );
    if (!kiemTra.allowed) {
      setError(kiemTra.lyDo ?? "Không thể đổi trạng thái theo quy trình.");
      return;
    }
    try {
      await appointmentsApi.updateStatus(id, status);
      if (app) setApp({ ...app, trangThai: status });
      const log = await appointmentsApi.statusHistory(id);
      setStatusLog(log);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi");
    }
  };

  const choPhepNhapHoSo =
    canEditMedical &&
    !!app &&
    lichHenChoPhepNhapHoSoKham(app.trangThai, vaiTroUser);
  const choPhepNhapSinhHieu =
    canEditMedical &&
    !!app &&
    lichHenChoPhepNhapSinhHieu(app.trangThai, vaiTroUser);
  const choPhepInDonThuoc = lichHenChoPhepInDonThuoc(app?.trangThai, vaiTroUser);
  const coNoiDungDonThuoc =
    diagnosis.trim().length > 0 ||
    prescription.trim().length > 0 ||
    rows.some((r) => r.maThuoc > 0);

  const payloadHoSoKham = () => ({
    diagnosis,
    prescription,
    notes,
    chiTietDonThuoc: rows.filter((r) => r.maThuoc > 0),
    chiTietDichVu: dichVuRows.filter((r) => r.maDichVu > 0),
    ...sinhHieuSangPayload(sinhHieu),
  });

  const apDungHoSoDaLuu = (saved: Awaited<ReturnType<typeof visitRecordsApi.save>>) => {
    setSinhHieu(sinhHieuTuHoSo(saved));
    if (saved.chiTietDonThuoc?.length) {
      setRows(
        saved.chiTietDonThuoc.map((c) => ({
          maThuoc: c.maThuoc,
          tenThuoc: c.tenThuoc,
          soLuong: c.soLuong ?? 1,
          donGia: c.donGia,
          lieuDung: c.lieuDung ?? "",
        })),
      );
    }
    if (saved.chiTietDichVu?.length) {
      daGoiYDichVuTuLich.current = true;
      setDichVuRows(
        saved.chiTietDichVu.map((c) => ({
          id: c.id,
          maDichVu: c.maDichVu,
          tenDichVu: c.tenDichVu,
          tenLoaiDichVu: c.tenLoaiDichVu,
          soLuong: c.soLuong ?? 1,
          donGia: c.donGia,
        })),
      );
    }
  };

  const saveVitals = async () => {
    if (!choPhepNhapSinhHieu) {
      setError(
        "Ghi sinh hiệu khi lịch đã tiếp nhận (lễ tân) hoặc trong giai đoạn khám (bác sĩ).",
      );
      return;
    }
    try {
      const saved = await visitRecordsApi.save(id, payloadHoSoKham());
      apDungHoSoDaLuu(saved);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi");
    }
  };

  const saveRecord = async () => {
    if (!choPhepNhapHoSo) {
      setError(
        "Chỉ nhập hồ sơ khám khi lịch ở giai đoạn đang khám → xét nghiệm → đã kê đơn.",
      );
      return;
    }
    try {
      const saved = await visitRecordsApi.save(id, payloadHoSoKham());
      apDungHoSoDaLuu(saved);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi");
    }
  };

  const addRow = () => {
    const first = thuocList[0]?.id;
    if (first == null) return;
    setRows((r) => [...r, newRow(first)]);
  };

  const removeRow = (idx: number) => {
    setRows((r) => r.filter((_, i) => i !== idx));
  };

  const patchRow = (idx: number, patch: Partial<ChiTietDonThuoc>) => {
    setRows((r) =>
      r.map((row, i) => (i === idx ? { ...row, ...patch } : row)),
    );
  };

  if (!loading && !user) return null;
  if (!app) return <div className="py-4">Đang tải...</div>;

  const tagMeta = metaTrangThai(app.trangThai);
  const khoaTrangThai = lichHenKhoaDoiTrangThai(app.trangThai);
  const hienNutHoaDon = lichHenHienNutHoaDon(app.trangThai);
  const lapHoaDonMoi = lichHenChoPhepLapHoaDon(app.trangThai) && maHoaDonLienKet == null;
  const xemHoaDon = maHoaDonLienKet != null;
  const trangThaiNut = (target: string) => {
    if (khoaTrangThai) {
      return { disabled: true, title: "Lịch đã thanh toán — trạng thái được khóa." };
    }
    if (app.trangThai === target) {
      return { disabled: false, title: "Trạng thái hiện tại" };
    }
    const kt = lichHenChoPhepChuyenTrangThai(app.trangThai, target, vaiTroUser);
    return {
      disabled: !kt.allowed,
      title: kt.allowed
        ? `Chuyển sang ${STATUS_LABEL[target] ?? target}`
        : kt.lyDo ?? "Không thể chuyển trạng thái này.",
    };
  };

  return (
    <div className="lich-hen-detail-page">
      <h2 className="mb-4">Chi tiết lịch khám</h2>
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {app.biAnhHuongNgoaiLe ? (
        <Alert variant="warning" className="mb-3">
          <div className="d-flex gap-2 align-items-start">
            <i className="bi bi-exclamation-triangle-fill fs-5 flex-shrink-0" aria-hidden />
            <div>
              <strong>Lịch hẹn cần xác nhận lại</strong>
              <p className="mb-0 mt-1 small">
                {app.lyDoAnhHuongNgoaiLe ??
                  "Bác sĩ có thay đổi lịch làm việc ngày khám. Vui lòng liên hệ phòng khám để đổi giờ hoặc hẹn lại."}
              </p>
              {user && laChiTaiKhoanBenhNhan(user) ? (
                <p className="mb-0 mt-2 small text-muted">
                  Gọi hotline hoặc nhắn qua mục trò chuyện / liên hệ trên trang chủ.
                </p>
              ) : null}
            </div>
          </div>
        </Alert>
      ) : null}
      <Card className="mb-3">
        <Card.Header className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <span>
            #{app.id} - {formatNgayDdMmYyyy(app.ngayHen)} {formatGioHen(app.gioHen)}
          </span>
          <span
            className={`lich-hen-status-tag lich-hen-status-tag--${tagMeta.slug}`}
          >
            <i className={`bi ${tagMeta.icon}`} aria-hidden />
            {tagMeta.label}
          </span>
        </Card.Header>
        <Card.Body>
          <p>
            <strong>Bệnh nhân:</strong> {app.tenBenhNhan} (mã: {app.maBenhNhan})
          </p>
          <p>
            <strong>Bác sĩ:</strong> {app.tenBacSi}
          </p>
          <p>
            <strong>Dịch vụ:</strong> {app.tenDichVu}
          </p>
          {app.ghiChu && (
            <p>
              <strong>Ghi chú:</strong> {app.ghiChu}
            </p>
          )}
          {canUpdateAppointmentStatus ? (
            <>
              {khoaTrangThai ? (
                <Alert variant="secondary" className="mb-3 py-2 small">
                  Lịch đã <strong>thanh toán</strong> — trạng thái được khóa. Chỉ xem hồ sơ /
                  hóa đơn, không đổi quy trình khám nữa.
                </Alert>
              ) : !isAdmin ? (
                <Alert variant="info" className="mb-3 py-2 small">
                  Trạng thái chỉ đổi <strong>theo từng bước</strong> trong quy trình khám.
                  Hủy / không đến chỉ khi lịch còn <strong>Đã đặt</strong>. Cần ngoại lệ — liên hệ{" "}
                  <strong>quản trị</strong>.
                </Alert>
              ) : null}
              <div className="lich-hen-flow-label mb-2 fw-semibold text-secondary">
                Cập nhật trạng thái
                {isAdmin ? (
                  <span className="fw-normal text-muted ms-2">(quản trị: không giới hạn quy trình)</span>
                ) : null}
              </div>
              <div className="lich-hen-flow-toolbar d-flex flex-wrap gap-2">
                {STATUS_FLOW.map((s) => {
                  const nut = trangThaiNut(s.value);
                  return (
                  <button
                    key={s.value}
                    type="button"
                    className={`lich-hen-flow-btn lich-hen-flow-btn--${s.slug}${
                      app.trangThai === s.value ? " is-active" : ""
                    }${nut.disabled ? " is-locked" : ""}`}
                    disabled={nut.disabled}
                    title={nut.title}
                    onClick={() => updateStatus(s.value)}
                  >
                    <i
                      className={`bi ${s.icon} lich-hen-flow-btn__icon`}
                      aria-hidden
                    />
                    <span>{s.label}</span>
                  </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="small text-muted">
              <div className="d-flex flex-wrap align-items-center gap-2">
                <span className="fw-semibold text-body">Trạng thái hiện tại:</span>
                <span
                  className={`lich-hen-status-tag lich-hen-status-tag--${tagMeta.slug}`}
                >
                  <i className={`bi ${tagMeta.icon}`} aria-hidden />
                  {tagMeta.label}
                </span>
                <span> (chỉ xem, không thể thay đổi)</span>
              </div>
              {user && laChiTaiKhoanBenhNhan(user) ? (
                <p className="mb-0 mt-2 text-secondary">
                  Để hủy hoặc đổi lịch, vui lòng liên hệ phòng khám.
                </p>
              ) : null}
            </div>
          )}
        </Card.Body>
      </Card>

      {statusLog.length > 0 && (
        <Card className="mb-3">
          <Card.Header>Lịch sử trạng thái (truy vết quy trình)</Card.Header>
          <Card.Body className="p-0">
            <div className="lich-hen-status-log-scroll">
              <Table responsive hover className="mb-0 small">
                <thead>
                  <tr>
                    <th className="text-center text-nowrap" style={{ width: "3rem" }}>
                      STT
                    </th>
                    <th>Thời điểm</th>
                    <th>Từ</th>
                    <th>Đến</th>
                    <th>Tài khoản</th>
                  </tr>
                </thead>
                <tbody>
                  {statusLog.map((l, i) => (
                    <tr key={l.id}>
                      <td className="text-center text-muted">{i + 1}</td>
                      <td>
                        {l.taoLuc
                          ? new Date(l.taoLuc).toLocaleString("vi-VN")
                          : "—"}
                      </td>
                      <td>
                        {l.trangThaiCu
                          ? STATUS_LABEL[l.trangThaiCu] ?? l.trangThaiCu
                          : "—"}
                      </td>
                      <td>
                        {STATUS_LABEL[l.trangThaiMoi] ?? l.trangThaiMoi}
                      </td>
                      <td>{l.tenDangNhap || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      )}

      {canEditMedical ? (
        <>
          <SinhHieuBanDauPanel
            value={sinhHieu}
            onChange={setSinhHieu}
            disabled={!choPhepNhapSinhHieu}
            isAdmin={isAdmin}
            trangThai={app.trangThai}
          />
          <div className="d-flex flex-wrap gap-2 mb-3">
            <Button
              variant="outline-primary"
              onClick={saveVitals}
              disabled={!choPhepNhapSinhHieu}
            >
              <i className="bi bi-heart-pulse me-2" aria-hidden />
              Lưu sinh hiệu
            </Button>
          </div>
        </>
      ) : null}

      {canEditMedical ? (
        <Card>
          <Card.Header>Kết quả khám / Chẩn đoán / Đơn thuốc</Card.Header>
          <Card.Body>
            {!choPhepNhapHoSo ? (
              <Alert variant="secondary" className="mb-3 py-2 small">
                {isAdmin
                  ? "Quản trị có thể chỉnh hồ sơ khám ở mọi giai đoạn."
                  : "Nhập hồ sơ khám khi lịch ở giai đoạn đang khám → xét nghiệm → đã kê đơn."}
              </Alert>
            ) : null}
            <Form.Group className="mb-3">
              <Form.Label>Chẩn đoán</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Chẩn đoán theo thăm khám (ICD / mô tả)..."
                value={diagnosis}
                disabled={!choPhepNhapHoSo}
                onChange={(e) => setDiagnosis(e.target.value)}
              />
            </Form.Group>

            <div className="mb-4 pb-3 border-bottom">
              <DichVuPhatSinhKham
                dichVuList={dichVuList}
                rows={dichVuRows}
                onChange={setDichVuRows}
                disabled={!choPhepNhapHoSo}
              />
            </div>

            {choPhepInDonThuoc ? (
              <Alert variant="success" className="mb-3 py-2 small">
                Sau khi kê đơn, <strong>lưu hồ sơ</strong> rồi{" "}
                <strong>in đơn thuốc</strong> để đóng dấu giao cho bệnh nhân. Tiền
                thuốc bệnh nhân tự mua tại nhà thuốc —{" "}
                <strong>không tính vào hóa đơn khám</strong> tại quầy.
              </Alert>
            ) : null}
            <h6 className="text-muted mb-2">Đơn thuốc theo danh mục</h6>
            {thuocList.length === 0 && (
              <p className="small text-muted">
                Chưa có thuốc trong danh mục. Quản trị có thể thêm tại mục{" "}
                <Link href="/thuoc">Danh mục thuốc</Link>.
              </p>
            )}
            {rows.length > 0 && (
              <Table
                responsive
                size="sm"
                bordered
                className="mb-2 lich-hen-don-thuoc-table"
              >
                <thead>
                  <tr className="text-nowrap small">
                    <th className="text-center" style={{ width: "3rem" }}>
                      STT
                    </th>
                    <th>Thuốc</th>
                    <th>Đơn vị</th>
                    <th>Hàm lượng</th>
                    <th>Dạng</th>
                    <th>Hoạt chất</th>
                    <th>Hãng / nước SX</th>
                    <th className="text-end">Giá bán</th>
                    <th className="text-end">Tồn</th>
                    <th className="text-center">SL</th>
                    <th>Liều dùng / ghi chú</th>
                    <th className="text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => {
                    const tCat = thuocCatalogTheoMa(thuocList, row.maThuoc);
                    const tenHien =
                      tCat?.tenThuoc?.trim() ||
                      row.tenThuoc?.trim() ||
                      "—";
                    const coGiaBan =
                      tCat?.giaBan != null && !Number.isNaN(Number(tCat.giaBan));
                    const coTon =
                      tCat?.tonKho != null && !Number.isNaN(Number(tCat.tonKho));
                    const hangNuoc = [tCat?.hangSanXuat?.trim(), tCat?.nuocSanXuat?.trim()]
                      .filter(Boolean)
                      .join(" · ");
                    return (
                      <tr key={idx}>
                        <td className="text-center text-muted align-middle">
                          {idx + 1}
                        </td>
                        <td className="lich-hen-thuoc-chon-cell align-top">
                          <div className="lich-hen-thuoc-cell-block d-flex flex-column gap-2 align-items-start">
                            <div className="lich-hen-thuoc-cell__title text-break min-w-0">
                              {tenHien}
                            </div>
                            <Button
                              type="button"
                              variant="outline-primary"
                              size="sm"
                              className="d-inline-flex align-items-center gap-1"
                              disabled={!choPhepNhapHoSo}
                              onClick={() => setThuocModalRow(idx)}
                            >
                              <i className="bi bi-capsule" aria-hidden />
                              Chọn thuốc
                            </Button>
                          </div>
                        </td>
                        <td className="align-middle small text-break">
                          {oCell(tCat?.donVi)}
                        </td>
                        <td className="align-middle small text-break">
                          {oCell(tCat?.hamLuong)}
                        </td>
                        <td className="align-middle small text-break">
                          {oCell(tCat?.dangBaoChe)}
                        </td>
                        <td className="align-middle small text-break">
                          {oCell(tCat?.hoatChat)}
                        </td>
                        <td className="align-middle small text-break">
                          {hangNuoc || "—"}
                        </td>
                        <td className="align-middle small text-end text-nowrap">
                          {coGiaBan ? formatVndInputMoneyUnit(tCat!.giaBan) : "—"}
                        </td>
                        <td className="align-middle small text-end text-nowrap">
                          {coTon
                            ? Number(tCat!.tonKho).toLocaleString("vi-VN")
                            : "—"}
                        </td>
                        <td className="align-middle text-center">
                          <Form.Control
                            type="number"
                            min={1}
                            placeholder="1"
                            className="lich-hen-don-thuoc-qty"
                            value={row.soLuong ?? 1}
                            disabled={!choPhepNhapHoSo}
                            onChange={(e) =>
                              patchRow(idx, {
                                soLuong: Number(e.target.value) || 1,
                              })
                            }
                          />
                        </td>
                        <td className="align-middle">
                          <Form.Control
                            placeholder="VD: Sau ăn, 2 viên/lần"
                            value={row.lieuDung ?? ""}
                            disabled={!choPhepNhapHoSo}
                            onChange={(e) =>
                              patchRow(idx, { lieuDung: e.target.value })
                            }
                          />
                        </td>
                        <td className="lich-hen-don-thuoc-del-cell">
                          <button
                            type="button"
                            className="btn btn-sm lich-hen-remove-row-thuoc"
                            disabled={!choPhepNhapHoSo}
                            onClick={() => removeRow(idx)}
                            title="Xóa dòng thuốc"
                            aria-label="Xóa dòng thuốc"
                          >
                            <i className="bi bi-trash" aria-hidden />
                            <span>Xóa</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            )}
            <button
              type="button"
              className="btn btn-sm lich-hen-add-row-thuoc mb-3"
              onClick={addRow}
              disabled={!choPhepNhapHoSo || thuocList.length === 0}
            >
              <i className="bi bi-plus-circle-fill me-2" aria-hidden />
              Thêm dòng thuốc
            </button>

            <Form.Group className="mb-3">
              <Form.Label>Ghi chú đơn thuốc (tự do)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Ghi thêm hướng dẫn, thuốc ngoài danh mục (nếu cần)..."
                value={prescription}
                disabled={!choPhepNhapHoSo}
                onChange={(e) => setPrescription(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Ghi chú hồ sơ</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Ghi chú nội bộ cho lần khám..."
                value={notes}
                disabled={!choPhepNhapHoSo}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Form.Group>
            <div className="d-flex flex-wrap gap-2">
              <Button variant="primary" onClick={saveRecord} disabled={!choPhepNhapHoSo}>
                <i className="bi bi-check2-circle me-2" aria-hidden />
                Lưu hồ sơ khám
              </Button>
              {choPhepInDonThuoc ? (
                coNoiDungDonThuoc ? (
                  <Link
                    href={`/lich-hen/${id}/don-thuoc/print`}
                    className="btn btn-outline-success d-inline-flex align-items-center gap-2"
                    title="In đơn thuốc đóng dấu (lưu hồ sơ trước để in đúng dữ liệu)"
                  >
                    <i className="bi bi-printer" aria-hidden />
                    In đơn thuốc
                  </Link>
                ) : (
                  <Button
                    variant="outline-success"
                    disabled
                    title="Thêm chẩn đoán hoặc thuốc trước khi in"
                    className="d-inline-flex align-items-center gap-2"
                  >
                    <i className="bi bi-printer" aria-hidden />
                    In đơn thuốc
                  </Button>
                )
              ) : null}
            </div>
          </Card.Body>
        </Card>
      ) : null}
      <ThuocChonModal
        show={thuocModalRow !== null}
        onHide={() => setThuocModalRow(null)}
        thuocList={thuocList}
        selectedId={
          thuocModalRow !== null ? rows[thuocModalRow]?.maThuoc ?? 0 : 0
        }
        title={
          thuocModalRow !== null
            ? `Chọn thuốc (dòng ${thuocModalRow + 1})`
            : "Chọn thuốc"
        }
        onSelect={(maThuoc) => {
          if (thuocModalRow === null) return;
          const t = thuocList.find((x) => x.id === maThuoc);
          patchRow(thuocModalRow, {
            maThuoc,
            tenThuoc: t?.tenThuoc,
          });
        }}
      />
      <div className="mt-3 d-flex flex-wrap gap-2 align-items-center lich-hen-detail-actions">
        {choPhepInDonThuoc ? (
          coNoiDungDonThuoc ? (
            <Link
              href={`/lich-hen/${id}/don-thuoc/print`}
              className="btn btn-success d-inline-flex align-items-center gap-2"
              title="In đơn thuốc đóng dấu cho bệnh nhân"
            >
              <i className="bi bi-printer-fill" aria-hidden />
              In đơn thuốc
            </Link>
          ) : (
            <Button
              variant="success"
              disabled
              className="d-inline-flex align-items-center gap-2"
              title="Thêm chẩn đoán hoặc thuốc trước khi in"
            >
              <i className="bi bi-printer-fill" aria-hidden />
              In đơn thuốc
            </Button>
          )
        ) : null}
        {user && laBacSiKhongXemHoaDon(user) ? (
          <Button
            variant="outline-secondary"
            disabled
            className="d-inline-flex align-items-center gap-2"
            title="Bác sĩ không truy cập hóa đơn; lễ tân hoặc thu ngân lập và thanh toán."
          >
            <i className="bi bi-receipt" aria-hidden />
            Hóa đơn
          </Button>
        ) : lapHoaDonMoi ? (
          <Link
            href={`/hoa-don/new?maLichHen=${id}`}
            className="btn btn-outline-primary d-inline-flex align-items-center gap-2"
          >
            <i className="bi bi-receipt" aria-hidden />
            Lập hóa đơn
          </Link>
        ) : xemHoaDon ? (
          <Link
            href={`/hoa-don/${maHoaDonLienKet}`}
            className="btn btn-outline-primary d-inline-flex align-items-center gap-2"
          >
            <i className="bi bi-receipt" aria-hidden />
            Xem hóa đơn
          </Link>
        ) : (
          <Button
            variant="outline-secondary"
            disabled
            className="d-inline-flex align-items-center gap-2"
            title={
              hienNutHoaDon
                ? "Đang tải thông tin hóa đơn…"
                : "Chuyển lịch sang trạng thái chờ thanh toán để lập hóa đơn."
            }
          >
            <i className="bi bi-receipt" aria-hidden />
            Hóa đơn
          </Button>
        )}
        <Button
          variant="secondary"
          className="d-inline-flex align-items-center gap-2"
          onClick={() => router.back()}
        >
          <i className="bi bi-arrow-left-circle" aria-hidden />
          Quay lại
        </Button>
      </div>
    </div>
  );
}
