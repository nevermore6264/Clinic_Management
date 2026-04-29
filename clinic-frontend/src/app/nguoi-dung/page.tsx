"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Table, Button, Form, Alert, Modal } from "react-bootstrap";
import { useAuth } from "@/lib/useAuth";
import { usersApi, type ThongTinNguoiDungDto } from "@/lib/api";

const ROLES = ["QUAN_TRI", "LE_TAN", "BAC_SI", "THU_NGAN", "BENH_NHAN"];

const ROLE_LABELS: Record<string, string> = {
  QUAN_TRI: "Quản trị",
  LE_TAN: "Lễ tân",
  BAC_SI: "Bác sĩ",
  THU_NGAN: "Thu ngân",
  BENH_NHAN: "Bệnh nhân",
};

const ROLE_BADGE_CLASS: Record<string, string> = {
  QUAN_TRI: "user-role-tag--admin",
  LE_TAN: "user-role-tag--reception",
  BAC_SI: "user-role-tag--doctor",
  THU_NGAN: "user-role-tag--cashier",
  BENH_NHAN: "user-role-tag--patient",
};

export default function UsersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [list, setList] = useState<ThongTinNguoiDungDto[]>([]);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    username: "",
    password: "",
    fullName: "",
    roles: ["LE_TAN"] as string[],
  });

  useEffect(() => {
    if (!loading && !user) router.replace("/dang-nhap");
    if (user && !user.cacVaiTro.includes("QUAN_TRI")) router.replace("/bang-dieu-khien");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user?.cacVaiTro.includes("QUAN_TRI")) return;
    usersApi
      .list()
      .then(setList)
      .catch((e) => setError(e.message));
  }, [user]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await usersApi.create({
        username: createForm.username,
        password: createForm.password,
        fullName: createForm.fullName || undefined,
        roles: createForm.roles,
      });
      usersApi.list().then(setList);
      setShowCreate(false);
      setCreateForm({
        username: "",
        password: "",
        fullName: "",
        roles: ["LE_TAN"],
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Lỗi");
    }
  };

  const toggleRole = (role: string) => {
    setCreateForm((f) => ({
      ...f,
      roles: f.roles.includes(role)
        ? f.roles.filter((r) => r !== role)
        : [...f.roles, role],
    }));
  };

  if (!user?.cacVaiTro.includes("QUAN_TRI")) return null;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Quản lý tài khoản</h2>
        <Button variant="primary" onClick={() => setShowCreate(true)}>
          Tạo tài khoản
        </Button>
      </div>
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      <Card>
        <Table responsive hover className="mb-0">
          <thead>
            <tr>
              <th>Tên đăng nhập</th>
              <th>Họ tên</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {list.map((u) => (
              <tr key={u.id}>
                <td>{u.tenDangNhap}</td>
                <td>{u.hoTen || "—"}</td>
                <td>
                  <div className="d-flex flex-wrap gap-1">
                    {u.cacVaiTro?.map((role) => (
                      <span
                        key={`${u.id}-${role}`}
                        className={`user-role-tag ${ROLE_BADGE_CLASS[role] ?? ""}`}
                      >
                        {ROLE_LABELS[role] ?? role}
                      </span>
                    ))}
                  </div>
                </td>
                <td>
                  <span
                    className={`user-status-tag ${
                      u.hoatDong ? "user-status-tag--active" : "user-status-tag--inactive"
                    }`}
                  >
                    {u.hoatDong ? "Hoạt động" : "Ẩn"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Modal show={showCreate} onHide={() => setShowCreate(false)}>
        <Modal.Header closeButton>Tạo tài khoản</Modal.Header>
        <Form onSubmit={handleCreate}>
          <Modal.Body>
            <Form.Group className="mb-2">
              <Form.Label className="required">Tên đăng nhập</Form.Label>
              <Form.Control
                value={createForm.username}
                onChange={(e) =>
                  setCreateForm({ ...createForm, username: e.target.value })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label className="required">Mật khẩu</Form.Label>
              <Form.Control
                type="password"
                value={createForm.password}
                onChange={(e) =>
                  setCreateForm({ ...createForm, password: e.target.value })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Họ tên</Form.Label>
              <Form.Control
                value={createForm.fullName}
                onChange={(e) =>
                  setCreateForm({ ...createForm, fullName: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Vai trò</Form.Label>
              <div className="d-flex flex-wrap gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    className={`role-chip ${createForm.roles.includes(r) ? "role-chip--active" : ""}`}
                    onClick={() => toggleRole(r)}
                    aria-pressed={createForm.roles.includes(r)}
                  >
                    {ROLE_LABELS[r] ?? r}
                  </button>
                ))}
              </div>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreate(false)}>
              Hủy
            </Button>
            <Button variant="primary" type="submit">
              Tạo
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
