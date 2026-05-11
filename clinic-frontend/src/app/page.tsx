"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { LoadingState } from "@/components/LoadingState";
import {
  buildMapIframeSrc,
  getLandingPublic,
} from "@/lib/landingPublicContent";
import { LANDING_BOOKING_DRAFT_KEY } from "@/lib/landingBookingDraft";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [bookName, setBookName] = useState("");
  const [bookPhone, setBookPhone] = useState("");
  const [bookNeed, setBookNeed] = useState("");
  const [bookErr, setBookErr] = useState<string | null>(null);

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

  const lp = getLandingPublic();
  const mapIframeSrc = buildMapIframeSrc(lp);

  const goLogin = () => router.push("/dang-nhap");

  const submitLandingBooking = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBookErr(null);
    const name = bookName.trim();
    const phoneDigits = bookPhone.replace(/\D/g, "");
    if (name.length < 2) {
      setBookErr("Vui lòng nhập họ tên (ít nhất 2 ký tự).");
      return;
    }
    if (phoneDigits.length < 9 || phoneDigits.length > 11) {
      setBookErr("Vui lòng nhập số điện thoại hợp lệ (Việt Nam).");
      return;
    }
    try {
      sessionStorage.setItem(
        LANDING_BOOKING_DRAFT_KEY,
        JSON.stringify({
          name,
          phone: phoneDigits,
          need: bookNeed.trim(),
          ts: Date.now(),
        }),
      );
    } catch {
    }
    router.push("/dang-nhap?next=/lich-hen");
  };

  return (
    <div className="landing-bg landing-bg--clinic landing-hospital">
      <div className="landing-bg__mesh" aria-hidden />

      <div className="landing-urgent-strip">
        <div className="landing-hospital-shell landing-urgent-strip__inner">
          <div className="landing-urgent-strip__left">
            <i className="bi bi-life-preserver" aria-hidden />
            <span>
              <strong>Cấp cứu / Hỗ trợ 24/7</strong>
              <a
                href={`tel:${lp.phoneTel}`}
                className="landing-urgent-strip__tel"
              >
                {lp.phoneDisplay}
              </a>
            </span>
          </div>
          <p className="landing-urgent-strip__hint">
            Trường hợp nguy cấp, vui lòng gọi ngay hoặc đến cơ sở y tế gần nhất.
          </p>
        </div>
      </div>

      <div className="landing-info-rail">
        <div className="landing-hospital-shell landing-info-rail__inner">
          <span className="landing-info-rail__item">
            <i className="bi bi-clock-history" aria-hidden />
            Tiếp nhận: <strong>07:30 – 17:30</strong> (T2 – T7)
          </span>
          <span className="landing-info-rail__dot" aria-hidden />
          <span className="landing-info-rail__item">
            <i className="bi bi-geo-alt" aria-hidden />
            <strong>{lp.cityLabel}</strong>, Việt Nam
          </span>
          <span
            className="landing-info-rail__dot landing-info-rail__dot--hide-sm"
            aria-hidden
          />
          <a href="#lien-he" className="landing-info-rail__link">
            Chỉ đường &amp; liên hệ
          </a>
        </div>
      </div>

      <header className="landing-site-header">
        <div className="landing-hospital-shell landing-site-header__inner">
          <div className="landing-site-header__brand">
            <span className="landing-site-header__logo" aria-hidden>
              <i className="bi bi-heart-pulse-fill" />
            </span>
            <div>
              <span className="landing-site-header__title">
                {lp.clinicName}
              </span>
              <span className="landing-site-header__tagline">
                Phòng khám đa khoa
              </span>
            </div>
          </div>

          <nav className="landing-site-header__nav" aria-label="Menu chính">
            <a href="#thong-bao">Thông báo</a>
            <a href="#chuyen-khoa-landing">Chuyên khoa</a>
            <a href="#dich-vu">Dịch vụ</a>
            <a href="#cam-ket">Cam kết</a>
            <a href="#quy-trinh">Quy trình</a>
            <a href="#co-so">Cơ sở</a>
            <a href="#doi-ngu">Đội ngũ</a>
            <a href="#tin-tuc">Tin hoạt động</a>
            <a href="#danh-gia">Bệnh nhân</a>
            <a href="#hoi-dap">Hỏi đáp</a>
            <a href="#dat-lich-nhanh">Đặt lịch nhanh</a>
            <a href="#lien-he">Liên hệ</a>
          </nav>

          <div className="landing-site-header__cta">
            <a
              href={`tel:${lp.phoneTel}`}
              className="landing-site-header__phone"
            >
              <i className="bi bi-telephone-outbound" aria-hidden />
              <span>
                <small>Hotline</small>
                <strong>{lp.phoneDisplay}</strong>
              </span>
            </a>
            {lp.zaloUrl ? (
              <a
                href={lp.zaloUrl}
                className="btn btn-hospital-ghost landing-site-header__zalo"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="bi bi-chat-dots-fill me-1" aria-hidden />
                Zalo
              </a>
            ) : null}
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
              <ul
                className="landing-hero-institutional__bullets"
                aria-label="Cam kết"
              >
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
                    <p className="landing-clinic-panel__eyebrow">
                      Tiếp nhận hôm nay
                    </p>
                    <p className="landing-clinic-panel__title">
                      Dịch vụ chọn nhanh
                    </p>
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

      <section
        className="landing-quick-tiles-section"
        aria-label="Truy cập nhanh"
      >
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
              <strong>Lịch tiếp nhận dịp lễ:</strong> Phòng khám vẫn mở khám
              ngoại trú theo giờ đăng ký; một số dịch vụ xét nghiệm có thể điều
              chỉnh thời gian trả kết quả — vui lòng gọi hotline để được hướng
              dẫn.
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
                <span className="landing-specialty-chip__label">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
          <p className="text-center small text-muted mt-3 mb-0 fw-semibold">
            Đặt lịch theo chuyên khoa sau khi đăng nhập — hoặc gọi hotline để
            được tư vấn chọn bác sĩ phù hợp.
          </p>
        </div>
      </section>

      <section
        id="dich-vu"
        className="landing-section landing-section--muted landing-section--hospital"
      >
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
                Giảm chờ tại quầy; nhận nhắc lịch trước ngày khám để chủ động
                thời gian.
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

      <section className="landing-stats-ribbon" aria-label="Thống kê hoạt động">
        <div className="landing-stats-ribbon__inner landing-hospital-shell landing-reveal">
          <div className="landing-stats-ribbon__item">
            <span className="landing-stats-ribbon__value">15+</span>
            <span className="landing-stats-ribbon__unit">năm</span>
            <span className="landing-stats-ribbon__label">
              Phục vụ cộng đồng
            </span>
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
            <span className="landing-stats-ribbon__label">
              Tư vấn — cấp cứu
            </span>
          </div>
        </div>
        <p className="landing-stats-ribbon__note landing-hospital-shell">
          * Số liệu minh họa cho giao diện — thay bằng thống kê thật khi vận
          hành.
        </p>
      </section>

      <section className="landing-bhyt-strip" aria-label="Thanh toán và BHYT">
        <div className="landing-hospital-shell landing-bhyt-strip__grid landing-reveal">
          <div className="landing-bhyt-strip__copy">
            <span className="landing-bhyt-strip__icon">
              <i className="bi bi-card-checklist" aria-hidden />
            </span>
            <div>
              <h3 className="landing-bhyt-strip__title">
                BHYT &amp; chi phí khám
              </h3>
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

      <section
        id="cam-ket"
        className="landing-trust-strip"
        aria-label="Cam kết vận hành"
      >
        <div className="landing-hospital-shell">
          <ul className="landing-trust-strip__list">
            {[
              {
                icon: "bi-shield-fill-check",
                title: "Phòng ngừa nhiễm khuẩn",
                text: "Khử khuẩn bề mặt, tách luồng, nhắc vệ sinh tay.",
              },
              {
                icon: "bi-lock-fill",
                title: "Bảo mật hồ sơ",
                text: "Dữ liệu truy cập theo vai trò; lưu trữ theo thói quen phòng khám.",
              },
              {
                icon: "bi-hourglass-split",
                title: "Chờ có kiểm soát",
                text: "Ưu tiên theo hẹn; hướng dẫn tại quầy khi đông.",
              },
              {
                icon: "bi-chat-left-text",
                title: "Tư vấn trước chỉ định",
                text: "Giải thích cận lâm sàng; người bệnh đồng ý trước khi thực hiện.",
              },
            ].map((row) => (
              <li
                key={row.title}
                className="landing-trust-strip__item landing-reveal"
              >
                <span className="landing-trust-strip__icon" aria-hidden>
                  <i className={`bi ${row.icon}`} />
                </span>
                <div>
                  <strong className="landing-trust-strip__item-title">
                    {row.title}
                  </strong>
                  <p className="landing-trust-strip__item-text">{row.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="quy-trinh"
        className="landing-section landing-section--hospital"
      >
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
                <p>Bác sĩ khám, giải thích và chỉ định cận lâm sàng khi cần.</p>
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

      <section
        id="doi-ngu"
        className="landing-section landing-section--team landing-section--hospital"
      >
        <div className="landing-hospital-shell">
          <div className="landing-section__head landing-section__head--center mb-4">
            <p className="landing-section__eyebrow">Con người</p>
            <h2 className="landing-section__title">Đội ngũ chuyên môn</h2>
            <p className="landing-section__desc">
              Bác sĩ có chứng chỉ hành nghề, tham gia đào tạo liên tục và phối
              hợp đa chuyên khoa khi cần.
            </p>
          </div>
          <div className="landing-team-grid">
            {[
              {
                name: "BS.CKI Nguyễn Minh",
                role: "Trưởng khoa Nội",
                exp: "18 năm khám lâm sàng",
                imageSrc:
                  "data:image/jpeg;base64,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",
                imageAlt: "Chân dung bác sĩ nam ",
              },
              {
                name: "BS.CKII Lê Thu",
                role: "Chuyên khoa Tim mạch",
                exp: "Siêu âm tim — HA",
                imageSrc:
                  "data:image/jpeg;base64,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",
                imageAlt: "Chân dung bác sĩ nữ ",
              },
              {
                name: "BS.CKI Phạm Hoàng Anh",
                role: "Nhi — tiêm chủng",
                exp: "Tư vấn dinh dưỡng trẻ em",
                imageSrc:
                  "data:image/jpeg;base64,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",
                imageAlt: "Chân dung bác sĩ ",
              },
            ].map((d) => (
              <article
                key={d.name}
                className="landing-team-card landing-reveal"
              >
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

      <section
        id="co-so"
        className="landing-section landing-section--facility landing-section--muted landing-section--hospital"
      >
        <div className="landing-hospital-shell">
          <div className="landing-section__head landing-section__head--center mb-4">
            <p className="landing-section__eyebrow">Hạ tầng</p>
            <h2 className="landing-section__title">Không gian phòng khám</h2>
            <p className="landing-section__desc mb-0">
              Không gian tiếp nhận và khám hiện đại — ảnh minh họa; thay bằng
              ảnh thực tế cơ sở của bạn khi triển khai.
            </p>
          </div>
          <div className="landing-facility-grid">
            {[
              {
                src: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=720&h=480&q=80",
                alt: "Sảnh và quầy tiếp nhận bệnh viện — ảnh minh họa",
                cap: "Khu tiếp nhận",
              },
              {
                src: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=720&h=480&q=80",
                alt: "Bác sĩ khám cho bệnh nhân trong phòng khám — ảnh minh họa",
                cap: "Phòng khám & thiết bị",
              },
              {
                src: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=720&h=480&q=80",
                alt: "Hành lang và khu chờ trong cơ sở y tế — ảnh minh họa",
                cap: "Khu chờ",
              },
            ].map((item) => (
              <figure
                key={item.cap}
                className="landing-facility-card landing-reveal"
              >
                <div className="landing-facility-card__media">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    width={720}
                    height={480}
                    className="landing-facility-card__img"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <figcaption className="landing-facility-card__cap">
                  {item.cap}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section
        id="tin-tuc"
        className="landing-section landing-section--muted landing-section--news"
      >
        <div className="landing-hospital-shell">
          <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
            <div>
              <p className="landing-section__eyebrow mb-2">Tin tức</p>
              <h2 className="landing-section__title mb-0">
                Hoạt động &amp; sự kiện
              </h2>
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
              <div className="landing-news-card__featured-media">
                <Image
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&h=560&q=80"
                  alt="Thiết bị và không gian khám — ảnh minh họa tin"
                  fill
                  sizes="(max-width: 991px) 100vw, 280px"
                  className="landing-news-card__featured-img"
                />
              </div>
              <div className="landing-news-card__body">
                <time className="landing-news-card__date" dateTime="2026-05-01">
                  01/05/2026
                </time>
                <h3 className="landing-news-card__title">
                  Mở rộng khung giờ khám ngoại trú cuối tuần
                </h3>
                <p className="landing-news-card__excerpt">
                  Phục vụ người bận đi làm; đặt lịch qua ứng dụng hoặc hotline
                  để được xếp giờ phù hợp.
                </p>
              </div>
            </article>
            <article className="landing-news-card landing-news-card--thumb landing-reveal">
              <div className="landing-news-card__thumb">
                <Image
                  src="https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=400&h=400&q=80"
                  alt="Thiết bị chẩn đoán — ảnh minh họa"
                  width={400}
                  height={400}
                  className="landing-news-card__thumb-img"
                  sizes="120px"
                />
              </div>
              <div className="landing-news-card__body landing-news-card__body--compact">
                <time className="landing-news-card__date" dateTime="2026-04-18">
                  18/04/2026
                </time>
                <h3 className="landing-news-card__title h6">
                  Tập huấn phòng chống nhiễm khuẩn tại phòng khám
                </h3>
              </div>
            </article>
            <article className="landing-news-card landing-news-card--thumb landing-reveal">
              <div className="landing-news-card__thumb">
                <Image
                  src="https://images.unsplash.com/photo-1551190822-a9333d879a1f?auto=format&fit=crop&w=400&h=400&q=80"
                  alt="Đội ngũ y tế — ảnh minh họa"
                  width={400}
                  height={400}
                  className="landing-news-card__thumb-img"
                  sizes="120px"
                />
              </div>
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

      <section
        id="danh-gia"
        className="landing-section landing-section--muted landing-section--hospital"
      >
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
                “Đặt lịch online được nhắc trước, đến nơi không phải chờ lâu.
                Bác sĩ giải thích rõ nên gia đình yên tâm.”
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

      <section
        id="hoi-dap"
        className="landing-section landing-section--hospital"
      >
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
                Có. Hệ thống hỗ trợ lưu lịch hẹn và nhắc lịch theo cấu hình
                phòng khám.
              </p>
            </details>
          </div>
        </div>
      </section>

      <section
        id="dat-lich-nhanh"
        className="landing-section landing-section--booking-mini landing-section--hospital"
      >
        <div className="landing-hospital-shell">
          <div className="landing-section__head landing-section__head--center mb-4">
            <p className="landing-section__eyebrow">Đặt lịch</p>
            <h2 className="landing-section__title">
              Gửi yêu cầu đặt lịch nhanh
            </h2>
            <p className="landing-section__desc mb-0">
              Điền thông tin — bạn sẽ được chuyển tới đăng nhập để hoàn tất trên
              hệ thống đặt lịch (hoặc liên hệ hotline / Zalo).
            </p>
          </div>
          <form
            className="landing-booking-mini landing-reveal"
            onSubmit={submitLandingBooking}
            noValidate
          >
            <div className="landing-booking-mini__grid">
              <div>
                <label className="form-label small fw-bold" htmlFor="bk-name">
                  Họ và tên
                </label>
                <input
                  id="bk-name"
                  name="name"
                  type="text"
                  className="form-control"
                  autoComplete="name"
                  value={bookName}
                  onChange={(e) => setBookName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                />
              </div>
              <div>
                <label className="form-label small fw-bold" htmlFor="bk-phone">
                  Điện thoại
                </label>
                <input
                  id="bk-phone"
                  name="phone"
                  type="tel"
                  className="form-control"
                  autoComplete="tel"
                  inputMode="tel"
                  value={bookPhone}
                  onChange={(e) => setBookPhone(e.target.value)}
                  placeholder={lp.phoneDisplay}
                />
              </div>
              <div className="landing-booking-mini__need">
                <label className="form-label small fw-bold" htmlFor="bk-need">
                  Nhu cầu (tuỳ chọn)
                </label>
                <input
                  id="bk-need"
                  name="need"
                  type="text"
                  className="form-control"
                  value={bookNeed}
                  onChange={(e) => setBookNeed(e.target.value)}
                  placeholder="Ví dụ: Khám nội — tái khám"
                />
              </div>
            </div>
            {bookErr ? (
              <p
                className="text-danger small fw-semibold mt-2 mb-0"
                role="alert"
              >
                {bookErr}
              </p>
            ) : null}
            <div className="landing-booking-mini__actions">
              <button type="submit" className="btn btn-hospital-primary btn-lg">
                <i className="bi bi-calendar2-check me-2" aria-hidden />
                Tiếp tục đặt lịch
              </button>
              {lp.zaloUrl ? (
                <a
                  href={lp.zaloUrl}
                  className="btn btn-outline-secondary btn-lg"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="bi bi-chat-dots-fill me-2" aria-hidden />
                  Chat Zalo OA
                </a>
              ) : null}
              <a
                href={`tel:${lp.phoneTel}`}
                className="btn btn-outline-primary btn-lg"
              >
                <i className="bi bi-telephone me-2" aria-hidden />
                Gọi {lp.phoneDisplay}
              </a>
            </div>
          </form>
        </div>
      </section>

      <section
        id="lien-he"
        className="landing-section landing-section--contact-hospital"
      >
        <div className="landing-hospital-shell">
          <div className="landing-contact-layout">
            <div className="landing-contact-layout__intro">
              <p className="landing-section__eyebrow">Liên hệ</p>
              <h2 className="landing-section__title landing-contact-grid__title">
                {lp.clinicName}
              </h2>
              <p className="landing-section__desc mb-0">
                Địa chỉ: {lp.addressFull}
                <br />
                Email:{" "}
                <a
                  href={`mailto:${lp.email}`}
                  className="landing-contact-grid__link"
                >
                  {lp.email}
                </a>
                <br />
                Hotline:{" "}
                <a
                  href={`tel:${lp.phoneTel}`}
                  className="landing-contact-grid__link"
                >
                  {lp.phoneDisplay}
                </a>
              </p>
            </div>
            <div className="landing-contact-card">
              <h3 className="h6 fw-bold text-uppercase text-muted mb-3">
                Giờ làm việc
              </h3>
              <ul className="list-unstyled mb-0 small fw-semibold">
                <li className="mb-2">Thứ 2 – Thứ 7: 07:30 – 17:30</li>
                <li className="mb-2">
                  Chủ nhật: Nghỉ (trừ trường hợp đặc biệt)
                </li>
                <li>Cấp cứu / tư vấn: gọi hotline 24/7</li>
              </ul>
            </div>
            <div className="landing-contact-links-card landing-reveal">
              <h3 className="h6 fw-bold text-uppercase text-muted mb-3">
                Mở nhanh
              </h3>
              <div className="d-flex flex-column gap-2">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lp.addressFull)}`}
                  className="btn btn-outline-primary w-100"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="bi bi-geo-alt me-2" aria-hidden />
                  Google Maps (ứng dụng)
                </a>
                <a
                  href={lp.zaloUrl}
                  className="btn btn-outline-secondary w-100"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="bi bi-chat-dots-fill me-2" aria-hidden />
                  Zalo OA
                </a>
              </div>
            </div>
          </div>
          <div className="landing-contact-map-embed landing-reveal">
            <div className="landing-contact-map-embed__head">
              <strong>Bản đồ</strong>
            </div>
            <div className="landing-contact-map-embed__frame">
              <iframe
                title={`Bản đồ ${lp.clinicName}`}
                src={mapIframeSrc}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
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
                type="button"
                className="landing-final-cta__btn landing-final-cta__btn--primary"
                onClick={goLogin}
              >
                <span className="landing-final-cta__btn-icon" aria-hidden>
                  <i className="bi bi-calendar2-heart" />
                </span>
                Đặt lịch khám
              </button>
              <button
                type="button"
                className="landing-final-cta__btn landing-final-cta__btn--secondary"
                onClick={goLogin}
              >
                <span className="landing-final-cta__btn-icon" aria-hidden>
                  <i className="bi bi-box-arrow-in-right" />
                </span>
                Cổng nhân viên
              </button>
            </div>
          </div>
        </div>
      </section>

      <div
        className="landing-float-cta d-lg-none"
        role="region"
        aria-label="Gọi hoặc đặt lịch nhanh"
      >
        <a href={`tel:${lp.phoneTel}`} className="landing-float-cta__call">
          <i className="bi bi-telephone-fill" aria-hidden />
          <span>
            <small>Gọi ngay</small>
            <strong>{lp.phoneDisplay}</strong>
          </span>
        </a>
        {lp.zaloUrl ? (
          <a
            href={lp.zaloUrl}
            className="landing-float-cta__zalo"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat Zalo OA"
          >
            <i className="bi bi-chat-dots-fill" aria-hidden />
          </a>
        ) : null}
        <button
          type="button"
          className="landing-float-cta__book"
          onClick={goLogin}
        >
          Đặt lịch khám
        </button>
      </div>

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
                    {lp.clinicName}
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
                  <a href={`tel:${lp.phoneTel}`} className="text-white-50">
                    Hotline: {lp.phoneDisplay}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${lp.email}`} className="text-white-50">
                    Email: {lp.email}
                  </a>
                </li>
                <li className="text-white-50">{lp.addressFull}</li>
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
                <li>
                  <Link href="/chinh-sach-bao-mat" className="text-white-50">
                    Chính sách bảo mật
                  </Link>
                </li>
                <li>
                  <Link href="/dieu-khoan-su-dung" className="text-white-50">
                    Điều khoản sử dụng
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="landing-marketing-footer__bottom">
            © {new Date().getFullYear()} {lp.clinicName}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
