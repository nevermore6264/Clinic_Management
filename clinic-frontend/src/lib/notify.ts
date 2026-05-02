"use client";

export type NotifyKind = "success" | "error" | "info" | "warning";

export type NotifyPayload = {
  id?: string;
  kind?: NotifyKind;
  title?: string;
  message: string;
  durationMs?: number;
};

type Listener = (payload: Required<NotifyPayload>) => void;

const listeners = new Set<Listener>();

const DEFAULT_DURATION_MS = 3500;

function randomId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function subscribeNotify(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function notify(payload: NotifyPayload) {
  const normalized: Required<NotifyPayload> = {
    id: payload.id ?? randomId(),
    kind: payload.kind ?? "info",
    title: payload.title ?? "",
    message: payload.message,
    durationMs: payload.durationMs ?? DEFAULT_DURATION_MS,
  };
  listeners.forEach((listener) => listener(normalized));
}

notify.success = (message: string, title = "Thành công") =>
  notify({ kind: "success", title, message });
notify.error = (message: string, title = "Thất bại") =>
  notify({ kind: "error", title, message, durationMs: 5000 });
notify.info = (message: string, title = "Thông báo") =>
  notify({ kind: "info", title, message });
notify.warning = (message: string, title = "Lưu ý") =>
  notify({ kind: "warning", title, message });

export const notifyMessageByMethod: Record<string, string> = {
  POST: "Tạo mới thành công",
  PUT: "Cập nhật thành công",
  PATCH: "Thao tác thành công",
  DELETE: "Xóa thành công",
};
