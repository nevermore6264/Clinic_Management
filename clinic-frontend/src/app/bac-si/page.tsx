"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Card, Form, Modal, Table } from "react-bootstrap";
import Link from "next/link";
import {
  bacSiApi,
  chuyenKhoaApi,
  nguoiDungApi,
  type BacSi,
  type ChuyenKhoa,
  type ThongTinNguoiDungDto,
} from "@/lib/api";
import { useAuth } from "@/lib/useAuth";

function formatCk(
  b: Pick<BacSi, "tenChuyenKhoa" | "chuyenMon">,
): string | undefined {
  return b.tenChuyenKhoa ?? b.chuyenMon;
}

export default function QuanLyBacSiPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [list, setList] = useState<BacSi[]>([]);
  const [chuyenKhoa, setChuyenKhoa] = useState<ChuyenKhoa[]>([]);
  const [nguoiDung, setNguoiDung] = useState<ThongTinNguoiDungDto[]>([]);
  const [error, setError] = useState("");

  const [showThem, setShowThem] = useState(false);
  const [maNguoiDung, setMaNguoiDung] = useState("");
  const [maCkThem, setMaCkThem] = useState("");
  const [bangCapThem, setBangCapThem] = useState("");

  const [dangSua, setDangSua] = useState<BacSi | null>(null);
  const [maCkSua, setMaCkSua] = useState("");
  const [bangCapSua, setBangCapSua] = useState("");
  const [hoatDongSua, setHoatDongSua] = useState(true);

  const napDuLieu = useCallback(async () => {
    try {
      const [bs, ck, nd] = await Promise.all([
        bacSiApi.danhSachTatCa(),
        chuyenKhoaApi.danhSach(),
        nguoiDungApi.danhSach(),
      ]);
      setList(bs);
      setChuyenKhoa(ck);
      setNguoiDung(nd);
      setError("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Không tải được dữ liệu");
    }
  }, []);

  useEffect(() => {
    if (!loading && !user) router.replace("/dang-nhap");
    if (user && !user.cacVaiTro.includes("QUAN_TRI")) {
      router.replace("/bang-dieu-khien");
    }
  }, [loading, router, user]);

  useEffect(() => {
    if (!user?.cacVaiTro.includes("QUAN_TRI")) return;
    napDuLieu();
  }, [user, napDuLieu]);

  const maBsDaCo = useMemo(() => {
    const s = new Set<number>();
    list.forEach((b) => {
      if (b.maNguoiDung != null) s.add(b.maNguoiDung);
    });
    return s;
  }, [list]);

  const taiKhoanBsChuaGan = useMemo(() => {
    return nguoiDung.filter(
      (u) =>
        u.hoatDong &&
        u.cacVaiTro.includes("BAC_SI") &&
        !maBsDaCo.has(u.id),
    );
  }, [nguoiDung, maBsDaCo]);

  const moThem = () => {
    setMaNguoiDung("");
    setMaCkThem("");
    setBangCapThem("");
    setShowThem(true);
  };

  const dongThem = () => setShowThem(false);

  const luuThem = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const idNd = Number(maNguoiDung);
    if (!maNguoiDung || Number.isNaN(idNd)) {
      setError("Vui lòng chọn tài khoản bác sĩ.");
      return;
    }
    try {
      await bacSiApi.tao({
        maNguoiDung: idNd,
        maChuyenKhoa: maCkThem ? Number(maCkThem) : undefined,
        bangCap: bangCapThem.trim() || undefined,
      });
      dongThem();
      await napDuLieu();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Không tạo được hồ sơ bác sĩ");
    }
  };

  const moSua = (b: BacSi) => {
    setDangSua(b);
    setMaCkSua(b.maChuyenKhoa != null ? String(b.maChuyenKhoa) : "");
    setBangCapSua(b.bangCap ?? "");
    setHoatDongSua(Boolean(b.hoatDong));
  };

  const dongSua = () => setDangSua(null);

  const luuSua = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dangSua) return;
    setError("");
    try {
      await bacSiApi.capNhat(dangSua.id, {
        maChuyenKhoa: maCkSua ? Number(maCkSua) : null,
        bangCap: bangCapSua,
        hoatDong: hoatDongSua,
      });
      dongSua();
      await napDuLieu();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Không cập nhật được");
    }
  };

  if (!user?.cacVaiTro.includes("QUAN_TRI")) return null;

  return (
    <div className="bac-si-page">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <h2 className="mb-0">Quản lý bác sĩ</h2>
        <div className="d-flex gap-2">
          <Button variant="primary" onClick={moThem}>
            <i className="bi bi-person-plus me-2" aria-hidden />
            Gán hồ sơ bác sĩ
          </Button>
          <Link href="/nguoi-dung" className="btn btn-outline-secondary">
            <i className="bi bi-person-gear me-2" aria-hidden />
            Tài khoản
          </Link>
          <Link href="/lich-lam-viec-bac-si" className="btn btn-outline-secondary">
            <i className="bi bi-calendar3 me-2" aria-hidden />
            Lịch bác sĩ
          </Link>
        </div>
      </div>

      <Card className="mb-3">
        <Card.Body className="text-muted small py-3">
          Mỗi bác sĩ gắn với một{" "}
          <strong>tài khoản</strong> có vai trò &quot;BAC_SI&quot;. Tạo tài khoản
          tại trang Tài khoản trước, sau đó gán hồ sơ chuyên khoa/bằng cấp tại đây.
        </Card.Body>
      </Card>

      {error ? <Alert variant="danger">{error}</Alert> : null}

      <Card>
        <Table responsive hover className="mb-0 align-middle">
          <thead>
            <tr>
              <th>Họ tên</th>
              <th>Tên đăng nhập</th>
              <th>Chuyên khoa</th>
              <th>Bằng cấp</th>
              <th className="text-center">Hoạt động</th>
              <th className="text-end">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {list.map((b) => (
              <tr key={b.id}>
                <td>{b.hoTen ?? "—"}</td>
                <td>
                  <code className="small">{b.tenDangNhap ?? "—"}</code>
                </td>
                <td>{formatCk(b) ?? "—"}</td>
                <td>{b.bangCap ?? "—"}</td>
                <td className="text-center">
                  {b.hoatDong ? (
                    <span className="text-success">
                      <i className="bi bi-check-circle-fill" aria-hidden /> Có
                    </span>
                  ) : (
                    <span className="text-muted">
                      <i className="bi bi-x-circle" aria-hidden /> Không
                    </span>
                  )}
                </td>
                <td className="text-end">
                  <Button
                    size="sm"
                    className="btn-action-edit"
                    onClick={() => moSua(b)}
                  >
                    <i className="bi bi-pencil-square me-1" aria-hidden />
                    Sửa
                  </Button>
                </td>
              </tr>
            ))}
            {list.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-muted py-4">
                  Chưa có hồ sơ bác sĩ nào.
                </td>
              </tr>
            ) : null}
          </tbody>
        </Table>
      </Card>

      <Modal show={showThem} onHide={dongThem} centered>
        <Form onSubmit={luuThem}>
          <Modal.Header closeButton>
            <Modal.Title>Gán hồ sơ bác sĩ</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label className="required">Tài khoản (vai trò bác sĩ)</Form.Label>
              <Form.Select
                value={maNguoiDung}
                onChange={(e) => setMaNguoiDung(e.target.value)}
                required
              >
                <option value="">— Chọn tài khoản —</option>
                {taiKhoanBsChuaGan.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.hoTen || u.tenDangNhap} ({u.tenDangNhap})
                  </option>
                ))}
              </Form.Select>
              {taiKhoanBsChuaGan.length === 0 ? (
                <Form.Text className="text-warning">
                  Không có tài khoản bác sĩ nào chưa gán. Hãy tạo tài khoản với vai
                  trò bác sĩ hoặc chờ hoàn tất phân quyền.
                </Form.Text>
              ) : null}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Chuyên khoa</Form.Label>
              <Form.Select
                value={maCkThem}
                onChange={(e) => setMaCkThem(e.target.value)}
              >
                <option value="">— Không chọn —</option>
                {chuyenKhoa.map((ck) => (
                  <option key={ck.id} value={ck.id}>
                    {ck.tenChuyenKhoa}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-0">
              <Form.Label>Bằng cấp</Form.Label>
              <Form.Control
                value={bangCapThem}
                onChange={(e) => setBangCapThem(e.target.value)}
                placeholder="Ví dụ: Bác sĩ đa khoa"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" type="button" onClick={dongThem}>
              Hủy
            </Button>
            <Button variant="primary" type="submit" disabled={taiKhoanBsChuaGan.length === 0}>
              Lưu
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={Boolean(dangSua)} onHide={dongSua} centered>
        <Form onSubmit={luuSua}>
          <Modal.Header closeButton>
            <Modal.Title>
              Sửa hồ sơ — {dangSua?.hoTen ?? dangSua?.tenDangNhap}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Chuyên khoa</Form.Label>
              <Form.Select
                value={maCkSua}
                onChange={(e) => setMaCkSua(e.target.value)}
              >
                <option value="">— Không chọn —</option>
                {chuyenKhoa.map((ck) => (
                  <option key={ck.id} value={ck.id}>
                    {ck.tenChuyenKhoa}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Bằng cấp</Form.Label>
              <Form.Control
                value={bangCapSua}
                onChange={(e) => setBangCapSua(e.target.value)}
              />
            </Form.Group>
            <Form.Check
              type="switch"
              id="bs-hoat-dong"
              label="Đang hoạt động (hiển thị khi đặt lịch)"
              checked={hoatDongSua}
              onChange={(e) => setHoatDongSua(e.target.checked)}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" type="button" onClick={dongSua}>
              Hủy
            </Button>
            <Button variant="primary" type="submit">
              Lưu
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
