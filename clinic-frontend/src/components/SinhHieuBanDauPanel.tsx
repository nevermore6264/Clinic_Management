"use client";

import { useMemo } from "react";
import { Alert, Card, Col, Form, Row } from "react-bootstrap";
import type { SinhHieuBanDau } from "@/lib/api";

export type SinhHieuState = Required<{
  [K in keyof SinhHieuBanDau]: string;
}>;

export const SINH_HIEU_RONG: SinhHieuState = {
  nhietDo: "",
  huyetApTamThu: "",
  huyetApTamTruong: "",
  nhipTim: "",
  nhipTho: "",
  chieuCaoCm: "",
  canNangKg: "",
  spo2: "",
  ghiChuSinhHieu: "",
};

export function sinhHieuTuHoSo(r?: SinhHieuBanDau | null): SinhHieuState {
  if (!r) return { ...SINH_HIEU_RONG };
  return {
    nhietDo: r.nhietDo != null ? String(r.nhietDo) : "",
    huyetApTamThu: r.huyetApTamThu != null ? String(r.huyetApTamThu) : "",
    huyetApTamTruong:
      r.huyetApTamTruong != null ? String(r.huyetApTamTruong) : "",
    nhipTim: r.nhipTim != null ? String(r.nhipTim) : "",
    nhipTho: r.nhipTho != null ? String(r.nhipTho) : "",
    chieuCaoCm: r.chieuCaoCm != null ? String(r.chieuCaoCm) : "",
    canNangKg: r.canNangKg != null ? String(r.canNangKg) : "",
    spo2: r.spo2 != null ? String(r.spo2) : "",
    ghiChuSinhHieu: r.ghiChuSinhHieu ?? "",
  };
}

function parseNum(s: string): number | null {
  const t = s.trim();
  if (!t) return null;
  const n = Number(t.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

export function sinhHieuSangPayload(state: SinhHieuState): SinhHieuBanDau {
  return {
    nhietDo: parseNum(state.nhietDo),
    huyetApTamThu: parseNum(state.huyetApTamThu),
    huyetApTamTruong: parseNum(state.huyetApTamTruong),
    nhipTim: parseNum(state.nhipTim),
    nhipTho: parseNum(state.nhipTho),
    chieuCaoCm: parseNum(state.chieuCaoCm),
    canNangKg: parseNum(state.canNangKg),
    spo2: parseNum(state.spo2),
    ghiChuSinhHieu: state.ghiChuSinhHieu.trim() || null,
  };
}

function tinhBmi(chieuCaoCm: string, canNangKg: string): string | null {
  const cao = parseNum(chieuCaoCm);
  const nang = parseNum(canNangKg);
  if (cao == null || nang == null || cao <= 0) return null;
  const m = cao / 100;
  const bmi = nang / (m * m);
  return bmi.toFixed(1);
}

type Props = {
  value: SinhHieuState;
  onChange: (next: SinhHieuState) => void;
  disabled?: boolean;
  isAdmin?: boolean;
  trangThai?: string;
};

export function SinhHieuBanDauPanel({
  value,
  onChange,
  disabled = false,
  isAdmin = false,
  trangThai,
}: Props) {
  const bmi = useMemo(
    () => tinhBmi(value.chieuCaoCm, value.canNangKg),
    [value.chieuCaoCm, value.canNangKg],
  );

  const patch = (field: keyof SinhHieuState, raw: string) => {
    onChange({ ...value, [field]: raw });
  };

  return (
    <Card className="mb-3 lich-hen-sinh-hieu-card">
      <Card.Header className="d-flex flex-wrap align-items-center gap-2">
        <span>
          <i className="bi bi-activity me-2" aria-hidden />
          Sinh hiệu ban đầu
        </span>
        <span className="badge text-bg-light border small fw-semibold">
          Tiếp nhận → khám
        </span>
      </Card.Header>
      <Card.Body>
        {disabled ? (
          <Alert variant="secondary" className="mb-3 py-2 small">
            {isAdmin
              ? "Quản trị có thể chỉnh sinh hiệu ở mọi giai đoạn trước thanh toán."
              : trangThai === "DA_DAT"
                ? "Ghi sinh hiệu sau khi chuyển lịch sang trạng thái tiếp nhận."
                : "Không chỉnh sinh hiệu ở giai đoạn này."}
          </Alert>
        ) : trangThai === "DA_TIEP_NHAN" ? (
          <Alert variant="info" className="mb-3 py-2 small">
            <strong>Lễ tân</strong> ghi sinh hiệu khi tiếp nhận;{" "}
            <strong>bác sĩ</strong> có thể bổ sung hoặc cập nhật khi bắt đầu
            khám.
          </Alert>
        ) : (
          <Alert variant="info" className="mb-3 py-2 small">
            Sinh hiệu đã ghi ở tiếp nhận — bác sĩ / lễ tân có thể cập nhật nếu
            cần bổ sung trước khi kết thúc khám.
          </Alert>
        )}

        <Row className="g-3 lich-hen-sinh-hieu-grid">
          <Col xs={6} md={4} lg={3}>
            <Form.Group>
              <Form.Label className="small fw-semibold">
                Nhiệt độ <span className="text-muted fw-normal">(°C)</span>
              </Form.Label>
              <Form.Control
                type="number"
                inputMode="decimal"
                step="0.1"
                min={34}
                max={42}
                placeholder="36.5"
                value={value.nhietDo}
                disabled={disabled}
                onChange={(e) => patch("nhietDo", e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col xs={6} md={4} lg={3}>
            <Form.Group>
              <Form.Label className="small fw-semibold">
                Huyết áp tâm thu{" "}
                <span className="text-muted fw-normal">(mmHg)</span>
              </Form.Label>
              <Form.Control
                type="number"
                inputMode="numeric"
                min={60}
                max={250}
                placeholder="120"
                value={value.huyetApTamThu}
                disabled={disabled}
                onChange={(e) => patch("huyetApTamThu", e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col xs={6} md={4} lg={3}>
            <Form.Group>
              <Form.Label className="small fw-semibold">
                Huyết áp tâm trương{" "}
                <span className="text-muted fw-normal">(mmHg)</span>
              </Form.Label>
              <Form.Control
                type="number"
                inputMode="numeric"
                min={40}
                max={150}
                placeholder="80"
                value={value.huyetApTamTruong}
                disabled={disabled}
                onChange={(e) => patch("huyetApTamTruong", e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col xs={6} md={4} lg={3}>
            <Form.Group>
              <Form.Label className="small fw-semibold">
                Nhịp tim <span className="text-muted fw-normal">(l/p)</span>
              </Form.Label>
              <Form.Control
                type="number"
                inputMode="numeric"
                min={30}
                max={220}
                placeholder="72"
                value={value.nhipTim}
                disabled={disabled}
                onChange={(e) => patch("nhipTim", e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col xs={6} md={4} lg={3}>
            <Form.Group>
              <Form.Label className="small fw-semibold">
                Nhịp thở <span className="text-muted fw-normal">(l/p)</span>
              </Form.Label>
              <Form.Control
                type="number"
                inputMode="numeric"
                min={8}
                max={60}
                placeholder="18"
                value={value.nhipTho}
                disabled={disabled}
                onChange={(e) => patch("nhipTho", e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col xs={6} md={4} lg={3}>
            <Form.Group>
              <Form.Label className="small fw-semibold">
                SpO₂ <span className="text-muted fw-normal">(%)</span>
              </Form.Label>
              <Form.Control
                type="number"
                inputMode="numeric"
                min={70}
                max={100}
                placeholder="98"
                value={value.spo2}
                disabled={disabled}
                onChange={(e) => patch("spo2", e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col xs={6} md={4} lg={3}>
            <Form.Group>
              <Form.Label className="small fw-semibold">
                Chiều cao <span className="text-muted fw-normal">(cm)</span>
              </Form.Label>
              <Form.Control
                type="number"
                inputMode="decimal"
                step="0.1"
                min={50}
                max={250}
                placeholder="165"
                value={value.chieuCaoCm}
                disabled={disabled}
                onChange={(e) => patch("chieuCaoCm", e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col xs={6} md={4} lg={3}>
            <Form.Group>
              <Form.Label className="small fw-semibold">
                Cân nặng <span className="text-muted fw-normal">(kg)</span>
              </Form.Label>
              <Form.Control
                type="number"
                inputMode="decimal"
                step="0.1"
                min={2}
                max={300}
                placeholder="60"
                value={value.canNangKg}
                disabled={disabled}
                onChange={(e) => patch("canNangKg", e.target.value)}
              />
            </Form.Group>
          </Col>
          {bmi ? (
            <Col xs={12} md={4} lg={3} className="d-flex align-items-end">
              <div className="lich-hen-sinh-hieu-bmi small text-muted pb-2">
                BMI tham khảo: <strong className="text-body">{bmi}</strong>
              </div>
            </Col>
          ) : null}
        </Row>

        <Form.Group className="mt-3">
          <Form.Label className="small fw-semibold">Ghi chú sinh hiệu</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            placeholder="VD: đo tại phòng tiếp nhận, bệnh nhân vừa đi bộ…"
            value={value.ghiChuSinhHieu}
            disabled={disabled}
            onChange={(e) => patch("ghiChuSinhHieu", e.target.value)}
          />
        </Form.Group>
      </Card.Body>
    </Card>
  );
}
