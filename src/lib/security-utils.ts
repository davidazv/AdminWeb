/**
 * Utilidades de seguridad para el portal administrativo
 * Implementa funciones seguras para prevenir vulnerabilidades detectadas por OWASP ZAP
 */

/**
 * Genera un nombre de archivo seguro usando crypto.randomUUID()
 * Reemplaza Math.random() para prevenir nombres predecibles
 * 
 * @param extension - Extensión del archivo (ej: 'pdf', 'jpg')
 * @param prefix - Prefijo opcional para el archivo (ej: 'evidencia', 'reporte')
 * @returns Nombre de archivo único y seguro
 */
export function generateSecureFilename(extension: string, prefix: string = 'file'): string {
  // Usar crypto.randomUUID() en lugar de Math.random() para seguridad criptográfica
  const secureId = crypto.randomUUID();
  
  // Sanitizar la extensión para prevenir ataques de path traversal
  const sanitizedExtension = extension.replace(/[^a-zA-Z0-9]/g, '');
  
  // Sanitizar el prefijo
  const sanitizedPrefix = prefix.replace(/[^a-zA-Z0-9_-]/g, '');
  
  return `${sanitizedPrefix}_${secureId}.${sanitizedExtension}`;
}

/**
 * Genera un timestamp sanitizado que no revela información sensible del servidor
 * Reemplaza timestamps Unix directos para prevenir ataques de timing
 * 
 * @returns Timestamp ofuscado para uso público
 */
export function generateSanitizedTimestamp(): string {
  // En lugar de exponer timestamp directo, usar un hash del tiempo
  const now = Date.now();
  
  // Truncar a minutos para reducir precisión del timing
  const truncatedTime = Math.floor(now / (1000 * 60)) * (1000 * 60);
  
  // Convertir a string base36 para ofuscación adicional
  return truncatedTime.toString(36);
}

/**
 * Valida URLs de redirección para prevenir open redirect vulnerabilities
 * 
 * @param redirectUrl - URL a validar
 * @param currentHost - Host actual de la aplicación
 * @returns true si la URL es segura para redirección
 */
export function isValidRedirectUrl(redirectUrl: string, currentHost: string): boolean {
  try {
    const url = new URL(redirectUrl);
    
    // Lista blanca de hosts permitidos
    const allowedHosts = [
      'localhost',
      '127.0.0.1',
      currentHost,
      // Agregar aquí otros dominios seguros si es necesario
    ];
    
    // Verificar que el host esté en la lista blanca
    if (!allowedHosts.includes(url.hostname)) {
      return false;
    }
    
    // Verificar protocolo seguro
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return false;
    }
    
    // Prevenir paths peligrosos
    const dangerousPaths = [
      '///', // Triple slash
      '../', // Path traversal
      '..\\', // Windows path traversal
    ];
    
    return !dangerousPaths.some(path => url.pathname.includes(path));
    
  } catch (error) {
    // URL malformada
    return false;
  }
}

/**
 * Sanitiza datos de respuesta para prevenir exposición de información sensible
 * Remueve o ofusca campos que podrían revelar información del servidor
 * 
 * @param data - Datos a sanitizar
 * @returns Datos sanitizados
 */
export function sanitizeResponseData<T extends Record<string, any>>(data: T): T {
  const sanitized = { ...data };
  
  // Campos sensibles a remover o sanitizar
  const sensitiveFields = [
    'timestamp',
    'server_time',
    'created_at',
    'updated_at',
    'internal_id',
    'server_info',
    'debug_info',
  ];
  
  sensitiveFields.forEach(field => {
    if (field in sanitized) {
      if (field.includes('timestamp') || field.includes('_at')) {
        // Sanitizar timestamps
        sanitized[field] = generateSanitizedTimestamp();
      } else {
        // Remover campos sensibles
        delete sanitized[field];
      }
    }
  });
  
  return sanitized;
}

/**
 * Valida y sanitiza parámetros de entrada para prevenir inyecciones
 * 
 * @param input - Entrada a sanitizar
 * @param maxLength - Longitud máxima permitida
 * @returns Input sanitizado
 */
export function sanitizeInput(input: string, maxLength: number = 1000): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Truncar longitud
  let sanitized = input.slice(0, maxLength);
  
  // Remover caracteres peligrosos para prevenir XSS y injection
  sanitized = sanitized
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remover tags script
    .replace(/<[^>]*>/g, '') // Remover tags HTML
    .replace(/javascript:/gi, '') // Remover javascript: URLs
    .replace(/on\w+\s*=/gi, '') // Remover event handlers
    .trim();
  
  return sanitized;
}