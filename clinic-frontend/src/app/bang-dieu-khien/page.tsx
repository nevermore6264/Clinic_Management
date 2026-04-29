"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Row, Col } from "react-bootstrap";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import { dashboardApi, type DashboardStats } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { LoadingState } from "@/components/LoadingState";

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
      className="stat-card card--static h-100"
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

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/dang-nhap");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    dashboardApi
      .stats()
      .then(setStats)
      .catch(() => {});
  }, [user]);

  if (loading) return <LoadingState />;
  if (!user) return null;

  const maxRevenue = stats?.doanhThu7NgayGanNhat?.length
    ? Math.max(
        ...stats.doanhThu7NgayGanNhat.map((r) => Number(r.tongDoanhThu) || 0),
        1,
      )
    : 1;

  return (
    <div>
      <PageHeader
        title="Trang chủ"
        subtitle={`Xin chào, ${user.hoTen || user.tenDangNhap}. Đây là tổng quan hoạt động hôm nay.`}
      />

      {stats && (
        <>
          <Row className="g-3 mb-4 stagger-children">
            <Col sm={6} xl={3}>
              <StatCard
                label="Tổng bệnh nhân"
                value={stats.tongBenhNhan}
                icon="bi-people-fill"
                accent="var(--clinic-teal)"
                iconBg="rgba(13, 148, 136, 0.15)"
                iconFg="var(--clinic-teal-dark)"
              />
            </Col>
            <Col sm={6} xl={3}>
              <StatCard
                label="Lượt khám hôm nay"
                value={stats.lichHenHomNay}
                icon="bi-calendar2-check"
                accent="#059669"
                iconBg="rgba(5, 150, 105, 0.12)"
                iconFg="#047857"
              />
            </Col>
            <Col sm={6} xl={3}>
              <StatCard
                label="Doanh thu hôm nay"
                value={`${(stats.doanhThuHomNay || 0).toLocaleString("vi-VN")}đ`}
                icon="bi-currency-exchange"
                accent="var(--clinic-info)"
                iconBg="rgba(2, 132, 199, 0.12)"
                iconFg="#0369a1"
              />
            </Col>
            <Col sm={6} xl={3}>
              <StatCard
                label="Doanh thu tuần"
                value={`${(stats.doanhThuTuanNay || 0).toLocaleString("vi-VN")}đ`}
                icon="bi-graph-up"
                accent="var(--clinic-accent)"
                iconBg="var(--clinic-accent-soft)"
                iconFg="#c2410c"
              />
            </Col>
          </Row>

          {stats.doanhThu7NgayGanNhat?.length > 0 && (
            <Card className="mb-4 card--static border-0 shadow-sm">
              <Card.Header className="d-flex align-items-center gap-2">
                <i className="bi bi-bar-chart-line-fill text-primary" />
                Doanh thu 7 ngày gần nhất
              </Card.Header>
              <Card.Body>
                <div
                  className="d-flex align-items-end gap-1 px-1"
                  style={{ height: 140 }}
                >
                  {stats.doanhThu7NgayGanNhat.map((r, i) => (
                    <div
                      key={r.ngay}
                      className="flex-grow-1 chart-bar"
                      style={{
                        height: `${Math.max(12, ((r.tongDoanhThu || 0) / maxRevenue) * 100)}%`,
                        minWidth: 20,
                        animationDelay: `${i * 0.05}s`,
                      }}
                      title={`${r.ngay}: ${(r.tongDoanhThu || 0).toLocaleString("vi-VN")}đ`}
                    />
                  ))}
                </div>
                <div className="d-flex justify-content-between mt-2 small text-muted px-1">
                  {stats.doanhThu7NgayGanNhat.map((r) => (
                    <span key={r.ngay}>{r.ngay?.slice(5)}</span>
                  ))}
                </div>
              </Card.Body>
            </Card>
          )}
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
          href="/hoa-don"
          title="Hóa đơn & thanh toán"
          desc="Lập hóa đơn và ghi nhận thanh toán."
          icon="bi-wallet2"
        />
        {user.cacVaiTro.includes("QUAN_TRI") && (
          <QuickLinkCard
            href="/dich-vu"
            title="Dịch vụ & bảng giá"
            desc="Cấu hình dịch vụ khám và đơn giá."
            icon="bi-hospital"
          />
        )}
        {(user.cacVaiTro.includes("QUAN_TRI") ||
          user.cacVaiTro.includes("THU_NGAN")) && (
          <QuickLinkCard
            href="/bao-cao"
            title="Báo cáo doanh thu"
            desc="Thống kê theo ngày, bác sĩ, dịch vụ và xuất Excel."
            icon="bi-file-earmark-bar-graph"
          />
        )}
      </Row>
    </div>
  );
}
