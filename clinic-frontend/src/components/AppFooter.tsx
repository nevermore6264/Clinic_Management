export function AppFooter() {
  return (
    <footer className="landing-marketing-footer mt-auto">
      <div className="page-shell">
        <div className="landing-marketing-footer__grid">
          <div>
            <div className="landing-brand mb-2">
              <span className="landing-brand__mark">
                <i className="bi bi-heart-pulse-fill" aria-hidden />
              </span>
              <div>
                <div className="landing-brand__name text-white">MEDLATEC Clinic</div>
                <div className="landing-brand__sub text-white-50">
                  Hệ thống quản lý phòng khám thông minh
                </div>
              </div>
            </div>
            <p className="landing-marketing-footer__desc">
              Giải pháp số hóa quy trình phòng khám: lịch hẹn, hồ sơ khám, thanh
              toán và báo cáo vận hành.
            </p>
          </div>
          <div>
            <h4>Dịch vụ</h4>
            <ul>
              <li>Đặt lịch khám</li>
              <li>Hồ sơ khám điện tử</li>
              <li>Hóa đơn & thanh toán</li>
            </ul>
          </div>
          <div>
            <h4>Liên hệ</h4>
            <ul>
              <li>Hotline: 1900 565656</li>
              <li>Email: info@medlatec.com</li>
              <li>Hà Nội, Việt Nam</li>
            </ul>
          </div>
          <div>
            <h4>Điều hướng</h4>
            <ul>
              <li>Trang chủ</li>
              <li>Chính sách bảo mật</li>
              <li>Điều khoản sử dụng</li>
            </ul>
          </div>
        </div>
        <div className="landing-marketing-footer__bottom">
          © {new Date().getFullYear()} MEDLATEC Clinic. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
