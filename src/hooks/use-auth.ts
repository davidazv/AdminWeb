/**
 * useAuth hook - Authentication state and actions
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/services";
import { User } from "@/lib/dto";

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

  const logout = () => {
    authApi.logout();
    setUser(null);
    router.push("/login");
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    logout,
  };
}
