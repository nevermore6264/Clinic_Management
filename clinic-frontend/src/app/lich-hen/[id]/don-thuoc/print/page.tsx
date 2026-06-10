"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Alert } from "react-bootstrap";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import {
  appointmentsApi,
  thuocApi,
  visitRecordsApi,
  type ChiTietDonThuoc,
  type HoSoKham,
  type LichHen,
  type Thuoc,
} from "@/lib/api";
import { LoadingState } from "@/components/LoadingState";
import {
  formatGioHen,
  formatNgayDdMmYyyy,
  formatNgayHenDayVi,
} from "@/lib/formatInstantVi";
import { lichHenChoPhepInDonThuoc } from "@/lib/lichHenQuyTrinh";
import { getLandingPublic } from "@/lib/landingPublicContent";

function coNoiDungDonThuoc(hs: HoSoKham | null): boolean {
  if (!hs) return false;
  if (hs.chanDoan?.trim()) return true;
  if (hs.donThuoc?.trim()) return true;
  return (hs.chiTietDonThuoc ?? []).some((r) => r.maThuoc > 0);
}

function dongThuocHopLe(rows: ChiTietDonThuoc[]): ChiTietDonThuoc[] {
  return rows.filter((r) => r.maThuoc > 0);
}

export default function DonThuocPrintPage() {
  const params = useParams();
  const id = Number(params.id);
  const { user, loading } = useAuth();
  const router = useRouter();
  const lp = getLandingPublic();
  const [app, setApp] = useState<LichHen | null>(null);
  const [hoSo, setHoSo] = useState<HoSoKham | null>(null);
  const [thuocList, setThuocList] = useState<Thuoc[]>([]);
  const [loadErr, setLoadErr] = useState("");

  const vaiTro = user?.cacVaiTro ?? [];
  const duocIn = lichHenChoPhepInDonThuoc(app?.trangThai, vaiTro);

  useEffect(() => {
    if (!loading && !user) router.replace("/dang-nhap");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || !id) return;
    if (!user.cacVaiTro.some((r) => r === "BAC_SI" || r === "QUAN_TRI")) {
      router.replace("/bang-dieu-khien");
      return;
    }
    appointmentsApi
      .get(id)
      .then(setApp)
      .catch((e) => setLoadErr(e instanceof Error ? e.message : "Lỗi tải lịch"));
    visitRecordsApi
      .byAppointment(id)
      .then(setHoSo)
      .catch(() => setHoSo(null));
    thuocApi
      .dangHoatDong()
      .then(setThuocList)
      .catch(() => setThuocList([]));
  }, [user, id, router]);

  const dongThuoc = useMemo(
    () => dongThuocHopLe(hoSo?.chiTietDonThuoc ?? []),
    [hoSo?.chiTietDonThuoc],
  );

  const ngayIn = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }, []);

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="don-thuoc-print-page py-4">
        <LoadingState />
      </div>
    );
  }
  if (!user) return null;

  if (loadErr) {
    return (
      <div className="don-thuoc-print-page py-4 px-3">
        <Alert variant="danger">{loadErr}</Alert>
        <button type="button" className="btn btn-secondary" onClick={() => router.back()}>
          Quay lại
        </button>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="don-thuoc-print-page py-4">
        <LoadingState label="Đang tải lịch khám…" />
      </div>
    );
  }

  if (!duocIn) {
    return (
      <div className="don-thuoc-print-page py-4 px-3">
        <Alert variant="warning">
          Chỉ in đơn thuốc khi lịch đang trong giai đoạn khám → kê đơn → chờ thanh toán
          (bác sĩ / quản trị).
        </Alert>
        <Link href={`/lich-hen/${id}`} className="btn btn-secondary">
          Về chi tiết lịch
        </Link>
      </div>
    );
  }

  const coDon = coNoiDungDonThuoc(hoSo);

  return (
    <div className="don-thuoc-print-page py-4 px-3 px-md-4">
      <div className="no-print don-thuoc-print-toolbar mb-4">
        <div className="don-thuoc-print-toolbar__inner">
          <div className="don-thuoc-print-toolbar__hint">
            <i className="bi bi-printer me-2 text-success" aria-hidden />
            Xem trước đơn thuốc — in, đóng dấu và giao cho bệnh nhân. Thuốc{" "}
            <strong>không</strong> tính vào hóa đơn khám tại quầy.
          </div>
          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-success d-inline-flex align-items-center gap-2"
              onClick={handlePrint}
              disabled={!coDon}
            >
              <i className="bi bi-printer" aria-hidden />
              In đơn thuốc
            </button>
            <Link
              href={`/lich-hen/${id}`}
              className="btn btn-secondary d-inline-flex align-items-center gap-2"
            >
              <i className="bi bi-arrow-left" aria-hidden />
              Về hồ sơ khám
            </Link>
          </div>
        </div>
        {!coDon ? (
          <Alert variant="info" className="mb-0 border-0 border-top rounded-0">
            Chưa có nội dung đơn thuốc. Về trang chi tiết lịch, kê đơn và{" "}
            <strong>Lưu hồ sơ khám</strong> trước khi in.
          </Alert>
        ) : null}
      </div>

      <div id="don-thuoc-print" className="don-thuoc-print-sheet">
        <header className="don-thuoc-print__masthead">
          <div className="don-thuoc-print__brand">
            <div className="don-thuoc-print__brand-icon" aria-hidden>
              <i className="bi bi-capsule" />
            </div>
            <div>
              <div className="don-thuoc-print__brand-name">{lp.clinicName}</div>
              <div className="don-thuoc-print__brand-line">
                {lp.clinicTagline} · {lp.addressFull}
              </div>
              <div className="don-thuoc-print__brand-line">
                ĐT: {lp.phoneDisplay}
                {lp.email ? ` · ${lp.email}` : ""}
              </div>
            </div>
          </div>
          <div className="don-thuoc-print__doc-badge">
            <span className="don-thuoc-print__doc-badge-label">Phiếu</span>
            <span className="don-thuoc-print__doc-badge-title">ĐƠN THUỐC</span>
            <span className="don-thuoc-print__doc-badge-meta">
              Lịch #{app.id}
              {hoSo?.id ? ` · HS ${hoSo.id}` : ""}
            </span>
          </div>
        </header>

        <div className="don-thuoc-print__meta row g-2 g-md-3 small">
          <div className="col-md-6">
            <strong>Họ tên bệnh nhân:</strong> {app.tenBenhNhan ?? "—"}
            <br />
            <strong>Mã BN:</strong> {app.maBenhNhan}
          </div>
          <div className="col-md-6 text-md-end">
            <strong>Ngày kê đơn:</strong> {ngayIn}
            <br />
            <strong>Ngày khám:</strong>{" "}
            {formatNgayHenDayVi(app.ngayHen) ?? formatNgayDdMmYyyy(app.ngayHen)}{" "}
            {formatGioHen(app.gioHen)}
          </div>
        </div>

        <div className="don-thuoc-print__chan-doan mt-3">
          <div className="don-thuoc-print__section-label">Chẩn đoán</div>
          <p className="don-thuoc-print__chan-doan-text mb-0">
            {hoSo?.chanDoan?.trim() || "—"}
          </p>
        </div>

        <div className="don-thuoc-print__table-wrap mt-3">
          <div className="don-thuoc-print__section-label">Thuốc điều trị</div>
          {dongThuoc.length === 0 ? (
            <p className="small text-muted mb-0 fst-italic">
              (Không có dòng thuốc trong danh mục — xem phần hướng dẫn bên dưới nếu có)
            </p>
          ) : (
            <table className="table table-sm table-bordered don-thuoc-print-table mb-0">
              <thead>
                <tr>
                  <th className="text-center" style={{ width: "2.5rem" }}>
                    STT
                  </th>
                  <th>Tên thuốc</th>
                  <th>Hàm lượng / dạng</th>
                  <th className="text-center">SL</th>
                  <th>Đơn vị</th>
                  <th>Cách dùng</th>
                </tr>
              </thead>
              <tbody>
                {dongThuoc.map((row, idx) => {
                  const t = thuocList.find((x) => x.id === row.maThuoc);
                  const hamDang = [t?.hamLuong, t?.dangBaoChe]
                    .filter(Boolean)
                    .join(" · ");
                  return (
                    <tr key={`${row.maThuoc}-${idx}`}>
                      <td className="text-center">{idx + 1}</td>
                      <td>
                        <strong>
                          {t?.tenThuoc?.trim() || row.tenThuoc?.trim() || "—"}
                        </strong>
                        {t?.hoatChat?.trim() ? (
                          <div className="small text-muted">{t.hoatChat}</div>
                        ) : null}
                      </td>
                      <td className="small">{hamDang || "—"}</td>
                      <td className="text-center">{row.soLuong ?? 1}</td>
                      <td className="small">{t?.donVi?.trim() || "—"}</td>
                      <td className="small">{row.lieuDung?.trim() || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {hoSo?.donThuoc?.trim() ? (
          <div className="don-thuoc-print__free-text mt-3">
            <div className="don-thuoc-print__section-label">
              Hướng dẫn / thuốc ghi thêm
            </div>
            <p className="mb-0" style={{ whiteSpace: "pre-wrap" }}>
              {hoSo.donThuoc.trim()}
            </p>
          </div>
        ) : null}

        <div className="don-thuoc-print__notice mt-3 small">
          <i className="bi bi-info-circle me-1" aria-hidden />
          Đơn thuốc này dùng để bệnh nhân mua thuốc tại <strong>nhà thuốc phòng khám</strong>{" "}
          hoặc <strong>nhà thuốc bên ngoài</strong>. Tiền thuốc{" "}
          <strong>không</strong> nằm trong hóa đơn thanh toán dịch vụ khám tại quầy.
        </div>

        <div className="don-thuoc-print__signatures row g-4 mt-4">
          <div className="col-6">
            <div className="don-thuoc-print__sig-box">
              <div className="don-thuoc-print__sig-label">Bệnh nhân / người nhận</div>
              <div className="don-thuoc-print__sig-line" />
              <div className="don-thuoc-print__sig-hint small text-muted">
                (Ký, ghi rõ họ tên)
              </div>
            </div>
          </div>
          <div className="col-6">
            <div className="don-thuoc-print__sig-box don-thuoc-print__sig-box--doctor">
              <div className="don-thuoc-print__sig-label">Bác sĩ kê đơn</div>
              <div className="don-thuoc-print__doctor-name fw-semibold">
                {app.tenBacSi ?? "—"}
              </div>
              <div
                className="don-thuoc-print__stamp-area"
                aria-label="Vùng đóng dấu và chữ ký bác sĩ"
              >
                <span className="don-thuoc-print__stamp-text">ĐÓNG DẤU</span>
              </div>
              <div className="don-thuoc-print__sig-hint small text-muted">
                Chữ ký, đóng dấu hành nghề
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
