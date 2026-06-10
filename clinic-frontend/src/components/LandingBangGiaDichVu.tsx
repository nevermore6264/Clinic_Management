"use client";

import { useEffect, useMemo, useState } from "react";
import { Form, Spinner } from "react-bootstrap";
import { api, type DichVu } from "@/lib/api";
import { chuoiTimKiemVi } from "@/lib/chuoiTimKiemVi";
import { formatVndInputMoneyUnit } from "@/lib/moneyVnd";
import { dichVuBenhNhanTuDat } from "@/lib/dichVuDatLich";

type Props = {
  onDatLich: () => void;
  onDangKy: () => void;
};

function khopTim(d: DichVu, qRaw: string): boolean {
  const q = chuoiTimKiemVi(qRaw);
  if (!q) return true;
  const haystack = chuoiTimKiemVi(
    [d.ten, d.tenLoaiDichVu ?? "", d.tenChuyenKhoa ?? "", d.moTa ?? ""].join(" "),
  );
  return haystack.includes(q);
}

export function LandingBangGiaDichVu({ onDatLich, onDangKy }: Props) {
  const [services, setServices] = useState<DichVu[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [locKhoa, setLocKhoa] = useState<number | "all">("all");
  const [locLoai, setLocLoai] = useState<number | "all">("all");

  useEffect(() => {
    let huy = false;
    setLoading(true);
    setLoadErr(null);
    api<DichVu[]>("/dich-vu", { notifyError: false, notifySuccess: false })
      .then((list) => {
        if (huy) return;
        setServices(list.filter((s) => s.hoatDong !== false));
      })
      .catch(() => {
        if (huy) return;
        setLoadErr("Không tải được bảng giá. Vui lòng gọi hotline để được tư vấn.");
        setServices([]);
      })
      .finally(() => {
        if (!huy) setLoading(false);
      });
    return () => {
      huy = true;
    };
  }, []);

  const danhSachKhoa = useMemo(() => {
    const map = new Map<number, string>();
    for (const s of services) {
      if (s.maChuyenKhoa != null && s.tenChuyenKhoa?.trim()) {
        map.set(s.maChuyenKhoa, s.tenChuyenKhoa.trim());
      }
    }
    return Array.from(map.entries()).sort((a, b) =>
      a[1].localeCompare(b[1], "vi"),
    );
  }, [services]);

  const danhSachLoai = useMemo(() => {
    const map = new Map<number, string>();
    for (const s of services) {
      if (s.maLoaiDichVu != null && s.tenLoaiDichVu?.trim()) {
        map.set(s.maLoaiDichVu, s.tenLoaiDichVu.trim());
      }
    }
    return Array.from(map.entries()).sort((a, b) =>
      a[1].localeCompare(b[1], "vi"),
    );
  }, [services]);

  const filtered = useMemo(() => {
    let rows = services;
    if (locKhoa !== "all") {
      rows = rows.filter((s) => s.maChuyenKhoa === locKhoa);
    }
    if (locLoai !== "all") {
      rows = rows.filter((s) => s.maLoaiDichVu === locLoai);
    }
    if (q.trim()) {
      rows = rows.filter((s) => khopTim(s, q));
    }
    return [...rows].sort((a, b) => a.ten.localeCompare(b.ten, "vi"));
  }, [services, locKhoa, locLoai, q]);

  const tongGiaThamKhao = useMemo(() => {
    let t = 0;
    for (const s of filtered) {
      const g = Number(s.gia);
      if (Number.isFinite(g)) t += g;
    }
    return t;
  }, [filtered]);

  return (
    <div className="landing-bang-gia">
      <div className="landing-bang-gia__toolbar">
        <div className="landing-bang-gia__search-wrap">
          <i className="bi bi-search landing-bang-gia__search-icon" aria-hidden />
          <Form.Control
            type="search"
            className="landing-bang-gia__search"
            placeholder="Tìm tên dịch vụ, loại, chuyên khoa…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Tìm dịch vụ trong bảng giá"
          />
        </div>
        <div className="landing-bang-gia__stats small text-muted">
          {loading ? (
            <span>Đang tải danh mục…</span>
          ) : (
            <span>
              <strong className="text-body">{filtered.length}</strong> dịch vụ
              hiển thị
              {filtered.length > 0 ? (
                <>
                  {" "}
                  · tổng tham khảo{" "}
                  <strong className="text-primary">
                    {formatVndInputMoneyUnit(tongGiaThamKhao)}
                  </strong>
                </>
              ) : null}
            </span>
          )}
        </div>
      </div>

      {!loading && danhSachKhoa.length > 0 ? (
        <div className="landing-bang-gia__filters" role="group" aria-label="Lọc chuyên khoa">
          <span className="landing-bang-gia__filter-label">Chuyên khoa</span>
          <button
            type="button"
            className={`landing-bang-gia__chip${
              locKhoa === "all" ? " landing-bang-gia__chip--active" : ""
            }`}
            onClick={() => setLocKhoa("all")}
          >
            Tất cả
          </button>
          {danhSachKhoa.map(([ma, ten]) => (
            <button
              key={ma}
              type="button"
              className={`landing-bang-gia__chip landing-bang-gia__chip--khoa${
                locKhoa === ma ? " landing-bang-gia__chip--active" : ""
              }`}
              onClick={() => setLocKhoa(ma)}
            >
              {ten}
            </button>
          ))}
        </div>
      ) : null}

      {!loading && danhSachLoai.length > 0 ? (
        <div className="landing-bang-gia__filters" role="group" aria-label="Lọc loại dịch vụ">
          <span className="landing-bang-gia__filter-label">Loại dịch vụ</span>
          <button
            type="button"
            className={`landing-bang-gia__chip${
              locLoai === "all" ? " landing-bang-gia__chip--active" : ""
            }`}
            onClick={() => setLocLoai("all")}
          >
            Tất cả
          </button>
          {danhSachLoai.map(([ma, ten]) => (
            <button
              key={ma}
              type="button"
              className={`landing-bang-gia__chip landing-bang-gia__chip--loai${
                locLoai === ma ? " landing-bang-gia__chip--active" : ""
              }`}
              onClick={() => setLocLoai(ma)}
            >
              {ten}
            </button>
          ))}
        </div>
      ) : null}

      <div className="landing-bang-gia__table-wrap">
        {loading ? (
          <div className="landing-bang-gia__loading py-5 text-center text-muted">
            <Spinner animation="border" size="sm" className="me-2" />
            Đang tải bảng giá dịch vụ…
          </div>
        ) : loadErr ? (
          <div className="landing-bang-gia__empty py-4 text-center text-muted">
            {loadErr}
          </div>
        ) : filtered.length === 0 ? (
          <div className="landing-bang-gia__empty py-4 text-center text-muted">
            {services.length === 0
              ? "Chưa có dịch vụ công bố trên hệ thống."
              : "Không có dịch vụ khớp bộ lọc — thử từ khóa hoặc tag khác."}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-sm table-hover landing-bang-gia__table mb-0">
              <thead>
                <tr>
                  <th className="text-center" style={{ width: "3rem" }}>
                    STT
                  </th>
                  <th>Tên dịch vụ</th>
                  <th>Loại</th>
                  <th>Chuyên khoa</th>
                  <th className="text-end text-nowrap">Giá tham khảo</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, idx) => (
                  <tr key={s.id}>
                    <td className="text-center text-muted">{idx + 1}</td>
                    <td>
                      <div className="fw-semibold d-flex flex-wrap align-items-center gap-1">
                        <span>{s.ten}</span>
                        {!dichVuBenhNhanTuDat(s) ? (
                          <span className="landing-bang-gia__tag landing-bang-gia__tag--chuyen-sau">
                            Chỉ định BS
                          </span>
                        ) : null}
                      </div>
                      {s.moTa?.trim() ? (
                        <div className="small text-muted text-truncate" style={{ maxWidth: "22rem" }}>
                          {s.moTa.trim()}
                        </div>
                      ) : null}
                    </td>
                    <td className="small text-nowrap">
                      {s.tenLoaiDichVu ? (
                        <span className="landing-bang-gia__tag landing-bang-gia__tag--loai">
                          {s.tenLoaiDichVu}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="small text-nowrap">
                      {s.tenChuyenKhoa ? (
                        <span className="landing-bang-gia__tag landing-bang-gia__tag--khoa">
                          {s.tenChuyenKhoa}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="text-end fw-bold text-primary text-nowrap">
                      {Number.isFinite(Number(s.gia))
                        ? formatVndInputMoneyUnit(s.gia)
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="landing-bang-gia__note small text-muted mb-3">
        <i className="bi bi-info-circle me-1" aria-hidden />
        Giá trên mang tính <strong>tham khảo</strong>. Dịch vụ gắn nhãn{" "}
        <strong>Chỉ định BS</strong> cần chẩn đoán trước — không tự đặt lịch; chỉ
        chọn dịch vụ <strong>khám tổng quát</strong> khi đặt hẹn. Tra cứu{" "}
        <strong>không cần đăng nhập</strong>.
      </p>

      <div className="landing-bang-gia__actions d-flex flex-wrap gap-2">
        <button
          type="button"
          className="btn btn-hospital-primary"
          onClick={onDatLich}
        >
          <i className="bi bi-calendar2-check me-2" aria-hidden />
          Đặt lịch khám
        </button>
        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={onDangKy}
        >
          <i className="bi bi-person-plus me-2" aria-hidden />
          Đăng ký tài khoản
        </button>
      </div>
    </div>
  );
}
