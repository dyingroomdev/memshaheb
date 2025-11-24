"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAdminAuth } from "@/contexts/admin-auth-context";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !token) {
      router.replace("/admin/login");
    }
  }, [token, loading, router]);

  if (!token) {
    return null;
  }

  return <>{children}</>;
}
