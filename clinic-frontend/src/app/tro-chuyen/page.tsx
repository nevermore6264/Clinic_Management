"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, Form, Button, Alert } from "react-bootstrap";
import { useAuth } from "@/lib/useAuth";
import { chatApi, type TinNhanChatDto } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { LoadingState } from "@/components/LoadingState";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const MA_PHONG = 1;
const WS_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";

export default function ChatPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<TinNhanChatDto[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [connected, setConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!loading && !user) router.replace("/dang-nhap");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    chatApi
      .layLichSu(MA_PHONG)
      .then(setMessages)
      .catch((e) => setError(e.message));
  }, [user]);

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
          `${WS_BASE}/ws?token=${encodeURIComponent(token)}`,
        ) as unknown as WebSocket,
      onConnect: () => {
        setConnected(true);
        setError("");
        client.subscribe(`/topic/room/${MA_PHONG}`, (msg) => {
          try {
            const body = JSON.parse(msg.body) as TinNhanChatDto;
            setMessages((prev) => [...prev, body]);
          } catch {
            
          }
        });
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

  const send = () => {
    const text = input.trim();
    if (!text || !clientRef.current?.connected) return;
    setError("");
    try {
      clientRef.current.publish({
        destination: "/app/tro-chuyen.send",
        body: JSON.stringify({ noiDung: text, maPhong: MA_PHONG }),
      });
      setInput("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gửi thất bại");
    }
  };

  if (loading) return <LoadingState />;
  if (!user) return null;

  return (
    <div>
      <PageHeader
        title="Chat nội bộ"
        subtitle="Trao đổi nhanh giữa nhân viên. Tin nhắn được đồng bộ theo thời gian thực."
      />
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      <Card className="card--static border-0 shadow-sm overflow-hidden">
        <Card.Header className="d-flex justify-content-between align-items-center py-3">
          <span className="d-flex align-items-center gap-2 fw-semibold">
            <i className="bi bi-hash" aria-hidden />
            Phòng {MA_PHONG}
          </span>
          <span
            className={`small d-inline-flex align-items-center gap-1 px-2 py-1 rounded-pill ${
              connected ? "bg-success-subtle text-success" : "bg-secondary-subtle text-secondary"
            }`}
          >
            <i className={`bi ${connected ? "bi-wifi" : "bi-wifi-off"}`} />
            {connected ? "Đã kết nối" : "Đang kết nối..."}
          </span>
        </Card.Header>
        <div
          style={{ height: 420, overflowY: "auto", padding: 16 }}
          className="bg-light"
        >
          {messages.map((m) => (
            <div
              key={m.id}
              className={`mb-2 ${m.maNguoiGui === user?.maNguoiDung ? "text-end" : ""}`}
            >
              <span className="small text-muted">{m.tenNguoiGui}</span>
              <div
                className={`d-inline-block p-2 rounded-3 shadow-sm ${
                  m.maNguoiGui === user?.maNguoiDung
                    ? "chat-bubble-me"
                    : "chat-bubble-other"
                }`}
                style={{ maxWidth: "80%" }}
              >
                {m.noiDung}
              </div>
              <div className="small text-muted">
                {m.taoLuc
                  ? new Date(m.taoLuc).toLocaleTimeString("vi-VN")
                  : ""}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <Card.Footer className="bg-white border-top py-3">
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="d-flex gap-2"
          >
            <Form.Control
              placeholder="Nhập tin nhắn..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              disabled={!connected}
            />
            <Button
              type="submit"
              variant="primary"
              disabled={!connected || !input.trim()}
            >
              Gửi
            </Button>
          </Form>
        </Card.Footer>
      </Card>
    </div>
  );
}
