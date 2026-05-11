"use client";

import Link from "next/link";
import { Card, Row, Col } from "react-bootstrap";
import type { ThongKeBangDieuKhien } from "@/lib/api";
import { type GiaiDoanLichHen, hrefLichHenTheoNgay } from "@/lib/dashboardLichHenLinks";

type Props = {
  stats: ThongKeBangDieuKhien;
  todayISO: string;
};

const FLOW: {
  giaiDoan: GiaiDoanLichHen;
  label: string;
  hint: string;
  icon: string;
  muted?: boolean;
}[] = [
  {
    giaiDoan: "CHO_TIEP_NHAN",
    label: "Chờ tiếp nhận",
    hint: "Đã đặt lịch",
    icon: "bi-door-open",
  },
  {
    giaiDoan: "TRONG_KHAM",
    label: "Trong khám / CLS",
    hint: "Tiếp nhận → xét nghiệm",
    icon: "bi-heart-pulse",
  },
  {
    giaiDoan: "SAU_KHAM",
    label: "Sau khám",
    hint: "Kê đơn, chờ thanh toán",
    icon: "bi-clipboard2-pulse",
  },
  {
    giaiDoan: "HOAN_TAT",
    label: "Đã hoàn tất",
    hint: "Đã thanh toán",
    icon: "bi-check2-circle",
  },
  {
    giaiDoan: "HUY_VANG",
    label: "Hủy / vắng",
    hint: "Không thực hiện",
    icon: "bi-slash-circle",
    muted: true,
  },
];

function pick(
  s: ThongKeBangDieuKhien,
  key: keyof ThongKeBangDieuKhien,
): number {
  const v = s[key];
  return typeof v === "number" && !Number.isNaN(v) ? v : 0;
}

export function DashboardClinicalToday({ stats, todayISO }: Props) {
  const hrefDay = hrefLichHenTheoNgay(todayISO, todayISO);
  const tong = pick(stats, "lichHenHomNay");
  const soBs = pick(stats, "soBacSiCoLichHomNay");

  return (
    <Card className="dashboard-clinical card--static border-0 shadow-sm mb-4">
      <Card.Header className="dashboard-clinical__header d-flex flex-wrap align-items-center justify-content-between gap-2 py-3 border-0">
        <div>
          <div
            className="d-flex align-items-center gap-2 fw-bold"
            style={{ color: "var(--clinic-navy)" }}
          >
            <span className="dashboard-clinical__header-icon d-inline-flex align-items-center justify-content-center rounded-3">
              <i className="bi bi-activity" aria-hidden />
            </span>
            Luồng lịch khám hôm nay
          </div>
          <div className="small text-muted mt-1">
            Giống sơ đồ tiếp nhận — bấm từng bước để mở danh sách lịch đã lọc
            theo giai đoạn.
          </div>
        </div>
        <div className="text-end small">
          <div className="text-muted">Tổng lượt trong ngày</div>
          <div className="fs-5 fw-black text-primary">{tong}</div>
          <div className="text-muted">
            Bác sĩ có lịch: <strong className="text-body">{soBs}</strong>
          </div>
          <Link
            href={hrefDay}
            className="btn btn-sm btn-outline-primary mt-2"
          >
            Mở tất cả lịch hôm nay
            <i className="bi bi-arrow-right-short ms-1" aria-hidden />
          </Link>
        </div>
      </Card.Header>
      <Card.Body className="pt-0 pb-4">
        <Row className="row-cols-2 row-cols-md-3 row-cols-xl-5 g-2 g-lg-3 stagger-children">
          {FLOW.map((step) => {
            const keyMap: Record<GiaiDoanLichHen, keyof ThongKeBangDieuKhien> =
              {
                CHO_TIEP_NHAN: "lichHenChoTiepNhanHomNay",
                TRONG_KHAM: "lichHenTrongKhamHomNay",
                SAU_KHAM: "lichHenSauKhamHomNay",
                HOAN_TAT: "lichHenDaHoanTatHomNay",
                HUY_VANG: "lichHenHuyVangHomNay",
              };
            const n = pick(stats, keyMap[step.giaiDoan]);
            const href = hrefLichHenTheoNgay(
              todayISO,
              todayISO,
              step.giaiDoan,
            );
            return (
              <Col key={step.giaiDoan}>
                <Link
                  href={href}
                  className={`dashboard-clinical-step text-decoration-none d-block h-100 rounded-3 border p-3 stagger-item ${
                    step.muted ? "dashboard-clinical-step--muted" : ""
                  }`}
                >
                  <div className="d-flex align-items-start justify-content-between gap-2 mb-2">
                    <span className="dashboard-clinical-step__icon rounded-2 d-inline-flex align-items-center justify-content-center">
                      <i className={`bi ${step.icon}`} aria-hidden />
                    </span>
                    <span className="dashboard-clinical-step__count">{n}</span>
                  </div>
                  <div className="fw-bold small text-body">{step.label}</div>
                  <div className="text-muted small mt-1">{step.hint}</div>
                  <div className="small text-primary mt-2 fw-semibold">
                    Danh sách
                    <i className="bi bi-chevron-right ms-1" aria-hidden />
                  </div>
                </Link>
              </Col>
            );
          })}
        </Row>
      </Card.Body>
    </Card>
  );
}
