"use client";

import {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
  type ChangeEvent,
} from "react";
import { useRouter } from "next/navigation";
import { Form, Button, Alert, Dropdown, Spinner } from "react-bootstrap";
import { useAuth } from "@/lib/useAuth";
import {
  API_BASE,
  chatApi,
  type TinNhanChatDto,
  type NguoiDungChatEntry,
  type TroChuyenTaiLenResponse,
} from "@/lib/api";
import { LoadingState } from "@/components/LoadingState";
import { ChatGeneratedAvatar } from "@/components/ChatGeneratedAvatar";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

function wsOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";
  return raw.replace(/\/?api\/?$/i, "") || raw;
}

export function dmTopicKey(a: number, b: number): string {
  return `${Math.min(a, b)}-${Math.max(a, b)}`;
}

const EMOJI_NHANH: string[] = [
  "😀", "😃", "😄", "😁", "😅", "🤣", "🥰", "😘", "🤔", "😮", "👍", "👎", "🙏", "👏", "🎉", "✨", "❤️", "💙", "✅", "❌", "📌", "📎", "💊", "🏥", "☕", "🙋", "💪",
];

function useAuthMediaUrl(path: string | undefined) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!path) {
      setUrl(null);
      return;
    }
    let blobUrl: string | null = null;
    let cancelled = false;
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const full = `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
    fetch(full, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.blob();
      })
      .then((b) => {
        if (cancelled) return;
        blobUrl = URL.createObjectURL(b);
        setUrl(blobUrl);
      })
      .catch(() => setUrl(null));
    return () => {
      cancelled = true;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [path]);
  return url;
}

function ChatDmFileBlock({ m, mine }: { m: TinNhanChatDto; mine: boolean }) {
  const p = m.dinhKemDuongDan;
  const mediaUrl = useAuthMediaUrl(p);
  const isImg = (m.dinhKemLoai ?? "").startsWith("image/");

  if (!p) return null;

  if (isImg) {
    if (!mediaUrl) {
      return (
        <div className="chat-dm-app__attach-skeleton text-muted small py-2">
          <Spinner animation="border" size="sm" className="me-2" />
          Đang tải ảnh…
        </div>
      );
    }
    return (
      <a
        href={mediaUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="chat-dm-app__attach-img-link d-inline-block"
      >
        <img
          src={mediaUrl}
          alt={m.dinhKemTen || "Ảnh"}
          className="chat-dm-app__attach-img"
        />
      </a>
    );
  }

  if (!mediaUrl) {
    return (
      <div className="chat-dm-app__attach-loading small text-muted py-1">
        <Spinner animation="border" size="sm" className="me-2" />
        {m.dinhKemTen || "Tệp"}…
      </div>
    );
  }

  return (
    <a
      href={mediaUrl}
      download={m.dinhKemTen ?? undefined}
      target="_blank"
      rel="noopener noreferrer"
      className={`chat-dm-app__attach-file d-flex align-items-center gap-2 ${
        mine ? "chat-dm-app__attach-file--mine" : ""
      }`}
    >
      <i className="bi bi-file-earmark-text fs-4" aria-hidden />
      <span className="text-truncate" style={{ maxWidth: "12rem" }}>
        {m.dinhKemTen || "Tệp đính kèm"}
      </span>
      <i className="bi bi-box-arrow-up-right small" aria-hidden />
    </a>
  );
}

/** Ẩn dòng “📎 tên file” trùng với khối đính kèm (backend tự tạo khi không có chú thích). */
function showCaptionDm(m: TinNhanChatDto): boolean {
  const t = (m.noiDung ?? "").trim();
  if (!t) return false;
  if (!m.dinhKemDuongDan) return true;
  const fn = (m.dinhKemTen ?? "").trim();
  const auto = fn ? `📎 ${fn}` : "📎 Tệp";
  return t !== auto;
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
  /** Tin đến chưa đọc theo mã người đối thoại (chỉ khi không đang mở hội thoại đó). */
  const [unreadByPeer, setUnreadByPeer] = useState<Record<number, number>>(
    {},
  );
  const clientRef = useRef<Client | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const peerIdRef = useRef<number | null>(null);
  peerIdRef.current = peerId;
  const [pendingAttach, setPendingAttach] =
    useState<TroChuyenTaiLenResponse | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);

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
      client.deactivate();
      clientRef.current = null;
      setConnected(false);
    };
  }, [user]);

  /** Đăng ký mọi kênh DM với từng liên hệ để nhận tin realtime và badge chưa đọc. */
  useEffect(() => {
    const client = clientRef.current;
    if (!client?.connected || !user || contacts.length === 0) return;

    const unsubs: { unsubscribe: () => void }[] = [];

    for (const contact of contacts) {
      const peerForTopic = contact.id;
      const topic = `/topic/dm/${dmTopicKey(user.maNguoiDung, peerForTopic)}`;
      const sub = client.subscribe(topic, (msg) => {
        try {
          const body = JSON.parse(msg.body) as TinNhanChatDto;
          const viewing = peerIdRef.current === peerForTopic;
          setMessages((prev) => {
            if (!viewing) return prev;
            if (prev.some((p) => p.id === body.id)) return prev;
            return [...prev, body];
          });
          const incoming = body.maNguoiGui !== user.maNguoiDung;
          if (incoming && !viewing) {
            setUnreadByPeer((u) => ({
              ...u,
              [peerForTopic]: (u[peerForTopic] ?? 0) + 1,
            }));
          }
        } catch {
          
        }
      });
      unsubs.push(sub);
    }

    return () => {
      unsubs.forEach((s) => s.unsubscribe());
    };
  }, [user, contacts, connected]);

  /** Khi chọn hội thoại, xóa số tin chưa đọc của người đó. */
  useEffect(() => {
    if (peerId == null) return;
    setUnreadByPeer((u) => {
      if (u[peerId] == null || u[peerId] === 0) return u;
      const next = { ...u };
      delete next[peerId];
      return next;
    });
  }, [peerId]);

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

  const insertEmoji = useCallback((emoji: string) => {
    const el = textareaRef.current;
    if (!el) {
      setInput((v) => v + emoji);
      return;
    }
    const start = el.selectionStart ?? input.length;
    const end = el.selectionEnd ?? input.length;
    const next = input.slice(0, start) + emoji + input.slice(end);
    setInput(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + emoji.length;
      el.setSelectionRange(pos, pos);
    });
  }, [input]);

  const send = () => {
    const text = input.trim();
    const hasAttach = Boolean(pendingAttach?.duongDan);
    if (
      (!text && !hasAttach) ||
      !clientRef.current?.connected ||
      peerId == null
    )
      return;
    setError("");
    try {
      const payload: Record<string, string | number> = {
        maNguoiNhan: peerId,
      };
      if (text) payload.noiDung = text;
      if (pendingAttach) {
        payload.dinhKemDuongDan = pendingAttach.duongDan;
        payload.dinhKemTen = pendingAttach.tenHienThi;
        payload.dinhKemLoai = pendingAttach.loaiMime;
      }
      clientRef.current.publish({
        destination: "/app/tro-chuyen.send",
        body: JSON.stringify(payload),
      });
      setInput("");
      setPendingAttach(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gửi thất bại");
    }
  };

  const onPickFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f || peerId == null) return;
    setUploadingFile(true);
    setError("");
    try {
      const res = await chatApi.uploadFile(f);
      setPendingAttach(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tải tệp lên thất bại");
    } finally {
      setUploadingFile(false);
    }
  };

  if (loading) return <LoadingState />;
  if (!user) return null;

  return (
    <div className="chat-dm-app">
      <div className="chat-dm-app__header mb-3">
        <h2 className="h4 mb-1 fw-semibold">Tin nhắn</h2>
        <p className="text-muted small mb-0">
          Trò chuyện riêng với đồng nghiệp trong hệ thống — chọn người trong danh
          bạ bên trái để bắt đầu.
        </p>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <div className="chat-dm-app__shell row g-0">
        <aside className="chat-dm-app__sidebar col-12 col-md-4 col-lg-3 border-end">
          <div className="p-3 border-bottom bg-body chat-dm-app__sidebar-head">
            <div className="d-flex flex-wrap align-items-center gap-2">
              <div
                className="chat-dm-app__search flex-grow-1 min-w-0"
                role="search"
              >
                <i
                  className="bi bi-search chat-dm-app__search-icon"
                  aria-hidden
                />
                <Form.Control
                  className="chat-dm-app__search-input"
                  size="sm"
                  placeholder="Tìm theo tên hoặc đăng nhập…"
                  value={contactQuery}
                  onChange={(e) => setContactQuery(e.target.value)}
                  aria-label="Tìm liên hệ"
                />
              </div>
              <span
                className={`chat-dm-app__conn chat-dm-app__conn--${
                  connected ? "on" : "off"
                } flex-shrink-0`}
              >
                <span className="chat-dm-app__conn-dot" aria-hidden />
                {connected ? "Trực tiếp" : "Đang nối…"}
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
              filteredContacts.map((c) => {
                const unread = unreadByPeer[c.id] ?? 0;
                const active = peerId === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    className={`chat-dm-app__contact w-100 text-start border-0 ${
                      active ? "chat-dm-app__contact--active" : ""
                    }`}
                    onClick={() => setPeerId(c.id)}
                  >
                    <ChatGeneratedAvatar
                      userId={c.id}
                      hoTen={c.hoTen}
                      tenDangNhap={c.tenDangNhap}
                      className="chat-dm-app__avatar"
                    />
                    <span className="chat-dm-app__contact-text">
                      <span className="chat-dm-app__contact-name-row">
                        <span
                          className={`chat-dm-app__contact-name ${
                            active ? "chat-dm-app__contact-name--active" : ""
                          }`}
                        >
                          {c.hoTen?.trim() || c.tenDangNhap}
                        </span>
                        {unread > 0 ? (
                          <span className="chat-dm-app__unread" title={`${unread} tin chưa đọc`}>
                            {unread > 99 ? "99+" : unread}
                          </span>
                        ) : null}
                      </span>
                      <span className="chat-dm-app__contact-sub">
                        @{c.tenDangNhap}
                      </span>
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <section className="chat-dm-app__main col-12 col-md-8 col-lg-9 d-flex flex-column">
          <header className="chat-dm-app__thread-head px-3 py-3 border-bottom d-flex align-items-center gap-3">
            {peerId != null ? (
              <>
                <ChatGeneratedAvatar
                  userId={peerId}
                  hoTen={contacts.find((x) => x.id === peerId)?.hoTen}
                  tenDangNhap={
                    contacts.find((x) => x.id === peerId)?.tenDangNhap
                  }
                  className="chat-dm-app__avatar chat-dm-app__avatar--lg"
                />
                <div className="flex-grow-1 min-w-0">
                  <div className="fw-bold text-truncate">{peerLabel}</div>
                  <div className="small text-muted text-truncate">
                    Tin nhắn chỉ hiển thị trong cuộc trò chuyện này.
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
                        <ChatGeneratedAvatar
                          userId={m.maNguoiGui}
                          hoTen={m.tenNguoiGui}
                          className="chat-dm-app__bubble-avatar"
                        />
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
                          {m.dinhKemDuongDan ? (
                            <ChatDmFileBlock m={m} mine={mine} />
                          ) : null}
                          {showCaptionDm(m) ? (
                            <div className="chat-dm-app__bubble-text">{m.noiDung}</div>
                          ) : null}
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
            <input
              ref={fileInputRef}
              type="file"
              className="d-none"
              accept="image/*,.pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={onPickFile}
            />
            <div className="chat-dm-app__composer-toolbar d-flex flex-wrap align-items-center gap-2 mb-2">
              <div className="chat-dm-app__tool-strip d-inline-flex align-items-stretch">
                <Dropdown drop="up">
                  <Dropdown.Toggle
                    variant="light"
                    id="chat-emoji-dd"
                    className="chat-dm-app__tool-btn chat-dm-app__tool-btn--first"
                    disabled={!connected || peerId == null}
                  >
                    <span className="chat-dm-app__tool-emoji" aria-hidden>
                      😊
                    </span>
                    <span className="visually-hidden">Chèn emoji</span>
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="chat-dm-app__emoji-menu shadow-lg border-0 p-2 rounded-4">
                    <div className="chat-dm-app__emoji-grid">
                      {EMOJI_NHANH.map((em) => (
                        <button
                          key={em}
                          type="button"
                          className="chat-dm-app__emoji-cell"
                          onClick={() => insertEmoji(em)}
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  </Dropdown.Menu>
              </Dropdown>
                <Button
                  type="button"
                  variant="light"
                  className="chat-dm-app__tool-btn chat-dm-app__tool-btn--last d-inline-flex align-items-center justify-content-center gap-2"
                  disabled={
                    !connected || peerId == null || uploadingFile
                  }
                  onClick={() => fileInputRef.current?.click()}
                  title="Đính kèm ảnh, PDF hoặc Word (tối đa 15 MB)"
                >
                  {uploadingFile ? (
                    <Spinner
                      animation="border"
                      size="sm"
                      className="chat-dm-app__tool-spinner"
                    />
                  ) : (
                    <i className="bi bi-paperclip fs-5" aria-hidden />
                  )}
                  <span className="chat-dm-app__tool-label">Đính kèm</span>
                </Button>
              </div>
              {pendingAttach ? (
                <span className="chat-dm-app__pending-file small d-inline-flex align-items-center gap-2">
                  <i className="bi bi-file-earmark-check text-success" aria-hidden />
                  <span className="text-truncate" style={{ maxWidth: "10rem" }}>
                    {pendingAttach.tenHienThi}
                  </span>
                  <button
                    type="button"
                    className="btn btn-link btn-sm text-danger p-0"
                    onClick={() => setPendingAttach(null)}
                    aria-label="Bỏ tệp"
                  >
                    <i className="bi bi-x-lg" aria-hidden />
                  </button>
                </span>
              ) : null}
            </div>
            <Form
              className="d-flex gap-2 align-items-end"
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
            >
              <Form.Control
                ref={textareaRef}
                as="textarea"
                rows={1}
                className="chat-dm-app__textarea"
                placeholder={
                  peerId == null
                    ? "Chọn người nhận…"
                    : connected
                      ? "Nhập tin nhắn (emoji & tệp đính kèm)…"
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
                disabled={
                  !connected ||
                  peerId == null ||
                  (!input.trim() && !pendingAttach)
                }
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
