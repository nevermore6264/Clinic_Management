"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Form, Button, Alert } from "react-bootstrap";
import { useAuth } from "@/lib/useAuth";
import { cauHinhNhacLichApi, type CauHinhNhacLich } from "@/lib/api";

export default function ReminderConfigPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [config, setConfig] = useState<CauHinhNhacLich | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/dang-nhap");
    if (
      user &&
      !user.cacVaiTro.includes("QUAN_TRI") &&
      !user.cacVaiTro.includes("LE_TAN")
    )
      router.replace("/bang-dieu-khien");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    cauHinhNhacLichApi
      .lay()
      .then(setConfig)
      .catch(() =>
        setConfig({
          soNgayTruoc: 1,
          soGioTruoc: 2,
          batThuDienTu: true,
          batTinNhan: false,
        }),
      );
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    setError("");
    setSaved(false);
    try {
      await cauHinhNhacLichApi.capNhat(config);
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi");
    }
  };

  if (!user?.cacVaiTro.includes("QUAN_TRI") && !user?.cacVaiTro.includes("LE_TAN"))
    return null;

  return (
    <div>
      <h2 className="mb-4">Cấu hình nhắc lịch khám</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {saved && <Alert variant="success">Đã lưu cấu hình.</Alert>}
      <Card>
        <Card.Body>
          <p className="text-muted">
            Hệ thống tự động gửi email nhắc bệnh nhân trước lịch khám. Cấu hình
            thời gian gửi nhắc bên dưới.
          </p>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nhắc trước (ngày)</Form.Label>
              <Form.Control
                type="number"
                min={0}
                max={7}
                value={config?.soNgayTruoc ?? 1}
                onChange={(e) =>
                  setConfig((c) =>
                    c
                      ? { ...c, soNgayTruoc: Number(e.target.value) || 0 }
                      : null,
                  )
                }
              />
              <Form.Text className="text-muted">
                Ví dụ: 1 = gửi nhắc trước 1 ngày.
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Nhắc trước (giờ)</Form.Label>
              <Form.Control
                type="number"
                min={0}
                max={24}
                value={config?.soGioTruoc ?? 2}
                onChange={(e) =>
                  setConfig((c) =>
                    c
                      ? { ...c, soGioTruoc: Number(e.target.value) || 0 }
                      : null,
                  )
                }
              />
              <Form.Text className="text-muted">
                Ví dụ: 2 = gửi nhắc trước 2 giờ.
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                label="Bật gửi email nhắc lịch"
                checked={config?.batThuDienTu ?? true}
                onChange={(e) =>
                  setConfig((c) =>
                    c ? { ...c, batThuDienTu: e.target.checked } : null,
                  )
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                label="Bật gửi SMS (chưa triển khai)"
                checked={config?.batTinNhan ?? false}
                onChange={(e) =>
                  setConfig((c) =>
                    c ? { ...c, batTinNhan: e.target.checked } : null,
                  )
                }
                disabled
              />
            </Form.Group>
            <Button type="submit" variant="primary">
              Lưu cấu hình
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}
