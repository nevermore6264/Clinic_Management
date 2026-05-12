"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Table, Form, Alert, Pagination } from "react-bootstrap";
import { useAuth } from "@/lib/useAuth";
import { auditLogsApi, type NhatKyHeThongEntry } from "@/lib/api";
import { todayLocalYmd } from "@/lib/dateLocal";

export default function NhatKyHeThongsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [list, setList] = useState<NhatKyHeThongEntry[]>([]);
  const [from, setFrom] = useState(todayLocalYmd);
  const [to, setTo] = useState(todayLocalYmd);
  const [error, setError] = useState("");
  const [trang, setTrang] = useState(0);
  const [kichThuoc, setKichThuoc] = useState(20);
  const [tongTrang, setTongTrang] = useState(1);
  const [tongPhanTu, setTongPhanTu] = useState(0);

  useEffect(() => {
    if (!loading && !user) router.replace("/dang-nhap");
    if (user && !user.cacVaiTro.includes("QUAN_TRI")) router.replace("/bang-dieu-khien");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user?.cacVaiTro.includes("QUAN_TRI")) return;
    auditLogsApi
      .list(from, to, trang, kichThuoc)
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
  }, [user, from, to, trang, kichThuoc]);

  if (!user?.cacVaiTro.includes("QUAN_TRI")) return null;

  return (
    <div>
      <h2 className="mb-4">Nhật ký hoạt động</h2>
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      <Card className="mb-3">
        <Card.Body>
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
            <Form.Group>
              <Form.Label>Số dòng / trang</Form.Label>
              <Form.Select
                value={kichThuoc}
                onChange={(e) => {
                  setKichThuoc(Number(e.target.value) || 20);
                  setTrang(0);
                }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </Form.Select>
            </Form.Group>
          </div>
        </Card.Body>
      </Card>
      <Card>
        <Table responsive size="sm" className="mb-0">
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>Người thao tác</th>
              <th>Đối tượng</th>
              <th>Hành động</th>
              <th>Trước / Sau</th>
            </tr>
          </thead>
          <tbody>
            {list.map((l) => (
              <tr key={l.id}>
                <td>
                  {l.taoLuc
                    ? new Date(l.taoLuc).toLocaleString("vi-VN")
                    : "—"}
                </td>
                <td>{l.tenDangNhap ?? "—"}</td>
                <td>
                  {l.loaiThucThe}#{l.maThucThe}
                </td>
                <td>{l.hanhDong}</td>
                <td className="small text-muted">
                  {l.giaTriCu && (
                    <span className="text-danger">{l.giaTriCu}</span>
                  )}
                  {l.giaTriCu && l.giaTriMoi && " → "}
                  {l.giaTriMoi && <span>{l.giaTriMoi}</span>}
                  {!l.giaTriCu && !l.giaTriMoi && "—"}
                </td>
              </tr>
            ))}
            {list.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-muted py-4">
                  {tongPhanTu === 0
                    ? "Không có bản ghi."
                    : "Không có dòng trên trang này."}
                </td>
              </tr>
            ) : null}
          </tbody>
        </Table>
        {tongPhanTu > 0 ? (
          <Card.Footer className="d-flex flex-wrap align-items-center justify-content-between gap-2 py-3">
            <div className="small text-muted">
              Hiển thị {trang * kichThuoc + 1}–
              {Math.min((trang + 1) * kichThuoc, tongPhanTu)} trong {tongPhanTu}{" "}
              bản ghi
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
    </div>
  );
}
