"use client";

import { useEffect } from "react";
import Image from "next/image";
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

  const goLogin = () => router.push("/dang-nhap");

  return (
    <div className="landing-bg landing-bg--clinic landing-hospital">
      <div className="landing-bg__mesh" aria-hidden />

      {/* Hàng 1 — kiểu BV: cấp cứu nổi bật, full chiều ngang */}
      <div className="landing-urgent-strip">
        <div className="landing-hospital-shell landing-urgent-strip__inner">
          <div className="landing-urgent-strip__left">
            <i className="bi bi-life-preserver" aria-hidden />
            <span>
              <strong>Cấp cứu / Hỗ trợ 24/7</strong>
              <a href="tel:1900565656" className="landing-urgent-strip__tel">
                1900 56 56 56
              </a>
            </span>
          </div>
          <p className="landing-urgent-strip__hint">
            Trường hợp nguy cấp, vui lòng gọi ngay hoặc đến cơ sở y tế gần nhất.
          </p>
        </div>
      </div>

      {/* Hàng 2 — thông tin tiện ích */}
      <div className="landing-info-rail">
        <div className="landing-hospital-shell landing-info-rail__inner">
          <span className="landing-info-rail__item">
            <i className="bi bi-clock-history" aria-hidden />
            Tiếp nhận: <strong>07:30 – 17:30</strong> (T2 – T7)
          </span>
          <span className="landing-info-rail__dot" aria-hidden />
          <span className="landing-info-rail__item">
            <i className="bi bi-geo-alt" aria-hidden />
            <strong>Đà Nẵng</strong>, Việt Nam
          </span>
          <span className="landing-info-rail__dot landing-info-rail__dot--hide-sm" aria-hidden />
          <a href="#lien-he" className="landing-info-rail__link">
            Chỉ đường &amp; liên hệ
          </a>
        </div>
      </div>

      {/* Header trang — logo + menu + hotline + đặt lịch */}
      <header className="landing-site-header">
        <div className="landing-hospital-shell landing-site-header__inner">
          <div className="landing-site-header__brand">
            <span className="landing-site-header__logo" aria-hidden>
              <i className="bi bi-heart-pulse-fill" />
            </span>
            <div>
              <span className="landing-site-header__title">MEDLATEC Clinic</span>
              <span className="landing-site-header__tagline">
                Phòng khám đa khoa
              </span>
            </div>
          </div>

          <nav
            className="landing-site-header__nav"
            aria-label="Menu chính"
          >
            <a href="#thong-bao">Thông báo</a>
            <a href="#chuyen-khoa-landing">Chuyên khoa</a>
            <a href="#dich-vu">Dịch vụ</a>
            <a href="#quy-trinh">Quy trình</a>
            <a href="#doi-ngu">Đội ngũ</a>
            <a href="#tin-tuc">Tin hoạt động</a>
            <a href="#danh-gia">Bệnh nhân</a>
            <a href="#hoi-dap">Hỏi đáp</a>
            <a href="#lien-he">Liên hệ</a>
          </nav>

          <div className="landing-site-header__cta">
            <a href="tel:1900565656" className="landing-site-header__phone">
              <i className="bi bi-telephone-outbound" aria-hidden />
              <span>
                <small>Hotline</small>
                <strong>1900 56 56 56</strong>
              </span>
            </a>
            <button
              type="button"
              className="btn btn-hospital-primary"
              onClick={goLogin}
            >
              Đặt lịch khám
            </button>
            <button
              type="button"
              className="btn btn-hospital-ghost"
              onClick={goLogin}
            >
              Nhân viên
            </button>
          </div>
        </div>
      </header>

      {/* Hero — dải xanh bệnh viện + lưới nội dung */}
      <section className="landing-hero-institutional">
        <div className="landing-hero-institutional__pattern" aria-hidden />
        <div className="landing-hospital-shell">
          <div className="landing-hero-institutional__grid">
            <div className="landing-hero-institutional__copy landing-reveal landing-reveal--1">
              <p className="landing-hero-institutional__eyebrow">
                Chăm sóc sức khỏe toàn diện
              </p>
              <h1 className="landing-hero-institutional__title">
                Phòng khám đồng hành cùng
                <span> gia đình bạn</span>
              </h1>
              <p className="landing-hero-institutional__lead">
                Khám đa khoa, xét nghiệm và tư vấn theo quy trình rõ ràng — giảm
                thời gian chờ, minh bạch chi phí, hồ sơ điện tử thuận tiện tái
                khám.
              </p>
              <div className="landing-hero-institutional__actions">
                <button
                  type="button"
                  className="btn btn-hospital-light btn-hospital-light--lg"
                  onClick={goLogin}
                >
                  <i className="bi bi-calendar2-check me-2" aria-hidden />
                  Đặt lịch trực tuyến
                </button>
                <button
                  type="button"
                  className="btn btn-hospital-outline-light btn-hospital-outline-light--lg"
                  onClick={goLogin}
                >
                  <i className="bi bi-person-badge me-2" aria-hidden />
                  Tra cứu / Đăng nhập
                </button>
              </div>
              <ul className="landing-hero-institutional__bullets" aria-label="Cam kết">
                <li>
                  <i className="bi bi-check-circle-fill" aria-hidden />
                  Đội ngũ bác sĩ chuyên khoa
                </li>
                <li>
                  <i className="bi bi-check-circle-fill" aria-hidden />
                  Nhắc lịch &amp; tái khám
                </li>
                <li>
                  <i className="bi bi-check-circle-fill" aria-hidden />
                  Bảo mật hồ sơ bệnh án
                </li>
              </ul>
            </div>

            <div className="landing-hero-institutional__aside landing-reveal landing-reveal--3">
              <div className="landing-clinic-panel landing-clinic-panel--hero">
                <div className="landing-clinic-panel__header">
                  <div>
                    <p className="landing-clinic-panel__eyebrow">Tiếp nhận hôm nay</p>
                    <p className="landing-clinic-panel__title">Dịch vụ chọn nhanh</p>
                  </div>
                  <span className="landing-clinic-panel__badge">
                    <i className="bi bi-check-circle-fill" aria-hidden />
                    Đang mở
                  </span>
                </div>
                <ul className="landing-clinic-services" aria-label="Dịch vụ">
                  <li>
                    <span className="landing-clinic-services__icon">
                      <i className="bi bi-clipboard2-pulse" aria-hidden />
                    </span>
                    <div>
                      <strong>Khám nội tổng quát</strong>
                      <small>Khám lâm sàng, tư vấn điều trị</small>
                    </div>
                  </li>
                  <li>
                    <span className="landing-clinic-services__icon">
                      <i className="bi bi-droplet-half" aria-hidden />
                    </span>
                    <div>
                      <strong>Xét nghiệm</strong>
                      <small>Lấy mẫu tại phòng khám</small>
                    </div>
                  </li>
                  <li>
                    <span className="landing-clinic-services__icon">
                      <i className="bi bi-activity" aria-hidden />
                    </span>
                    <div>
                      <strong>Cận lâm sàng</strong>
                      <small>Siêu âm, điện tim… theo chỉ định</small>
                    </div>
                  </li>
                </ul>
                <div className="landing-clinic-panel__foot">
                  <span>
                    <i className="bi bi-shield-check" aria-hidden />
                    Chuẩn vệ sinh phòng khám
                  </span>
                  <span>
                    <i className="bi bi-receipt" aria-hidden />
                    Biên lai — hóa đơn rõ ràng
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hàng ô shortcut — rất giống web BV */}
      <section className="landing-quick-tiles-section" aria-label="Truy cập nhanh">
        <div className="landing-hospital-shell">
          <div className="landing-quick-tiles">
            <button
              type="button"
              className="landing-quick-tile"
              onClick={goLogin}
            >
              <span className="landing-quick-tile__icon">
                <i className="bi bi-calendar-plus" aria-hidden />
              </span>
              <span className="landing-quick-tile__text">
                <strong>Đặt hẹn khám</strong>
                <small>Chọn giờ phù hợp</small>
              </span>
            </button>
            <button
              type="button"
              className="landing-quick-tile"
              onClick={goLogin}
            >
              <span className="landing-quick-tile__icon">
                <i className="bi bi-search-heart" aria-hidden />
              </span>
              <span className="landing-quick-tile__text">
                <strong>Tra cứu lịch</strong>
                <small>Tài khoản bệnh nhân</small>
              </span>
            </button>
            <button
              type="button"
              className="landing-quick-tile"
              onClick={goLogin}
            >
              <span className="landing-quick-tile__icon">
                <i className="bi bi-journal-medical" aria-hidden />
              </span>
              <span className="landing-quick-tile__text">
                <strong>Bảng giá tham khảo</strong>
                <small>Dịch vụ &amp; gói khám</small>
              </span>
            </button>
            <button
              type="button"
              className="landing-quick-tile"
              onClick={() => {
                document.getElementById("quy-trinh")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
            >
              <span className="landing-quick-tile__icon">
                <i className="bi bi-signpost-2" aria-hidden />
              </span>
              <span className="landing-quick-tile__text">
                <strong>Hướng dẫn đi khám</strong>
                <small>Chuẩn bị &amp; quy trình</small>
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Thông báo — kiểu banner BV */}
      <section
        id="thong-bao"
        className="landing-announcement-section landing-section"
      >
        <div className="landing-hospital-shell">
          <div className="landing-announcement-card landing-reveal">
            <span className="landing-announcement-card__badge">
              <i className="bi bi-megaphone-fill" aria-hidden />
              Thông báo
            </span>
            <p className="landing-announcement-card__text">
              <strong>Lịch tiếp nhận dịp lễ:</strong> Phòng khám vẫn mở khám ngoại
              trú theo giờ đăng ký; một số dịch vụ xét nghiệm có thể điều chỉnh
              thời gian trả kết quả — vui lòng gọi hotline để được hướng dẫn.
            </p>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm rounded-pill px-3"
              onClick={() =>
                document.getElementById("lien-he")?.scrollIntoView({
                  behavior: "smooth",
                })
              }
            >
              Chi tiết liên hệ
            </button>
          </div>
        </div>
      </section>

      {/* Chuyên khoa — thanh icon như nhiều web BV */}
      <section
        id="chuyen-khoa-landing"
        className="landing-specialty-section landing-section landing-section--muted"
      >
        <div className="landing-hospital-shell">
          <div className="landing-section__head landing-section__head--center mb-3 mb-lg-4">
            <p className="landing-section__eyebrow">Chuyên khoa</p>
            <h2 className="landing-section__title mb-0">
              Lĩnh vực khám &amp; điều trị
            </h2>
          </div>
          <div
            className="landing-specialty-scroll landing-reveal"
            role="list"
            aria-label="Danh sách chuyên khoa"
          >
            {[
              { icon: "bi-heart-pulse", label: "Nội tổng quát" },
              { icon: "bi-wind", label: "Hô hấp — Hen — COPD" },
              { icon: "bi-droplet", label: "Tiểu đường — Nội tiết" },
              { icon: "bi-emoji-smile", label: "Tiêu hóa — Gan mật" },
              { icon: "bi-ear", label: "Tai — Mũi — Họng" },
              { icon: "bi-eye", label: "Mắt — nhãn khoa" },
              { icon: "bi-activity", label: "Tim mạch — HA" },
              { icon: "bi-virus", label: "Truyền nhiễm — Vaccine" },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                className="landing-specialty-chip"
                role="listitem"
                onClick={goLogin}
              >
                <span className="landing-specialty-chip__icon">
                  <i className={`bi ${item.icon}`} aria-hidden />
                </span>
                <span className="landing-specialty-chip__label">{item.label}</span>
              </button>
            ))}
          </div>
          <p className="text-center small text-muted mt-3 mb-0 fw-semibold">
            Đặt lịch theo chuyên khoa sau khi đăng nhập — hoặc gọi hotline để được
            tư vấn chọn bác sĩ phù hợp.
          </p>
        </div>
      </section>

      <section id="dich-vu" className="landing-section landing-section--muted landing-section--hospital">
        <div className="landing-hospital-shell">
          <div className="landing-section__head landing-section__head--center">
            <p className="landing-section__eyebrow">Dịch vụ y khoa</p>
            <h2 className="landing-section__title">
              Dịch vụ chính tại phòng khám
            </h2>
            <p className="landing-section__desc">
              Tổ chức theo mô hình bệnh viện tư gọn: một điểm tiếp nhận, luồng
              khám thống nhất, thông tin được lưu cho lần khám sau.
            </p>
          </div>

          <div className="landing-feature-grid">
            <article className="landing-feature-card landing-feature-card--accent-a">
              <div className="landing-feature-card__icon">
                <i className="bi bi-calendar-heart" aria-hidden />
              </div>
              <h3>Đặt lịch &amp; ưu tiên khung giờ</h3>
              <p>
                Giảm chờ tại quầy; nhận nhắc lịch trước ngày khám để chủ động thời
                gian.
              </p>
            </article>
            <article className="landing-feature-card landing-feature-card--accent-b">
              <div className="landing-feature-card__icon">
                <i className="bi bi-hospital" aria-hidden />
              </div>
              <h3>Khám đa khoa</h3>
              <p>
                Tiếp nhận triệu chứng, khám tổng quát và phối hợp chuyên khoa
                trong cùng hệ thống.
              </p>
            </article>
            <article className="landing-feature-card landing-feature-card--accent-c">
              <div className="landing-feature-card__icon">
                <i className="bi bi-file-earmark-medical" aria-hidden />
              </div>
              <h3>Hồ sơ &amp; đơn thuốc</h3>
              <p>
                Lưu trữ điện tử, thuận tiệm cho tái khám và người nhà đồng hành.
              </p>
            </article>
            <article className="landing-feature-card landing-feature-card--accent-d">
              <div className="landing-feature-card__icon">
                <i className="bi bi-credit-card-2-front" aria-hidden />
              </div>
              <h3>Thanh toán minh bạch</h3>
              <p>
                Niêm yết dịch vụ, biên lai đầy đủ — thuận tiện BHYT và chi phí
                tự túc.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Con số — dải full width kiểu BV */}
      <section className="landing-stats-ribbon" aria-label="Thống kê hoạt động">
        <div className="landing-stats-ribbon__inner landing-hospital-shell landing-reveal">
          <div className="landing-stats-ribbon__item">
            <span className="landing-stats-ribbon__value">15+</span>
            <span className="landing-stats-ribbon__unit">năm</span>
            <span className="landing-stats-ribbon__label">Phục vụ cộng đồng</span>
          </div>
          <div className="landing-stats-ribbon__divider" aria-hidden />
          <div className="landing-stats-ribbon__item">
            <span className="landing-stats-ribbon__value">25+</span>
            <span className="landing-stats-ribbon__unit">BS CK</span>
            <span className="landing-stats-ribbon__label">
              Chuyên khoa I &amp; II
            </span>
          </div>
          <div className="landing-stats-ribbon__divider" aria-hidden />
          <div className="landing-stats-ribbon__item">
            <span className="landing-stats-ribbon__value">50k+</span>
            <span className="landing-stats-ribbon__unit">lượt/năm</span>
            <span className="landing-stats-ribbon__label">Khám ngoại trú</span>
          </div>
          <div className="landing-stats-ribbon__divider" aria-hidden />
          <div className="landing-stats-ribbon__item">
            <span className="landing-stats-ribbon__value">24/7</span>
            <span className="landing-stats-ribbon__unit">hotline</span>
            <span className="landing-stats-ribbon__label">Tư vấn — cấp cứu</span>
          </div>
        </div>
      </section>

      {/* BHYT — thanh xanh lá đặc trưng web y tế */}
      <section className="landing-bhyt-strip" aria-label="Thanh toán và BHYT">
        <div className="landing-hospital-shell landing-bhyt-strip__grid landing-reveal">
          <div className="landing-bhyt-strip__copy">
            <span className="landing-bhyt-strip__icon">
              <i className="bi bi-card-checklist" aria-hidden />
            </span>
            <div>
              <h3 className="landing-bhyt-strip__title">BHYT &amp; chi phí khám</h3>
              <p className="landing-bhyt-strip__desc mb-0">
                Tiếp nhận khám BHYT đúng tuyến và chi phí dịch vụ theo thông tư;
                quầy hướng dẫn thủ tục ngay tại tiếp nhận.
              </p>
            </div>
          </div>
          <ul className="landing-bhyt-strip__list">
            <li>
              <i className="bi bi-check2-circle" aria-hidden />
              Niêm yết giá dịch vụ tại quầy
            </li>
            <li>
              <i className="bi bi-check2-circle" aria-hidden />
              Hóa đơn điện tử / chứng từ đầy đủ
            </li>
            <li>
              <i className="bi bi-check2-circle" aria-hidden />
              Hỗ trợ làm thủ tục BHYT
            </li>
          </ul>
        </div>
      </section>

      <section id="quy-trinh" className="landing-section landing-section--hospital">
        <div className="landing-hospital-shell">
          <div className="landing-process">
            <div className="landing-process__intro">
              <div className="landing-section__head">
                <p className="landing-section__eyebrow">Dành cho người bệnh</p>
                <h2 className="landing-section__title">Quy trình đi khám</h2>
                <p className="landing-section__desc">
                  Các bước tương tự quy trình tại bệnh viện / phòng khám lớn: rõ
                  ràng, có nhân viên hướng dẫn.
                </p>
              </div>
            </div>
            <div className="landing-process__steps">
              <div className="process-step">
                <div className="process-step__number">01</div>
                <h3>Đăng ký</h3>
                <p>
                  Đặt lịch online hoặc đến quầy; mang giấy tờ, thẻ BHYT (nếu có)
                  và kết quả khám cũ.
                </p>
              </div>
              <div className="process-step">
                <div className="process-step__number">02</div>
                <h3>Tiếp nhận</h3>
                <p>
                  Đo sinh hiệu, khai hồ sơ, phân luồng theo chuyên khoa phù hợp.
                </p>
              </div>
              <div className="process-step">
                <div className="process-step__number">03</div>
                <h3>Khám &amp; chỉ định</h3>
                <p>
                  Bác sĩ khám, giải thích và chỉ định cận lâm sàng khi cần.
                </p>
              </div>
              <div className="process-step">
                <div className="process-step__number">04</div>
                <h3>Ra về</h3>
                <p>
                  Đơn thuốc, thanh toán, hẹn tái khám và hướng dẫn chăm sóc tại
                  nhà.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Đội ngũ — teaser kiểu “Ban chuyên môn” */}
      <section
        id="doi-ngu"
        className="landing-section landing-section--team landing-section--hospital"
      >
        <div className="landing-hospital-shell">
          <div className="landing-section__head landing-section__head--center mb-4">
            <p className="landing-section__eyebrow">Con người</p>
            <h2 className="landing-section__title">Đội ngũ chuyên môn</h2>
            <p className="landing-section__desc">
              Bác sĩ có chứng chỉ hành nghề, tham gia đào tạo liên tục và phối hợp
              đa chuyên khoa khi cần.
            </p>
            <p className="small text-muted fw-semibold mb-0 mt-2">
              Ảnh chân dung minh họa (stock); thay bằng ảnh thật tại phòng khám khi
              có.
            </p>
          </div>
          <div className="landing-team-grid">
            {[
              {
                name: "BS.CKI Nguyễn Minh",
                role: "Trưởng khoa Nội",
                exp: "18 năm khám lâm sàng",
                imageSrc:
                  "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=320&h=320&q=80",
                imageAlt:
                  "Bác sĩ nam mặc blouse trắng trong phòng khám — ảnh minh họa",
              },
              {
                name: "BS.CKII Lê Thu",
                role: "Chuyên khoa Tim mạch",
                exp: "Siêu âm tim — HA",
                imageSrc:
                  "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=320&h=320&q=80",
                imageAlt:
                  "Bác sĩ nữ với ống nghe trong môi trường y tế — ảnh minh họa",
              },
              {
                name: "BS.CKI Phạm Hoàng Anh",
                role: "Nhi — tiêm chủng",
                exp: "Tư vấn dinh dưỡng trẻ em",
                imageSrc:
                  "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=320&h=320&q=80",
                imageAlt:
                  "Nhân viên y tế trong phòng khám — ảnh minh họa",
              },
            ].map((d) => (
              <article key={d.name} className="landing-team-card landing-reveal">
                <div className="landing-team-card__avatar">
                  <Image
                    src={d.imageSrc}
                    alt={d.imageAlt}
                    width={112}
                    height={112}
                    className="landing-team-card__avatar-img"
                    sizes="112px"
                  />
                </div>
                <h3 className="landing-team-card__name">{d.name}</h3>
                <p className="landing-team-card__role">{d.role}</p>
                <p className="landing-team-card__exp">{d.exp}</p>
              </article>
            ))}
          </div>
          <p className="text-center mt-4 mb-0">
            <button
              type="button"
              className="btn btn-outline-primary rounded-pill px-4"
              onClick={goLogin}
            >
              Xem lịch khám theo bác sĩ
            </button>
          </p>
        </div>
      </section>

      {/* Tin hoạt động — layout đa dạng kiểu tin BV */}
      <section
        id="tin-tuc"
        className="landing-section landing-section--muted landing-section--news"
      >
        <div className="landing-hospital-shell">
          <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
            <div>
              <p className="landing-section__eyebrow mb-2">Tin tức</p>
              <h2 className="landing-section__title mb-0">Hoạt động &amp; sự kiện</h2>
            </div>
            <button
              type="button"
              className="btn btn-link text-decoration-none fw-bold p-0"
              onClick={goLogin}
            >
              Xem tất cả
              <i className="bi bi-arrow-right ms-1" aria-hidden />
            </button>
          </div>
          <div className="landing-news-grid">
            <article className="landing-news-card landing-news-card--featured landing-reveal">
              <div className="landing-news-card__media" aria-hidden>
                <div className="landing-news-card__placeholder">
                  <i className="bi bi-images" />
                </div>
              </div>
              <div className="landing-news-card__body">
                <time className="landing-news-card__date" dateTime="2026-05-01">
                  01/05/2026
                </time>
                <h3 className="landing-news-card__title">
                  Mở rộng khung giờ khám ngoại trú cuối tuần
                </h3>
                <p className="landing-news-card__excerpt">
                  Phục vụ người bận đi làm; đặt lịch qua ứng dụng hoặc hotline để
                  được xếp giờ phù hợp.
                </p>
              </div>
            </article>
            <article className="landing-news-card landing-reveal">
              <div className="landing-news-card__body landing-news-card__body--compact">
                <time className="landing-news-card__date" dateTime="2026-04-18">
                  18/04/2026
                </time>
                <h3 className="landing-news-card__title h6">
                  Tập huấn phòng chống nhiễm khuẩn tại phòng khám
                </h3>
              </div>
            </article>
            <article className="landing-news-card landing-reveal">
              <div className="landing-news-card__body landing-news-card__body--compact">
                <time className="landing-news-card__date" dateTime="2026-04-02">
                  02/04/2026
                </time>
                <h3 className="landing-news-card__title h6">
                  Gói khám sức khỏe tổng quát — ưu đãi mùa hè
                </h3>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section id="danh-gia" className="landing-section landing-section--muted landing-section--hospital">
        <div className="landing-hospital-shell">
          <div className="landing-section__head landing-section__head--center">
            <p className="landing-section__eyebrow">Phản hồi</p>
            <h2 className="landing-section__title">Người bệnh chia sẻ</h2>
            <p className="landing-section__desc">
              Ý kiến từ người khám và người nhà — giúp chúng tôi cải thiện dịch
              vụ mỗi ngày.
            </p>
          </div>
          <div className="landing-testimonials">
            <article className="testimonial-card">
              <p className="testimonial-card__quote">
                “Đặt lịch online được nhắc trước, đến nơi không phải chờ lâu. Bác
                sĩ giải thích rõ nên gia đình yên tâm.”
              </p>
              <div className="testimonial-card__author">
                <span className="testimonial-card__avatar" aria-hidden>
                  CH
                </span>
                <div className="testimonial-card__meta">
                  <strong>Chị Hương</strong>
                  <span>Bệnh nhân nội tổng quát</span>
                </div>
              </div>
            </article>
            <article className="testimonial-card">
              <p className="testimonial-card__quote">
                “Quy trình rõ ràng, nhân viên hướng dẫn tận tình. Hóa đơn và đơn
                thuốc đầy đủ để tôi gửi công ty bảo hiểm.”
              </p>
              <div className="testimonial-card__author">
                <span className="testimonial-card__avatar" aria-hidden>
                  AN
                </span>
                <div className="testimonial-card__meta">
                  <strong>Anh Nam</strong>
                  <span>Khám sức khỏe định kỳ</span>
                </div>
              </div>
            </article>
            <article className="testimonial-card">
              <p className="testimonial-card__quote">
                “Tái khám được nhắc lịch, hồ sơ lần trước còn đó nên bác sĩ nắm
                nhanh tình trạng.”
              </p>
              <div className="testimonial-card__author">
                <span className="testimonial-card__avatar" aria-hidden>
                  MT
                </span>
                <div className="testimonial-card__meta">
                  <strong>Cô Mai</strong>
                  <span>Tái khám theo hẹn</span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section id="hoi-dap" className="landing-section landing-section--hospital">
        <div className="landing-hospital-shell">
          <div className="landing-section__head landing-section__head--center">
            <p className="landing-section__eyebrow">Hỏi — đáp</p>
            <h2 className="landing-section__title">Thắc mắc thường gặp</h2>
          </div>
          <div className="landing-faq">
            <details className="landing-faq__item" open>
              <summary>Tôi có thể đặt lịch khám trước bao lâu?</summary>
              <p>
                Bạn có thể đặt theo khung giờ còn trống. Nên đặt sớm để chọn bác
                sĩ và giờ phù hợp; cấp cứu xin gọi hotline trên đầu trang.
              </p>
            </details>
            <details className="landing-faq__item">
              <summary>Khi đi khám cần mang theo gì?</summary>
              <p>
                Giấy tờ tùy thân, thẻ BHYT (nếu có), đơn thuốc hoặc kết quả xét
                nghiệm cũ để bác sĩ tham chiếu.
              </p>
            </details>
            <details className="landing-faq__item">
              <summary>Có nhắc lịch tái khám không?</summary>
              <p>
                Có. Hệ thống hỗ trợ lưu lịch hẹn và nhắc lịch theo cấu hình phòng
                khám.
              </p>
            </details>
          </div>
        </div>
      </section>

      <section
        id="lien-he"
        className="landing-section landing-section--contact-hospital"
      >
        <div className="landing-hospital-shell">
          <div className="landing-contact-grid">
            <div>
              <p className="landing-section__eyebrow">Liên hệ</p>
              <h2 className="landing-section__title landing-contact-grid__title">
                MEDLATEC Clinic
              </h2>
              <p className="landing-section__desc mb-0">
                Địa chỉ: Đà Nẵng, Việt Nam
                <br />
                Email: info@medlatec.com
                <br />
                Hotline:{" "}
                <a href="tel:1900565656" className="landing-contact-grid__link">
                  1900 56 56 56
                </a>
              </p>
            </div>
            <div className="landing-contact-card">
              <h3 className="h6 fw-bold text-uppercase text-muted mb-3">
                Giờ làm việc
              </h3>
              <ul className="list-unstyled mb-0 small fw-semibold">
                <li className="mb-2">Thứ 2 – Thứ 7: 07:30 – 17:30</li>
                <li className="mb-2">Chủ nhật: Nghỉ (trừ trường hợp đặc biệt)</li>
                <li>Cấp cứu / tư vấn: gọi hotline 24/7</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section landing-section--final landing-section--clinic-final">
        <div className="landing-hospital-shell">
          <div className="landing-final-cta">
            <div>
              <div className="landing-final-cta__eyebrow">Đặt lịch hôm nay</div>
              <h2>Chúng tôi sẵn sàng đón tiếp bạn</h2>
              <p>
                Đặt lịch trực tuyến hoặc gọi hotline — nhân viên hỗ trợ chọn
                thời gian phù hợp.
              </p>
            </div>
            <div className="landing-final-cta__actions">
              <button
                className="btn btn-light btn-lg fw-bold"
                onClick={goLogin}
                type="button"
              >
                <i className="bi bi-calendar2-heart me-2" aria-hidden />
                Đặt lịch khám
              </button>
              <button
                className="btn btn-outline-light btn-lg"
                onClick={goLogin}
                type="button"
              >
                <i className="bi bi-box-arrow-in-right me-2" aria-hidden />
                Cổng nhân viên
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer className="landing-marketing-footer landing-marketing-footer--hospital">
        <div className="landing-hospital-shell">
          <div className="landing-marketing-footer__grid">
            <div>
              <div className="landing-brand mb-2">
                <span className="landing-brand__mark">
                  <i className="bi bi-heart-pulse-fill" aria-hidden />
                </span>
                <div>
                  <div className="landing-brand__name text-white">
                    MEDLATEC Clinic
                  </div>
                  <div className="landing-brand__sub text-white-50">
                    Phòng khám đa khoa
                  </div>
                </div>
              </div>
              <p className="landing-marketing-footer__desc">
                Chăm sóc sức khỏe theo tiêu chuẩn phòng khám — tôn trọng thời
                gian người bệnh, minh bạch trong khám chữa bệnh.
              </p>
            </div>
            <div>
              <h4>Dịch vụ</h4>
              <ul>
                <li>Khám nội tổng quát</li>
                <li>Xét nghiệm — cận lâm sàng</li>
                <li>Tái khám &amp; tư vấn</li>
              </ul>
            </div>
            <div>
              <h4>Liên hệ</h4>
              <ul>
                <li>
                  <a href="tel:1900565656" className="text-white-50">
                    Hotline: 1900 56 56 56
                  </a>
                </li>
                <li>Email: info@medlatec.com</li>
                <li>Đà Nẵng, Việt Nam</li>
              </ul>
            </div>
            <div>
              <h4>Khác</h4>
              <ul>
                <li>
                  <button type="button" onClick={goLogin}>
                    Đăng nhập / Đặt lịch
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
