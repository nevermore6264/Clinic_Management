"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";
import { useAuth } from "@/lib/useAuth";
import { laChiTaiKhoanBenhNhan } from "@/lib/roles";

function NavLinkItem({
  href,
  active,
  icon,
  children,
}: {
  href: string;
  active: boolean;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <Nav.Link
      as={Link}
      href={href}
      active={active}
      className="align-items-center"
    >
      <i className={`bi ${icon}`} aria-hidden />
      <span>{children}</span>
    </Nav.Link>
  );
}

function QuanLyDropdown({
  pathname,
  userRoles,
}: {
  pathname: string;
  userRoles: string[];
}) {
  const isAdmin = userRoles.includes("QUAN_TRI");
  const isLeTan = userRoles.includes("LE_TAN");
  const isThuNgan = userRoles.includes("THU_NGAN");

  const pathsAdmin = [
    "/loai-dich-vu",
    "/dich-vu",
    "/thuoc",
    "/don-thuoc",
    "/chuyen-khoa",
    "/bac-si",
    "/nhat-ky-he-thong",
    "/nguoi-dung",
  ];
  const pathsThuNgan = ["/phieu-chi", "/bao-cao"];
  const pathsNhacLich = ["/cau-hinh-nhac-lich"];

  const activeQuanLy =
    (isAdmin && pathsAdmin.some((p) => pathname.startsWith(p))) ||
    ((isAdmin || isThuNgan) &&
      pathsThuNgan.some((p) => pathname.startsWith(p))) ||
    ((isAdmin || isLeTan) && pathsNhacLich.some((p) => pathname === p));

  if (!isAdmin && !isLeTan && !isThuNgan) return null;

  return (
    <NavDropdown
      title={
        <span className="d-inline-flex align-items-center gap-2">
          <i className="bi bi-grid-1x2-fill" aria-hidden />
          <span>Quản lý</span>
        </span>
      }
      id="nav-quan-ly"
      className={`nav-quan-ly-dropdown${activeQuanLy ? " nav-quan-ly-dropdown--active" : ""}`}
    >
      <NavDropdown.Header className="small fw-bold text-uppercase text-muted py-2">
        Hỗ trợ vận hành
      </NavDropdown.Header>
      {(isAdmin || isLeTan) && (
        <NavDropdown.Item
          as={Link}
          href="/cau-hinh-nhac-lich"
          active={pathname === "/cau-hinh-nhac-lich"}
        >
          <i className="bi bi-bell me-2" aria-hidden />
          Cấu hình nhắc lịch
        </NavDropdown.Item>
      )}
      {(isAdmin || isThuNgan) && (
        <>
          <NavDropdown.Item
            as={Link}
            href="/phieu-chi"
            active={pathname.startsWith("/phieu-chi")}
          >
            <i className="bi bi-cash-coin me-2" aria-hidden />
            Phiếu chi
          </NavDropdown.Item>
          <NavDropdown.Item
            as={Link}
            href="/bao-cao"
            active={pathname === "/bao-cao"}
          >
            <i className="bi bi-graph-up-arrow me-2" aria-hidden />
            Báo cáo
          </NavDropdown.Item>
        </>
      )}
      {isAdmin && (
        <>
          <NavDropdown.Divider />
          <NavDropdown.Header className="small fw-bold text-uppercase text-muted py-2">
            Danh mục &amp; nhân sự
          </NavDropdown.Header>
          <NavDropdown.Item
            as={Link}
            href="/loai-dich-vu"
            active={pathname.startsWith("/loai-dich-vu")}
          >
            <i className="bi bi-tags me-2" aria-hidden />
            Loại dịch vụ
          </NavDropdown.Item>
          <NavDropdown.Item
            as={Link}
            href="/dich-vu"
            active={pathname.startsWith("/dich-vu")}
          >
            <i className="bi bi-hospital me-2" aria-hidden />
            Dịch vụ
          </NavDropdown.Item>
          <NavDropdown.Item
            as={Link}
            href="/thuoc"
            active={pathname.startsWith("/thuoc")}
          >
            <i className="bi bi-capsule me-2" aria-hidden />
            Thuốc
          </NavDropdown.Item>
          <NavDropdown.Item
            as={Link}
            href="/don-thuoc"
            active={pathname.startsWith("/don-thuoc")}
          >
            <i className="bi bi-receipt me-2" aria-hidden />
            Đơn thuốc
          </NavDropdown.Item>
          <NavDropdown.Item
            as={Link}
            href="/chuyen-khoa"
            active={pathname.startsWith("/chuyen-khoa")}
          >
            <i className="bi bi-bookmarks me-2" aria-hidden />
            Chuyên khoa
          </NavDropdown.Item>
          <NavDropdown.Item
            as={Link}
            href="/bac-si"
            active={pathname.startsWith("/bac-si")}
          >
            <i className="bi bi-person-badge me-2" aria-hidden />
            Bác sĩ
          </NavDropdown.Item>
          <NavDropdown.Divider />
          <NavDropdown.Header className="small fw-bold text-uppercase text-muted py-2">
            Hệ thống
          </NavDropdown.Header>
          <NavDropdown.Item
            as={Link}
            href="/nhat-ky-he-thong"
            active={pathname === "/nhat-ky-he-thong"}
          >
            <i className="bi bi-journal-text me-2" aria-hidden />
            Nhật ký hệ thống
          </NavDropdown.Item>
          <NavDropdown.Item
            as={Link}
            href="/nguoi-dung"
            active={pathname === "/nguoi-dung"}
          >
            <i className="bi bi-person-gear me-2" aria-hidden />
            Tài khoản người dùng
          </NavDropdown.Item>
        </>
      )}
    </NavDropdown>
  );
}

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  if (loading) {
    if (pathname === "/dang-nhap") return null;
    return (
      <Navbar variant="light" className="navbar-clinic py-3">
        <Container className="page-shell d-flex justify-content-between align-items-center">
          <Navbar.Brand className="mb-0 d-flex align-items-center gap-2">
            <span className="brand-mark">
              <i className="bi bi-heart-pulse-fill" aria-hidden />
            </span>
            Phòng khám
          </Navbar.Brand>
          <div
            className="loading-state__spinner"
            style={{ width: 28, height: 28 }}
            aria-label="Đang tải"
          />
        </Container>
      </Navbar>
    );
  }

  if (!user) {
    return pathname === "/dang-nhap" ? null : (
      <Navbar variant="light" className="navbar-clinic" expand="md">
        <Container className="page-shell">
          <Navbar.Brand as={Link} href="/" className="mb-0">
            <span className="brand-mark">
              <i className="bi bi-heart-pulse-fill" aria-hidden />
            </span>
            Phòng khám
          </Navbar.Brand>
        </Container>
      </Navbar>
    );
  }

  const handleLogout = () => {
    logout();
    router.push("/dang-nhap");
  };

  const vt = user.cacVaiTro.join(" · ");
  const chiTaiKhoanBn = laChiTaiKhoanBenhNhan(user);
  const bnQuery = user.maBenhNhan
    ? `?maBenhNhan=${encodeURIComponent(String(user.maBenhNhan))}`
    : "";

  return (
    <Navbar variant="light" className="navbar-clinic" expand="lg" sticky="top">
      <Container fluid className="page-shell px-3 px-lg-4">
        <Navbar.Brand
          as={Link}
          href="/bang-dieu-khien"
          className="d-flex align-items-center gap-2 me-lg-4"
        >
          <span className="brand-mark">
            <i className="bi bi-heart-pulse-fill" aria-hidden />
          </span>
          <span className="d-none d-sm-inline">Phòng khám</span>
        </Navbar.Brand>
        <Navbar.Toggle
          aria-controls="nav-main"
          className="border-0 shadow-none"
        />
        <Navbar.Collapse id="nav-main">
          <Nav className="me-auto flex-wrap py-lg-0 py-2 gap-lg-1">
            <NavLinkItem
              href="/bang-dieu-khien"
              active={pathname === "/bang-dieu-khien"}
              icon="bi-house-door"
            >
              Trang chủ
            </NavLinkItem>
            {chiTaiKhoanBn ? (
              <>
                <NavLinkItem
                  href="/benh-nhan"
                  active={pathname.startsWith("/benh-nhan")}
                  icon="bi-person-vcard"
                >
                  Hồ sơ của tôi
                </NavLinkItem>
                <NavLinkItem
                  href={`/lich-hen${bnQuery}`}
                  active={pathname.startsWith("/lich-hen")}
                  icon="bi-calendar3"
                >
                  Lịch của tôi
                </NavLinkItem>
                <NavLinkItem
                  href={`/hoa-don${bnQuery}`}
                  active={pathname.startsWith("/hoa-don")}
                  icon="bi-receipt"
                >
                  Hóa đơn
                </NavLinkItem>
                <NavLinkItem
                  href="/tro-chuyen"
                  active={pathname === "/tro-chuyen"}
                  icon="bi-chat-dots"
                >
                  Chat
                </NavLinkItem>
              </>
            ) : (
              <>
                <NavLinkItem
                  href="/benh-nhan"
                  active={pathname.startsWith("/benh-nhan")}
                  icon="bi-people"
                >
                  Bệnh nhân
                </NavLinkItem>
                <NavLinkItem
                  href="/lich-hen"
                  active={pathname.startsWith("/lich-hen")}
                  icon="bi-calendar-check"
                >
                  Lịch khám
                </NavLinkItem>
                <NavLinkItem
                  href="/lich-lam-viec-bac-si"
                  active={pathname === "/lich-lam-viec-bac-si"}
                  icon="bi-calendar3"
                >
                  Lịch bác sĩ
                </NavLinkItem>
                <NavLinkItem
                  href="/hoa-don"
                  active={pathname.startsWith("/hoa-don")}
                  icon="bi-receipt"
                >
                  Hóa đơn
                </NavLinkItem>
                <NavLinkItem
                  href="/tro-chuyen"
                  active={pathname === "/tro-chuyen"}
                  icon="bi-chat-dots"
                >
                  Chat
                </NavLinkItem>
                <QuanLyDropdown
                  pathname={pathname}
                  userRoles={user.cacVaiTro}
                />
              </>
            )}
          </Nav>
          <Nav className="ms-lg-auto align-items-lg-center gap-2 pt-3 pt-lg-0 mt-2 mt-lg-0">
            <div className="d-none d-lg-flex nav-user-summary">
              <span className="nav-user-summary__name">
                {user.hoTen || user.tenDangNhap}
              </span>
              <span className="nav-user-summary__role">{vt}</span>
            </div>
            <NavDropdown
              title={
                <span className="d-inline-flex align-items-center gap-2 text-dark nav-user-trigger">
                  <i className="bi bi-person-circle fs-5" aria-hidden />
                  <span className="d-lg-none">Tài khoản</span>
                </span>
              }
              align="end"
              className="nav-user-dropdown"
            >
              <NavDropdown.Header className="small text-muted d-xl-none">
                {user.hoTen || user.tenDangNhap}
                <br />
                <span className="fw-normal opacity-75">{vt}</span>
              </NavDropdown.Header>
              <NavDropdown.Item as={Link} href="/doi-mat-khau">
                <i className="bi bi-key me-2" aria-hidden />
                Đổi mật khẩu
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout} className="text-danger">
                <i className="bi bi-box-arrow-right me-2" aria-hidden />
                Đăng xuất
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
