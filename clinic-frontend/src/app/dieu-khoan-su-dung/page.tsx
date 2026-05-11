import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Điều khoản sử dụng",
  description:
    "Điều khoản sử dụng website và dịch vụ đặt lịch (bản minh họa).",
};

export default function DieuKhoanSuDungPage() {
  return (
    <div className="container py-5" style={{ maxWidth: "42rem" }}>
      <nav aria-label="Breadcrumb" className="mb-4">
        <Link href="/" className="text-decoration-none fw-semibold">
          ← Về trang chủ
        </Link>
      </nav>
      <h1 className="h2 fw-bold mb-3">Điều khoản sử dụng</h1>
      <p className="text-muted small fw-semibold mb-4">
        Đây là trang placeholder. Vui lòng thay bằng điều khoản do phòng khám ban
        hành khi vận hành thật.
      </p>
      <div className="public-legal-body small lh-lg text-secondary">
        <h2 className="h6 text-dark fw-bold mt-4">1. Chấp nhận điều khoản</h2>
        <p>
          Khi truy cập website và sử dụng các tính năng (bao gồm đặt lịch khám),
          bạn xác nhận đã đọc và đồng ý với các điều khoản sau.
        </p>
        <h2 className="h6 text-dark fw-bold mt-4">2. Dịch vụ đặt lịch</h2>
        <p>
          Lịch hẹn phụ thuộc khung giờ còn trống và xác nhận của phòng khám.
          Thông tin đặt lịch cần chính xác để liên hệ khi cần.
        </p>
        <h2 className="h6 text-dark fw-bold mt-4">3. Giới hạn trách nhiệm</h2>
        <p>
          Nội dung website mang tính thông tin và hỗ trợ đặt lịch; không thay
          thế chẩn đoán hoặc điều trị trực tiếp.
        </p>
        <h2 className="h6 text-dark fw-bold mt-4">4. Thay đổi điều khoản</h2>
        <p>
          Phòng khám có thể cập nhật điều khoản; phiên bản hiện hành được đăng
          trên trang này.
        </p>
      </div>
    </div>
  );
}
