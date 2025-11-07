import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
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
  await setupAuth(app);

  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

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
      const user = await storage.getUser(req.user.claims.sub);
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
      const user = await storage.getUser(req.user.claims.sub);
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
      const user = await storage.getUser(req.user.claims.sub);
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
      const user = await storage.getUser(req.user.claims.sub);
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

  app.post("/api/objects/upload", isAuthenticated, async (_req, res) => {
    try {
      const response = await fetch(
        `${process.env.PUBLIC_OBJECT_SEARCH_PATHS}/upload`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get upload URL");
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ message: "Failed to get upload URL" });
    }
  });

  app.get("/api/invitations/:communityId", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
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
      const user = await storage.getUser(req.user.claims.sub);
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
      const userId = req.user.claims.sub;
      const invitation = await storage.acceptInvitation(req.params.code, userId);
      
      if (!invitation) {
        return res.status(404).json({ message: "Invalid or expired invitation code" });
      }

      await storage.upsertUser({
        id: userId,
        communityId: invitation.communityId,
        role: invitation.role,
        propertyUnit: invitation.propertyUnit || undefined,
      });

      res.json({ message: "Invitation accepted successfully", invitation });
    } catch (error) {
      console.error("Error accepting invitation:", error);
      res.status(500).json({ message: "Failed to accept invitation" });
    }
  });

  app.delete("/api/invitations/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
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
      const user = await storage.getUser(req.user.claims.sub);
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
      const user = await storage.getUser(req.user.claims.sub);
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
      const user = await storage.getUser(req.user.claims.sub);
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
      const user = await storage.getUser(req.user.claims.sub);
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
      const user = await storage.getUser(req.user.claims.sub);
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      const count = await storage.getUnreadNotificationsCount(userId);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread count:", error);
      res.status(500).json({ message: "Failed to fetch unread count" });
    }
  });

  app.post("/api/notifications/:id/read", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      await storage.markAllNotificationsAsRead(userId);
      res.json({ message: "All notifications marked as read" });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}