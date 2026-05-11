"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Row, Col, Placeholder } from "react-bootstrap";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import { dashboardApi, type DashboardStats } from "@/lib/api";
import { laChiTaiKhoanBenhNhan } from "@/lib/roles";
import { LoadingState } from "@/components/LoadingState";
import { DashboardRevenueCharts } from "@/components/dashboard/DashboardRevenueCharts";
import { DashboardClinicalToday } from "@/components/dashboard/DashboardClinicalToday";
import { hrefLichHenTheoNgay } from "@/lib/dashboardLichHenLinks";

function StatCard({
  label,
  value,
  icon,
  accent,
  iconBg,
  iconFg,
  dash,
}: {
  label: string;
  value: string | number;
  icon: string;
  accent?: string;
  iconBg?: string;
  iconFg?: string;
  dash?: boolean;
}) {
  return (
    <Card
      className={`stat-card card--static h-100 stagger-item${dash ? " stat-card--dash" : ""}`}
      style={
        {
          "--stat-accent": accent,
          "--stat-icon-bg": iconBg,
          "--stat-icon-fg": iconFg,
        } as CSSProperties
      }
    >
      <Card.Body className="p-4">
        <div className="d-flex justify-content-between align-items-start gap-3">
          <div>
            <div className="stat-label mb-2">{label}</div>
            <div className="stat-value">{value}</div>
          </div>
          <div className="stat-icon flex-shrink-0">
            <i className={`bi ${icon}`} aria-hidden />
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}

function QuickLinkCard({
  href,
  title,
  desc,
  icon,
  tone = 0,
}: {
  href: string;
  title: string;
  desc: string;
  icon: string;
  tone?: number;
}) {
  const t = ((tone % 5) + 5) % 5;
  return (
    <Col md={6} xl={4}>
      <Card
        as={Link}
        href={href}
        className={`card--link card--quick-link h-100 stagger-item dashboard-quick-tone-${t}`}
      >
        <Card.Body className="p-4 position-relative">
          <div className="d-flex align-items-start gap-3">
            <div className="dashboard-quick-link-icon flex-shrink-0">
              <i className={`bi ${icon}`} aria-hidden />
            </div>
            <div>
              <Card.Title className="mb-2">{title}</Card.Title>
              <Card.Text>{desc}</Card.Text>
            </div>
          </div>
        </Card.Body>
      </Card>
    </Col>
  );
}

function DashboardHero({
  compact,
  eyebrow,
  title,
  lede,
  actions,
}: {
  compact?: boolean;
  eyebrow: string;
  title: string;
  lede: string;
  actions?: ReactNode;
}) {
  return (
    <div
      className={`dashboard-hero mb-4${compact ? " dashboard-hero--compact" : ""}`}
    >
      <div className="dashboard-hero__glow" aria-hidden />
      <div className="dashboard-hero__grid-deco" aria-hidden />
      <div className="dashboard-hero__inner">
        <div className="dashboard-hero__eyebrow">
          <span className="dashboard-hero__pulse" aria-hidden />
          {eyebrow}
        </div>
        <h1 className="dashboard-hero__title">{title}</h1>
        <p className="dashboard-hero__lede">{lede}</p>
        {actions ? (
          <div className="dashboard-hero__actions">{actions}</div>
        ) : null}
      </div>
    </div>
  );
}

function DashboardKpiSkeleton() {
  return (
    <div className="dashboard-kpi-grid mb-4">
      {[1, 2, 3, 4, 5].map((k) => (
        <Card
          key={k}
          className="card--static border-0 shadow-sm dashboard-stat-skeleton stagger-item position-relative"
        >
          <Card.Body className="p-4">
            <div className="d-flex justify-content-between align-items-start gap-3">
              <div className="flex-grow-1">
                <Placeholder as="div" animation="glow" className="mb-2">
                  <Placeholder xs={7} bg="secondary" />
                </Placeholder>
                <Placeholder as="div" animation="glow">
                  <Placeholder xs={4} size="lg" bg="secondary" />
                </Placeholder>
              </div>
              <Placeholder
                animation="glow"
                className="rounded-3 flex-shrink-0"
                style={{ width: 52, height: 52 }}
                bg="secondary"
              />
            </div>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
}

function DashboardSectionHead({
  title,
  hint,
}: {
  title: string;
  hint: string;
}) {
  return (
    <div className="dashboard-section-head">
      <div className="dashboard-section-head__rail" aria-hidden />
      <div className="dashboard-section-head__text">
        <h2 className="dashboard-section-head__title">{title}</h2>
        <p className="dashboard-section-head__hint">{hint}</p>
      </div>
    </div>
  );
}

function DashboardQuanLyTile({
  href,
  icon,
  label,
}: {
  href: string;
  icon: string;
  label: string;
}) {
  return (
    <Col xs={6} md={4} xl={3}>
      <Link
        href={href}
        className="dashboard-quan-ly-tile d-flex align-items-center gap-2 p-3 rounded-3 border bg-white text-decoration-none h-100 stagger-item"
      >
        <span className="dashboard-quan-ly-tile__icon">
          <i className={`bi ${icon}`} aria-hidden />
        </span>
        <span className="dashboard-quan-ly-tile__label">{label}</span>
      </Link>
    </Col>
  );
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/dang-nhap");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || laChiTaiKhoanBenhNhan(user)) return;
    dashboardApi
      .stats()
      .then(setStats)
      .catch(() => {});
  }, [user]);

  if (loading) return <LoadingState />;
  if (!user) return null;

  const bnQuery = user.maBenhNhan
    ? `?maBenhNhan=${encodeURIComponent(String(user.maBenhNhan))}`
    : "";

  if (laChiTaiKhoanBenhNhan(user)) {
    return (
      <div className="dashboard-page dashboard-page--patient">
        <DashboardHero
          compact
          eyebrow="Cổng bệnh nhân"
          title={`Xin chào, ${user.hoTen || user.tenDangNhap}`}
          lede="Tài khoản bệnh nhân — xem hồ sơ, lịch khám và hóa đơn của bạn tại đây."
        />
        <DashboardSectionHead
          title="Truy cập nhanh"
          hint="Các mục bạn hay dùng nhất"
        />
        <Row className="g-3 stagger-children">
          <QuickLinkCard
            href="/benh-nhan"
            title="Hồ sơ của tôi"
            desc="Xem và cập nhật thông tin liên hệ."
            icon="bi-person-vcard"
            tone={0}
          />
          <QuickLinkCard
            href={`/lich-hen${bnQuery}`}
            title="Lịch khám"
            desc="Đặt lịch hoặc xem các lượt khám của bạn."
            icon="bi-calendar-heart"
            tone={1}
          />
          <QuickLinkCard
            href={`/hoa-don${bnQuery}`}
            title="Hóa đơn"
            desc="Xem chi tiết và trạng thái thanh toán."
            icon="bi-wallet2"
            tone={2}
          />
          <QuickLinkCard
            href="/tro-chuyen"
            title="Chat"
            desc="Trao đổi với phòng khám."
            icon="bi-chat-dots"
            tone={3}
          />
        </Row>
      </div>
    );
  }

  const roles = user.cacVaiTro;
  const isAdmin = roles.includes("QUAN_TRI");
  const isLeTan = roles.includes("LE_TAN");
  const isThuNgan = roles.includes("THU_NGAN");
  const coNhomQuanLy = isAdmin || isLeTan || isThuNgan;

  const todayLong = new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const todayISO = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }, []);

  return (
    <div className="dashboard-page">
      <DashboardHero
        eyebrow="Bảng điều khiển"
        title={`Xin chào, ${user.hoTen || user.tenDangNhap}`}
        lede={`${todayLong} · Theo dõi luồng khám, lịch và tài chính trong ngày.`}
        actions={
          <div className="d-flex flex-wrap gap-2">
            <Link
              href={hrefLichHenTheoNgay(todayISO, todayISO)}
              className="btn btn-sm btn-light border dashboard-hero-chip"
            >
              <i className="bi bi-calendar2-check me-1" aria-hidden />
              Lịch hôm nay
            </Link>
            <Link
              href="/benh-nhan"
              className="btn btn-sm btn-light border dashboard-hero-chip"
            >
              <i className="bi bi-people me-1" aria-hidden />
              Bệnh nhân
            </Link>
            <Link
              href="/hoa-don"
              className="btn btn-sm btn-light border dashboard-hero-chip"
            >
              <i className="bi bi-receipt me-1" aria-hidden />
              Hóa đơn
            </Link>
          </div>
        }
      />

      {stats ? (
        <>
          <DashboardClinicalToday stats={stats} todayISO={todayISO} />

          <div className="dashboard-kpi-grid mb-4 stagger-children">
            <StatCard
              dash
              label="Tổng bệnh nhân"
              value={stats.tongBenhNhan}
              icon="bi-people-fill"
              accent="var(--clinic-teal)"
              iconBg="rgba(13, 148, 136, 0.15)"
              iconFg="var(--clinic-teal-dark)"
            />
            <StatCard
              dash
              label="Tổng lượt lịch trong ngày"
              value={stats.lichHenHomNay}
              icon="bi-calendar2-check"
              accent="#059669"
              iconBg="rgba(5, 150, 105, 0.12)"
              iconFg="#047857"
            />
            <StatCard
              dash
              label="Lịch hẹn tuần này"
              value={stats.lichHenTuanNay}
              icon="bi-calendar-week"
              accent="#7c3aed"
              iconBg="rgba(124, 58, 237, 0.12)"
              iconFg="#5b21b6"
            />
            <StatCard
              dash
              label="Doanh thu hôm nay"
              value={`${(stats.doanhThuHomNay || 0).toLocaleString("vi-VN")}đ`}
              icon="bi-currency-exchange"
              accent="var(--clinic-info)"
              iconBg="rgba(2, 132, 199, 0.12)"
              iconFg="#0369a1"
            />
            <StatCard
              dash
              label="Doanh thu tuần"
              value={`${(stats.doanhThuTuanNay || 0).toLocaleString("vi-VN")}đ`}
              icon="bi-graph-up"
              accent="var(--clinic-accent)"
              iconBg="var(--clinic-accent-soft)"
              iconFg="#c2410c"
            />
          </div>

          <DashboardRevenueCharts
            series={stats.doanhThu7NgayGanNhat ?? []}
            doanhThuTuanNay={Number(stats.doanhThuTuanNay) || 0}
          />
        </>
      ) : (
        <DashboardKpiSkeleton />
      )}

      <DashboardSectionHead
        title="Truy cập nhanh"
        hint="Mở module thường dùng — hover thẻ để xem hiệu ứng."
      />
      <Row className="g-3 stagger-children">
        <QuickLinkCard
          href="/benh-nhan"
          title="Bệnh nhân"
          desc="Hồ sơ, tìm kiếm và cập nhật thông tin bệnh nhân."
          icon="bi-person-vcard"
          tone={0}
        />
        <QuickLinkCard
          href="/lich-hen"
          title="Lịch khám"
          desc="Đặt lịch, theo dõi trạng thái và hồ sơ khám."
          icon="bi-calendar-heart"
          tone={1}
        />
        <QuickLinkCard
          href="/lich-lam-viec-bac-si"
          title="Lịch bác sĩ"
          desc="Xem lịch làm việc và khung giờ theo bác sĩ."
          icon="bi-calendar3"
          tone={2}
        />
        <QuickLinkCard
          href="/hoa-don"
          title="Hóa đơn & thanh toán"
          desc="Lập hóa đơn và ghi nhận thanh toán."
          icon="bi-wallet2"
          tone={3}
        />
        <QuickLinkCard
          href="/tro-chuyen"
          title="Chat"
          desc="Trao đổi nội bộ và với bệnh nhân."
          icon="bi-chat-dots"
          tone={4}
        />
      </Row>

      {coNhomQuanLy && (
        <>
          <DashboardSectionHead
            title="Quản lý & cấu hình"
            hint="Dịch vụ, báo cáo, nhắc lịch và tài khoản — gom một chỗ."
          />
          <Card className="dashboard-ops-card card--static border-0 shadow-sm mb-2">
            <Card.Header className="d-flex align-items-center gap-2 py-3 fw-bold border-0">
              <i className="bi bi-grid-1x2-fill text-primary" aria-hidden />
              Module hỗ trợ vận hành
            </Card.Header>
            <Card.Body className="pt-3 pb-4">
              <p className="small text-muted mb-3">
                Danh mục dịch vụ, báo cáo, nhắc lịch và tài khoản — cùng một
                nhóm để dễ tìm.
              </p>
              <Row className="g-2 g-md-3 stagger-children">
                {(isAdmin || isLeTan) && (
                  <DashboardQuanLyTile
                    href="/cau-hinh-nhac-lich"
                    icon="bi-bell"
                    label="Cấu hình nhắc lịch"
                  />
                )}
                {(isAdmin || isThuNgan) && (
                  <>
                    <DashboardQuanLyTile
                      href="/phieu-chi"
                      icon="bi-cash-coin"
                      label="Phiếu chi"
                    />
                    <DashboardQuanLyTile
                      href="/bao-cao"
                      icon="bi-graph-up-arrow"
                      label="Báo cáo doanh thu"
                    />
                  </>
                )}
                {isAdmin && (
                  <>
                    <DashboardQuanLyTile
                      href="/loai-dich-vu"
                      icon="bi-tags"
                      label="Loại dịch vụ"
                    />
                    <DashboardQuanLyTile
                      href="/dich-vu"
                      icon="bi-hospital"
                      label="Dịch vụ &amp; giá"
                    />
                    <DashboardQuanLyTile
                      href="/thuoc"
                      icon="bi-capsule"
                      label="Thuốc"
                    />
                    <DashboardQuanLyTile
                      href="/chuyen-khoa"
                      icon="bi-bookmarks"
                      label="Chuyên khoa"
                    />
                    <DashboardQuanLyTile
                      href="/bac-si"
                      icon="bi-person-badge"
                      label="Bác sĩ"
                    />
                    <DashboardQuanLyTile
                      href="/nhat-ky-he-thong"
                      icon="bi-journal-text"
                      label="Nhật ký hệ thống"
                    />
                    <DashboardQuanLyTile
                      href="/nguoi-dung"
                      icon="bi-person-gear"
                      label="Tài khoản người dùng"
                    />
                  </>
                )}
              </Row>
            </Card.Body>
          </Card>
        </>
      )}
    </div>
  );
}
