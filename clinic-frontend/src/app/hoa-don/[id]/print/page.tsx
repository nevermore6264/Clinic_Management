"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { invoicesApi, lichHenApi, type HoaDon, type LichHen } from "@/lib/api";
import { HoaDonStatusTag } from "@/components/HoaDonStatusTag";
import { PhuongThucThanhToanTag } from "@/components/PhuongThucThanhToanTag";
import { LoadingState } from "@/components/LoadingState";
import {
  formatGioHen,
  formatInstantVi,
  formatNgayHenDayVi,
} from "@/lib/formatInstantVi";
import { LICH_HEN_STATUS_LABEL } from "@/lib/lichHenStatus";

const clinic = {
  name: process.env.NEXT_PUBLIC_CLINIC_NAME ?? "Phòng khám đa khoa",
  address: process.env.NEXT_PUBLIC_CLINIC_ADDRESS ?? "",
  phone: process.env.NEXT_PUBLIC_CLINIC_PHONE ?? "",
  taxId: process.env.NEXT_PUBLIC_CLINIC_TAX_ID ?? "",
};

export default function InvoicePrintPage() {
  const params = useParams();
  const id = Number(params.id);
  const { user, loading } = useAuth();
  const router = useRouter();
  const [inv, setInv] = useState<HoaDon | null>(null);
  const [lichHen, setLichHen] = useState<LichHen | null>(null);
  const [lichHenLoading, setLichHenLoading] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/dang-nhap");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || !id) return;
    invoicesApi
      .get(id)
      .then(setInv)
      .catch(() => {});
  }, [user, id]);

  useEffect(() => {
    if (!inv?.maLichHen) {
      setLichHen(null);
      setLichHenLoading(false);
      return;
    }
    setLichHenLoading(true);
    lichHenApi
      .layTheoMa(inv.maLichHen)
      .then(setLichHen)
      .catch(() => setLichHen(null))
      .finally(() => setLichHenLoading(false));
  }, [inv?.maLichHen, inv?.id]);

  const handlePrint = () => window.print();

  const issuerLines: string[] = [];
  if (clinic.address.trim()) issuerLines.push(clinic.address.trim());
  if (clinic.phone.trim())
    issuerLines.push(`Điện thoại: ${clinic.phone.trim()}`);
  if (clinic.taxId.trim()) issuerLines.push(`MST: ${clinic.taxId.trim()}`);

  if (loading) {
    return (
      <div className="invoice-print-page py-4">
        <LoadingState />
      </div>
    );
  }
  if (!user) return null;
  if (!inv) {
    return (
      <div className="invoice-print-page py-4">
        <LoadingState label="Đang tải hóa đơn..." />
      </div>
    );
  }

  const tong = Number(inv.tongTien ?? 0);
  const daTra = Number(inv.soTienDaTra ?? 0);
  const conLai = tong - daTra;
  const ngayLap = inv.taoLuc
    ? new Date(inv.taoLuc).toLocaleDateString("vi-VN", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "—";
  const rows = inv.chiTiet ?? [];
  const pays = inv.giaoDichThanhToan ?? [];

  return (
    <div className="invoice-print-page py-4 px-3 px-md-4">
      <div className="no-print invoice-print-toolbar mb-4">
        <div className="invoice-print-toolbar__inner">
          <div className="invoice-print-toolbar__hint">
            <i className="bi bi-eye me-2 text-primary" aria-hidden />
            Xem trước — khổ A4, kiểm tra lại trước khi in.
          </div>
          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-primary d-inline-flex align-items-center gap-2"
              onClick={handlePrint}
            >
              <i className="bi bi-printer" aria-hidden />
              In hóa đơn
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary d-inline-flex align-items-center gap-2"
              onClick={() => router.back()}
            >
              <i className="bi bi-arrow-left" aria-hidden />
              Quay lại
            </button>
          </div>
        </div>
      </div>

      <div id="invoice-print" className="invoice-print-sheet">
        <header className="invoice-print__masthead">
          <div className="invoice-print__brand">
            <div className="invoice-print__brand-icon" aria-hidden>
              <i className="bi bi-heart-pulse-fill" />
            </div>
            <div>
              <div className="invoice-print__brand-name">{clinic.name}</div>
              <div className="invoice-print__brand-line">
                Hóa đơn thanh toán dịch vụ y tế
              </div>
            </div>
          </div>
          <div className="invoice-print__doc-badge">
            <span className="invoice-print__doc-badge-label">Số chứng từ</span>
            <span className="invoice-print__doc-badge-no">{inv.soHoaDon}</span>
          </div>
        </header>

        {issuerLines.length > 0 ? (
          <div className="invoice-print__issuer">
            {issuerLines.map((line, idx) => (
              <p key={idx} className="invoice-print__issuer-line mb-0">
                {line}
              </p>
            ))}
          </div>
        ) : null}

        <div className="invoice-print__hero">
          <h1 className="invoice-print__title">Hóa đơn thanh toán</h1>
          <div className="invoice-print__status-row">
            <span className="invoice-print__status-caption">Trạng thái HĐ</span>
            <HoaDonStatusTag trangThai={inv.trangThai} />
          </div>
        </div>

        <section className="invoice-print__doc-facts" aria-label="Thông tin chứng từ">
          <div className="invoice-print__doc-facts-grid">
            <div className="invoice-print__fact">
              <span className="invoice-print__fact-label">Mã hóa đơn (hệ thống)</span>
              <span className="invoice-print__fact-value">#{inv.id}</span>
            </div>
            <div className="invoice-print__fact">
              <span className="invoice-print__fact-label">Mã bệnh nhân</span>
              <span className="invoice-print__fact-value">{inv.maBenhNhan}</span>
            </div>
            <div className="invoice-print__fact">
              <span className="invoice-print__fact-label">Mã lịch hẹn</span>
              <span className="invoice-print__fact-value font-monospace">
                {inv.maLichHen ?? "—"}
              </span>
            </div>
            <div className="invoice-print__fact">
              <span className="invoice-print__fact-label">Ngày giờ lập chứng từ</span>
              <span className="invoice-print__fact-value">
                {formatInstantVi(inv.taoLuc)}
              </span>
            </div>
          </div>
        </section>

        <section className="invoice-print__meta-grid invoice-print__meta-grid--person">
          <div className="invoice-print__meta-item invoice-print__meta-item--wide">
            <span className="invoice-print__meta-label">Người mua / Bệnh nhân</span>
            <span className="invoice-print__meta-value">{inv.tenBenhNhan ?? "—"}</span>
            <span className="invoice-print__meta-sub">
              Ngày in phiếu: {ngayLap}
            </span>
          </div>
        </section>

        {inv.maLichHen ? (
          <section className="invoice-print__panel" aria-label="Lịch khám liên quan">
            <h2 className="invoice-print__panel-title">
              <i className="bi bi-calendar-event me-2" aria-hidden />
              Lịch khám liên quan
            </h2>
            {lichHenLoading ? (
              <p className="invoice-print__muted mb-0">Đang tải thông tin lịch…</p>
            ) : lichHen ? (
              <div className="invoice-print__panel-grid">
                <div className="invoice-print__panel-cell">
                  <span className="invoice-print__panel-label">Ngày hẹn</span>
                  <span>{formatNgayHenDayVi(lichHen.ngayHen)}</span>
                </div>
                <div className="invoice-print__panel-cell">
                  <span className="invoice-print__panel-label">Giờ hẹn</span>
                  <span>{formatGioHen(lichHen.gioHen)}</span>
                </div>
                <div className="invoice-print__panel-cell">
                  <span className="invoice-print__panel-label">Bác sĩ</span>
                  <span>{lichHen.tenBacSi ?? `— (ID ${lichHen.maBacSi})`}</span>
                </div>
                <div className="invoice-print__panel-cell">
                  <span className="invoice-print__panel-label">Dịch vụ đặt lịch</span>
                  <span>{lichHen.tenDichVu ?? "—"}</span>
                </div>
                <div className="invoice-print__panel-cell invoice-print__panel-cell--full">
                  <span className="invoice-print__panel-label">Trạng thái lịch</span>
                  <span>
                    {lichHen.trangThai
                      ? LICH_HEN_STATUS_LABEL[lichHen.trangThai] ??
                        lichHen.trangThai
                      : "—"}
                  </span>
                </div>
              </div>
            ) : (
              <p className="invoice-print__muted mb-0">
                Không tải được chi tiết lịch hẹn (mã {inv.maLichHen}).
              </p>
            )}
          </section>
        ) : null}

        <section className="invoice-print__section">
          <h2 className="invoice-print__section-heading">
            <i className="bi bi-list-ul me-2" aria-hidden />
            Chi tiết dịch vụ thanh toán
          </h2>
          <div className="invoice-print__table-shell">
            <table className="invoice-print-table">
              <thead>
                <tr>
                  <th scope="col" className="invoice-print__col-stt text-center">
                    STT
                  </th>
                  <th scope="col">Dịch vụ</th>
                  <th scope="col" className="text-end">
                    Đơn giá
                  </th>
                  <th scope="col" className="text-center invoice-print__col-sl">
                    SL
                  </th>
                  <th scope="col" className="text-end">
                    Thành tiền
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((i, idx) => (
                  <tr key={i.id ?? idx}>
                    <td className="text-center text-muted">{idx + 1}</td>
                    <td>{i.tenDichVu}</td>
                    <td className="text-end invoice-print__num">
                      {i.donGia?.toLocaleString("vi-VN")}đ
                    </td>
                    <td className="text-center">{i.soLuong}</td>
                    <td className="text-end invoice-print__num fw-semibold">
                      {i.thanhTien?.toLocaleString("vi-VN")}đ
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="invoice-print__totals" aria-label="Tổng tiền">
          <div className="invoice-print__total-line">
            <span>Tổng tiền dịch vụ</span>
            <strong className="invoice-print__num">{tong.toLocaleString("vi-VN")}đ</strong>
          </div>
          <div className="invoice-print__total-line">
            <span>Đã thanh toán</span>
            <strong className="invoice-print__num invoice-print__num--paid">
              {daTra.toLocaleString("vi-VN")}đ
            </strong>
          </div>
          <div
            className={`invoice-print__total-line invoice-print__total-line--highlight ${conLai > 0 ? "invoice-print__total-line--due" : ""}`}
          >
            <span>Số tiền còn lại</span>
            <strong className="invoice-print__num">{conLai.toLocaleString("vi-VN")}đ</strong>
          </div>
          <p className="invoice-print__total-note mb-0">
            Số tiền trên là đơn vị VND, đã gồm các khoản ghi trên hệ thống tại thời
            điểm lập chứng từ.
          </p>
        </section>

        {pays.length > 0 ? (
          <section className="invoice-print__payments" aria-label="Thanh toán">
            <h2 className="invoice-print__section-heading">
              <i className="bi bi-wallet2 me-2" aria-hidden />
              Đã thanh toán (chi tiết)
            </h2>
            <div className="invoice-print__table-shell invoice-print__table-shell--compact">
              <table className="invoice-print-table invoice-print-table--payments">
                <thead>
                  <tr>
                    <th scope="col">Thời điểm</th>
                    <th scope="col" className="text-end">
                      Số tiền
                    </th>
                    <th scope="col">Hình thức</th>
                    <th scope="col">Mã tham chiếu</th>
                  </tr>
                </thead>
                <tbody>
                  {pays.map((p) => (
                    <tr key={p.id}>
                      <td className="text-nowrap">{formatInstantVi(p.lucThanhToan)}</td>
                      <td className="text-end invoice-print__num fw-semibold">
                        {p.soTien?.toLocaleString("vi-VN")}đ
                      </td>
                      <td>
                        <PhuongThucThanhToanTag phuongThuc={p.phuongThuc} />
                      </td>
                      <td className="small">{p.maThamChieu?.trim() || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        <div className="invoice-print__signatures">
          <div className="invoice-print__sign-slot">
            <span className="invoice-print__sign-label">Người lập phiếu / Thu ngân</span>
            <div className="invoice-print__sign-line" />
            <span className="invoice-print__sign-hint">Ký, ghi rõ họ tên</span>
          </div>
          <div className="invoice-print__sign-slot">
            <span className="invoice-print__sign-label">Khách hàng / Người nhận</span>
            <div className="invoice-print__sign-line" />
            <span className="invoice-print__sign-hint">Ký, ghi rõ họ tên</span>
          </div>
        </div>

        <footer className="invoice-print__footer">
          <p className="invoice-print__thanks">
            Cảm ơn quý khách đã tin tưởng sử dụng dịch vụ.
          </p>
          <p className="invoice-print__fineprint">
            Chứng từ được lập từ hệ thống quản lý phòng khám; vui lòng giữ bản in để
            đối soát sau thanh toán. Trường hợp sai sót, liên hệ quầy thu ngân trong
            giờ làm việc.
          </p>
        </footer>
      </div>
    </div>
  );
}
