"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

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
    setLoading(false);
  }, []);

  const setToken = (t: string | null) => {
    setTokenState(t);
    if (t) localStorage.setItem("token", t);
    else localStorage.removeItem("token");
  };

  const login = async (tenDangNhap: string, matKhau: string) => {
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";
    const res = await fetch(`${base}/api/xac-thuc/dang-nhap`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenDangNhap, matKhau }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Đăng nhập thất bại");
    }
    const data = await res.json();
    setToken(data.token);
    const nd: NguoiDung = {
      tenDangNhap: data.tenDangNhap,
      hoTen: data.hoTen ?? "",
      cacVaiTro: data.cacVaiTro ? Array.from(data.cacVaiTro) : [],
      maNguoiDung: data.maNguoiDung,
    };
    setUser(nd);
    localStorage.setItem("user", JSON.stringify(nd));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, logout, setUser, setToken }}
    >
      {children}
    </AuthContext.Provider>
  );
}
