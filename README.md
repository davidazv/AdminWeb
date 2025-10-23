This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Environment Variables (.env.local)

Para ejecutar este proyecto frontend, necesitas configurar las siguientes variables de entorno en un archivo `.env.local`:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api

# Authentication
NEXT_PUBLIC_JWT_SECRET=tu_clave_secreta_jwt_frontend

# Application Configuration
NEXT_PUBLIC_APP_NAME=OFraud Dashboard
NEXT_PUBLIC_APP_VERSION=1.0.0

# File Upload Configuration
NEXT_PUBLIC_MAX_FILE_SIZE=5242880
NEXT_PUBLIC_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf

# Environment
NODE_ENV=development
```

**Nota:** Las variables que comienzan con `NEXT_PUBLIC_` son visibles en el cliente. Nunca pongas información sensible en estas variables. Reemplaza los valores de ejemplo con tu configuración real.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Troubleshooting

Si el proyecto no corre correctamente, prueba los siguientes pasos:

Elimina node_modules y reinstala todo:
```bash
rm -rf node_modules .next
npm install
```

Una vez que termine la instalación, vuelve a iniciar:
```bash
npm run dev
```

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
