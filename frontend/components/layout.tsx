import { Navbar } from './navbar';
import { Footer } from './footer';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}