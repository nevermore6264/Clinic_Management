"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingState } from "@/components/LoadingState";

/** Đặt lịch mở modal trên /lich-hen — giữ URL này để đồng bộ bookmark / liên kết cũ. */
export default function NewAppointmentRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/lich-hen?datLich=1");
  }, [router]);

  return <LoadingState />;
}
