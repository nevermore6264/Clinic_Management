"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingState } from "@/components/LoadingState";

export default function NewAppointmentRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/lich-hen?datLich=1");
  }, [router]);

  return <LoadingState />;
}
