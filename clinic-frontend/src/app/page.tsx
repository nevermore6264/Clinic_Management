"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { LoadingState } from "@/components/LoadingState";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      
      return;
    }
    router.replace("/bang-dieu-khien");
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="py-5">
        <LoadingState label="Đang tải trang…" />
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="landing-bg">
      <section className="landing-hero">
        <div className="page-shell">
          <div className="landing-topbar">
            <div className="landing-brand">
              <span className="landing-brand__mark">
                <i className="bi bi-heart-pulse-fill" aria-hidden />
              </span>
              <div>
                <div className="landing-brand__name">MEDLATEC Clinic</div>
                <div className="landing-brand__sub">Hệ thống quản lý phòng khám thông minh</div>
              </div>
            </div>
            <div className="landing-topbar__actions">
              <button
                className="btn btn-outline-primary landing-topbar__button"
                type="button"
                onClick={() => router.push("/dang-nhap")}
              >
                Đăng nhập
              </button>
            </div>
          </div>

          <div className="landing-hero__grid">
            <div className="landing-hero__content landing-reveal landing-reveal--1">
              <div className="landing-hero__content-inner">
              <div className="landing-badge">
                <i className="bi bi-stars" aria-hidden />
                <span>Nền tảng quản lý trọn quy trình khám chữa bệnh</span>
              </div>
              <h1 className="landing-title">
                Vận hành phòng khám
                <br />hiện đại và nhất quán
              </h1>
              <p className="landing-lead">
                Từ đặt lịch, tiếp nhận, khám bệnh, kê đơn đến hóa đơn, thanh toán và báo cáo, mọi thao tác đều được chuẩn
                hóa trong một giao diện thống nhất, trực quan và dễ sử dụng.
              </p>

              <div className="landing-cta">
                <button
                  className="btn btn-primary landing-cta__primary"
                  onClick={() => router.push("/dang-nhap")}
                  type="button"
                >
                  <i className="bi bi-calendar2-check me-2" aria-hidden />
                  Bắt đầu đặt lịch
                </button>
                <button
                  className="btn btn-outline-primary landing-cta__secondary"
                  onClick={() => router.push("/dang-nhap")}
                  type="button"
                >
                  <i className="bi bi-box-arrow-in-right me-2" aria-hidden />
                  Truy cập hệ thống
                </button>
              </div>

              <div className="landing-kpis">
                <div className="landing-kpi landing-reveal landing-reveal--2">
                  <div className="landing-kpi__value">24/7</div>
                  <div className="landing-kpi__label">Tiếp nhận lịch hẹn trực tuyến</div>
                </div>
                <div className="landing-kpi landing-reveal landing-reveal--3">
                  <div className="landing-kpi__value">4 bước</div>
                  <div className="landing-kpi__label">Khép kín từ đặt lịch đến thanh toán</div>
                </div>
                <div className="landing-kpi landing-reveal landing-reveal--4">
                  <div className="landing-kpi__value">1 nền tảng</div>
                  <div className="landing-kpi__label">Lễ tân, bác sĩ, thu ngân cùng vận hành</div>
                </div>
              </div>
              </div>
            </div>

            <div className="landing-visual landing-reveal landing-reveal--3">
              <div className="landing-preview">
                <div className="landing-preview__head">
                  <div>
                    <div className="landing-preview__eyebrow">Live Operations</div>
                    <div className="landing-preview__title">Bảng điều hành phòng khám</div>
                  </div>
                  <span className="landing-preview__status">Online</span>
                </div>

                <div className="landing-preview__metrics">
                  <article className="metric-card metric-card--primary">
                    <span>Lịch hôm nay</span>
                    <strong>128</strong>
                    <small>+18% so với hôm qua</small>
                  </article>
                  <article className="metric-card">
                    <span>Doanh thu trong ngày</span>
                    <strong>48,5 triệu</strong>
                    <small>42 giao dịch đã ghi nhận</small>
                  </article>
                </div>

                <div className="landing-preview__table-wrap">
                  <table className="landing-preview__table">
                    <thead>
                      <tr>
                        <th>Giờ</th>
                        <th>Bệnh nhân</th>
                        <th>Dịch vụ</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>09:15</td>
                        <td>Nguyễn Minh H.</td>
                        <td>Khám tổng quát</td>
                        <td><span className="status-pill status-pill--blue">Đang khám</span></td>
                      </tr>
                      <tr>
                        <td>10:00</td>
                        <td>Trần Ngọc A.</td>
                        <td>Xét nghiệm</td>
                        <td><span className="status-pill status-pill--green">Đã tiếp nhận</span></td>
                      </tr>
                      <tr>
                        <td>10:30</td>
                        <td>Lê Quốc B.</td>
                        <td>Tái khám</td>
                        <td><span className="status-pill status-pill--slate">Chờ khám</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="landing-preview__chips">
                  <span><i className="bi bi-shield-check" aria-hidden /> Bảo mật phân quyền</span>
                  <span><i className="bi bi-bell" aria-hidden /> Nhắc lịch tự động</span>
                  <span><i className="bi bi-graph-up-arrow" aria-hidden /> Báo cáo thời gian thực</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section landing-section--muted">
        <div className="page-shell">
          <div className="landing-section__head landing-section__head--center">
            <h2 className="landing-section__title">Điểm nổi bật của hệ thống</h2>
            <p className="landing-section__desc">
              Thiết kế theo đúng bài toán nghiệp vụ thực tế của phòng khám: rõ luồng, rõ vai trò, rõ dữ liệu.
            </p>
          </div>

          <div className="landing-feature-grid">
            <article className="landing-feature-card landing-reveal landing-reveal--1">
              <div className="landing-feature-card__icon">
                <i className="bi bi-calendar-check" aria-hidden />
              </div>
              <h3>Đặt lịch và quản lý lịch khám</h3>
              <p>
                Hỗ trợ đặt lịch theo bác sĩ, dịch vụ, khung giờ; kiểm tra trùng lịch và theo dõi trạng thái từng lượt khám.
              </p>
            </article>
            <article className="landing-feature-card landing-reveal landing-reveal--2">
              <div className="landing-feature-card__icon">
                <i className="bi bi-journal-medical" aria-hidden />
              </div>
              <h3>Hồ sơ khám và đơn thuốc</h3>
              <p>
                Bác sĩ cập nhật chẩn đoán, ghi chú chuyên môn, đơn thuốc và lịch sử trạng thái để truy vết đầy đủ.
              </p>
            </article>
            <article className="landing-feature-card landing-reveal landing-reveal--3">
              <div className="landing-feature-card__icon">
                <i className="bi bi-credit-card-2-front" aria-hidden />
              </div>
              <h3>Hóa đơn và thanh toán</h3>
              <p>
                Tạo hóa đơn theo lịch hẹn, ghi nhận nhiều giao dịch thanh toán và in chứng từ phục vụ đối soát.
              </p>
            </article>
            <article className="landing-feature-card landing-reveal landing-reveal--4">
              <div className="landing-feature-card__icon">
                <i className="bi bi-graph-up-arrow" aria-hidden />
              </div>
              <h3>Báo cáo và dashboard</h3>
              <p>
                Dashboard doanh thu, số lịch hẹn, nhắc lịch và báo cáo Excel giúp ban quản lý theo dõi tình hình theo thời gian thực.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="landing-section">
        <div className="page-shell">
          <div className="landing-process">
            <div className="landing-process__intro">
              <div className="landing-section__head">
                <h2 className="landing-section__title">Quy trình vận hành khép kín</h2>
                <p className="landing-section__desc">
                  Hệ thống được thiết kế theo luồng nghiệp vụ thực tế, giúp giảm sai sót và tăng tốc độ xử lý tại quầy tiếp nhận.
                </p>
              </div>
            </div>
            <div className="landing-process__steps">
              <div className="process-step landing-reveal landing-reveal--1">
                <div className="process-step__number">01</div>
                <h3>Tiếp nhận lịch hẹn</h3>
                <p>Bệnh nhân chọn dịch vụ, bác sĩ, ngày giờ; hệ thống lưu lịch và hỗ trợ nhắc lịch.</p>
              </div>
              <div className="process-step landing-reveal landing-reveal--2">
                <div className="process-step__number">02</div>
                <h3>Khám và cập nhật trạng thái</h3>
                <p>Lễ tân check-in, bác sĩ ghi nhận tình trạng, chẩn đoán và kết quả khám.</p>
              </div>
              <div className="process-step landing-reveal landing-reveal--3">
                <div className="process-step__number">03</div>
                <h3>Kê đơn và lưu hồ sơ</h3>
                <p>Thông tin thuốc, liều dùng, hồ sơ khám và lịch sử trạng thái được quản lý tập trung.</p>
              </div>
              <div className="process-step landing-reveal landing-reveal--4">
                <div className="process-step__number">04</div>
                <h3>Thanh toán và báo cáo</h3>
                <p>Tạo hóa đơn, ghi giao dịch thanh toán, theo dõi doanh thu và xuất báo cáo tổng hợp.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section landing-section--muted">
        <div className="page-shell">
          <div className="landing-section__head landing-section__head--center">
            <h2 className="landing-section__title">Khách hàng nói gì về trải nghiệm</h2>
            <p className="landing-section__desc">
              Phản hồi từ đội ngũ vận hành và bệnh nhân sau khi sử dụng hệ thống.
            </p>
          </div>
          <div className="landing-testimonials">
            <article className="testimonial-card landing-reveal landing-reveal--1">
              <p>
                “Từ lúc dùng hệ thống, lễ tân xử lý lịch hẹn nhanh hơn rõ rệt, giảm trùng lịch và đỡ sót lịch nhắc.”
              </p>
              <div className="testimonial-card__author">
                <strong>Nguyễn Thị H.</strong>
                <span>Điều phối phòng khám</span>
              </div>
            </article>
            <article className="testimonial-card landing-reveal landing-reveal--2">
              <p>
                “Hồ sơ khám và đơn thuốc được lưu tập trung, bác sĩ tra cứu lại rất tiện khi bệnh nhân tái khám.”
              </p>
              <div className="testimonial-card__author">
                <strong>BS. Trần Minh Q.</strong>
                <span>Bác sĩ nội tổng quát</span>
              </div>
            </article>
            <article className="testimonial-card landing-reveal landing-reveal--3">
              <p>
                “Phần hóa đơn và báo cáo doanh thu giúp bộ phận thu ngân đối soát cuối ngày nhanh, hạn chế sai số.”
              </p>
              <div className="testimonial-card__author">
                <strong>Lê Khánh V.</strong>
                <span>Thu ngân</span>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="landing-section">
        <div className="page-shell">
          <div className="landing-section__head landing-section__head--center">
            <h2 className="landing-section__title">Câu hỏi thường gặp (FAQ)</h2>
          </div>
          <div className="landing-faq">
            <details className="landing-faq__item landing-reveal landing-reveal--1" open>
              <summary>Hệ thống phù hợp cho phòng khám quy mô nào?</summary>
              <p>
                Phù hợp từ phòng khám tư nhân quy mô nhỏ đến cơ sở có nhiều bộ phận vận hành. Có thể mở rộng tính năng theo nhu cầu thực tế.
              </p>
            </details>
            <details className="landing-faq__item landing-reveal landing-reveal--2">
              <summary>Có hỗ trợ nhắc lịch và theo dõi trạng thái khám không?</summary>
              <p>
                Có. Hệ thống hỗ trợ cấu hình nhắc lịch, cập nhật trạng thái lượt khám và lưu lịch sử trạng thái đầy đủ.
              </p>
            </details>
            <details className="landing-faq__item landing-reveal landing-reveal--3">
              <summary>Dữ liệu hóa đơn có liên kết trực tiếp lịch hẹn không?</summary>
              <p>
                Có. Hóa đơn được gắn theo mã lịch hẹn để truy vết xuyên suốt quy trình khám, thanh toán và báo cáo.
              </p>
            </details>
          </div>
        </div>
      </section>

      <section className="landing-section landing-section--final">
        <div className="page-shell">
          <div className="landing-final-cta landing-reveal landing-reveal--2">
            <div>
              <div className="landing-final-cta__eyebrow">Sẵn sàng trải nghiệm bản demo?</div>
              <h2>Truy cập hệ thống để trải nghiệm đầy đủ các chức năng vận hành</h2>
              <p>
                Từ quản trị, lễ tân, bác sĩ đến thu ngân, mỗi vai trò đều có quyền hạn riêng và luồng thao tác chuyên biệt.
              </p>
            </div>
            <div className="landing-final-cta__actions">
              <button
                className="btn btn-primary btn-lg"
                onClick={() => router.push("/dang-nhap")}
                type="button"
              >
                <i className="bi bi-box-arrow-in-right me-2" aria-hidden />
                Vào trang đăng nhập
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer className="landing-marketing-footer">
        <div className="page-shell">
          <div className="landing-marketing-footer__grid">
            <div>
              <div className="landing-brand mb-2">
                <span className="landing-brand__mark">
                  <i className="bi bi-heart-pulse-fill" aria-hidden />
                </span>
                <div>
                  <div className="landing-brand__name text-white">MEDLATEC Clinic</div>
                  <div className="landing-brand__sub text-white-50">Nền tảng quản lý phòng khám</div>
                </div>
              </div>
              <p className="landing-marketing-footer__desc">
                Giải pháp số hóa quy trình phòng khám: lịch hẹn, hồ sơ khám, thanh toán và báo cáo vận hành.
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
                <li>Đà Nẵng, Việt Nam</li>
              </ul>
            </div>
            <div>
              <h4>Điều hướng</h4>
              <ul>
                <li>
                  <button type="button" onClick={() => router.push("/dang-nhap")}>
                    Đăng nhập hệ thống
                  </button>
                </li>
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
    </div>
  );
}
