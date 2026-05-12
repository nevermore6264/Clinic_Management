"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Table, Card, Form, Alert, Pagination } from "react-bootstrap";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import { invoicesApi, type HoaDon } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { LoadingState } from "@/components/LoadingState";
import { HoaDonStatusTag } from "@/components/HoaDonStatusTag";
import { daysAgoLocalYmd, todayLocalYmd } from "@/lib/dateLocal";
import { laBacSiKhongXemHoaDon, laChiTaiKhoanBenhNhan } from "@/lib/roles";
import { catTrang, tongSoTrangClient } from "@/lib/phanTrangClient";

function formatTaoLucPatient(t?: string) {
  if (!t) return "";
  const d = new Date(t);
  if (Number.isNaN(d.getTime())) return t;
  return d.toLocaleString("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function InvoicesPageInner() {
  const searchParams = useSearchParams();
  const maBenhNhanParam = searchParams.get("maBenhNhan");
  const { user, loading } = useAuth();
  const router = useRouter();
  const [list, setList] = useState<HoaDon[]>([]);
  const [from, setFrom] = useState(() => daysAgoLocalYmd(30));
  const [to, setTo] = useState(todayLocalYmd);
  const [error, setError] = useState("");
  const [trang, setTrang] = useState(0);
  const KICH_THUOC = 20;
  const [tongTrang, setTongTrang] = useState(1);
  const [tongPhanTu, setTongPhanTu] = useState(0);
  const [trangBn, setTrangBn] = useState(0);
  const KICH_THUOC_BN = 10;

  useEffect(() => {
    if (!loading && !user) router.replace("/dang-nhap");
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading && user && laBacSiKhongXemHoaDon(user)) {
      router.replace("/bang-dieu-khien");
    }
  }, [user, loading, router]);

  const chiTaiKhoanBn = !!user && laChiTaiKhoanBenhNhan(user);

  useEffect(() => {
    if (!user) return;
    if (laBacSiKhongXemHoaDon(user)) return;
    if (chiTaiKhoanBn && !user.maBenhNhan) {
      setError(
        "Tài khoản chưa liên kết hồ sơ bệnh nhân — không thể tải hóa đơn. Liên hệ lễ tân.",
      );
      setList([]);
      return;
    }
    if (chiTaiKhoanBn && user.maBenhNhan) {
      invoicesApi
        .byPatient(user.maBenhNhan)
        .then((rows) =>
          setList(
            Array.isArray(rows)
              ? rows.filter((inv) => {
                  const t = inv.taoLuc;
                  if (!t) return true;
                  const d = new Date(t);
                  if (Number.isNaN(d.getTime())) return true;
                  const ymd = d.toISOString().slice(0, 10);
                  return ymd >= from && ymd <= to;
                })
              : [],
          ),
        )
        .catch((e) => setError(e.message));
      return;
    }
    invoicesApi
      .list(from, to, trang, KICH_THUOC)
      .then((r) => {
        setList(r.content);
        const tp = Math.max(1, r.totalPages ?? 1);
        setTongTrang(tp);
        setTongPhanTu(r.totalElements ?? 0);
        if (trang >= tp) {
          setTrang(0);
        }
      })
      .catch((e) => setError(e.message));
  }, [user, from, to, chiTaiKhoanBn, trang]);

  const rowsHienThi = useMemo(
    () =>
      list.filter(
        (inv) =>
          !maBenhNhanParam ||
          inv.maBenhNhan === Number(maBenhNhanParam),
      ),
    [list, maBenhNhanParam],
  );

  const dongBenhNhanTrang = useMemo(
    () => catTrang(rowsHienThi, trangBn, KICH_THUOC_BN),
    [rowsHienThi, trangBn],
  );
  const tongTrangBn = tongSoTrangClient(rowsHienThi.length, KICH_THUOC_BN);

  useEffect(() => {
    if (!chiTaiKhoanBn) return;
    setTrangBn(0);
  }, [from, to, maBenhNhanParam, chiTaiKhoanBn]);

  if (loading) return <LoadingState />;
  if (!user) return null;
  if (laBacSiKhongXemHoaDon(user)) return <LoadingState />;

  const lichTheoHoSoHref =
    user.maBenhNhan != null
      ? `/lich-hen?maBenhNhan=${encodeURIComponent(String(user.maBenhNhan))}`
      : "/lich-hen";

  return (
    <div className={chiTaiKhoanBn ? "patient-portal-hoadon" : undefined}>
      <PageHeader
        title={chiTaiKhoanBn ? "Hóa đơn của tôi" : "Hóa đơn & thanh toán"}
        subtitle={
          chiTaiKhoanBn
            ? "Theo dõi số tiền và trạng thái thanh toán theo ngày lập hóa đơn."
            : "Lọc theo ngày tạo hóa đơn."
        }
      >
        {chiTaiKhoanBn ? (
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <Link
              href="/benh-nhan"
              className="btn btn-sm btn-light border rounded-pill d-inline-flex align-items-center gap-2"
            >
              <i className="bi bi-person-circle" aria-hidden />
              Hồ sơ của tôi
            </Link>
            <Link
              href={lichTheoHoSoHref}
              className="btn btn-sm btn-light border rounded-pill d-inline-flex align-items-center gap-2"
            >
              <i className="bi bi-calendar3" aria-hidden />
              Lịch khám
            </Link>
          </div>
        ) : (
          <Link
            href="/lich-hen"
            className="btn btn-outline-primary d-inline-flex align-items-center gap-2"
          >
            <i className="bi bi-calendar-check" aria-hidden />
            Chọn lịch hẹn để lập hóa đơn
          </Link>
        )}
      </PageHeader>
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      <Card
        className={`mb-3 card--static border-0 shadow-sm${
          chiTaiKhoanBn ? " patient-portal-hoadon__filters" : ""
        }`}
      >
        <Card.Body>
          {chiTaiKhoanBn ? (
            <>
              <p className="patient-portal-hoadon__lead text-muted mb-0">
                Chọn <strong className="text-body">khoảng ngày lập hóa đơn</strong>{" "}
                để xem lại các lần thanh toán của bạn.
              </p>
              <div className="patient-portal-hoadon__dates mt-3">
                <Form.Group>
                  <Form.Label>Từ ngày</Form.Label>
                  <Form.Control
                    type="date"
                    value={from}
                    onChange={(e) => {
                      setFrom(e.target.value);
                      setTrangBn(0);
                    }}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Đến ngày</Form.Label>
                  <Form.Control
                    type="date"
                    value={to}
                    onChange={(e) => {
                      setTo(e.target.value);
                      setTrangBn(0);
                    }}
                  />
                </Form.Group>
              </div>
            </>
          ) : (
            <div className="d-flex flex-wrap gap-3 align-items-end">
              <Form.Group>
                <Form.Label>Từ ngày</Form.Label>
                <Form.Control
                  type="date"
                  value={from}
                  onChange={(e) => {
                    setFrom(e.target.value);
                    setTrang(0);
                  }}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Đến ngày</Form.Label>
                <Form.Control
                  type="date"
                  value={to}
                  onChange={(e) => {
                    setTo(e.target.value);
                    setTrang(0);
                  }}
                />
              </Form.Group>
            </div>
          )}
        </Card.Body>
      </Card>
      {chiTaiKhoanBn ? (
        <div className="patient-portal-hoadon__list">
          {rowsHienThi.length === 0 ? (
            <Card className="card--static border-0 shadow-sm text-center text-muted">
              <Card.Body className="py-5 px-3">
                {list.length === 0
                  ? "Chưa có hóa đơn trong khoảng ngày này. Thử mở rộng « Từ ngày » hoặc « Đến ngày »."
                  : "Không có hóa đơn khớp bộ lọc."}
              </Card.Body>
            </Card>
          ) : (
            <>
              {dongBenhNhanTrang.map((inv) => (
              <Card
                key={inv.id}
                className="patient-portal-invoice-card card--static border-0 shadow-sm"
              >
                <Card.Body>
                  <div className="patient-portal-invoice-card__top">
                    <div>
                      <div className="patient-portal-invoice-card__id">
                        Hóa đơn{" "}
                        {inv.soHoaDon != null && inv.soHoaDon !== ""
                          ? inv.soHoaDon
                          : `#${inv.id}`}
                      </div>
                      {inv.taoLuc ? (
                        <div className="patient-portal-invoice-card__meta">
                          <i className="bi bi-clock-history me-1" aria-hidden />
                          {formatTaoLucPatient(inv.taoLuc)}
                        </div>
                      ) : null}
                    </div>
                    <HoaDonStatusTag trangThai={inv.trangThai} />
                  </div>
                  <div className="patient-portal-invoice-card__amount">
                    {inv.tongTien != null
                      ? `${inv.tongTien.toLocaleString("vi-VN")}đ`
                      : "—"}
                  </div>
                  <div className="patient-portal-invoice-card__paid">
                    Đã thanh toán:{" "}
                    <span className="fw-semibold text-body">
                      {inv.soTienDaTra != null
                        ? `${inv.soTienDaTra.toLocaleString("vi-VN")}đ`
                        : "—"}
                    </span>
                  </div>
                  <div className="patient-portal-invoice-card__actions mt-3 pt-2 border-top">
                    <Link
                      href={`/hoa-don/${inv.id}`}
                      className="btn btn-sm btn-primary"
                    >
                      <i className="bi bi-receipt-cutoff me-1" aria-hidden />
                      Xem chi tiết và thanh toán
                    </Link>
                  </div>
                </Card.Body>
              </Card>
              ))}
              {tongTrangBn > 1 ? (
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3 px-1">
                  <span className="small text-muted">
                    {rowsHienThi.length} hóa đơn khớp lọc · trang{" "}
                    {trangBn + 1}/{tongTrangBn}
                  </span>
                  <Pagination className="mb-0 flex-wrap">
                    <Pagination.Prev
                      disabled={trangBn <= 0}
                      onClick={() => setTrangBn((p) => Math.max(0, p - 1))}
                    />
                    <Pagination.Item active className="user-select-none">
                      {trangBn + 1} / {tongTrangBn}
                    </Pagination.Item>
                    <Pagination.Next
                      disabled={trangBn >= tongTrangBn - 1}
                      onClick={() =>
                        setTrangBn((p) => Math.min(tongTrangBn - 1, p + 1))
                      }
                    />
                  </Pagination>
                </div>
              ) : null}
            </>
          )}
        </div>
      ) : (
        <Card className="card--static border-0 shadow-sm overflow-hidden">
          <div className="table-responsive">
            <Table responsive hover className="mb-0 align-middle">
              <thead>
                <tr>
                  <th>Mã HĐ</th>
                  <th>Bệnh nhân</th>
                  <th>Tổng tiền</th>
                  <th>Đã thanh toán</th>
                  <th>Trạng thái</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rowsHienThi.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-muted text-center py-4">
                      {tongPhanTu === 0
                        ? "Không có hóa đơn trong khoảng ngày đã chọn. Thử mở rộng Từ ngày / Đến ngày."
                        : maBenhNhanParam
                          ? "Không có hóa đơn khớp bộ lọc (mã bệnh nhân)."
                          : "Không có dòng trên trang này."}
                    </td>
                  </tr>
                ) : (
                  rowsHienThi.map((inv) => (
                    <tr key={inv.id}>
                      <td>{inv.soHoaDon}</td>
                      <td>{inv.tenBenhNhan}</td>
                      <td>{inv.tongTien?.toLocaleString("vi-VN")}đ</td>
                      <td>{inv.soTienDaTra?.toLocaleString("vi-VN")}đ</td>
                      <td>
                        <HoaDonStatusTag trangThai={inv.trangThai} />
                      </td>
                      <td className="text-end">
                        <Link
                          href={`/hoa-don/${inv.id}`}
                          className="btn btn-sm btn-outline-primary"
                        >
                          <i className="bi bi-eye me-1" />
                          Chi tiết
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
          {tongPhanTu > 0 ? (
            <Card.Footer className="d-flex flex-wrap align-items-center justify-content-between gap-2 py-3">
              <div className="small text-muted">
                Hiển thị {trang * KICH_THUOC + 1}–
                {Math.min((trang + 1) * KICH_THUOC, tongPhanTu)} trong{" "}
                {tongPhanTu} hóa đơn khớp lọc · trang {trang + 1}/{tongTrang}
              </div>
              <Pagination className="mb-0 flex-wrap">
                <Pagination.First
                  disabled={trang <= 0}
                  onClick={() => setTrang(0)}
                />
                <Pagination.Prev
                  disabled={trang <= 0}
                  onClick={() => setTrang((p) => Math.max(0, p - 1))}
                />
                <Pagination.Item active className="user-select-none">
                  {trang + 1} / {tongTrang}
                </Pagination.Item>
                <Pagination.Next
                  disabled={trang >= tongTrang - 1}
                  onClick={() =>
                    setTrang((p) => Math.min(tongTrang - 1, p + 1))
                  }
                />
                <Pagination.Last
                  disabled={trang >= tongTrang - 1}
                  onClick={() => setTrang(tongTrang - 1)}
                />
              </Pagination>
            </Card.Footer>
          ) : null}
        </Card>
      )}
    </div>
  );
}

export default function InvoicesPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <InvoicesPageInner />
    </Suspense>
  );
}
