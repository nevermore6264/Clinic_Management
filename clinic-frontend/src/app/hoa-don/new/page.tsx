"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  Form,
  Button,
  Alert,
  Table,
  Spinner,
  Row,
  Col,
  InputGroup,
} from "react-bootstrap";
import styles from "./page.module.css";
import { useAuth } from "@/lib/useAuth";
import {
  invoicesApi,
  lichHenApi,
  servicesApi,
  type DichVu,
  type LichHen,
} from "@/lib/api";
import Link from "next/link";
import { LoadingState } from "@/components/LoadingState";
import {
  lichHenChoPhepLapHoaDon,
  metaTrangThaiLichHen,
} from "@/lib/lichHenStatus";
import { laBacSiKhongXemHoaDon, laChiTaiKhoanBenhNhan } from "@/lib/roles";
import { chuoiTimKiemVi } from "@/lib/chuoiTimKiemVi";

function dinhDangNgayHen(ngayHen?: string) {
  if (!ngayHen) return "—";
  const d = new Date(ngayHen.includes("T") ? ngayHen : `${ngayHen}T12:00:00`);
  if (Number.isNaN(d.getTime())) return ngayHen;
  return d.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function dinhDangGioHen(gioHen?: string) {
  if (!gioHen) return "—";
  return gioHen.length >= 5 ? gioHen.slice(0, 5) : gioHen;
}

function dichVuKhopBoLoc(d: DichVu, qRaw: string): boolean {
  const q = chuoiTimKiemVi(qRaw);
  if (!q) return true;
  const haystack = chuoiTimKiemVi(
    [d.ten, d.tenLoaiDichVu ?? "", d.tenChuyenKhoa ?? "", d.moTa ?? ""].join(
      " ",
    ),
  );
  return haystack.includes(q);
}

function lyDoKhongLapHoaDon(trangThai?: string): string {
  switch (trangThai) {
    case "HUY":
      return "Lịch đã hủy — không lập được hóa đơn.";
    case "VANG":
      return "Đánh dấu không đến — không lập được hóa đơn.";
    case "CHO_THANH_TOAN":
      return "Lịch đã có hóa đơn chờ thanh toán; một lịch chỉ một hóa đơn. Mở chi tiết hóa đơn để ghi nhận thanh toán.";
    case "DA_THANH_TOAN":
      return "Lịch đã hoàn tất thanh toán; một lịch chỉ gắn một hóa đơn. Mở danh sách / chi tiết hóa đơn để xem hoặc in.";
    default:
      return "Trạng thái lịch không cho phép lập hóa đơn mới.";
  }
}

function NewInvoicePageInner() {
  const searchParams = useSearchParams();
  const maLichHenParam = searchParams.get("maLichHen");
  const { user, loading } = useAuth();
  const router = useRouter();
  const [services, setServices] = useState<DichVu[]>([]);
  const [lichHen, setLichHen] = useState<LichHen | null>(null);
  const [lichHenLoading, setLichHenLoading] = useState(false);
  const [lichHenError, setLichHenError] = useState("");
  const [items, setItems] = useState<{ serviceId: number; quantity: number }[]>(
    [],
  );
  const [error, setError] = useState("");
  const [locDichVu, setLocDichVu] = useState("");

  const daGoiYDichVuTuLich = useRef(false);

  const dichVuHoatDong = useMemo(
    () => services.filter((s) => s.hoatDong !== false),
    [services],
  );

  const idDaChon = useMemo(
    () => new Set(items.map((i) => i.serviceId)),
    [items],
  );

  const dichVuChuaLenHd = useMemo(
    () => dichVuHoatDong.filter((s) => !idDaChon.has(s.id)),
    [dichVuHoatDong, idDaChon],
  );

  const dichVuKhopLoc = useMemo(
    () => dichVuChuaLenHd.filter((s) => dichVuKhopBoLoc(s, locDichVu)),
    [dichVuChuaLenHd, locDichVu],
  );

  const tongTamTinh = useMemo(() => {
    let t = 0;
    for (const it of items) {
      const dv = services.find((s) => s.id === it.serviceId);
      if (!dv) continue;
      const gia = Number(dv.gia);
      const sl = Number(it.quantity) || 1;
      if (Number.isFinite(gia)) t += gia * sl;
    }
    return t;
  }, [items, services]);

  useEffect(() => {
    daGoiYDichVuTuLich.current = false;
    setItems([]);
  }, [maLichHenParam]);

  useEffect(() => {
    if (
      daGoiYDichVuTuLich.current ||
      !lichHen?.maDichVu ||
      services.length === 0 ||
      items.length > 0
    )
      return;
    const coTrongDanhSach = services.some((s) => s.id === lichHen.maDichVu);
    if (!coTrongDanhSach) return;
    daGoiYDichVuTuLich.current = true;
    setItems([{ serviceId: lichHen.maDichVu, quantity: 1 }]);
  }, [lichHen, services, items.length]);

  useEffect(() => {
    if (!loading && !user) router.replace("/dang-nhap");
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading && user && laBacSiKhongXemHoaDon(user)) {
      router.replace("/bang-dieu-khien");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading && user && laChiTaiKhoanBenhNhan(user)) {
      router.replace("/hoa-don");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    servicesApi
      .list()
      .then(setServices)
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!user || !maLichHenParam) {
      setLichHen(null);
      setLichHenError("");
      return;
    }
    const id = Number(maLichHenParam);
    if (Number.isNaN(id) || id <= 0) {
      setLichHen(null);
      setLichHenError("Mã lịch hẹn không hợp lệ.");
      return;
    }
    setLichHenLoading(true);
    setLichHenError("");
    lichHenApi
      .layTheoMa(id)
      .then((lh) => {
        setLichHen(lh);
      })
      .catch((e: unknown) => {
        setLichHen(null);
        setLichHenError(
          e instanceof Error ? e.message : "Không tải được thông tin lịch hẹn.",
        );
      })
      .finally(() => setLichHenLoading(false));
  }, [user, maLichHenParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (lichHen && !lichHenChoPhepLapHoaDon(lichHen.trangThai)) {
      setError(lyDoKhongLapHoaDon(lichHen.trangThai));
      return;
    }
    const maLichHen = Number(maLichHenParam);
    if (!maLichHenParam || Number.isNaN(maLichHen) || maLichHen <= 0) {
      setError(
        "Thiếu mã lịch hẹn. Vui lòng tạo hóa đơn từ trang chi tiết lịch hẹn.",
      );
      return;
    }
    if (items.length === 0) {
      setError("Chọn ít nhất một dịch vụ.");
      return;
    }
    try {
      await invoicesApi.create(maLichHen, items);
      router.push("/hoa-don");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Lỗi");
    }
  };

  const tagMetaLichHen = metaTrangThaiLichHen(lichHen?.trangThai);
  const lapBiChan =
    Boolean(lichHen) && !lichHenChoPhepLapHoaDon(lichHen?.trangThai);

  const themDichVu = (serviceId: number) => {
    if (lapBiChan) return;
    setItems((prev) => {
      const idx = prev.findIndex((x) => x.serviceId === serviceId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          quantity: next[idx].quantity + 1,
        };
        return next;
      }
      return [...prev, { serviceId, quantity: 1 }];
    });
  };

  const capNhatSoLuong = (index: number, quantity: number) => {
    const q = Math.max(1, Math.floor(quantity) || 1);
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], quantity: q };
      return next;
    });
  };

  const dieuChinhSoLuong = (index: number, delta: number) => {
    setItems((prev) => {
      const next = [...prev];
      const q = Math.max(1, next[index].quantity + delta);
      next[index] = { ...next[index], quantity: q };
      return next;
    });
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  if (!loading && !user) return null;

  return (
    <div className="hoa-don-new-page lich-hen-detail-page">
      <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-4">
        <h2 className="mb-0">Lập hóa đơn</h2>
        {maLichHenParam ? (
          <Form.Group className="mb-0 hoa-don-new-ma-lich">
            <Form.Label className="small text-muted mb-1">
              Mã lịch hẹn
            </Form.Label>
            <Form.Control
              readOnly
              value={maLichHenParam}
              className="fw-semibold bg-white"
              style={{ maxWidth: "14rem" }}
            />
          </Form.Group>
        ) : null}
      </div>
      {error && <Alert variant="danger">{error}</Alert>}
      {!maLichHenParam && (
        <Alert variant="warning" className="mb-3">
          Chưa có mã lịch hẹn trong đường dẫn. Hãy mở trang&nbsp;
          <a href="/lich-hen">danh sách lịch hẹn</a>, chọn một lượt khám rồi bấm
          &quot;Hóa đơn&quot;, hoặc thêm <code>?maLichHen=...</code> vào URL.
        </Alert>
      )}
      {lichHenLoading && (
        <div className="d-flex align-items-center gap-2 text-muted mb-3">
          <Spinner animation="border" size="sm" />
          Đang tải thông tin lịch hẹn…
        </div>
      )}
      {lichHenError && !lichHenLoading && (
        <Alert variant="danger" className="mb-3">
          {lichHenError}
        </Alert>
      )}
      {lapBiChan && lichHen && (
        <Alert variant="warning" className="mb-3">
          <strong>Không thể lập hóa đơn:</strong>{" "}
          {lyDoKhongLapHoaDon(lichHen.trangThai)}{" "}
          <Link href="/hoa-don" className="alert-link">
            Đi tới danh sách hóa đơn
          </Link>
          .
        </Alert>
      )}
      {lichHen && !lichHenLoading && (
        <Card className="mb-3 border-0 shadow-sm bg-light">
          <Card.Body className="py-3">
            <div className="small text-uppercase text-muted fw-semibold mb-2">
              Lịch hẹn liên kết
            </div>
            <dl className="row mb-0 small">
              <dt className="col-sm-3 text-muted">Bệnh nhân</dt>
              <dd className="col-sm-9 mb-2 fw-medium">
                {lichHen.tenBenhNhan ?? "—"}
              </dd>
              <dt className="col-sm-3 text-muted">Bác sĩ</dt>
              <dd className="col-sm-9 mb-2">{lichHen.tenBacSi ?? "—"}</dd>
              <dt className="col-sm-3 text-muted">Ngày & giờ</dt>
              <dd className="col-sm-9 mb-2">
                {dinhDangNgayHen(lichHen.ngayHen)} ·{" "}
                {dinhDangGioHen(lichHen.gioHen)}
              </dd>
              <dt className="col-sm-3 text-muted">Dịch vụ đặt</dt>
              <dd className="col-sm-9 mb-2">{lichHen.tenDichVu ?? "—"}</dd>
              <dt className="col-sm-3 text-muted">Trạng thái</dt>
              <dd className="col-sm-9 mb-0">
                <span
                  className={`lich-hen-status-tag lich-hen-status-tag--${tagMetaLichHen.slug}`}
                >
                  <i className={`bi ${tagMetaLichHen.icon}`} aria-hidden />
                  {tagMetaLichHen.label}
                </span>
              </dd>
            </dl>
          </Card.Body>
        </Card>
      )}
      <Card className={lapBiChan ? "opacity-75" : undefined}>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <div className="fw-semibold mb-2">Dịch vụ trên hóa đơn</div>
            <p className="small text-muted mb-3">
              Tìm bên trái, bấm <strong>Thêm</strong> để đưa vào hóa đơn; dịch vụ
              đã có trên hóa đơn sẽ không còn trong danh sách trái. Chỉnh số
              lượng hoặc <strong>Xóa</strong> dòng ở bảng bên phải.
            </p>
            <Row className="g-3 mb-3">
              <Col xs={12} lg={5}>
                <div className="border rounded overflow-hidden h-100 bg-white">
                  <div className="p-3 border-bottom bg-light">
                    <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
                      <span className="fw-semibold small text-uppercase text-muted mb-0">
                        Danh mục dịch vụ
                      </span>
                      <span
                        className="badge bg-secondary-subtle text-secondary border small fw-normal"
                        title="Số dòng khớp ô tìm / số dịch vụ còn có thể thêm (chưa trên hóa đơn)"
                      >
                        {dichVuKhopLoc.length}/{dichVuChuaLenHd.length}
                      </span>
                    </div>
                    <div className={styles.catalogSearchWrap}>
                      <i
                        className={`bi bi-search ${styles.catalogSearchIcon}`}
                        aria-hidden
                      />
                      <Form.Control
                        type="search"
                        size="sm"
                        autoComplete="off"
                        spellCheck={false}
                        disabled={lapBiChan}
                        placeholder="Tìm tên, loại, chuyên khoa…"
                        value={locDichVu}
                        onChange={(e) => setLocDichVu(e.target.value)}
                        className={styles.catalogSearchInput}
                        aria-label="Tìm dịch vụ trong danh mục"
                      />
                    </div>
                  </div>
                  <div className={styles.catalogScroll}>
                    {dichVuKhopLoc.length === 0 ? (
                      <div className="p-4 text-center text-muted small">
                        {dichVuHoatDong.length === 0
                          ? "Chưa có dịch vụ trong hệ thống."
                          : dichVuChuaLenHd.length === 0
                            ? "Tất cả dịch vụ đang hoạt động đã có trên hóa đơn. Xóa một dòng bên phải nếu cần chọn lại."
                            : "Không tìm thấy dịch vụ phù hợp — thử từ khóa khác."}
                      </div>
                    ) : (
                      dichVuKhopLoc.map((s) => (
                        <div
                          key={s.id}
                          className={`${styles.catalogRow} ${lapBiChan ? styles.catalogRowDisabled : ""}`}
                        >
                          <div className={styles.catalogRowBody}>
                            <div className={styles.catalogTitleLine}>
                              <span className={styles.catalogTitle}>
                                {s.ten}
                              </span>
                              <span className={styles.catalogRowPrice}>
                                {s.gia?.toLocaleString("vi-VN")}đ
                              </span>
                            </div>
                            <div className={styles.catalogRowMeta}>
                              {[s.tenLoaiDichVu, s.tenChuyenKhoa]
                                .filter(Boolean)
                                .join(" · ") || "—"}
                            </div>
                          </div>
                          <div className={styles.catalogRowActions}>
                            <Button
                              type="button"
                              variant="outline-primary"
                              size="sm"
                              className={styles.catalogAddBtn}
                              disabled={lapBiChan}
                              onClick={() => themDichVu(s.id)}
                              title="Thêm vào hóa đơn"
                            >
                              <i className="bi bi-plus-lg" aria-hidden />
                              <span>Thêm</span>
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </Col>
              <Col xs={12} lg={7}>
                <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap mb-2">
                  <span className="fw-semibold small text-uppercase text-muted mb-0">
                    Đã chọn
                  </span>
                  {items.length > 0 ? (
                    <div
                      className={styles.tamTinhBanner}
                      role="status"
                      aria-live="polite"
                      aria-label={`Tạm tính ${tongTamTinh.toLocaleString("vi-VN")} đồng, ${items.length} dòng`}
                    >
                      <i className="bi bi-calculator" aria-hidden />
                      <span className={styles.tamTinhMeta}>
                        {items.length} dòng · tạm tính
                      </span>
                      <span className={styles.tamTinhSo}>
                        {tongTamTinh.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  ) : null}
                </div>
                {items.length === 0 ? (
                  <div className={styles.emptySelected}>
                    <i className="bi bi-inbox d-block mb-2 fs-4 opacity-50" aria-hidden />
                    Chưa có dịch vụ — tìm và bấm <strong>Thêm</strong> ở cột bên
                    trái.
                  </div>
                ) : (
                  <div className={styles.selectedTableWrap}>
                    <Table
                      responsive
                      size="sm"
                      className={`mb-0 lich-hen-don-thuoc-table hoa-don-new-line-items align-middle ${styles.selectedTable}`}
                    >
                      <thead className="table-light">
                        <tr>
                          <th>Dịch vụ</th>
                          <th>Loại dịch vụ</th>
                          <th className="text-end text-nowrap">Đơn giá</th>
                          <th className="text-end">SL</th>
                          <th className="text-end" aria-label="Thao tác" />
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item, i) => {
                          const dv = services.find((x) => x.id === item.serviceId);
                          return (
                            <tr key={`${item.serviceId}-${i}`}>
                              <td className={styles.selectedCellTen}>
                                <div className="fw-medium text-break">
                                  {dv?.ten ?? `Mã #${item.serviceId}`}
                                </div>
                              </td>
                              <td className={`small ${styles.selectedCellLoai}`}>
                                {dv?.tenLoaiDichVu?.trim() || "—"}
                              </td>
                              <td className="text-end text-nowrap small fw-semibold">
                                {dv?.gia != null
                                  ? `${dv.gia.toLocaleString("vi-VN")}đ`
                                  : "—"}
                              </td>
                              <td className={styles.selectedCellQty}>
                                <InputGroup
                                  size="sm"
                                  className={styles.qtyInputGroup}
                                >
                                  <Button
                                    type="button"
                                    variant="light"
                                    className={styles.qtyStepBtn}
                                    disabled={lapBiChan || item.quantity <= 1}
                                    onClick={() => dieuChinhSoLuong(i, -1)}
                                    aria-label="Giảm số lượng"
                                  >
                                    <i className="bi bi-dash-lg" aria-hidden />
                                  </Button>
                                  <Form.Control
                                    type="number"
                                    min={1}
                                    className={styles.qtyStepValue}
                                    disabled={lapBiChan}
                                    value={item.quantity}
                                    onChange={(e) =>
                                      capNhatSoLuong(
                                        i,
                                        Number(e.target.value) || 1,
                                      )
                                    }
                                  />
                                  <Button
                                    type="button"
                                    variant="light"
                                    className={styles.qtyStepBtn}
                                    disabled={lapBiChan}
                                    onClick={() => dieuChinhSoLuong(i, 1)}
                                    aria-label="Tăng số lượng"
                                  >
                                    <i className="bi bi-plus-lg" aria-hidden />
                                  </Button>
                                </InputGroup>
                              </td>
                              <td className={`text-end ${styles.selectedCellDel}`}>
                                <button
                                  type="button"
                                  className={styles.lineRemoveBtn}
                                  disabled={lapBiChan}
                                  onClick={() => removeItem(i)}
                                  title="Xóa khỏi hóa đơn"
                                >
                                  <i className="bi bi-trash3" aria-hidden />
                                  <span>Xóa</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Col>
            </Row>
            <div className="d-flex flex-wrap gap-2 pt-2 border-top mt-3">
              <Button
                type="submit"
                variant="primary"
                disabled={lapBiChan}
                className="btn-bac-si-modal-primary d-inline-flex align-items-center px-4"
              >
                <i className="bi bi-receipt-cutoff me-2" aria-hidden />
                Tạo hóa đơn
              </Button>
              <Button
                type="button"
                className="btn-modal-dismiss d-inline-flex align-items-center"
                onClick={() => router.back()}
              >
                <i className="bi bi-x-lg me-2" aria-hidden />
                Hủy
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}

export default function NewInvoicePage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <NewInvoicePageInner />
    </Suspense>
  );
}
