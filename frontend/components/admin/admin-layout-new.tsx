import { AdminSidebar } from './admin-sidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayoutNew({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0E0A14] via-[#1A0F2E] to-[#0E0A14]">
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}