import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  // Oculta el header X-Powered-By para no revelar información del servidor
  poweredByHeader: false,
  
  // Headers de seguridad adicionales a nivel de configuración
  async headers() {
    return [
      {
        // Aplicar headers a todas las rutas
        source: '/(.*)',
        headers: [
          // Previene que los navegadores interpreten archivos como diferentes tipos MIME
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Protección adicional contra clickjacking
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // HSTS - Fuerza conexiones HTTPS por 1 año
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          // Control de prefetch DNS
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'off',
          },
          // Política de referrer restrictiva
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
