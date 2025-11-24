'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

import { API_BASE_URL } from '@/lib/config';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        if (!token) {
          router.push('/admin/login');
          return;
        }

        // Verify token with backend
        const response = await fetch(`${API_BASE_URL}/auth/verify`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('admin_token');
          router.push('/admin/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/admin/login');
      }
    };

    checkAuth();
  }, [router]);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0E0A14] via-[#1A0F2E] to-[#0E0A14] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="h-8 w-8 animate-spin text-accent mx-auto mb-4" />
          <p className="text-muted">Authenticating...</p>
        </motion.div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
}
