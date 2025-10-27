import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Crear respuesta con headers de seguridad
  const response = NextResponse.next();

  // Content Security Policy (CSP) - Permite conexiones al backend localhost:3000
  const cspHeader = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Permite scripts inline necesarios para Next.js
    "style-src 'self' 'unsafe-inline'", // Permite estilos inline para Tailwind
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'", // Protección adicional contra clickjacking
    "upgrade-insecure-requests",
    "connect-src 'self' http://localhost:3000 ws://localhost:3000" // Permite conexiones al backend
  ].join('; ');

  // Headers de seguridad principales
  response.headers.set('Content-Security-Policy', cspHeader);
  
  // Anti-Clickjacking: Previene que la página sea embebida en frames
  response.headers.set('X-Frame-Options', 'DENY');
  
  // Previene MIME-sniffing - 29 instancias detectadas por OWASP ZAP
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // HSTS - Fuerza HTTPS con configuración de 1 año como se requiere
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  // Oculta información del servidor (X-Powered-By ya se maneja en next.config.ts)
  response.headers.set('X-DNS-Prefetch-Control', 'off');
  
  // Protección XSS adicional
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Controla información del referrer
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Políticas de permisos restrictivas
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Validación de redirecciones para prevenir open redirects
  const url = request.nextUrl.clone();
  const redirectParam = url.searchParams.get('redirect') || url.searchParams.get('returnUrl');
  
  if (redirectParam) {
    try {
      const redirectUrl = new URL(redirectParam, request.url);
      // Solo permitir redirecciones a dominios seguros
      const allowedHosts = ['localhost', '127.0.0.1', url.hostname];
      
      if (!allowedHosts.includes(redirectUrl.hostname)) {
        // Redirección insegura detectada - redirigir a página segura
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch (error) {
      // URL malformada - redirigir a página segura
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Aplicar middleware a todas las rutas excepto:
     * - api (API routes)
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico (favicon)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};