'use client';

import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProtectedProps {
  children: React.ReactNode;
}

/**
 * Protected Route Wrapper
 * Ensures user is authenticated before rendering protected content
 * Redirects to login if no valid token
 */
export default function Protected({ children }: ProtectedProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get('token');

    if (!token) {
      router.push('/login');
      return;
    }

    try {
      // Validate token structure (JWT format)
      const parts = token.split('.');
      if (parts.length !== 3) {
        Cookies.remove('token');
        router.push('/login');
        return;
      }

      setIsAuthenticated(true);
    } catch (error) {
      Cookies.remove('token');
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loader"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
