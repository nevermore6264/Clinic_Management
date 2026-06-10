"use client";

import { useState } from "react";
import { Alert, Button, Modal, Table } from "react-bootstrap";
import Link from "next/link";
import { cauHinhNhacLichApi, type KetQuaGuiNhacHangLoat, type LichHen } from "@/lib/api";
import { formatGioHen, formatNgayDdMmYyyy } from "@/lib/formatInstantVi";
import { notify } from "@/lib/notify";

type Props = {
  show: boolean;
  onHide: () => void;
  ngay: string;
  tenBacSi?: string;
  danhSach: LichHen[];
};

export function ModalLichHenNgoaiLe({
  show,
  onHide,
  ngay,
  tenBacSi,
  danhSach,
}: Props) {
  const [dangGui, setDangGui] = useState(false);
  const [ketQua, setKetQua] = useState<KetQuaGuiNhacHangLoat | null>(null);

  const ids = danhSach.map((a) => a.id).filter((id): id is number => id != null);

  const guiEmailHangLoat = async () => {
    if (ids.length === 0) return;
    setDangGui(true);
    setKetQua(null);
    try {
      const kq = await cauHinhNhacLichApi.guiEmailNgoaiLeHangLoat(ids);
      setKetQua(kq);
      if (kq.thatBai === 0) {
        notify.success(`Đã gửi email cho ${kq.thanhCong} bệnh nhân.`);
      } else {
        notify.warning(
          `Gửi xong: ${kq.thanhCong} thành công, ${kq.thatBai} thất bại.`,
        );
      }
    } catch (e: unknown) {
      notify.error(e instanceof Error ? e.message : "Gửi email thất bại");
    } finally {
      setDangGui(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title className="fs-5">
          <i className="bi bi-exclamation-triangle-fill text-warning me-2" aria-hidden />
          Lịch hẹn bị ảnh hưởng
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert variant="warning" className="small py-2">
          Sau khi ghi <strong>ngoại lệ</strong> ngày{" "}
          <strong>{formatNgayDdMmYyyy(ngay)}</strong>
          {tenBacSi ? (
            <>
              {" "}
              cho <strong>{tenBacSi}</strong>
            </>
          ) : null}
          , các lịch hẹn dưới đây <strong>không còn khớp</strong> khung giờ làm
          việc. Bệnh nhân sẽ thấy cảnh báo trên cổng; nên gửi email và hướng dẫn
          đổi lịch / gọi hotline.
        </Alert>

        <div className="table-responsive">
          <Table size="sm" hover className="mb-0">
            <thead>
              <tr className="small text-muted">
                <th>Bệnh nhân</th>
                <th>Giờ hẹn</th>
                <th>Lý do</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {danhSach.map((a) => (
                <tr key={a.id}>
                  <td>{a.tenBenhNhan ?? `#${a.maBenhNhan}`}</td>
                  <td className="text-nowrap">{formatGioHen(a.gioHen)}</td>
                  <td className="small text-muted">
                    {a.lyDoAnhHuongNgoaiLe ?? "Cần xác nhận lại"}
                  </td>
                  <td className="text-end text-nowrap">
                    {a.id != null ? (
                      <Link
                        href={`/lich-hen/${a.id}`}
                        className="btn btn-sm btn-outline-primary"
                      >
                        Mở lịch
                      </Link>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        {ketQua && ketQua.loi.length > 0 ? (
          <Alert variant="danger" className="small mt-3 mb-0 py-2">
            {ketQua.loi.map((l) => (
              <div key={l.maLichHen}>
                Lịch #{l.maLichHen}: {l.lyDo}
              </div>
            ))}
          </Alert>
        ) : null}
      </Modal.Body>
      <Modal.Footer className="flex-wrap gap-2">
        <Button variant="secondary" onClick={onHide}>
          Đóng
        </Button>
        <Button
          variant="warning"
          disabled={dangGui || ids.length === 0}
          onClick={() => void guiEmailHangLoat()}
        >
          {dangGui ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" />
              Đang gửi…
            </>
          ) : (
            <>
              <i className="bi bi-envelope-exclamation me-2" aria-hidden />
              Gửi email thông báo ({ids.length})
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
