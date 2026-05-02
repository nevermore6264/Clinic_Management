"use client";

import Form from "react-bootstrap/Form";
import type { BenhNhan } from "@/lib/api";

type Props = {
  form: Partial<BenhNhan>;
  setForm: React.Dispatch<React.SetStateAction<Partial<BenhNhan>>>;
};

export function PatientRecordFormFields({ form, setForm }: Props) {
  return (
    <>
      <section className="patient-create-modal__section">
        <div className="patient-create-modal__section-title">Thông tin cơ bản</div>
        <Form.Group className="mb-2">
          <Form.Label className="form-label small fw-semibold text-secondary mb-1 required">
            Họ tên
          </Form.Label>
          <Form.Control
            value={form.hoTen || ""}
            onChange={(e) => setForm((f) => ({ ...f, hoTen: e.target.value }))}
            placeholder="VD: Nguyễn Văn A"
            required
          />
        </Form.Group>
        <div className="row g-2">
          <div className="col-md-6">
            <Form.Group className="mb-2">
              <Form.Label className="small fw-semibold text-secondary mb-1">
                Ngày sinh
              </Form.Label>
              <Form.Control
                type="date"
                value={form.ngaySinh || ""}
                onChange={(e) => setForm((f) => ({ ...f, ngaySinh: e.target.value }))}
              />
            </Form.Group>
          </div>
          <div className="col-md-6">
            <Form.Group className="mb-2">
              <Form.Label className="small fw-semibold text-secondary mb-1">
                Số điện thoại
              </Form.Label>
              <Form.Control
                value={form.soDienThoai || ""}
                onChange={(e) => setForm((f) => ({ ...f, soDienThoai: e.target.value }))}
                placeholder="0xxx xxx xxx"
              />
            </Form.Group>
          </div>
          <div className="col-md-4">
            <Form.Group className="mb-2">
              <Form.Label className="small fw-semibold text-secondary mb-1">
                Giới tính
              </Form.Label>
              <Form.Select
                value={form.gioiTinh || ""}
                onChange={(e) => setForm((f) => ({ ...f, gioiTinh: e.target.value }))}
              >
                <option value="">— Chọn —</option>
                <option value="NAM">Nam</option>
                <option value="NU">Nữ</option>
                <option value="KHAC">Khác</option>
              </Form.Select>
            </Form.Group>
          </div>
          <div className="col-md-4">
            <Form.Group className="mb-2">
              <Form.Label className="small fw-semibold text-secondary mb-1">
                Số CCCD
              </Form.Label>
              <Form.Control
                value={form.soCccd || ""}
                onChange={(e) => setForm((f) => ({ ...f, soCccd: e.target.value }))}
                placeholder="Số căn cước"
              />
            </Form.Group>
          </div>
          <div className="col-md-4">
            <Form.Group className="mb-2">
              <Form.Label className="small fw-semibold text-secondary mb-1">
                Nhóm máu
              </Form.Label>
              <Form.Select
                value={form.nhomMau || ""}
                onChange={(e) => setForm((f) => ({ ...f, nhomMau: e.target.value }))}
              >
                <option value="">— Chọn —</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="AB">AB</option>
                <option value="O">O</option>
              </Form.Select>
            </Form.Group>
          </div>
          <div className="col-md-6">
            <Form.Group className="mb-2 mb-md-0">
              <Form.Label className="small fw-semibold text-secondary mb-1">
                Nghề nghiệp
              </Form.Label>
              <Form.Control
                value={form.ngheNghiep || ""}
                onChange={(e) => setForm((f) => ({ ...f, ngheNghiep: e.target.value }))}
                placeholder="VD: Kỹ sư"
              />
            </Form.Group>
          </div>
          <div className="col-md-6">
            <Form.Group className="mb-0">
              <Form.Label className="small fw-semibold text-secondary mb-1">
                Email
              </Form.Label>
              <Form.Control
                type="email"
                value={form.thuDienTu || ""}
                onChange={(e) => setForm((f) => ({ ...f, thuDienTu: e.target.value }))}
                placeholder="email@example.com"
              />
            </Form.Group>
          </div>
        </div>
      </section>

      <section className="patient-create-modal__section">
        <div className="patient-create-modal__section-title">Liên hệ & trạng thái</div>
        <div className="row g-2">
          <div className="col-md-6">
            <Form.Group className="mb-2">
              <Form.Label className="small fw-semibold text-secondary mb-1">
                Người liên hệ khi cấp cứu
              </Form.Label>
              <Form.Control
                value={form.nguoiLienHe || ""}
                onChange={(e) => setForm((f) => ({ ...f, nguoiLienHe: e.target.value }))}
                placeholder="Họ tên người thân"
              />
            </Form.Group>
          </div>
          <div className="col-md-6">
            <Form.Group className="mb-2">
              <Form.Label className="small fw-semibold text-secondary mb-1">
                SĐT liên hệ
              </Form.Label>
              <Form.Control
                value={form.soDienThoaiLienHe || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, soDienThoaiLienHe: e.target.value }))
                }
                placeholder="0xxx xxx xxx"
              />
            </Form.Group>
          </div>
          <div className="col-12">
            <Form.Group className="mb-0">
              <Form.Label className="small fw-semibold text-secondary mb-1">
                Trạng thái hồ sơ
              </Form.Label>
              <Form.Select
                value={form.hoatDong === false ? "an" : "hoat-dong"}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    hoatDong: e.target.value !== "an",
                  }))
                }
              >
                <option value="hoat-dong">Hoạt động (hiển thị trong danh sách)</option>
                <option value="an">Ẩn (chỉ tìm thấy khi tra cứu)</option>
              </Form.Select>
            </Form.Group>
          </div>
        </div>
      </section>

      <section className="patient-create-modal__section">
        <div className="patient-create-modal__section-title">Địa chỉ & y khoa</div>
        <Form.Group className="mb-2">
          <Form.Label className="small fw-semibold text-secondary mb-1">Địa chỉ</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            value={form.diaChi || ""}
            onChange={(e) => setForm((f) => ({ ...f, diaChi: e.target.value }))}
            placeholder="Số nhà, đường, phường/xã, tỉnh/thành..."
          />
        </Form.Group>
        <div className="row g-2">
          <div className="col-md-6">
            <Form.Group className="mb-0">
              <Form.Label className="small fw-semibold text-secondary mb-1">
                Tiền sử bệnh
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={form.tienSuBenh || ""}
                onChange={(e) => setForm((f) => ({ ...f, tienSuBenh: e.target.value }))}
                placeholder="Bệnh mãn tính, phẫu thuật trước đây..."
              />
            </Form.Group>
          </div>
          <div className="col-md-6">
            <Form.Group className="mb-0">
              <Form.Label className="small fw-semibold text-secondary mb-1">Dị ứng</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={form.diUng || ""}
                onChange={(e) => setForm((f) => ({ ...f, diUng: e.target.value }))}
                placeholder="Thuốc, thực phẩm, môi trường..."
              />
            </Form.Group>
          </div>
        </div>
      </section>
    </>
  );
}

export const emptyPatientForm = (): Partial<BenhNhan> => ({
  hoTen: "",
  ngaySinh: "",
  soDienThoai: "",
  thuDienTu: "",
  diaChi: "",
  gioiTinh: "",
  soCccd: "",
  ngheNghiep: "",
  nhomMau: "",
  tienSuBenh: "",
  diUng: "",
  nguoiLienHe: "",
  soDienThoaiLienHe: "",
  hoatDong: true,
});
