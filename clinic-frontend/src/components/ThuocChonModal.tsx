"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Form, ListGroup, Modal } from "react-bootstrap";
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

  useEffect(() => {
    if (show) setQuery("");
  }, [show]);

  const filtered = useMemo(
    () => thuocList.filter((t) => khopTimKiem(t, query)),
    [thuocList, query],
  );

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Label className="small text-muted">Tìm theo tên, hoạt chất, đơn vị, hàm lượng…</Form.Label>
        <Form.Control
          type="search"
          autoComplete="off"
          spellCheck={false}
          className="mb-2"
          placeholder="Gõ để lọc danh sách…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        <ListGroup
          variant="flush"
          className="border rounded thuoc-chon-modal__list"
          style={{ maxHeight: "min(55vh, 440px)", overflowY: "auto" }}
        >
          {filtered.length === 0 ? (
            <ListGroup.Item className="text-muted small py-3 text-center border-0">
              {thuocList.length === 0
                ? "Chưa có thuốc trong danh mục."
                : `Không có thuốc khớp “${query.trim()}”.`}
            </ListGroup.Item>
          ) : (
            filtered.map((t) => {
              const id = t.id!;
              const active = id === selectedId;
              return (
                <ListGroup.Item
                  key={id}
                  action
                  active={active}
                  className="py-2 px-3 border-bottom"
                  onClick={() => {
                    onSelect(id);
                    onHide();
                  }}
                >
                  <div className="fw-semibold">{nhanThuoc(t)}</div>
                  {t.hoatChat ? (
                    <div className="text-muted small mt-1">
                      {t.hoatChat}
                      {t.hamLuong ? ` · ${t.hamLuong}` : ""}
                      {t.hangSanXuat ? ` · ${t.hangSanXuat}` : ""}
                    </div>
                  ) : null}
                </ListGroup.Item>
              );
            })
          )}
        </ListGroup>
      </Modal.Body>
      <Modal.Footer className="clinic-modal-footer-actions">
        <Button type="button" variant="secondary" className="btn-modal-dismiss" onClick={onHide}>
          <i className="bi bi-x-lg me-2" aria-hidden />
          Đóng
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
