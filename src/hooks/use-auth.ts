/**
 * useAuth hook - Authentication state and actions
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/services";
import { User } from "@/lib/dto";
import { isValidRedirectUrl } from "@/lib/security-utils";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userStr = authApi.getUser();
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch {
        authApi.logout();
      }
    }
    setIsLoading(false);
  }, []);

  const logout = (redirectUrl?: string) => {
    authApi.logout();
    setUser(null);
    
    // Validar URL de redirección para prevenir open redirects
    const targetUrl = redirectUrl && typeof window !== 'undefined' 
      ? (isValidRedirectUrl(redirectUrl, window.location.hostname) ? redirectUrl : "/login")
      : "/login";
    
    router.push(targetUrl);
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    logout,
  };
}
