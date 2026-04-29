"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  Button,
  InputGroup,
  Form,
  Card,
  Pagination,
  Alert,
} from "react-bootstrap";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import { patientsApi, type BenhNhan } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { LoadingState } from "@/components/LoadingState";

export default function PatientsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [list, setList] = useState<BenhNhan[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const size = 10;

  useEffect(() => {
    if (!loading && !user) router.replace("/dang-nhap");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    patientsApi
      .list(page, size)
      .then((r) => {
        setList(r.content);
        setTotal(r.totalElements);
      })
      .catch((e) => setError(e.message));
  }, [user, page]);

  const handleSearch = () => {
    if (!search.trim()) return;
    patientsApi
      .search(search)
      .then(setList)
      .catch((e) => setError(e.message));
  };

  if (loading) return <LoadingState />;
  if (!user) return null;

  return (
    <div>
      <PageHeader
        title="Bệnh nhân"
        subtitle="Danh sách hồ sơ đang hoạt động. Tìm theo tên hoặc mở chi tiết để chỉnh sửa."
      >
        <Button as={Link} href="/benh-nhan/new" variant="primary" className="d-inline-flex align-items-center gap-2">
          <i className="bi bi-person-plus" aria-hidden />
          Thêm bệnh nhân
        </Button>
      </PageHeader>

      {error && (
        <Alert variant="danger" onClose={() => setError("")} dismissible>
          {error}
        </Alert>
      )}

      <Card className="mb-3 card--static border-0 shadow-sm">
        <Card.Body className="p-3">
          <InputGroup>
            <Form.Control
              placeholder="Tìm theo tên..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button variant="outline-primary" onClick={handleSearch}>
              Tìm
            </Button>
          </InputGroup>
        </Card.Body>
      </Card>

      <Card className="card--static border-0 shadow-sm overflow-hidden">
        <div className="table-responsive">
          <Table responsive hover className="mb-0 align-middle">
            <thead>
              <tr>
                <th>Họ tên</th>
                <th>Ngày sinh</th>
                <th>SĐT</th>
                <th>Địa chỉ</th>
                <th className="text-end">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id}>
                  <td className="fw-medium">{p.hoTen}</td>
                  <td>{p.ngaySinh || "—"}</td>
                  <td>{p.soDienThoai || "—"}</td>
                  <td className="text-muted small">{p.diaChi || "—"}</td>
                  <td className="text-end text-nowrap">
                    <Button
                      size="sm"
                      variant="primary"
                      as={Link}
                      href={`/benh-nhan/${p.id}`}
                      className="me-1 btn-action-edit"
                    >
                      <i className="bi bi-pencil me-1" />
                      Sửa
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      as={Link}
                      href={`/lich-hen?maBenhNhan=${p.id}`}
                    >
                      <i className="bi bi-calendar3 me-1" />
                      Lịch
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        {!search && total > size && (
          <Card.Footer className="bg-light border-top py-3">
            <Pagination className="mb-0 justify-content-center">
              <Pagination.Prev
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              />
              <Pagination.Item active>
                {page + 1} / {Math.ceil(total / size)}
              </Pagination.Item>
              <Pagination.Next
                disabled={page >= Math.ceil(total / size) - 1}
                onClick={() => setPage((p) => p + 1)}
              />
            </Pagination>
          </Card.Footer>
        )}
      </Card>
    </div>
  );
}
