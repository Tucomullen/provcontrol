/**
 * Rate Limiting Middleware
 * 
 * Protege endpoints contra abusos y ataques de fuerza bruta
 */

import rateLimit, { ipKeyGenerator } from "express-rate-limit";

const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10); // 15 minutos por defecto

// Rate limit para registro (5 intentos cada 15 minutos)
export const registerRateLimit = rateLimit({
  windowMs,
  max: parseInt(process.env.RATE_LIMIT_MAX_REGISTER || "5", 10),
  message: "Demasiados intentos de registro. Por favor, intenta de nuevo más tarde.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limit para login (10 intentos cada 15 minutos)
export const loginRateLimit = rateLimit({
  windowMs,
  max: parseInt(process.env.RATE_LIMIT_MAX_LOGIN || "10", 10),
  message: "Demasiados intentos de inicio de sesión. Por favor, intenta de nuevo más tarde.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limit para uploads (20 uploads por hora)
export const uploadRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: parseInt(process.env.RATE_LIMIT_MAX_UPLOAD || "20", 10),
  message: "Demasiadas subidas de archivos. Por favor, espera un momento.",
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: any) => {
    // Usar userId si está autenticado, sino usar IP con helper para IPv6
    return req.user?.id || ipKeyGenerator(req);
  },
});

// Rate limit para creación de comunidades (3 creaciones por usuario)
export const communityCreationRateLimit = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 horas
  max: parseInt(process.env.RATE_LIMIT_MAX_COMMUNITY_CREATION || "3", 10),
  message: "Has alcanzado el límite de creación de comunidades. Por favor, contacta con soporte.",
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: any) => {
    // Usar userId si está autenticado, sino usar IP con helper para IPv6
    return req.user?.id || ipKeyGenerator(req);
  },
});

