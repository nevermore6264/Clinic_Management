export function AppFooter() {
  return (
    <footer className="app-footer mt-auto">
      <div className="page-shell app-footer__inner">
        <div className="app-footer__brand">
          <span className="app-footer__mark">
            <i className="bi bi-heart-pulse-fill" aria-hidden />
          </span>
          <div>
            <div className="app-footer__title">MEDLATEC Clinic</div>
            <div className="app-footer__subtitle">
              Hệ thống quản lý phòng khám thông minh
            </div>
          </div>
        </div>

        <div className="app-footer__meta">
          <span className="app-footer__meta-item">
            <i className="bi bi-shield-check" aria-hidden /> Bảo mật phân quyền
          </span>
          <span className="app-footer__meta-item">
            <i className="bi bi-clock-history" aria-hidden /> Vận hành 24/7
          </span>
          <span className="app-footer__meta-item">
            <i className="bi bi-graph-up-arrow" aria-hidden /> Báo cáo thời gian
            thực
          </span>
        </div>

        <div className="app-footer__bottom">
          © {new Date().getFullYear()} MEDLATEC Clinic. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
