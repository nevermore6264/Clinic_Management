"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { notify } from "@/lib/notify";

export interface NguoiDung {
  tenDangNhap: string;
  hoTen: string;
  cacVaiTro: string[];
  maNguoiDung: number;
}

interface AuthContextType {
  user: NguoiDung | null;
  token: string | null;
  loading: boolean;
  login: (tenDangNhap: string, matKhau: string) => Promise<void>;
  logout: () => void;
  setUser: (u: NguoiDung | null) => void;
  setToken: (t: string | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

/** Không hiển thị JSON/technical message cho người dùng khi đăng nhập sai. */
function thongBaoLoiDangNhap(body: string): string {
  const fallback = "Đăng nhập thất bại";
  const raw = body.trim();
  if (!raw) return fallback;
  try {
    const j = JSON.parse(raw) as { message?: string };
    if (j.message) {
      const m = j.message.toLowerCase();
      if (
        m.includes("bad credentials") ||
        m.includes("invalid user") ||
        m.includes("disabled") ||
        m.includes("locked")
      ) {
        return fallback;
      }
    }
  } catch {
    /* không phải JSON — lỗi mạng / text thuần */
  }
  if (raw.startsWith("{")) return fallback;
  const out = raw.length > 200 ? fallback : raw;
  return out.trim() || fallback;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<NguoiDung | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const t = localStorage.getItem("token");
      const u = localStorage.getItem("user");
      if (t && u) {
        setTokenState(t);
        try {
          setUser(JSON.parse(u));
        } catch {
          localStorage.removeItem("user");
          localStorage.removeItem("token");
        }
      }
    } catch {
      /* localStorage có thể throw (private mode, chặn cookie…) */
    } finally {
      setLoading(false);
    }
  }, []);

  const setToken = (t: string | null) => {
    setTokenState(t);
    if (t) localStorage.setItem("token", t);
    else localStorage.removeItem("token");
  };

  const login = useCallback(async (tenDangNhap: string, matKhau: string) => {
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";
    let res: Response;
    try {
      res = await fetch(`${base}/api/xac-thuc/dang-nhap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenDangNhap, matKhau }),
      });
    } catch {
      const msg =
        "Không kết nối được máy chủ. Kiểm tra backend đang chạy và địa chỉ API.";
      notify.error(msg);
      throw new Error(msg);
    }
    if (!res.ok) {
      const text = await res.text();
      const thongBao = thongBaoLoiDangNhap(text);
      notify.error(thongBao);
      throw new Error(thongBao);
    }
    let data: Record<string, unknown>;
    try {
      data = await res.json();
    } catch {
      const msg = "Phản hồi đăng nhập không hợp lệ.";
      notify.error(msg);
      throw new Error(msg);
    }
    const token = data.token;
    if (typeof token !== "string" || !token.trim()) {
      const msg = "Phản hồi đăng nhập thiếu token.";
      notify.error(msg);
      throw new Error(msg);
    }
    setToken(token);
    const vt = data.cacVaiTro;
    const nd: NguoiDung = {
      tenDangNhap:
        typeof data.tenDangNhap === "string" ? data.tenDangNhap : tenDangNhap,
      hoTen: typeof data.hoTen === "string" ? data.hoTen : "",
      cacVaiTro: vt != null ? Array.from(vt as Iterable<string>) : [],
      maNguoiDung:
        typeof data.maNguoiDung === "number"
          ? data.maNguoiDung
          : typeof data.maNguoiDung === "string"
            ? Number(data.maNguoiDung) || 0
            : 0,
    };
    setUser(nd);
    localStorage.setItem("user", JSON.stringify(nd));
    notify.success("Đăng nhập thành công");
  }, []);

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    notify.info("Bạn đã đăng xuất");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, logout, setUser, setToken }}
    >
      {children}
    </AuthContext.Provider>
  );
}
