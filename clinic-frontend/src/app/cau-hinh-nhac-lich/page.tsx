"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Alert,
  Button,
  Card,
  Form,
  Spinner,
  Tab,
  Table,
  Tabs,
} from "react-bootstrap";
import { useAuth } from "@/lib/useAuth";
import {
  appointmentsApi,
  cauHinhNhacLichApi,
  type CauHinhNhacLich,
  type LichHen,
} from "@/lib/api";
import { formatGioHen, formatNgayDdMmYyyy } from "@/lib/formatInstantVi";
import { metaTrangThaiLichHen } from "@/lib/lichHenStatus";
import { notify } from "@/lib/notify";

const SO_NGAY_MAC_DINH = 3;

function coEmail(a: LichHen): boolean {
  return Boolean(String(a.thuDienTuBenhNhan ?? "").trim());
}

function coTheGuiNhac(a: LichHen): boolean {
  const tt = a.trangThai ?? "";
  return tt !== "HUY" && tt !== "VANG" && coEmail(a);
}

export default function ReminderConfigPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<"cau-hinh" | "thu-cong">("cau-hinh");
  const [config, setConfig] = useState<CauHinhNhacLich | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const [lichHenList, setLichHenList] = useState<LichHen[]>([]);
  const [dangTaiLich, setDangTaiLich] = useState(false);
  const [loiThuCong, setLoiThuCong] = useState("");
  const [chonIds, setChonIds] = useState<Set<number>>(new Set());
  const [guiDangXuLyId, setGuiDangXuLyId] = useState<number | null>(null);
  const [dangGuiHangLoat, setDangGuiHangLoat] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/dang-nhap");
    if (
      user &&
      !user.cacVaiTro.includes("QUAN_TRI") &&
      !user.cacVaiTro.includes("LE_TAN")
    )
      router.replace("/bang-dieu-khien");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    cauHinhNhacLichApi
      .lay()
      .then(setConfig)
      .catch(() =>
        setConfig({
          soNgayTruoc: 1,
          soGioTruoc: 2,
          batThuDienTu: true,
        }),
      );
  }, [user]);

  const napLichHenThuCong = useCallback(async () => {
    setDangTaiLich(true);
    setLoiThuCong("");
    try {
      const rows = await cauHinhNhacLichApi.danhSachLichHenThuCong(SO_NGAY_MAC_DINH);
      setLichHenList(rows);
      setChonIds(new Set());
    } catch (e) {
      setLichHenList([]);
      setLoiThuCong(e instanceof Error ? e.message : "Không tải được danh sách lịch hẹn");
    } finally {
      setDangTaiLich(false);
    }
  }, []);

  useEffect(() => {
    if (!user || tab !== "thu-cong") return;
    void napLichHenThuCong();
  }, [user, tab, napLichHenThuCong]);

  const lichCoTheChon = useMemo(
    () => lichHenList.filter((a) => a.id != null && coTheGuiNhac(a)),
    [lichHenList],
  );

  const daChonTatCa =
    lichCoTheChon.length > 0 &&
    lichCoTheChon.every((a) => chonIds.has(a.id!));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    setError("");
    setSaved(false);
    try {
      await cauHinhNhacLichApi.capNhat(config);
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi");
    }
  };

  const toggleChon = (id: number) => {
    setChonIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleChonTatCa = () => {
    if (daChonTatCa) {
      setChonIds(new Set());
      return;
    }
    setChonIds(new Set(lichCoTheChon.map((a) => a.id!)));
  };

  const handleGuiMot = async (a: LichHen) => {
    if (a.id == null) return;
    setGuiDangXuLyId(a.id);
    setLoiThuCong("");
    try {
      await appointmentsApi.guiEmailNhacLich(a.id);
      notify({
        kind: "success",
        message: `Đã gửi email nhắc lịch cho ${a.tenBenhNhan ?? "bệnh nhân"}.`,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Gửi email thất bại";
      setLoiThuCong(msg);
      notify({ kind: "error", message: msg });
    } finally {
      setGuiDangXuLyId(null);
    }
  };

  const handleGuiHangLoat = async () => {
    const ids = Array.from(chonIds);
    if (ids.length === 0) {
      notify({
        kind: "warning",
        message: "Chọn ít nhất một lịch hẹn có email để gửi hàng loạt.",
      });
      return;
    }
    setDangGuiHangLoat(true);
    setLoiThuCong("");
    try {
      const ketQua = await cauHinhNhacLichApi.guiEmailHangLoat(ids);
      if (ketQua.thatBai === 0) {
        notify({
          kind: "success",
          message: `Đã gửi email nhắc lịch cho ${ketQua.thanhCong} bệnh nhân.`,
        });
      } else {
        notify({
          kind: "warning",
          message: `Gửi thành công ${ketQua.thanhCong}, thất bại ${ketQua.thatBai}.`,
        });
        const chiTiet = ketQua.loi
          .slice(0, 3)
          .map((l) => `#${l.maLichHen}: ${l.lyDo}`)
          .join("; ");
        setLoiThuCong(
          chiTiet + (ketQua.loi.length > 3 ? ` … và ${ketQua.loi.length - 3} lỗi khác` : ""),
        );
      }
      setChonIds(new Set());
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Gửi hàng loạt thất bại";
      setLoiThuCong(msg);
      notify({ kind: "error", message: msg });
    } finally {
      setDangGuiHangLoat(false);
    }
  };

  if (!user?.cacVaiTro.includes("QUAN_TRI") && !user?.cacVaiTro.includes("LE_TAN"))
    return null;

  const homNay = formatNgayDdMmYyyy(new Date().toISOString().slice(0, 10));

  return (
    <div>
      <h2 className="mb-4">Nhắc lịch khám</h2>

      <Tabs
        activeKey={tab}
        onSelect={(k) => setTab((k as "cau-hinh" | "thu-cong") || "cau-hinh")}
        id="cau-hinh-nhac-lich-tabs"
        className="mb-4"
      >
        <Tab
          eventKey="cau-hinh"
          title={
            <span>
              <i className="bi bi-gear me-2" aria-hidden />
              Cấu hình nhắc lịch khám
            </span>
          }
        >
          {error ? <Alert variant="danger">{error}</Alert> : null}
          {saved ? <Alert variant="success">Đã lưu cấu hình.</Alert> : null}
          <Card>
            <Card.Body>
              <p className="text-muted">
                Hệ thống tự động gửi email nhắc bệnh nhân trước lịch khám. Cấu hình
                thời gian gửi nhắc bên dưới.
              </p>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Nhắc trước (ngày)</Form.Label>
                  <Form.Control
                    type="number"
                    min={0}
                    max={7}
                    placeholder="Ví dụ: 1"
                    value={config?.soNgayTruoc ?? 1}
                    onChange={(e) =>
                      setConfig((c) =>
                        c
                          ? { ...c, soNgayTruoc: Number(e.target.value) || 0 }
                          : null,
                      )
                    }
                  />
                  <Form.Text className="text-muted">
                    Ví dụ: 1 = gửi nhắc trước 1 ngày.
                  </Form.Text>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Nhắc trước (giờ)</Form.Label>
                  <Form.Control
                    type="number"
                    min={0}
                    max={24}
                    placeholder="Ví dụ: 2"
                    value={config?.soGioTruoc ?? 2}
                    onChange={(e) =>
                      setConfig((c) =>
                        c
                          ? { ...c, soGioTruoc: Number(e.target.value) || 0 }
                          : null,
                      )
                    }
                  />
                  <Form.Text className="text-muted">
                    Ví dụ: 2 = gửi nhắc trước 2 giờ.
                  </Form.Text>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    label="Bật gửi email nhắc lịch"
                    checked={config?.batThuDienTu ?? true}
                    onChange={(e) =>
                      setConfig((c) =>
                        c ? { ...c, batThuDienTu: e.target.checked } : null,
                      )
                    }
                  />
                </Form.Group>
                <Button type="submit" variant="primary">
                  Lưu cấu hình
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Tab>

        <Tab
          eventKey="thu-cong"
          title={
            <span>
              <i className="bi bi-envelope me-2" aria-hidden />
              Nhắc lịch thủ công
            </span>
          }
        >
          {loiThuCong ? <Alert variant="danger">{loiThuCong}</Alert> : null}
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <p className="text-muted mb-3">
                Danh sách lịch hẹn trong <strong>{SO_NGAY_MAC_DINH} ngày</strong> tới
                (từ {homNay}). Chọn bệnh nhân có email để gửi thư nhắc thủ công — từng
                người hoặc hàng loạt.
              </p>
              <div className="d-flex flex-wrap gap-2 mb-3">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  disabled={dangTaiLich}
                  onClick={() => void napLichHenThuCong()}
                >
                  <i className="bi bi-arrow-clockwise me-1" aria-hidden />
                  Tải lại
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={dangGuiHangLoat || chonIds.size === 0}
                  onClick={() => void handleGuiHangLoat()}
                >
                  {dangGuiHangLoat ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Đang gửi…
                    </>
                  ) : (
                    <>
                      <i className="bi bi-envelope-check me-1" aria-hidden />
                      Gửi email hàng loạt
                      {chonIds.size > 0 ? ` (${chonIds.size})` : ""}
                    </>
                  )}
                </Button>
              </div>
            </Card.Body>
            <div className="table-responsive">
              <Table hover className="mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "2.5rem" }}>
                      <Form.Check
                        type="checkbox"
                        aria-label="Chọn tất cả"
                        checked={daChonTatCa}
                        disabled={lichCoTheChon.length === 0 || dangGuiHangLoat}
                        onChange={toggleChonTatCa}
                      />
                    </th>
                    <th className="text-center text-nowrap" style={{ width: "3rem" }}>
                      STT
                    </th>
                    <th>Bệnh nhân</th>
                    <th>Email</th>
                    <th>Ngày</th>
                    <th>Giờ</th>
                    <th>Bác sĩ</th>
                    <th>Dịch vụ</th>
                    <th>Trạng thái</th>
                    <th className="text-end">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {dangTaiLich ? (
                    <tr>
                      <td colSpan={10} className="text-center py-5 text-muted">
                        <Spinner animation="border" size="sm" className="me-2" />
                        Đang tải lịch hẹn…
                      </td>
                    </tr>
                  ) : lichHenList.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center text-muted py-4">
                        Không có lịch hẹn trong {SO_NGAY_MAC_DINH} ngày tới.
                      </td>
                    </tr>
                  ) : (
                    lichHenList.map((a, i) => {
                      const meta = metaTrangThaiLichHen(a.trangThai);
                      const guiDuoc = coTheGuiNhac(a);
                      const id = a.id!;
                      return (
                        <tr key={id}>
                          <td>
                            <Form.Check
                              type="checkbox"
                              aria-label={`Chọn lịch ${a.tenBenhNhan}`}
                              checked={chonIds.has(id)}
                              disabled={!guiDuoc || dangGuiHangLoat}
                              onChange={() => toggleChon(id)}
                            />
                          </td>
                          <td className="text-center text-muted">{i + 1}</td>
                          <td className="fw-medium">{a.tenBenhNhan ?? "—"}</td>
                          <td className="small">
                            {coEmail(a) ? (
                              <span className="text-break">{a.thuDienTuBenhNhan}</span>
                            ) : (
                              <span className="text-danger">Chưa có email</span>
                            )}
                          </td>
                          <td className="text-nowrap">
                            {formatNgayDdMmYyyy(a.ngayHen)}
                          </td>
                          <td className="text-nowrap">{formatGioHen(a.gioHen)}</td>
                          <td>{a.tenBacSi ?? "—"}</td>
                          <td>{a.tenDichVu ?? "—"}</td>
                          <td>
                            <span
                              className={`lich-hen-status-tag lich-hen-status-tag--${meta.slug}`}
                            >
                              <i className={`bi ${meta.icon}`} aria-hidden />
                              {meta.label}
                            </span>
                          </td>
                          <td className="text-end text-nowrap">
                            <Link
                              href={`/lich-hen/${id}`}
                              className="btn btn-sm btn-outline-secondary me-1"
                            >
                              Chi tiết
                            </Link>
                            <Button
                              size="sm"
                              variant="outline-primary"
                              disabled={
                                !guiDuoc ||
                                guiDangXuLyId === id ||
                                dangGuiHangLoat
                              }
                              title={
                                !coEmail(a)
                                  ? "Bệnh nhân chưa có email"
                                  : !guiDuoc
                                    ? "Không gửi cho lịch hủy/vắng"
                                    : "Gửi email nhắc lịch"
                              }
                              onClick={() => void handleGuiMot(a)}
                            >
                              {guiDangXuLyId === id ? (
                                <Spinner animation="border" size="sm" />
                              ) : (
                                <>
                                  <i className="bi bi-envelope me-1" aria-hidden />
                                  Gửi email
                                </>
                              )}
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </Table>
            </div>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
}
