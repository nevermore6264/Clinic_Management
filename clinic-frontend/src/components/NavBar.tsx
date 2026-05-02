"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Navbar, Nav, Container, Button, NavDropdown } from "react-bootstrap";
import { useAuth } from "@/lib/useAuth";

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
            {(user.cacVaiTro.includes("QUAN_TRI") ||
              user.cacVaiTro.includes("LE_TAN")) && (
              <NavLinkItem
                href="/cau-hinh-nhac-lich"
                active={pathname === "/cau-hinh-nhac-lich"}
                icon="bi-bell"
              >
                Nhắc lịch
              </NavLinkItem>
            )}
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
            {(user.cacVaiTro.includes("QUAN_TRI") ||
              user.cacVaiTro.includes("THU_NGAN")) && (
              <>
                <NavLinkItem
                  href="/phieu-chi"
                  active={pathname.startsWith("/phieu-chi")}
                  icon="bi-cash-coin"
                >
                  Phiếu chi
                </NavLinkItem>
                <NavLinkItem
                  href="/bao-cao"
                  active={pathname === "/bao-cao"}
                  icon="bi-graph-up-arrow"
                >
                  Báo cáo
                </NavLinkItem>
              </>
            )}
            {user.cacVaiTro.includes("QUAN_TRI") && (
              <>
                <NavLinkItem
                  href="/loai-dich-vu"
                  active={pathname.startsWith("/loai-dich-vu")}
                  icon="bi-tags"
                >
                  Loại dịch vụ
                </NavLinkItem>
                <NavLinkItem
                  href="/dich-vu"
                  active={pathname.startsWith("/dich-vu")}
                  icon="bi-hospital"
                >
                  Dịch vụ
                </NavLinkItem>
                <NavLinkItem
                  href="/thuoc"
                  active={pathname.startsWith("/thuoc")}
                  icon="bi-capsule"
                >
                  Thuốc
                </NavLinkItem>
                <NavLinkItem
                  href="/bac-si"
                  active={pathname.startsWith("/bac-si")}
                  icon="bi-person-badge"
                >
                  Bác sĩ
                </NavLinkItem>
                <NavLinkItem
                  href="/nhat-ky-he-thong"
                  active={pathname === "/nhat-ky-he-thong"}
                  icon="bi-journal-text"
                >
                  Nhật ký
                </NavLinkItem>
                <NavLinkItem
                  href="/nguoi-dung"
                  active={pathname === "/nguoi-dung"}
                  icon="bi-person-gear"
                >
                  Tài khoản
                </NavLinkItem>
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
