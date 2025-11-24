"use client";

import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopbar } from "@/components/admin/topbar";

type AdminShellProps = {
  children: ReactNode;
  onLogout?: () => void;
};

export function AdminShell({ children, onLogout }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0d0715] bg-[radial-gradient(circle_at_top,var(--color-accent)/18%,transparent_55%)] text-ink">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 pb-10 pt-6 lg:flex-row lg:px-8">
        <AdminSidebar activePath={pathname ?? ""} />
        <main className="flex-1">
          <div className="flex flex-col gap-6">
            <AdminTopbar
              onLogout={() => {
                onLogout?.();
                router.push("/admin/login");
              }}
            />
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex-1 rounded-[2.5rem] border border-white/10 bg-[rgba(24,19,34,0.8)] p-8 shadow-[0_50px_120px_-60px_rgba(10,8,20,0.7)] backdrop-blur-xl"
            >
              {children}
            </motion.section>
          </div>
        </main>
      </div>
    </div>
  );
}
