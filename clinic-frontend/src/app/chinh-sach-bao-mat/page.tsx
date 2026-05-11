import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Chính sách bảo mật",
  description:
    "Chính sách bảo mật thông tin người dùng và bệnh nhân (bản minh họa).",
};

export default function ChinhSachBaoMatPage() {
  return (
    <div className="container py-5" style={{ maxWidth: "42rem" }}>
      <nav aria-label="Breadcrumb" className="mb-4">
        <Link href="/" className="text-decoration-none fw-semibold">
          ← Về trang chủ
        </Link>
      </nav>
      <h1 className="h2 fw-bold mb-3">Chính sách bảo mật</h1>
      <p className="text-muted small fw-semibold mb-4">
        Đây là trang placeholder. Vui lòng thay bằng văn bản pháp lý do phòng khám
        soạn hoặc tư vấn pháp lý khi triển khai thật.
      </p>
      <div className="public-legal-body small lh-lg text-secondary">
        <h2 className="h6 text-dark fw-bold mt-4">1. Phạm vi áp dụng</h2>
        <p>
          Trang này mô tả cách thu thập, lưu trữ và sử dụng dữ liệu cá nhân khi
          bạn sử dụng website và dịch vụ của phòng khám.
        </p>
        <h2 className="h6 text-dark fw-bold mt-4">2. Dữ liệu có thể thu thập</h2>
        <p>
          Ví dụ: họ tên, số điện thoại, email, thông tin khám chữa bệnh cần thiết
          để cung cấp dịch vụ y tế và tuân thủ quy định.
        </p>
        <h2 className="h6 text-dark fw-bold mt-4">3. Bảo mật</h2>
        <p>
          Phòng khám áp dụng các biện pháp kỹ thuật và tổ chức phù hợp để bảo vệ
          dữ liệu; quyền truy cập được giới hạn theo vai trò.
        </p>
        <h2 className="h6 text-dark fw-bold mt-4">4. Liên hệ</h2>
        <p>
          Mọi yêu cầu liên quan đến dữ liệu cá nhân vui lòng liên hệ qua hotline
          hoặc email do phòng khám công bố trên website chính thức.
        </p>
      </div>
    </div>
  );
}
