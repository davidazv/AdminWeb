/**
 * Reports Constants - Status and category mappings
 */

// Map status IDs to names
export const STATUS_MAP = {
  1: 'Pendiente',
  2: 'Aceptado',
  3: 'Rechazado',
} as const;

// Map category IDs to names (based on database seed data)
export const CATEGORY_MAP = {
  1: 'Sitio Web Bancario Falso',
  2: 'Aplicación Bancaria Falsa',
  3: 'Phishing por Email',
  4: 'Estafa Telefónica',
  5: 'SMS Fraudulento',
  6: 'Fraude en Redes Sociales',
  7: 'Sitio de Compras Falso',
  8: 'Estafa de Inversión',
  9: 'Fraude Presencial',
  10: 'Clonación de Tarjetas',
} as const;

// Status colors for UI
export const STATUS_COLORS = {
  1: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
  },
  2: {
    bg: 'bg-green-100',
    text: 'text-green-800',
  },
  3: {
    bg: 'bg-red-100',
    text: 'text-red-800',
  },
} as const;
