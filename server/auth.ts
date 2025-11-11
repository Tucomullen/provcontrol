import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { Express, RequestHandler } from "express";
import session from "express-session";
import { storage } from "./storage/data-storage";
import type { User } from "@shared/schema";
import { registerRateLimit, loginRateLimit } from "./middleware/rateLimit";

// Extend Express Request to include user
declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      role: string;
    }
  }
}

// Extend session to include userId
declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key-change-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// Session configuration
const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 7 days

export function getSession() {
  return session({
    secret: process.env.SESSION_SECRET || "dev-session-secret-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
      sameSite: "lax",
    },
  });
}

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// Password verification
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// Generate JWT token
export function generateToken(user: { id: string; email: string; role: string }): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
    }
  );
}

// Verify JWT token
export function verifyToken(token: string): { id: string; email: string; role: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
    return decoded;
  } catch (error) {
    return null;
  }
}

// Register new user
export async function registerUser(data: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}): Promise<Omit<User, 'passwordHash'>> {
  // Check if user already exists
  const existingUser = await storage.getUserByEmail(data.email);
  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  // Hash password
  const passwordHash = await hashPassword(data.password);

  // Create user
  const user = await storage.createUser({
    email: data.email,
    passwordHash,
    firstName: data.firstName,
    lastName: data.lastName,
    role: data.role || "propietario",
  });

  // Return user without password hash
  const { passwordHash: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

// Login user
export async function loginUser(email: string, password: string): Promise<Omit<User, 'passwordHash'> | null> {
  const user = await storage.getUserByEmail(email);
  if (!user || !user.passwordHash) {
    return null;
  }

  // Verify password
  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return null;
  }

  // Return user without password hash
  const { passwordHash: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

// Authentication middleware
export const isAuthenticated: RequestHandler = async (req, res, next) => {
  try {
    // Check session first
    if (req.session && req.session.userId) {
      const user = await storage.getUser(req.session.userId);
      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role,
        };
        return next();
      }
    }

    // Check JWT token from Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      if (decoded) {
        const user = await storage.getUser(decoded.id);
        if (user) {
          req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
          };
          return next();
        }
      }
    }

    return res.status(401).json({ message: "Unauthorized" });
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

// Setup authentication routes
export function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  // Register endpoint
  app.post("/api/auth/register", registerRateLimit, async (req, res) => {
    try {
      const { email, password, firstName, lastName, role } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters" });
      }

      const user = await registerUser({ email, password, firstName, lastName, role });

      // Create session
      req.session.userId = user.id;
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
        }
      });

      // Generate token
      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      // En desarrollo, incluir token de verificación en la respuesta
      const userWithToken = await storage.getUser(user.id);
      const response: any = {
        user,
        token,
      };

      if (process.env.NODE_ENV === "development" && userWithToken?.emailVerificationToken) {
        const appUrl = process.env.APP_URL || "http://localhost:3000";
        response.verificationToken = userWithToken.emailVerificationToken;
        response.verificationUrl = `${appUrl}/onboarding/verify-email?token=${userWithToken.emailVerificationToken}`;
      }

      res.status(201).json(response);
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(400).json({ message: error.message || "Registration failed" });
    }
  });

  // Login endpoint
  app.post("/api/auth/login", loginRateLimit, async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const user = await loginUser(email, password);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Create session
      req.session.userId = user.id;
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
        }
      });

      // Generate token
      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      res.json({
        user,
        token,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out successfully" });
    });
  });

  // Get current user endpoint
  app.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Return user without password hash
      const { passwordHash: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Email verification endpoint
  app.post("/api/auth/verify-email", async (req, res) => {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ message: "Token de verificación requerido" });
      }

      // Buscar usuario con este token
      const users = await storage.getUserByEmail(""); // Necesitamos buscar por token
      // Como no tenemos método directo, usaremos una query manual
      const { db } = await import("./db");
      const { users: usersTable } = await import("@shared/schema");
      const { eq, and, gt } = await import("drizzle-orm");

      if (!db) {
        return res.status(500).json({ message: "Database not initialized" });
      }

      const [user] = await db
        .select()
        .from(usersTable)
        .where(
          and(
            eq(usersTable.emailVerificationToken, token),
            gt(usersTable.emailVerificationExpires, new Date())
          )
        );

      if (!user) {
        return res.status(400).json({ message: "Token inválido o expirado" });
      }

      // Marcar email como verificado
      await storage.upsertUser({
        id: user.id,
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      });

      res.json({ message: "Email verificado exitosamente" });
    } catch (error) {
      console.error("Error verifying email:", error);
      res.status(500).json({ message: "Error al verificar el email" });
    }
  });

  // Resend verification email endpoint
  app.post("/api/auth/resend-verification", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      if (user.emailVerified) {
        return res.status(400).json({ message: "El email ya está verificado" });
      }

      // Generar nuevo token de verificación
      const crypto = await import("crypto");
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // Expira en 24 horas

      await storage.upsertUser({
        id: user.id,
        emailVerificationToken: token,
        emailVerificationExpires: expiresAt,
      });

      // En desarrollo, retornar el token. En producción, enviar email
      const appUrl = process.env.APP_URL || "http://localhost:3000";
      const verificationUrl = `${appUrl}/onboarding/verify-email?token=${token}`;

      if (process.env.NODE_ENV === "development") {
        res.json({
          message: "Token de verificación generado",
          token,
          verificationUrl,
        });
      } else {
        // TODO: Enviar email con el token
        res.json({
          message: "Email de verificación enviado",
        });
      }
    } catch (error) {
      console.error("Error resending verification:", error);
      res.status(500).json({ message: "Error al reenviar verificación" });
    }
  });
}

