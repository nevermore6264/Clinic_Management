"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Form, Button, Alert, InputGroup } from "react-bootstrap";
import { useAuth } from "@/lib/useAuth";
import {
  chatApi,
  type TinNhanChatDto,
  type NguoiDungChatEntry,
} from "@/lib/api";
import { LoadingState } from "@/components/LoadingState";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

function wsOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";
  return raw.replace(/\/?api\/?$/i, "") || raw;
}

export function dmTopicKey(a: number, b: number): string {
  return `${Math.min(a, b)}-${Math.max(a, b)}`;
}

function chuCaiDau(name?: string, fallback?: string): string {
  const s = (name?.trim() || fallback?.trim() || "?").slice(0, 2);
  return s.toUpperCase();
}

export default function ChatPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [contacts, setContacts] = useState<NguoiDungChatEntry[]>([]);
  const [contactQuery, setContactQuery] = useState("");
  const [peerId, setPeerId] = useState<number | null>(null);
  const [messages, setMessages] = useState<TinNhanChatDto[]>([]);
  const [loadingThread, setLoadingThread] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [connected, setConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<{ unsubscribe: () => void } | null>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!loading && !user) router.replace("/dang-nhap");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    chatApi
      .contacts()
      .then(setContacts)
      .catch((e) => setError(e.message));
  }, [user]);

  useEffect(() => {
    if (!user || peerId == null) {
      setMessages([]);
      return;
    }
    let cancelled = false;
    setLoadingThread(true);
    setError("");
    chatApi
      .layDoiThoai(peerId)
      .then((rows) => {
        if (!cancelled) setMessages(Array.isArray(rows) ? rows : []);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoadingThread(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user, peerId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (!user) return;
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;

    const client = new Client({
      webSocketFactory: () =>
        new SockJS(
          `${wsOrigin()}/ws?token=${encodeURIComponent(token)}`,
        ) as unknown as WebSocket,
      reconnectDelay: 4000,
      heartbeatIncoming: 15000,
      heartbeatOutgoing: 15000,
      onConnect: () => {
        setConnected(true);
        setError("");
      },
      onStompError: (frame) => {
        setError(frame.headers?.message || "Lỗi kết nối chat");
        setConnected(false);
      },
      onWebSocketClose: () => setConnected(false),
    });
    client.activate();
    clientRef.current = client;

    return () => {
      subRef.current?.unsubscribe();
      subRef.current = null;
      client.deactivate();
      clientRef.current = null;
      setConnected(false);
    };
  }, [user]);

  useEffect(() => {
    subRef.current?.unsubscribe();
    subRef.current = null;
    const client = clientRef.current;
    if (!client?.connected || !user || peerId == null) return;

    const topic = `/topic/dm/${dmTopicKey(user.maNguoiDung, peerId)}`;
    const sub = client.subscribe(topic, (msg) => {
      try {
        const body = JSON.parse(msg.body) as TinNhanChatDto;
        setMessages((prev) => {
          if (prev.some((p) => p.id === body.id)) return prev;
          return [...prev, body];
        });
      } catch {
        
      }
    });
    subRef.current = sub;
    return () => {
      sub.unsubscribe();
      subRef.current = null;
    };
  }, [user, peerId, connected]);

  const filteredContacts = useMemo(() => {
    const q = contactQuery.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter(
      (c) =>
        (c.hoTen ?? "").toLowerCase().includes(q) ||
        (c.tenDangNhap ?? "").toLowerCase().includes(q),
    );
  }, [contacts, contactQuery]);

  const peerLabel = useMemo(() => {
    if (peerId == null) return null;
    const c = contacts.find((x) => x.id === peerId);
    return c?.hoTen?.trim() || c?.tenDangNhap || `Người dùng #${peerId}`;
  }, [contacts, peerId]);

  const send = () => {
    const text = input.trim();
    if (!text || !clientRef.current?.connected || peerId == null) return;
    setError("");
    try {
      clientRef.current.publish({
        destination: "/app/tro-chuyen.send",
        body: JSON.stringify({ noiDung: text, maNguoiNhan: peerId }),
      });
      setInput("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gửi thất bại");
    }
  };

  if (loading) return <LoadingState />;
  if (!user) return null;

  return (
    <div className="chat-dm-app">
      <div className="chat-dm-app__header mb-3">
        <h2 className="h4 mb-1 fw-semibold">Tin nhắn</h2>
        <p className="text-muted small mb-0">
          Chat riêng 1–1 qua WebSocket (STOMP). Chọn người trong danh bạ nội bộ.
        </p>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <div className="chat-dm-app__shell row g-0">
        <aside className="chat-dm-app__sidebar col-12 col-md-4 col-lg-3 border-end">
          <div className="p-3 border-bottom bg-body">
            <InputGroup size="sm">
              <InputGroup.Text className="bg-transparent border-end-0">
                <i className="bi bi-search" aria-hidden />
              </InputGroup.Text>
              <Form.Control
                className="border-start-0"
                placeholder="Tìm theo tên hoặc đăng nhập…"
                value={contactQuery}
                onChange={(e) => setContactQuery(e.target.value)}
                aria-label="Tìm liên hệ"
              />
            </InputGroup>
            <div className="d-flex align-items-center gap-2 mt-2 small text-muted">
              <span
                className={`rounded-pill px-2 py-0 chat-dm-app__pill ${
                  connected ? "chat-dm-app__pill--on" : "chat-dm-app__pill--off"
                }`}
              >
                <i
                  className={`bi ${connected ? "bi-broadcast-pin" : "bi-cloud-slash"} me-1`}
                  aria-hidden
                />
                {connected ? "Realtime" : "Đang kết nối…"}
              </span>
            </div>
          </div>
          <div className="chat-dm-app__contact-list">
            {filteredContacts.length === 0 ? (
              <div className="p-4 text-muted small text-center">
                {contacts.length === 0
                  ? "Chưa có danh sách người dùng."
                  : "Không khớp tìm kiếm."}
              </div>
            ) : (
              filteredContacts.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`chat-dm-app__contact w-100 text-start border-0 ${
                    peerId === c.id ? "chat-dm-app__contact--active" : ""
                  }`}
                  onClick={() => setPeerId(c.id)}
                >
                  <span className="chat-dm-app__avatar">
                    {chuCaiDau(c.hoTen, c.tenDangNhap)}
                  </span>
                  <span className="chat-dm-app__contact-text">
                    <span className="chat-dm-app__contact-name">
                      {c.hoTen?.trim() || c.tenDangNhap}
                    </span>
                    <span className="chat-dm-app__contact-sub">
                      @{c.tenDangNhap}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>
        </aside>

        <section className="chat-dm-app__main col-12 col-md-8 col-lg-9 d-flex flex-column">
          <header className="chat-dm-app__thread-head px-3 py-3 border-bottom d-flex align-items-center gap-3">
            {peerId != null ? (
              <>
                <span className="chat-dm-app__avatar chat-dm-app__avatar--lg">
                  {chuCaiDau(
                    contacts.find((x) => x.id === peerId)?.hoTen,
                    contacts.find((x) => x.id === peerId)?.tenDangNhap,
                  )}
                </span>
                <div className="flex-grow-1 min-w-0">
                  <div className="fw-semibold text-truncate">{peerLabel}</div>
                  <div className="small text-muted text-truncate">
                    Chỉ hai người trong cuộc trò chuyện nhận tin realtime qua máy
                    chủ.
                  </div>
                </div>
              </>
            ) : (
              <div className="text-muted small">
                Chọn một liên hệ bên trái để bắt đầu.
              </div>
            )}
          </header>

          <div className="chat-dm-app__messages flex-grow-1">
            {peerId == null ? (
              <div className="chat-dm-app__empty d-flex flex-column align-items-center justify-content-center h-100 p-4 text-center">
                <div className="chat-dm-app__empty-icon mb-3">
                  <i className="bi bi-chat-heart" aria-hidden />
                </div>
                <p className="text-muted mb-0" style={{ maxWidth: "22rem" }}>
                  Trò chuyện riêng với từng đồng nghiệp — không còn phòng chat
                  chung.
                </p>
              </div>
            ) : loadingThread ? (
              <div className="d-flex justify-content-center align-items-center h-100 py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Đang tải…</span>
                </div>
              </div>
            ) : (
              <div className="chat-dm-app__msg-inner px-3 py-3">
                {messages.map((m) => {
                  const mine = m.maNguoiGui === user.maNguoiDung;
                  return (
                    <div
                      key={m.id}
                      className={`chat-dm-app__row ${mine ? "chat-dm-app__row--mine" : ""}`}
                    >
                      {!mine && (
                        <span className="chat-dm-app__bubble-avatar">
                          {chuCaiDau(m.tenNguoiGui)}
                        </span>
                      )}
                      <div className="chat-dm-app__bubble-wrap">
                        {!mine && (
                          <span className="chat-dm-app__bubble-meta">
                            {m.tenNguoiGui || "—"}
                          </span>
                        )}
                        <div
                          className={`chat-dm-app__bubble ${mine ? "chat-dm-app__bubble--mine" : ""}`}
                        >
                          {m.noiDung}
                        </div>
                        <span className="chat-dm-app__bubble-time">
                          {m.taoLuc
                            ? new Date(m.taoLuc).toLocaleString("vi-VN", {
                                day: "2-digit",
                                month: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : ""}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          <footer className="chat-dm-app__composer border-top p-3 bg-body">
            <Form
              className="d-flex gap-2 align-items-end"
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
            >
              <Form.Control
                as="textarea"
                rows={1}
                className="chat-dm-app__textarea"
                placeholder={
                  peerId == null
                    ? "Chọn người nhận…"
                    : connected
                      ? "Nhập tin nhắn…"
                      : "Đang kết nối…"
                }
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                disabled={!connected || peerId == null}
              />
              <Button
                type="submit"
                className="chat-dm-app__send-btn flex-shrink-0"
                disabled={!connected || peerId == null || !input.trim()}
              >
                <i className="bi bi-send-fill me-md-1" aria-hidden />
                <span className="d-none d-md-inline">Gửi</span>
              </Button>
            </Form>
          </footer>
        </section>
      </div>
    </div>
  );
}
