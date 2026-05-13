"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Badge, Button, Form, InputGroup, ListGroup, Modal } from "react-bootstrap";
import type { Thuoc } from "@/lib/api";

function nhanThuoc(t: Thuoc): string {
  const base = t.tenThuoc?.trim() || "";
  const dv = t.donVi?.trim();
  return dv ? `${base} (${dv})` : base;
}

function khopTimKiem(t: Thuoc, q: string): boolean {
  const raw = q.trim().toLowerCase();
  if (!raw) return true;
  const haystack = [
    t.tenThuoc,
    t.donVi,
    t.hoatChat,
    t.hamLuong,
    t.dangBaoChe,
    t.hangSanXuat,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const tokens = raw.split(/\s+/).filter(Boolean);
  return tokens.every((tok) => haystack.includes(tok));
}

function badgeMeta(t: Thuoc): { key: string; label: string }[] {
  const out: { key: string; label: string }[] = [];
  if (t.donVi?.trim()) out.push({ key: "dv", label: t.donVi.trim() });
  if (t.hamLuong?.trim()) out.push({ key: "hl", label: t.hamLuong.trim() });
  if (t.dangBaoChe?.trim()) out.push({ key: "dbc", label: t.dangBaoChe.trim() });
  if (t.duongDung?.trim()) out.push({ key: "dd", label: t.duongDung.trim() });
  if (t.hangSanXuat?.trim()) out.push({ key: "hsx", label: t.hangSanXuat.trim() });
  if (t.nuocSanXuat?.trim()) out.push({ key: "nsx", label: t.nuocSanXuat.trim() });
  return out;
}

export interface ThuocChonModalProps {
  show: boolean;
  onHide: () => void;
  thuocList: Thuoc[];
  selectedId: number;
  onSelect: (maThuoc: number) => void;
  title?: string;
}

export function ThuocChonModal({
  show,
  onHide,
  thuocList,
  selectedId,
  onSelect,
  title = "Chọn thuốc",
}: ThuocChonModalProps) {
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (show) {
      setQuery("");
      const t = window.setTimeout(() => searchRef.current?.focus(), 120);
      return () => window.clearTimeout(t);
    }
  }, [show]);

  const filtered = useMemo(
    () => thuocList.filter((t) => khopTimKiem(t, query)),
    [thuocList, query],
  );

  const dangChon = useMemo(
    () => thuocList.find((t) => t.id === selectedId),
    [thuocList, selectedId],
  );

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      contentClassName="thuoc-chon-modal"
      dialogClassName="thuoc-chon-modal-dialog"
    >
      <Modal.Header closeButton className="align-items-start">
        <div className="d-flex gap-3 w-100 pe-2">
          <div className="thuoc-chon-modal__head-icon" aria-hidden>
            <i className="bi bi-capsule-pill" />
          </div>
          <div className="flex-grow-1 min-w-0">
            <Modal.Title as="h2" className="thuoc-chon-modal__title mb-0">
              {title}
            </Modal.Title>
            <p className="thuoc-chon-modal__subtitle mb-0">
              Tìm nhanh theo tên, hoạt chất, đơn vị, hàm lượng hoặc nhà sản xuất — chọn một dòng để
              áp dụng cho đơn.
            </p>
          </div>
        </div>
      </Modal.Header>
      <Modal.Body className="pt-3">
        <div className="thuoc-chon-modal__toolbar">
          <span className="thuoc-chon-modal__stat">
            Hiển thị <strong>{filtered.length}</strong> / {thuocList.length} mục
          </span>
          {dangChon ? (
            <span className="thuoc-chon-modal__pill-current">
              <i className="bi bi-check2-circle me-1" aria-hidden />
              Đang gán: {nhanThuoc(dangChon)}
            </span>
          ) : null}
        </div>
        <InputGroup className="thuoc-chon-modal__search-wrap mb-2">
          <InputGroup.Text id="thuoc-chon-modal-search">
            <i className="bi bi-search" aria-hidden />
          </InputGroup.Text>
          <Form.Control
            ref={searchRef}
            type="search"
            autoComplete="off"
            spellCheck={false}
            placeholder="Ví dụ: paracet, amox, viên, 500mg…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-labelledby="thuoc-chon-modal-search"
          />
          {query ? (
            <Button
              type="button"
              variant="outline-secondary"
              title="Xóa từ khóa"
              onClick={() => setQuery("")}
              className="thuoc-chon-modal__search-clear"
            >
              <i className="bi bi-x-lg" aria-hidden />
            </Button>
          ) : null}
        </InputGroup>

        <ListGroup
          variant="flush"
          className="thuoc-chon-modal__list"
          style={{ maxHeight: "min(52vh, 400px)", overflowY: "auto" }}
          role="listbox"
          aria-label="Danh sách thuốc"
        >
          {filtered.length === 0 ? (
            <ListGroup.Item className="thuoc-chon-modal__empty border-0">
              <div className="thuoc-chon-modal__empty-icon" aria-hidden>
                <i className="bi bi-inbox" />
              </div>
              <div className="thuoc-chon-modal__empty-title">
                {thuocList.length === 0 ? "Chưa có thuốc trong danh mục" : "Không tìm thấy kết quả"}
              </div>
              <p className="thuoc-chon-modal__empty-hint mb-0">
                {thuocList.length === 0
                  ? "Vui lòng thêm thuốc tại mục Danh mục thuốc trước khi lập đơn."
                  : `Không có thuốc khớp “${query.trim()}”. Thử bớt từ khóa hoặc tìm theo hoạt chất.`}
              </p>
            </ListGroup.Item>
          ) : (
            filtered.map((t) => {
              const id = t.id!;
              const current = id === selectedId;
              const badges = badgeMeta(t);
              return (
                <ListGroup.Item
                  key={id}
                  role="option"
                  aria-selected={current}
                  className={`thuoc-chon-modal__row${current ? " thuoc-chon-modal__row--current" : ""}`}
                  onClick={() => {
                    onSelect(id);
                    onHide();
                  }}
                >
                  <div className="thuoc-chon-modal__row-main">
                    <div className="thuoc-chon-modal__row-icon" aria-hidden>
                      <i className="bi bi-capsule" />
                    </div>
                    <div className="flex-grow-1 min-w-0">
                      <div className="thuoc-chon-modal__row-title">{t.tenThuoc?.trim() || "—"}</div>
                      {badges.length > 0 ? (
                        <div className="thuoc-chon-modal__badges">
                          {badges.map((b) => (
                            <Badge
                              key={b.key}
                              bg="light"
                              text="dark"
                              className="border border-secondary-subtle fw-semibold"
                            >
                              {b.label}
                            </Badge>
                          ))}
                        </div>
                      ) : null}
                      {t.hoatChat?.trim() ? (
                        <div className="thuoc-chon-modal__meta">
                          <span className="text-secondary fw-semibold">Hoạt chất: </span>
                          {t.hoatChat.trim()}
                        </div>
                      ) : null}
                      {t.chiDinh?.trim() ? (
                        <div className="thuoc-chon-modal__meta text-truncate" title={t.chiDinh}>
                          <span className="text-secondary fw-semibold">Chỉ định: </span>
                          {t.chiDinh.trim()}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </ListGroup.Item>
              );
            })
          )}
        </ListGroup>
      </Modal.Body>
      <Modal.Footer className="clinic-modal-footer-actions justify-content-between flex-wrap gap-2">
        <span className="small text-muted">
          <i className="bi bi-hand-index-thumb me-1" aria-hidden />
          Nhấp một dòng để chọn và đóng cửa sổ.
        </span>
        <Button type="button" variant="secondary" className="btn-modal-dismiss" onClick={onHide}>
          <i className="bi bi-x-lg me-2" aria-hidden />
          Đóng
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
