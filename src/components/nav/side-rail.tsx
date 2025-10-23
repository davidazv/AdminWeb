/**
 * SideRail - Vertical navigation rail
 * Implements: Fixed left sidebar with circular pills, active state with lavender bg
 * Desktop: icons + labels (~88-104px width)
 * Mobile: collapses to icons only
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  CheckCircle,
  Bell,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/services";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/buscar", label: "Buscar", icon: Search },
  { href: "/aceptar", label: "Aceptar", icon: CheckCircle },
  { href: "/notificaciones", label: "Ayuda", icon: Bell },
];

export function SideRail() {
  const pathname = usePathname();
  const router = useRouter();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogout = () => {
    authApi.logout();
    router.push("/login");
  };

  return (
    <>
      <aside className="fixed left-0 top-0 z-40 h-screen w-24 border-r border-border bg-card lg:w-28">
        <nav className="flex h-full flex-col items-center gap-3 py-6">
          {/* Logo/Brand */}
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <span className="text-lg font-bold">PB</span>
          </div>

          {/* Nav Items */}
          <div className="flex flex-1 flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex flex-col items-center gap-1.5 rounded-2xl px-3 py-3 transition-colors hover:bg-accent lg:px-4",
                    isActive && "bg-accent text-accent-foreground"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 transition-colors",
                      isActive
                        ? "text-accent-foreground"
                        : "text-muted-foreground group-hover:text-accent-foreground"
                    )}
                  />
                  <span
                    className={cn(
                      "text-xs font-medium transition-colors",
                      isActive
                        ? "text-accent-foreground"
                        : "text-muted-foreground group-hover:text-accent-foreground"
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Logout Button */}
          <button
            onClick={() => setShowLogoutDialog(true)}
            className="group flex flex-col items-center gap-1.5 rounded-2xl px-3 py-3 transition-colors hover:bg-red-100 lg:px-4 bg-red-50 border border-red-200"
            aria-label="Cerrar sesión"
          >
            <LogOut className="h-5 w-5 text-red-600 transition-colors group-hover:text-red-700" />
            <span className="text-xs font-medium text-red-600 transition-colors group-hover:text-red-700">
              Salir
            </span>
          </button>
        </nav>
      </aside>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cerrar sesión</DialogTitle>
            <DialogDescription>
              Confirmar para cerrar sesión.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowLogoutDialog(false)}
              className="border-gray-300 hover:bg-gray-100"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleLogout}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Cerrar sesión
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
