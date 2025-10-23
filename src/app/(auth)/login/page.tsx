/**
 * Login Page - /login
 * Implementa: Tarjeta centrada, título "PhishBlock", campos email/password, botón negro
 * Fondo lavanda pálido, tarjeta con borde lavanda grisáceo
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";
import { authApi } from "@/lib/services";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(10, "La contraseña debe tener al menos 10 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(data);
      authApi.setToken(response.access_token);
      authApi.setUser(JSON.stringify(response.user));
      toast.success("Sesión iniciada correctamente");
      router.push("/dashboard");
    } catch (error: any) {
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          "Credenciales inválidas. Verifica tu email y contraseña.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-red-50 p-4">
      <div className="w-full max-w-lg">
        {/* Login Card */}
        <Card className="border-2 border-red-200 shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center py-8">
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
              PhishBlock
            </CardTitle>
            <p className="text-muted-foreground mt-2">Sistema de Reportes de Fraude</p>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" autoComplete="off">
              <FormField
                label="Correo electrónico"
                htmlFor="email"
                error={errors.email?.message}
                required
              >
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  disabled={isLoading}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  className="h-12 text-base"
                />
              </FormField>

              <FormField
                label="Contraseña"
                htmlFor="password"
                error={errors.password?.message}
                required
              >
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  disabled={isLoading}
                  autoComplete="off"
                  className="h-12 text-base"
                />
              </FormField>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 shadow-lg transform transition-all duration-200 hover:scale-[1.02]"
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
