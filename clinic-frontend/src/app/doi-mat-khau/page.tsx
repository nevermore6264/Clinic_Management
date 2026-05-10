"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Form, Button, Alert } from "react-bootstrap";
import { useAuth } from "@/lib/useAuth";
import { authApi } from "@/lib/api";

type FieldKey = "current" | "new" | "confirm";

export default function ChangePasswordPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [fieldError, setFieldError] = useState<Partial<Record<FieldKey, string>>>(
    {},
  );

  const clearField = (k: FieldKey) =>
    setFieldError((e) => {
      const n = { ...e };
      delete n[k];
      return n;
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldError({});
    const err: Partial<Record<FieldKey, string>> = {};
    if (!currentPassword.trim()) err.current = "Vui lòng nhập mật khẩu hiện tại.";
    if (!newPassword.trim()) err.new = "Vui lòng nhập mật khẩu mới.";
    else if (newPassword.length < 6)
      err.new = "Mật khẩu mới cần ít nhất 6 ký tự.";
    if (!confirmPassword.trim())
      err.confirm = "Vui lòng nhập lại mật khẩu mới.";
    else if (newPassword && newPassword !== confirmPassword)
      err.confirm = "Xác nhận không khớp với mật khẩu mới.";
    if (Object.keys(err).length) {
      setFieldError(err);
      return;
    }
    try {
      await authApi.doiMatKhau(currentPassword, newPassword);
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Đổi mật khẩu thất bại.");
    }
  };

  if (!loading && !user) {
    router.replace("/dang-nhap");
    return null;
  }

  return (
    <div className="mx-auto" style={{ maxWidth: 400 }}>
      <h2 className="mb-4">Đổi mật khẩu</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">Đã đổi mật khẩu thành công.</Alert>}
      <Card>
        <Card.Body>
          <Form noValidate onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="required">Mật khẩu hiện tại</Form.Label>
              <Form.Control
                type="password"
                placeholder="Nhập mật khẩu đang dùng"
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  clearField("current");
                }}
                isInvalid={Boolean(fieldError.current)}
              />
              <Form.Control.Feedback type="invalid">
                {fieldError.current}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="required">Mật khẩu mới</Form.Label>
              <Form.Control
                type="password"
                placeholder="Tối thiểu 6 ký tự"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  clearField("new");
                  clearField("confirm");
                }}
                isInvalid={Boolean(fieldError.new)}
              />
              <Form.Control.Feedback type="invalid">
                {fieldError.new}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="required">
                Xác nhận mật khẩu mới
              </Form.Label>
              <Form.Control
                type="password"
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  clearField("confirm");
                }}
                isInvalid={Boolean(fieldError.confirm)}
              />
              <Form.Control.Feedback type="invalid">
                {fieldError.confirm}
              </Form.Control.Feedback>
            </Form.Group>
            <Button type="submit" variant="primary">
              Đổi mật khẩu
            </Button>{" "}
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
            >
              Hủy
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}
