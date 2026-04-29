"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Form, Button, Alert } from "react-bootstrap";
import { useAuth } from "@/lib/useAuth";
import { authApi } from "@/lib/api";

export default function ChangePasswordPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu mới và xác nhận không khớp.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Mật khẩu mới ít nhất 6 ký tự.");
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
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="required">Mật khẩu hiện tại</Form.Label>
              <Form.Control
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="required">Mật khẩu mới</Form.Label>
              <Form.Control
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="required">
                Xác nhận mật khẩu mới
              </Form.Label>
              <Form.Control
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
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
