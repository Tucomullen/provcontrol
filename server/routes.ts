import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage/data-storage";
import { setupAuth, isAuthenticated } from "./auth";
import { storage as fileStorage } from "./storage/index";
import { uploadRateLimit, communityCreationRateLimit } from "./middleware/rateLimit";
import {
  insertCommunitySchema,
  insertProviderSchema,
  insertIncidentSchema,
  insertBudgetSchema,
  insertRatingSchema,
  insertDocumentSchema,
  insertForumPostSchema,
  insertForumReplySchema,
  insertIncidentUpdateSchema,
  insertCommunityInvitationSchema,
  insertTransactionSchema,
  insertNotificationSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Auth routes are now handled in setupAuth
  // /api/auth/register, /api/auth/login, /api/auth/logout, /api/auth/user

  app.get("/api/communities", isAuthenticated, async (_req, res) => {
    try {
      const communities = await storage.getCommunities();
      res.json(communities);
    } catch (error) {
      console.error("Error fetching communities:", error);
      res.status(500).json({ message: "Failed to fetch communities" });
    }
  });

  app.get("/api/communities/:id", isAuthenticated, async (req, res) => {
    try {
      const community = await storage.getCommunity(req.params.id);
      if (!community) {
        return res.status(404).json({ message: "Community not found" });
      }
      res.json(community);
    } catch (error) {
      console.error("Error fetching community:", error);
      res.status(500).json({ message: "Failed to fetch community" });
    }
  });

  app.post("/api/communities", isAuthenticated, async (req, res) => {
    try {
      const result = insertCommunitySchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid data", errors: result.error });
      }
      const community = await storage.createCommunity(result.data);
      res.status(201).json(community);
    } catch (error) {
      console.error("Error creating community:", error);
      res.status(500).json({ message: "Failed to create community" });
    }
  });

  app.get("/api/providers", isAuthenticated, async (_req, res) => {
    try {
      const providers = await storage.getProviders();
      res.json(providers);
    } catch (error) {
      console.error("Error fetching providers:", error);
      res.status(500).json({ message: "Failed to fetch providers" });
    }
  });

  app.get("/api/providers/:id", isAuthenticated, async (req, res) => {
    try {
      const provider = await storage.getProvider(req.params.id);
      if (!provider) {
        return res.status(404).json({ message: "Provider not found" });
      }
      res.json(provider);
    } catch (error) {
      console.error("Error fetching provider:", error);
      res.status(500).json({ message: "Failed to fetch provider" });
    }
  });

  app.post("/api/providers", isAuthenticated, async (req, res) => {
    try {
      const result = insertProviderSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid data", errors: result.error });
      }
      const provider = await storage.createProvider(result.data);
      res.status(201).json(provider);
    } catch (error) {
      console.error("Error creating provider:", error);
      res.status(500).json({ message: "Failed to create provider" });
    }
  });

  app.patch("/api/providers/:id", isAuthenticated, async (req, res) => {
    try {
      const result = insertProviderSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid data", errors: result.error });
      }
      const provider = await storage.updateProvider(req.params.id, result.data);
      if (!provider) {
        return res.status(404).json({ message: "Provider not found" });
      }
      res.json(provider);
    } catch (error) {
      console.error("Error updating provider:", error);
      res.status(500).json({ message: "Failed to update provider" });
    }
  });

  app.get("/api/incidents", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      const incidents = await storage.getIncidents(user?.communityId || undefined);
      res.json(incidents);
    } catch (error) {
      console.error("Error fetching incidents:", error);
      res.status(500).json({ message: "Failed to fetch incidents" });
    }
  });

  app.get("/api/incidents/:id", isAuthenticated, async (req, res) => {
    try {
      const incident = await storage.getIncident(req.params.id);
      if (!incident) {
        return res.status(404).json({ message: "Incident not found" });
      }
      res.json(incident);
    } catch (error) {
      console.error("Error fetching incident:", error);
      res.status(500).json({ message: "Failed to fetch incident" });
    }
  });

  app.post("/api/incidents", isAuthenticated, async (req, res) => {
    try {
      const result = insertIncidentSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid data", errors: result.error });
      }
      const incident = await storage.createIncident(result.data);
      res.status(201).json(incident);
    } catch (error) {
      console.error("Error creating incident:", error);
      res.status(500).json({ message: "Failed to create incident" });
    }
  });

  app.patch("/api/incidents/:id", isAuthenticated, async (req, res) => {
    try {
      const result = insertIncidentSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid data", errors: result.error });
      }
      const incident = await storage.updateIncident(req.params.id, result.data);
      if (!incident) {
        return res.status(404).json({ message: "Incident not found" });
      }
      res.json(incident);
    } catch (error) {
      console.error("Error updating incident:", error);
      res.status(500).json({ message: "Failed to update incident" });
    }
  });

  app.get("/api/budgets", isAuthenticated, async (req, res) => {
    try {
      const incidentId = req.query.incidentId as string | undefined;
      const budgets = await storage.getBudgets(incidentId);
      res.json(budgets);
    } catch (error) {
      console.error("Error fetching budgets:", error);
      res.status(500).json({ message: "Failed to fetch budgets" });
    }
  });

  app.get("/api/budgets/:id", isAuthenticated, async (req, res) => {
    try {
      const budget = await storage.getBudget(req.params.id);
      if (!budget) {
        return res.status(404).json({ message: "Budget not found" });
      }
      res.json(budget);
    } catch (error) {
      console.error("Error fetching budget:", error);
      res.status(500).json({ message: "Failed to fetch budget" });
    }
  });

  app.post("/api/budgets", isAuthenticated, async (req, res) => {
    try {
      const result = insertBudgetSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid data", errors: result.error });
      }
      const budget = await storage.createBudget(result.data);
      res.status(201).json(budget);
    } catch (error) {
      console.error("Error creating budget:", error);
      res.status(500).json({ message: "Failed to create budget" });
    }
  });

  app.patch("/api/budgets/:id", isAuthenticated, async (req, res) => {
    try {
      const result = insertBudgetSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid data", errors: result.error });
      }
      const budget = await storage.updateBudget(req.params.id, result.data);
      if (!budget) {
        return res.status(404).json({ message: "Budget not found" });
      }
      res.json(budget);
    } catch (error) {
      console.error("Error updating budget:", error);
      res.status(500).json({ message: "Failed to update budget" });
    }
  });

  app.get("/api/ratings", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      const providerId = req.query.providerId as string | undefined;
      const ratings = await storage.getRatings(providerId, user?.communityId || undefined);
      res.json(ratings);
    } catch (error) {
      console.error("Error fetching ratings:", error);
      res.status(500).json({ message: "Failed to fetch ratings" });
    }
  });

  app.get("/api/ratings/:id", isAuthenticated, async (req, res) => {
    try {
      const rating = await storage.getRating(req.params.id);
      if (!rating) {
        return res.status(404).json({ message: "Rating not found" });
      }
      res.json(rating);
    } catch (error) {
      console.error("Error fetching rating:", error);
      res.status(500).json({ message: "Failed to fetch rating" });
    }
  });

  app.post("/api/ratings", isAuthenticated, async (req, res) => {
    try {
      const result = insertRatingSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid data", errors: result.error });
      }
      const rating = await storage.createRating(result.data);
      res.status(201).json(rating);
    } catch (error) {
      console.error("Error creating rating:", error);
      res.status(500).json({ message: "Failed to create rating" });
    }
  });

  app.get("/api/documents", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      const documents = await storage.getDocuments(user?.communityId || undefined);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.get("/api/documents/:id", isAuthenticated, async (req, res) => {
    try {
      const document = await storage.getDocument(req.params.id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      console.error("Error fetching document:", error);
      res.status(500).json({ message: "Failed to fetch document" });
    }
  });

  app.post("/api/documents", isAuthenticated, async (req, res) => {
    try {
      const result = insertDocumentSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid data", errors: result.error });
      }
      const document = await storage.createDocument(result.data);
      res.status(201).json(document);
    } catch (error) {
      console.error("Error creating document:", error);
      res.status(500).json({ message: "Failed to create document" });
    }
  });

  app.get("/api/forum-posts", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      const posts = await storage.getForumPosts(user?.communityId || undefined);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching forum posts:", error);
      res.status(500).json({ message: "Failed to fetch forum posts" });
    }
  });

  app.get("/api/forum-posts/:id", isAuthenticated, async (req, res) => {
    try {
      const post = await storage.getForumPost(req.params.id);
      if (!post) {
        return res.status(404).json({ message: "Forum post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Error fetching forum post:", error);
      res.status(500).json({ message: "Failed to fetch forum post" });
    }
  });

  app.post("/api/forum-posts", isAuthenticated, async (req, res) => {
    try {
      const result = insertForumPostSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid data", errors: result.error });
      }
      const post = await storage.createForumPost(result.data);
      res.status(201).json(post);
    } catch (error) {
      console.error("Error creating forum post:", error);
      res.status(500).json({ message: "Failed to create forum post" });
    }
  });

  app.patch("/api/forum-posts/:id", isAuthenticated, async (req, res) => {
    try {
      const result = insertForumPostSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid data", errors: result.error });
      }
      const post = await storage.updateForumPost(req.params.id, result.data);
      if (!post) {
        return res.status(404).json({ message: "Forum post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Error updating forum post:", error);
      res.status(500).json({ message: "Failed to update forum post" });
    }
  });

  app.get("/api/forum-replies/:postId", isAuthenticated, async (req, res) => {
    try {
      const replies = await storage.getForumReplies(req.params.postId);
      res.json(replies);
    } catch (error) {
      console.error("Error fetching forum replies:", error);
      res.status(500).json({ message: "Failed to fetch forum replies" });
    }
  });

  app.post("/api/forum-replies", isAuthenticated, async (req, res) => {
    try {
      const result = insertForumReplySchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid data", errors: result.error });
      }
      const reply = await storage.createForumReply(result.data);
      res.status(201).json(reply);
    } catch (error) {
      console.error("Error creating forum reply:", error);
      res.status(500).json({ message: "Failed to create forum reply" });
    }
  });

  app.get("/api/incident-updates/:incidentId", isAuthenticated, async (req, res) => {
    try {
      const updates = await storage.getIncidentUpdates(req.params.incidentId);
      res.json(updates);
    } catch (error) {
      console.error("Error fetching incident updates:", error);
      res.status(500).json({ message: "Failed to fetch incident updates" });
    }
  });

  app.post("/api/incident-updates", isAuthenticated, async (req, res) => {
    try {
      const result = insertIncidentUpdateSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid data", errors: result.error });
      }
      const update = await storage.createIncidentUpdate(result.data);
      res.status(201).json(update);
    } catch (error) {
      console.error("Error creating incident update:", error);
      res.status(500).json({ message: "Failed to create incident update" });
    }
  });

  // File upload endpoint - uses StorageProvider abstraction
  // This endpoint receives the file directly and uploads it using the configured storage provider
  app.post("/api/objects/upload", isAuthenticated, uploadRateLimit, async (req, res) => {
    try {
      const contentType = req.headers["content-type"] || "";
      
      // Si el content-type es application/json, es una petición para obtener la URL de subida
      // No esperar body, responder inmediatamente
      if (contentType.includes("application/json")) {
        const fileId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
        const baseUrl = `${req.protocol}://${req.get("host")}`;
        const uploadURL = `${baseUrl}/api/objects/upload/${fileId}`;
        
        res.json({ uploadURL });
        return;
      }
      
      // Si es un upload directo (image/ o application/ con datos), procesarlo
      if (contentType.startsWith("image/") || contentType.startsWith("application/")) {
        const chunks: Buffer[] = [];
        let hasResponded = false;
        
        const sendResponse = (status: number, data: any) => {
          if (hasResponded) return;
          hasResponded = true;
          if (!res.headersSent) {
            res.status(status).json(data);
          }
        };

        const sendError = (status: number, message: string) => {
          if (hasResponded) return;
          hasResponded = true;
          if (!res.headersSent) {
            res.status(status).json({ message });
          }
        };
        
        req.on("data", (chunk: Buffer) => {
          chunks.push(chunk);
        });

        req.on("end", async () => {
          try {
            if (chunks.length === 0) {
              return sendError(400, "No file data received");
            }

            const buffer = Buffer.concat(chunks);
            
            // Extract filename from Content-Disposition header or generate one
            let fileName = "upload";
            const contentDisposition = req.headers["content-disposition"];
            if (contentDisposition) {
              const match = contentDisposition.match(/filename="?([^"]+)"?/);
              if (match) {
                fileName = match[1];
              }
            }

            // Upload using storage provider
            const url = await fileStorage.upload(buffer, fileName, contentType);
            
            sendResponse(200, { uploadURL: url, url });
          } catch (error: any) {
            console.error("Error uploading file:", error);
            sendError(500, error.message || "Failed to upload file");
          }
        });

        req.on("error", (error) => {
          console.error("Request error:", error);
          sendError(500, "Failed to read file data");
        });

        // Timeout
        req.setTimeout(30000, () => {
          if (!hasResponded) {
            console.error("Upload POST request timeout");
            sendError(408, "Request timeout");
          }
        });
        
        return; // Importante: salir aquí para no ejecutar el código de abajo
      }
      
      // Fallback: Generate upload URL for PUT request
      const fileId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const uploadURL = `${baseUrl}/api/objects/upload/${fileId}`;
      
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error in upload endpoint:", error);
      if (!res.headersSent) {
        res.status(500).json({ message: "Failed to process upload request" });
      }
    }
  });

  // Legacy PUT endpoint for file upload (maintains compatibility with existing frontend)
  // Note: This route must handle raw body, so JSON parsing is skipped in index.ts
  app.put("/api/objects/upload/:fileId", isAuthenticated, (req, res) => {
    const fileId = req.params.fileId;
    const contentType = req.headers["content-type"] || "application/octet-stream";
    
    // Read the entire request body as buffer
    const chunks: Buffer[] = [];
    let hasResponded = false;
    
    const sendResponse = (status: number, data: any) => {
      if (hasResponded) {
        console.warn("Attempted to send response twice for PUT upload");
        return;
      }
      hasResponded = true;
      if (!res.headersSent) {
        res.status(status).setHeader('Content-Type', 'application/json').json(data);
      }
    };

    const sendError = (status: number, message: string) => {
      if (hasResponded) {
        console.warn("Attempted to send error response twice for PUT upload");
        return;
      }
      hasResponded = true;
      if (!res.headersSent) {
        res.status(status).json({ message });
      }
    };
    
    req.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });

    req.on("end", async () => {
      try {
        if (chunks.length === 0) {
          return sendError(400, "No file data received");
        }

        const buffer = Buffer.concat(chunks);
        
        // Determine file extension from content type
        let extension = "bin";
        if (contentType.startsWith("image/")) {
          extension = contentType.split("/")[1];
          if (extension === "jpeg") extension = "jpg";
        } else if (contentType === "application/pdf") {
          extension = "pdf";
        }

        const fileName = `${fileId}.${extension}`;
        
        // Upload using storage provider
        const url = await fileStorage.upload(buffer, fileName, contentType);
        
        sendResponse(200, { url, fileId });
      } catch (error: any) {
        console.error("Error uploading file:", error);
        sendError(500, error.message || "Failed to save file");
      }
    });

    req.on("error", (error) => {
      console.error("Request error:", error);
      sendError(500, "Failed to read file data");
    });

    // Timeout para evitar que la conexión se quede colgada
    req.setTimeout(30000, () => {
      if (!hasResponded) {
        console.error("Upload request timeout after 30 seconds");
        sendError(408, "Request timeout");
      }
    });
  });

  // Onboarding endpoints
  app.get("/api/onboarding/status", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      const allCommunities = await storage.getCommunities();
      
      const hasCommunities = allCommunities.length > 0;
      const userHasCommunity = !!user?.communityId;
      const needsEmailVerification = user?.role === "presidente" && !user?.emailVerified;
      const canCreateCommunity = !userHasCommunity && !hasCommunities;
      
      // Para proveedores, verificar si tienen perfil creado
      let hasProviderProfile = false;
      if (user?.role === "proveedor") {
        const provider = await storage.getProviderByUserId(userId);
        hasProviderProfile = !!provider;
      }

      res.json({
        hasCommunities,
        userHasCommunity,
        needsEmailVerification,
        canCreateCommunity,
        hasProviderProfile,
      });
    } catch (error) {
      console.error("Error fetching onboarding status:", error);
      res.status(500).json({ message: "Failed to fetch onboarding status" });
    }
  });

  app.post("/api/onboarding/community", isAuthenticated, communityCreationRateLimit, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      // Validar que el usuario no tenga comunidad asignada
      if (user?.communityId) {
        return res.status(400).json({ message: "El usuario ya pertenece a una comunidad" });
      }

      // Validar que el usuario sea presidente (solo presidentes pueden crear comunidades)
      if (user?.role !== "presidente") {
        return res.status(403).json({ message: "Solo los presidentes pueden crear comunidades" });
      }

      const { name, address, city, postalCode, totalUnits, description, logoUrl } = req.body;

      if (!name || !address || !city || !postalCode || !totalUnits) {
        return res.status(400).json({ message: "Faltan campos requeridos: name, address, city, postalCode, totalUnits" });
      }

      // Generar slug único desde el nombre
      let baseSlug = name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
        .replace(/[^a-z0-9]+/g, "-") // Reemplazar caracteres especiales con guiones
        .replace(/^-+|-+$/g, ""); // Eliminar guiones al inicio y final

      // Asegurar que el slug tenga al menos 3 caracteres
      if (baseSlug.length < 3) {
        baseSlug = `comunidad-${Date.now()}`;
      }

      // Limitar a 100 caracteres (requisito del schema)
      if (baseSlug.length > 100) {
        baseSlug = baseSlug.substring(0, 100).replace(/-+$/, ""); // Eliminar guiones finales después del truncado
      }

      // Verificar que el slug sea único, si no, agregar sufijo
      let slug = baseSlug;
      let counter = 1;
      while (await storage.getCommunityBySlug(slug)) {
        const suffix = `-${counter}`;
        // Asegurar que el slug completo no exceda 100 caracteres
        const maxBaseLength = 100 - suffix.length;
        const truncatedBase = baseSlug.substring(0, maxBaseLength).replace(/-+$/, "");
        slug = `${truncatedBase}${suffix}`;
        counter++;
      }

      // Crear comunidad
      const communityData = {
        name,
        slug,
        address,
        city,
        postalCode,
        totalUnits: parseInt(totalUnits),
        description: description || null,
        logoUrl: logoUrl || null,
        presidentId: userId,
      };

      const result = insertCommunitySchema.safeParse(communityData);
      if (!result.success) {
        return res.status(400).json({ message: "Datos inválidos", errors: result.error.errors });
      }

      const community = await storage.createCommunity(result.data);

      // Asignar usuario como presidente y asignar a la comunidad
      await storage.upsertUser({
        id: userId,
        communityId: community.id,
        role: "presidente",
      });

      // Crear registro en audit_logs
      await storage.createAuditLog({
        userId,
        action: "community_created",
        entityType: "community",
        entityId: community.id,
        metadata: { communityName: community.name, slug: community.slug },
      });

      res.status(201).json(community);
    } catch (error: any) {
      console.error("Error creating community:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        detail: error.detail,
        stack: error.stack,
      });
      
      // Errores de base de datos específicos
      if (error.code === "23505") {
        // Violación de constraint único (slug duplicado)
        return res.status(400).json({ message: "El slug de la comunidad ya existe. Intenta con otro nombre." });
      }
      if (error.code === "23502") {
        // Violación de NOT NULL
        return res.status(400).json({ 
          message: `Campo requerido faltante: ${error.column || "desconocido"}`,
          detail: error.detail 
        });
      }
      if (error.code === "23503") {
        // Violación de foreign key
        return res.status(400).json({ 
          message: "Error de referencia: El usuario o recurso referenciado no existe",
          detail: error.detail 
        });
      }
      
      // En desarrollo, devolver más detalles del error
      if (process.env.NODE_ENV === "development") {
        return res.status(500).json({ 
          message: "Error al crear la comunidad",
          error: error.message,
          code: error.code,
          detail: error.detail,
        });
      }
      
      res.status(500).json({ message: "Error al crear la comunidad" });
    }
  });

  app.get("/api/invitations/:communityId", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user || user.role !== "presidente") {
        return res.status(403).json({ message: "Only presidents can view invitations" });
      }
      const invitations = await storage.getInvitations(req.params.communityId);
      res.json(invitations);
    } catch (error) {
      console.error("Error fetching invitations:", error);
      res.status(500).json({ message: "Failed to fetch invitations" });
    }
  });

  app.post("/api/invitations", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user || user.role !== "presidente") {
        return res.status(403).json({ message: "Only presidents can create invitations" });
      }

      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const invitationData = {
        ...req.body,
        invitedBy: user.id,
        invitationCode: code,
        expiresAt,
      };

      const result = insertCommunityInvitationSchema.safeParse(invitationData);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid data", errors: result.error });
      }

      const invitation = await storage.createInvitation(result.data);
      res.status(201).json(invitation);
    } catch (error) {
      console.error("Error creating invitation:", error);
      res.status(500).json({ message: "Failed to create invitation" });
    }
  });

  app.get("/api/invitations/verify/:code", async (req, res) => {
    try {
      const invitation = await storage.getInvitationByCode(req.params.code);
      if (!invitation) {
        return res.status(404).json({ message: "Invalid or expired invitation code" });
      }
      res.json(invitation);
    } catch (error) {
      console.error("Error verifying invitation:", error);
      res.status(500).json({ message: "Failed to verify invitation" });
    }
  });

  app.post("/api/invitations/accept/:code", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      // Verificar que el usuario esté autenticado
      if (!user) {
        return res.status(401).json({ message: "Usuario no autenticado" });
      }

      // Verificar que el usuario no tenga ya una comunidad asignada
      if (user.communityId) {
        return res.status(400).json({ message: "Ya perteneces a una comunidad" });
      }

      // Obtener invitación
      const invitation = await storage.getInvitationByCode(req.params.code);
      
      if (!invitation) {
        return res.status(404).json({ message: "Código de invitación inválido o expirado" });
      }

      // Validar que la invitación no esté expirada
      if (new Date(invitation.expiresAt) < new Date()) {
        return res.status(400).json({ message: "La invitación ha expirado" });
      }

      // Validar que la invitación esté pendiente
      if (invitation.status !== "pendiente") {
        return res.status(400).json({ message: "La invitación ya fue utilizada o cancelada" });
      }

      // Aceptar invitación (esto actualiza el estado)
      const acceptedInvitation = await storage.acceptInvitation(req.params.code, userId);
      
      if (!acceptedInvitation) {
        return res.status(500).json({ message: "Error al aceptar la invitación" });
      }

      // Asignar usuario a comunidad con rol de invitación
      await storage.upsertUser({
        id: userId,
        communityId: invitation.communityId,
        role: invitation.role,
        propertyUnit: invitation.propertyUnit || undefined,
      });

      // Crear registro en audit_logs
      await storage.createAuditLog({
        userId,
        action: "invitation_accepted",
        entityType: "invitation",
        entityId: invitation.id,
        metadata: {
          communityId: invitation.communityId,
          role: invitation.role,
        },
      });

      res.json({ message: "Invitación aceptada exitosamente", invitation: acceptedInvitation });
    } catch (error) {
      console.error("Error accepting invitation:", error);
      res.status(500).json({ message: "Error al aceptar la invitación" });
    }
  });

  app.delete("/api/invitations/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user || user.role !== "presidente") {
        return res.status(403).json({ message: "Only presidents can cancel invitations" });
      }
      
      await storage.cancelInvitation(req.params.id);
      res.json({ message: "Invitation cancelled successfully" });
    } catch (error) {
      console.error("Error cancelling invitation:", error);
      res.status(500).json({ message: "Failed to cancel invitation" });
    }
  });

  app.get("/api/transactions", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user?.communityId) {
        return res.status(403).json({ message: "User must belong to a community" });
      }
      
      const ownerId = req.query.ownerId;
      const transactions = await storage.getTransactions(user.communityId, ownerId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.get("/api/transactions/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user?.communityId) {
        return res.status(403).json({ message: "User must belong to a community" });
      }

      const transaction = await storage.getTransaction(req.params.id);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      if (transaction.communityId !== user.communityId) {
        return res.status(403).json({ message: "Unauthorized access to transaction" });
      }

      res.json(transaction);
    } catch (error) {
      console.error("Error fetching transaction:", error);
      res.status(500).json({ message: "Failed to fetch transaction" });
    }
  });

  app.post("/api/transactions", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user || user.role !== "presidente" || !user.communityId) {
        return res.status(403).json({ message: "Only presidents can create transactions" });
      }

      const result = insertTransactionSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid data", errors: result.error });
      }
      
      const transactionData = {
        ...result.data,
        communityId: user.communityId,
        createdById: user.id,
      };
      
      const transaction = await storage.createTransaction(transactionData);
      res.status(201).json(transaction);
    } catch (error) {
      console.error("Error creating transaction:", error);
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  app.patch("/api/transactions/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user || user.role !== "presidente" || !user.communityId) {
        return res.status(403).json({ message: "Only presidents can update transactions" });
      }

      const existingTransaction = await storage.getTransaction(req.params.id);
      if (!existingTransaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      if (existingTransaction.communityId !== user.communityId) {
        return res.status(403).json({ message: "Unauthorized access to transaction" });
      }

      const result = insertTransactionSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid data", errors: result.error });
      }

      const { communityId, createdById, ...allowedUpdates } = result.data;
      const transaction = await storage.updateTransaction(req.params.id, allowedUpdates);
      res.json(transaction);
    } catch (error) {
      console.error("Error updating transaction:", error);
      res.status(500).json({ message: "Failed to update transaction" });
    }
  });

  app.delete("/api/transactions/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user || user.role !== "presidente" || !user.communityId) {
        return res.status(403).json({ message: "Only presidents can delete transactions" });
      }

      const existingTransaction = await storage.getTransaction(req.params.id);
      if (!existingTransaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      if (existingTransaction.communityId !== user.communityId) {
        return res.status(403).json({ message: "Unauthorized access to transaction" });
      }
      
      await storage.deleteTransaction(req.params.id);
      res.json({ message: "Transaction deleted successfully" });
    } catch (error) {
      console.error("Error deleting transaction:", error);
      res.status(500).json({ message: "Failed to delete transaction" });
    }
  });

  app.get("/api/notifications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const notifications = await storage.getNotifications(userId, limit);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.get("/api/notifications/unread-count", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const count = await storage.getUnreadNotificationsCount(userId);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread count:", error);
      res.status(500).json({ message: "Failed to fetch unread count" });
    }
  });

  app.post("/api/notifications/:id/read", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const success = await storage.markNotificationAsRead(req.params.id, userId);
      
      if (!success) {
        return res.status(403).json({ message: "Unauthorized access to notification" });
      }
      
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.post("/api/notifications/mark-all-read", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      await storage.markAllNotificationsAsRead(userId);
      res.json({ message: "All notifications marked as read" });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  app.get("/api/ratings/provider/:providerId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user || !user.communityId) {
        return res.status(403).json({ message: "User not part of a community" });
      }

      const provider = await storage.getProvider(req.params.providerId);
      if (!provider) {
        return res.status(404).json({ message: "Provider not found" });
      }

      const ratings = await storage.getRatings(req.params.providerId);
      const communityRatings = ratings.filter(r => r.communityId === user.communityId);
      
      res.json(communityRatings);
    } catch (error) {
      console.error("Error fetching ratings:", error);
      res.status(500).json({ message: "Failed to fetch ratings" });
    }
  });

  app.get("/api/ratings/stats/:providerId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user || !user.communityId) {
        return res.status(403).json({ message: "User not part of a community" });
      }

      const provider = await storage.getProvider(req.params.providerId);
      if (!provider) {
        return res.status(404).json({ message: "Provider not found" });
      }

      const ratings = await storage.getRatings(req.params.providerId);
      const communityRatings = ratings.filter(r => r.communityId === user.communityId);

      if (communityRatings.length === 0) {
        return res.json({
          averageOverall: 0,
          averageQuality: 0,
          averageTimeliness: 0,
          averageBudgetAdherence: 0,
          totalRatings: 0,
        });
      }

      const totalOverall = communityRatings.reduce((sum, r) => sum + r.overallRating, 0);
      const totalQuality = communityRatings.reduce((sum, r) => sum + r.qualityRating, 0);
      const totalTimeliness = communityRatings.reduce((sum, r) => sum + r.timelinessRating, 0);
      const totalBudget = communityRatings.reduce((sum, r) => sum + r.budgetAdherenceRating, 0);

      res.json({
        averageOverall: Math.round((totalOverall / communityRatings.length) * 10) / 10,
        averageQuality: Math.round((totalQuality / communityRatings.length) * 10) / 10,
        averageTimeliness: Math.round((totalTimeliness / communityRatings.length) * 10) / 10,
        averageBudgetAdherence: Math.round((totalBudget / communityRatings.length) * 10) / 10,
        totalRatings: communityRatings.length,
      });
    } catch (error) {
      console.error("Error fetching rating stats:", error);
      res.status(500).json({ message: "Failed to fetch rating stats" });
    }
  });

  app.post("/api/ratings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user || !user.communityId) {
        return res.status(403).json({ message: "User not part of a community" });
      }

      const validationResult = insertRatingSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid rating data",
          errors: validationResult.error.errors,
        });
      }

      const incident = await storage.getIncident(validationResult.data.incidentId);
      if (!incident) {
        return res.status(404).json({ message: "Incident not found" });
      }

      if (incident.status !== 'resuelta') {
        return res.status(400).json({ message: "Can only rate resolved incidents" });
      }

      if (incident.communityId !== user.communityId) {
        return res.status(403).json({ message: "Incident not from your community" });
      }

      const budget = await storage.getBudget(validationResult.data.budgetId);
      if (!budget || !budget.isApproved) {
        return res.status(400).json({ message: "Budget must be approved" });
      }

      if (budget.incidentId !== validationResult.data.incidentId) {
        return res.status(400).json({ message: "Budget does not match incident" });
      }

      if (budget.providerId !== validationResult.data.providerId) {
        return res.status(400).json({ message: "Provider does not match budget" });
      }

      const president = await storage.getUser(validationResult.data.authorizedByPresidentId);
      if (!president || president.role !== 'presidente' || president.communityId !== user.communityId) {
        return res.status(400).json({ message: "Must be authorized by community president" });
      }

      const rating = await storage.createRating({
        ...validationResult.data,
        ratedById: userId,
        communityId: user.communityId,
      });

      res.status(201).json(rating);
    } catch (error: any) {
      console.error("Error creating rating:", error);
      if (error.code === '23505') {
        return res.status(400).json({ message: "Rating already exists for this incident" });
      }
      res.status(500).json({ message: "Failed to create rating" });
    }
  });

  app.post("/api/ratings/:id/reply", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'proveedor') {
        return res.status(403).json({ message: "Only providers can reply to ratings" });
      }

      const provider = await storage.getProviderByUserId(userId);
      if (!provider) {
        return res.status(404).json({ message: "Provider not found" });
      }

      const { reply } = req.body;
      if (!reply || typeof reply !== 'string' || reply.trim().length === 0) {
        return res.status(400).json({ message: "Reply text is required" });
      }

      const rating = await storage.addProviderReply(req.params.id, provider.id, reply);
      
      if (!rating) {
        return res.status(403).json({ message: "Rating not found or unauthorized" });
      }

      res.json(rating);
    } catch (error) {
      console.error("Error adding provider reply:", error);
      res.status(500).json({ message: "Failed to add provider reply" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}