"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Row, Col } from "react-bootstrap";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import { dashboardApi, type DashboardStats } from "@/lib/api";
import { laChiTaiKhoanBenhNhan } from "@/lib/roles";
import { PageHeader } from "@/components/PageHeader";
import { LoadingState } from "@/components/LoadingState";
import { DashboardRevenueCharts } from "@/components/dashboard/DashboardRevenueCharts";

function StatCard({
  label,
  value,
  icon,
  accent,
  iconBg,
  iconFg,
}: {
  label: string;
  value: string | number;
  icon: string;
  accent?: string;
  iconBg?: string;
  iconFg?: string;
}) {
  return (
    <Card
      className="stat-card card--static h-100 stagger-item"
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
}: {
  href: string;
  title: string;
  desc: string;
  icon: string;
}) {
  return (
    <Col md={6} xl={4}>
      <Card as={Link} href={href} className="card--link h-100 stagger-item">
        <Card.Body className="p-4">
          <div className="d-flex align-items-start gap-3">
            <div
              className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: 48,
                height: 48,
                background: "var(--clinic-teal-soft)",
                color: "var(--clinic-teal-dark)",
                fontSize: "1.35rem",
              }}
            >
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
      <div>
        <PageHeader
          title="Trang chủ"
          subtitle={`Xin chào, ${user.hoTen || user.tenDangNhap}. Bạn đang dùng tài khoản bệnh nhân — xem hồ sơ, lịch khám và hóa đơn của bạn.`}
        />
        <h3 className="h5 fw-bold mb-3 mt-2">Truy cập nhanh</h3>
        <Row className="g-3 stagger-children">
          <QuickLinkCard
            href="/benh-nhan"
            title="Hồ sơ của tôi"
            desc="Xem và cập nhật thông tin liên hệ."
            icon="bi-person-vcard"
          />
          <QuickLinkCard
            href={`/lich-hen${bnQuery}`}
            title="Lịch khám"
            desc="Đặt lịch hoặc xem các lượt khám của bạn."
            icon="bi-calendar-heart"
          />
          <QuickLinkCard
            href={`/hoa-don${bnQuery}`}
            title="Hóa đơn"
            desc="Xem chi tiết và trạng thái thanh toán."
            icon="bi-wallet2"
          />
          <QuickLinkCard
            href="/tro-chuyen"
            title="Chat"
            desc="Trao đổi với phòng khám."
            icon="bi-chat-dots"
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

  return (
    <div>
      <PageHeader
        title="Trang chủ"
        subtitle={`Xin chào, ${user.hoTen || user.tenDangNhap}. Đây là tổng quan hoạt động hôm nay.`}
      />

      {stats && (
        <>
          <div className="dashboard-kpi-grid mb-4 stagger-children">
            <StatCard
              label="Tổng bệnh nhân"
              value={stats.tongBenhNhan}
              icon="bi-people-fill"
              accent="var(--clinic-teal)"
              iconBg="rgba(13, 148, 136, 0.15)"
              iconFg="var(--clinic-teal-dark)"
            />
            <StatCard
              label="Lịch hẹn hôm nay"
              value={stats.lichHenHomNay}
              icon="bi-calendar2-check"
              accent="#059669"
              iconBg="rgba(5, 150, 105, 0.12)"
              iconFg="#047857"
            />
            <StatCard
              label="Lịch hẹn tuần này"
              value={stats.lichHenTuanNay}
              icon="bi-calendar-week"
              accent="#7c3aed"
              iconBg="rgba(124, 58, 237, 0.12)"
              iconFg="#5b21b6"
            />
            <StatCard
              label="Doanh thu hôm nay"
              value={`${(stats.doanhThuHomNay || 0).toLocaleString("vi-VN")}đ`}
              icon="bi-currency-exchange"
              accent="var(--clinic-info)"
              iconBg="rgba(2, 132, 199, 0.12)"
              iconFg="#0369a1"
            />
            <StatCard
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
      )}

      <h3 className="h5 fw-bold mb-3 mt-2">Truy cập nhanh</h3>
      <Row className="g-3 stagger-children">
        <QuickLinkCard
          href="/benh-nhan"
          title="Bệnh nhân"
          desc="Hồ sơ, tìm kiếm và cập nhật thông tin bệnh nhân."
          icon="bi-person-vcard"
        />
        <QuickLinkCard
          href="/lich-hen"
          title="Lịch khám"
          desc="Đặt lịch, theo dõi trạng thái và hồ sơ khám."
          icon="bi-calendar-heart"
        />
        <QuickLinkCard
          href="/lich-lam-viec-bac-si"
          title="Lịch bác sĩ"
          desc="Xem lịch làm việc và khung giờ theo bác sĩ."
          icon="bi-calendar3"
        />
        <QuickLinkCard
          href="/hoa-don"
          title="Hóa đơn & thanh toán"
          desc="Lập hóa đơn và ghi nhận thanh toán."
          icon="bi-wallet2"
        />
        <QuickLinkCard
          href="/tro-chuyen"
          title="Chat"
          desc="Trao đổi nội bộ và với bệnh nhân."
          icon="bi-chat-dots"
        />
      </Row>

      {coNhomQuanLy && (
        <>
          <h3 className="h5 fw-bold mb-3 mt-4">Quản lý &amp; cấu hình</h3>
          <Card className="card--static border-0 shadow-sm mb-2">
            <Card.Header className="d-flex align-items-center gap-2 py-3 fw-bold">
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
