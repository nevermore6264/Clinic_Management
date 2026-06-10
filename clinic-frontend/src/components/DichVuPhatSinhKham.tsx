"use client";

import { useMemo, useState } from "react";
import { Button, Form, Table } from "react-bootstrap";
import type { ChiTietDichVuKham, DichVu } from "@/lib/api";
import { chuoiTimKiemVi } from "@/lib/chuoiTimKiemVi";
import { dichVuChoChiDinhTrongKham } from "@/lib/dichVuDatLich";
import { formatVndInputMoneyUnit } from "@/lib/moneyVnd";

type Props = {
  dichVuList: DichVu[];
  rows: ChiTietDichVuKham[];
  onChange: (rows: ChiTietDichVuKham[]) => void;
  disabled?: boolean;
};

function dichVuKhopTim(d: DichVu, qRaw: string): boolean {
  const q = chuoiTimKiemVi(qRaw);
  if (!q) return true;
  const haystack = chuoiTimKiemVi(
    [d.ten, d.tenLoaiDichVu ?? "", d.tenChuyenKhoa ?? "", d.moTa ?? ""].join(" "),
  );
  return haystack.includes(q);
}

export function DichVuPhatSinhKham({
  dichVuList,
  rows,
  onChange,
  disabled = false,
}: Props) {
  const [loc, setLoc] = useState("");

  const dichVuHoatDong = useMemo(
    () => dichVuList.filter((s) => dichVuChoChiDinhTrongKham(s)),
    [dichVuList],
  );

  const idDaChon = useMemo(() => new Set(rows.map((r) => r.maDichVu)), [rows]);

  const dichVuChuaChon = useMemo(
    () => dichVuHoatDong.filter((s) => !idDaChon.has(s.id)),
    [dichVuHoatDong, idDaChon],
  );

  const dichVuKhopLoc = useMemo(
    () => dichVuChuaChon.filter((s) => dichVuKhopTim(s, loc)),
    [dichVuChuaChon, loc],
  );

  const tongTamTinh = useMemo(() => {
    let t = 0;
    for (const row of rows) {
      const dv = dichVuList.find((s) => s.id === row.maDichVu);
      const gia = Number(row.donGia ?? dv?.gia);
      const sl = Number(row.soLuong) || 1;
      if (Number.isFinite(gia)) t += gia * sl;
    }
    return t;
  }, [rows, dichVuList]);

  const themDichVu = (maDichVu: number) => {
    if (disabled) return;
    const dv = dichVuList.find((s) => s.id === maDichVu);
    if (!dv) return;
    onChange([
      ...rows,
      {
        maDichVu,
        tenDichVu: dv.ten,
        tenLoaiDichVu: dv.tenLoaiDichVu,
        soLuong: 1,
        donGia: dv.gia,
      },
    ]);
  };

  const capNhatSoLuong = (idx: number, soLuong: number) => {
    const sl = Math.max(1, Math.floor(soLuong) || 1);
    onChange(rows.map((row, i) => (i === idx ? { ...row, soLuong: sl } : row)));
  };

  const xoaDong = (idx: number) => {
    onChange(rows.filter((_, i) => i !== idx));
  };

  return (
    <div className="lich-hen-dich-vu-phat-sinh">
      <h6 className="text-muted mb-2">Dịch vụ chuyên sâu / chỉ định bác sĩ</h6>
      <p className="small text-muted mb-3">
        Chỉ các dịch vụ thuộc loại <strong>chuyên sâu</strong> (bệnh nhân không tự đặt
        lịch). Ghi nhận khi khám theo chỉ định; khi lập hóa đơn danh sách này được gợi ý
        tự động.
      </p>
      <div className="row g-3">
        <div className="col-12 col-lg-5">
          <div className="border rounded bg-white h-100">
            <div className="p-2 border-bottom bg-light">
              <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
                <span className="small fw-semibold text-muted text-uppercase">
                  Danh mục
                </span>
                <span className="badge bg-secondary-subtle text-secondary border small">
                  {dichVuKhopLoc.length}/{dichVuChuaChon.length}
                </span>
              </div>
              <Form.Control
                type="search"
                size="sm"
                placeholder="Tìm tên, loại, chuyên khoa…"
                value={loc}
                disabled={disabled}
                onChange={(e) => setLoc(e.target.value)}
                aria-label="Tìm dịch vụ"
              />
            </div>
            <div
              className="lich-hen-dich-vu-catalog-scroll"
              style={{ maxHeight: "16rem", overflowY: "auto" }}
            >
              {dichVuKhopLoc.length === 0 ? (
                <p className="small text-muted text-center p-3 mb-0">
                  {dichVuHoatDong.length === 0
                    ? "Chưa có dịch vụ chuyên sâu trong danh mục (quản trị gắn loại « chuyên sâu »)."
                    : dichVuChuaChon.length === 0
                      ? "Đã thêm tất cả dịch vụ khả dụng."
                      : "Không tìm thấy dịch vụ phù hợp."}
                </p>
              ) : (
                dichVuKhopLoc.map((s) => (
                  <div
                    key={s.id}
                    className="d-flex align-items-start justify-content-between gap-2 px-2 py-2 border-bottom"
                  >
                    <div className="min-w-0">
                      <div className="fw-semibold small text-break">{s.ten}</div>
                      <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                        {[s.tenLoaiDichVu, s.tenChuyenKhoa].filter(Boolean).join(" · ") ||
                          "—"}
                      </div>
                      <div className="small text-primary">
                        {Number(s.gia).toLocaleString("vi-VN")}đ
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline-primary"
                      size="sm"
                      className="flex-shrink-0"
                      disabled={disabled}
                      onClick={() => themDichVu(s.id)}
                    >
                      <i className="bi bi-plus-lg" aria-hidden />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-7">
          {rows.length === 0 ? (
            <p className="small text-muted mb-0">
              Chưa có dịch vụ phát sinh. Bấm <strong>+</strong> ở danh mục bên trái để thêm
              xét nghiệm hoặc thủ thuật.
            </p>
          ) : (
            <>
              <Table responsive size="sm" bordered className="mb-2">
                <thead>
                  <tr className="small text-nowrap">
                    <th className="text-center" style={{ width: "2.5rem" }}>
                      STT
                    </th>
                    <th>Dịch vụ</th>
                    <th>Loại</th>
                    <th className="text-end">Đơn giá</th>
                    <th className="text-center" style={{ width: "4.5rem" }}>
                      SL
                    </th>
                    <th className="text-end">Tạm tính</th>
                    <th className="text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => {
                    const dv = dichVuList.find((s) => s.id === row.maDichVu);
                    const gia = Number(row.donGia ?? dv?.gia);
                    const sl = Number(row.soLuong) || 1;
                    const thanhTien = Number.isFinite(gia) ? gia * sl : null;
                    return (
                      <tr key={`${row.maDichVu}-${idx}`}>
                        <td className="text-center text-muted align-middle">{idx + 1}</td>
                        <td className="align-middle small">
                          {row.tenDichVu ?? dv?.ten ?? "—"}
                        </td>
                        <td className="align-middle small text-muted">
                          {row.tenLoaiDichVu ?? dv?.tenLoaiDichVu ?? "—"}
                        </td>
                        <td className="align-middle small text-end text-nowrap">
                          {Number.isFinite(gia)
                            ? formatVndInputMoneyUnit(gia)
                            : "—"}
                        </td>
                        <td className="align-middle text-center">
                          <Form.Control
                            type="number"
                            min={1}
                            size="sm"
                            className="text-center"
                            style={{ width: "3.5rem", margin: "0 auto" }}
                            value={sl}
                            disabled={disabled}
                            onChange={(e) =>
                              capNhatSoLuong(idx, Number(e.target.value))
                            }
                          />
                        </td>
                        <td className="align-middle small text-end text-nowrap">
                          {thanhTien != null
                            ? formatVndInputMoneyUnit(thanhTien)
                            : "—"}
                        </td>
                        <td className="align-middle text-center">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            disabled={disabled}
                            onClick={() => xoaDong(idx)}
                            title="Xóa dòng"
                            aria-label="Xóa dịch vụ"
                          >
                            <i className="bi bi-trash" aria-hidden />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
              <div className="small text-end fw-semibold text-secondary">
                Tổng tạm tính dịch vụ:{" "}
                <span className="text-primary">
                  {formatVndInputMoneyUnit(tongTamTinh)}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
