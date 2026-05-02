"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { LoadingState } from "@/components/LoadingState";

/** Trang chi tiết cũ chuyển về danh sách và mở modal sửa. */
export default function BenhNhanIdRedirectPage() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    const raw = params?.id;
    const id = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : "";
    if (!id || !/^\d+$/.test(id)) {
      router.replace("/benh-nhan");
      return;
    }
    router.replace(`/benh-nhan?sua=${encodeURIComponent(id)}`);
  }, [params, router]);

  return <LoadingState />;
}
