"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { invoicesApi, type HoaDon } from "@/lib/api";

export default function InvoicePrintPage() {
  const params = useParams();
  const id = Number(params.id);
  const { user, loading } = useAuth();
  const router = useRouter();
  const [inv, setInv] = useState<HoaDon | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/dang-nhap");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || !id) return;
    invoicesApi
      .get(id)
      .then(setInv)
      .catch(() => {});
  }, [user, id]);

  const handlePrint = () => window.print();

  if (!user || !inv) return <div className="p-4">Đang tải...</div>;

  return (
    <div className="p-4">
      <div className="no-print mb-3">
        <button
          type="button"
          className="btn btn-primary me-2"
          onClick={handlePrint}
        >
          In hóa đơn
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => router.back()}
        >
          Quay lại
        </button>
      </div>
      <div id="invoice-print" className="border p-4 bg-white">
        <h4 className="text-center">HÓA ĐƠN THANH TOÁN</h4>
        <p className="text-center text-muted mb-4">{inv.soHoaDon}</p>
        <p>
          <strong>Bệnh nhân:</strong> {inv.tenBenhNhan}
        </p>
        <p>
          <strong>Ngày lập:</strong>{" "}
          {inv.taoLuc
            ? new Date(inv.taoLuc).toLocaleDateString("vi-VN")
            : ""}
        </p>
        <table className="table table-bordered table-sm mt-3">
          <thead>
            <tr>
              <th>Dịch vụ</th>
              <th>Đơn giá</th>
              <th>SL</th>
              <th>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {inv.chiTiet?.map((i) => (
              <tr key={i.id}>
                <td>{i.tenDichVu}</td>
                <td>{i.donGia?.toLocaleString("vi-VN")}đ</td>
                <td>{i.soLuong}</td>
                <td>{i.thanhTien?.toLocaleString("vi-VN")}đ</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3">
          <strong>Tổng cộng:</strong> {inv.tongTien?.toLocaleString("vi-VN")}
          đ
        </p>
        <p>
          <strong>Đã thanh toán:</strong>{" "}
          {inv.soTienDaTra?.toLocaleString("vi-VN")}đ
        </p>
        <p>
          <strong>Còn lại:</strong>{" "}
          {(inv.tongTien - inv.soTienDaTra)?.toLocaleString("vi-VN")}đ
        </p>
      </div>
    </div>
  );
}
