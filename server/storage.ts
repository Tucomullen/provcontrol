import { eq, and, desc, gt } from "drizzle-orm";
import { db } from "./db";
import {
  users,
  communities,
  providers,
  incidents,
  budgets,
  ratings,
  documents,
  forumPosts,
  forumReplies,
  incidentUpdates,
  communityInvitations,
  transactions,
  notifications,
  type User,
  type UpsertUser,
  type Community,
  type InsertCommunity,
  type Provider,
  type InsertProvider,
  type Incident,
  type InsertIncident,
  type Budget,
  type InsertBudget,
  type Rating,
  type InsertRating,
  type Document,
  type InsertDocument,
  type ForumPost,
  type InsertForumPost,
  type ForumReply,
  type InsertForumReply,
  type IncidentUpdate,
  type InsertIncidentUpdate,
  type CommunityInvitation,
  type InsertCommunityInvitation,
  type Transaction,
  type InsertTransaction,
  type Notification,
  type InsertNotification,
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  getCommunities(): Promise<Community[]>;
  getCommunity(id: string): Promise<Community | undefined>;
  createCommunity(community: InsertCommunity): Promise<Community>;
  
  getProviders(): Promise<Provider[]>;
  getProvider(id: string): Promise<Provider | undefined>;
  createProvider(provider: InsertProvider): Promise<Provider>;
  updateProvider(id: string, provider: Partial<InsertProvider>): Promise<Provider | undefined>;
  
  getIncidents(communityId?: string): Promise<Incident[]>;
  getIncident(id: string): Promise<Incident | undefined>;
  createIncident(incident: InsertIncident): Promise<Incident>;
  updateIncident(id: string, incident: Partial<InsertIncident>): Promise<Incident | undefined>;
  
  getBudgets(incidentId?: string): Promise<Budget[]>;
  getBudget(id: string): Promise<Budget | undefined>;
  createBudget(budget: InsertBudget): Promise<Budget>;
  updateBudget(id: string, budget: Partial<InsertBudget>): Promise<Budget | undefined>;
  
  getRatings(providerId?: string, communityId?: string): Promise<Rating[]>;
  getRating(id: string): Promise<Rating | undefined>;
  createRating(rating: InsertRating): Promise<Rating>;
  
  getDocuments(communityId?: string): Promise<Document[]>;
  getDocument(id: string): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  
  getForumPosts(communityId?: string): Promise<ForumPost[]>;
  getForumPost(id: string): Promise<ForumPost | undefined>;
  createForumPost(post: InsertForumPost): Promise<ForumPost>;
  updateForumPost(id: string, post: Partial<InsertForumPost>): Promise<ForumPost | undefined>;
  
  getForumReplies(postId: string): Promise<ForumReply[]>;
  createForumReply(reply: InsertForumReply): Promise<ForumReply>;
  
  getIncidentUpdates(incidentId: string): Promise<IncidentUpdate[]>;
  createIncidentUpdate(update: InsertIncidentUpdate): Promise<IncidentUpdate>;
  
  getInvitations(communityId: string): Promise<CommunityInvitation[]>;
  getInvitationByCode(code: string): Promise<CommunityInvitation | undefined>;
  createInvitation(invitation: InsertCommunityInvitation): Promise<CommunityInvitation>;
  acceptInvitation(code: string, userId: string): Promise<CommunityInvitation | undefined>;
  cancelInvitation(id: string): Promise<void>;
  
  getTransactions(communityId?: string, ownerId?: string): Promise<Transaction[]>;
  getTransaction(id: string): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: string, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined>;
  deleteTransaction(id: string): Promise<void>;
  
  getNotifications(userId: string, limit?: number): Promise<Notification[]>;
  getUnreadNotificationsCount(userId: string): Promise<number>;
  markNotificationAsRead(id: string, userId: string): Promise<boolean>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  
  getRatings(providerId: string): Promise<Rating[]>;
  getRating(id: string): Promise<Rating | undefined>;
  createRating(rating: InsertRating): Promise<Rating>;
  addProviderReply(id: string, providerId: string, reply: string): Promise<Rating | undefined>;
  getRatingStats(providerId: string): Promise<{
    averageOverall: number;
    averageQuality: number;
    averageTimeliness: number;
    averageBudgetAdherence: number;
    totalRatings: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getCommunities(): Promise<Community[]> {
    return await db.select().from(communities).orderBy(desc(communities.createdAt));
  }

  async getCommunity(id: string): Promise<Community | undefined> {
    const [community] = await db.select().from(communities).where(eq(communities.id, id));
    return community;
  }

  async createCommunity(communityData: InsertCommunity): Promise<Community> {
    const [community] = await db.insert(communities).values(communityData).returning();
    return community;
  }

  async getProviders(): Promise<Provider[]> {
    return await db.select().from(providers).orderBy(desc(providers.averageRating));
  }

  async getProvider(id: string): Promise<Provider | undefined> {
    const [provider] = await db.select().from(providers).where(eq(providers.id, id));
    return provider;
  }

  async createProvider(providerData: InsertProvider): Promise<Provider> {
    const [provider] = await db.insert(providers).values(providerData).returning();
    return provider;
  }

  async updateProvider(id: string, providerData: Partial<InsertProvider>): Promise<Provider | undefined> {
    const [provider] = await db
      .update(providers)
      .set({ ...providerData, updatedAt: new Date() })
      .where(eq(providers.id, id))
      .returning();
    return provider;
  }

  async getIncidents(communityId?: string): Promise<Incident[]> {
    if (communityId) {
      return await db
        .select()
        .from(incidents)
        .where(eq(incidents.communityId, communityId))
        .orderBy(desc(incidents.createdAt));
    }
    return await db.select().from(incidents).orderBy(desc(incidents.createdAt));
  }

  async getIncident(id: string): Promise<Incident | undefined> {
    const [incident] = await db.select().from(incidents).where(eq(incidents.id, id));
    return incident;
  }

  async createIncident(incidentData: InsertIncident): Promise<Incident> {
    const [incident] = await db.insert(incidents).values(incidentData).returning();
    return incident;
  }

  async updateIncident(id: string, incidentData: Partial<InsertIncident>): Promise<Incident | undefined> {
    const [incident] = await db
      .update(incidents)
      .set({ ...incidentData, updatedAt: new Date() })
      .where(eq(incidents.id, id))
      .returning();
    return incident;
  }

  async getBudgets(incidentId?: string): Promise<Budget[]> {
    if (incidentId) {
      return await db
        .select()
        .from(budgets)
        .where(eq(budgets.incidentId, incidentId))
        .orderBy(desc(budgets.createdAt));
    }
    return await db.select().from(budgets).orderBy(desc(budgets.createdAt));
  }

  async getBudget(id: string): Promise<Budget | undefined> {
    const [budget] = await db.select().from(budgets).where(eq(budgets.id, id));
    return budget;
  }

  async createBudget(budgetData: InsertBudget): Promise<Budget> {
    const [budget] = await db.insert(budgets).values(budgetData).returning();
    return budget;
  }

  async updateBudget(id: string, budgetData: Partial<InsertBudget>): Promise<Budget | undefined> {
    const [budget] = await db
      .update(budgets)
      .set({ ...budgetData, updatedAt: new Date() })
      .where(eq(budgets.id, id))
      .returning();
    return budget;
  }

  async getRatings(providerId?: string, communityId?: string): Promise<Rating[]> {
    const conditions = [];
    if (providerId) conditions.push(eq(ratings.providerId, providerId));
    if (communityId) conditions.push(eq(ratings.communityId, communityId));

    if (conditions.length > 0) {
      return await db
        .select()
        .from(ratings)
        .where(and(...conditions))
        .orderBy(desc(ratings.createdAt));
    }
    return await db.select().from(ratings).orderBy(desc(ratings.createdAt));
  }

  async getRating(id: string): Promise<Rating | undefined> {
    const [rating] = await db.select().from(ratings).where(eq(ratings.id, id));
    return rating;
  }

  async createRating(ratingData: InsertRating): Promise<Rating> {
    const [rating] = await db.insert(ratings).values(ratingData).returning();
    return rating;
  }

  async getDocuments(communityId?: string): Promise<Document[]> {
    if (communityId) {
      return await db
        .select()
        .from(documents)
        .where(eq(documents.communityId, communityId))
        .orderBy(desc(documents.createdAt));
    }
    return await db.select().from(documents).orderBy(desc(documents.createdAt));
  }

  async getDocument(id: string): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document;
  }

  async createDocument(documentData: InsertDocument): Promise<Document> {
    const [document] = await db.insert(documents).values(documentData).returning();
    return document;
  }

  async getForumPosts(communityId?: string): Promise<ForumPost[]> {
    if (communityId) {
      return await db
        .select()
        .from(forumPosts)
        .where(eq(forumPosts.communityId, communityId))
        .orderBy(desc(forumPosts.isPinned), desc(forumPosts.lastActivityAt));
    }
    return await db.select().from(forumPosts).orderBy(desc(forumPosts.isPinned), desc(forumPosts.lastActivityAt));
  }

  async getForumPost(id: string): Promise<ForumPost | undefined> {
    const [post] = await db.select().from(forumPosts).where(eq(forumPosts.id, id));
    return post;
  }

  async createForumPost(postData: InsertForumPost): Promise<ForumPost> {
    const [post] = await db.insert(forumPosts).values(postData).returning();
    return post;
  }

  async updateForumPost(id: string, postData: Partial<InsertForumPost>): Promise<ForumPost | undefined> {
    const [post] = await db
      .update(forumPosts)
      .set({ ...postData, updatedAt: new Date() })
      .where(eq(forumPosts.id, id))
      .returning();
    return post;
  }

  async getForumReplies(postId: string): Promise<ForumReply[]> {
    return await db
      .select()
      .from(forumReplies)
      .where(eq(forumReplies.postId, postId))
      .orderBy(desc(forumReplies.createdAt));
  }

  async createForumReply(replyData: InsertForumReply): Promise<ForumReply> {
    const [reply] = await db.insert(forumReplies).values(replyData).returning();
    return reply;
  }

  async getIncidentUpdates(incidentId: string): Promise<IncidentUpdate[]> {
    return await db
      .select()
      .from(incidentUpdates)
      .where(eq(incidentUpdates.incidentId, incidentId))
      .orderBy(desc(incidentUpdates.createdAt));
  }

  async createIncidentUpdate(updateData: InsertIncidentUpdate): Promise<IncidentUpdate> {
    const [update] = await db.insert(incidentUpdates).values(updateData).returning();
    return update;
  }

  async getInvitations(communityId: string): Promise<CommunityInvitation[]> {
    return await db
      .select()
      .from(communityInvitations)
      .where(eq(communityInvitations.communityId, communityId))
      .orderBy(desc(communityInvitations.createdAt));
  }

  async getInvitationByCode(code: string): Promise<CommunityInvitation | undefined> {
    const [invitation] = await db
      .select()
      .from(communityInvitations)
      .where(
        and(
          eq(communityInvitations.invitationCode, code),
          eq(communityInvitations.status, "pendiente"),
          gt(communityInvitations.expiresAt, new Date())
        )
      );
    return invitation;
  }

  async createInvitation(invitationData: InsertCommunityInvitation): Promise<CommunityInvitation> {
    const [invitation] = await db
      .insert(communityInvitations)
      .values(invitationData)
      .returning();
    return invitation;
  }

  async acceptInvitation(code: string, userId: string): Promise<CommunityInvitation | undefined> {
    const [invitation] = await db
      .update(communityInvitations)
      .set({
        status: "aceptada",
        acceptedAt: new Date(),
        acceptedById: userId,
      })
      .where(
        and(
          eq(communityInvitations.invitationCode, code),
          eq(communityInvitations.status, "pendiente"),
          gt(communityInvitations.expiresAt, new Date())
        )
      )
      .returning();
    return invitation;
  }

  async cancelInvitation(id: string): Promise<void> {
    await db
      .update(communityInvitations)
      .set({ status: "cancelada" })
      .where(eq(communityInvitations.id, id));
  }

  async getTransactions(communityId?: string, ownerId?: string): Promise<Transaction[]> {
    let query = db.select().from(transactions).orderBy(desc(transactions.transactionDate));
    
    if (communityId && ownerId) {
      return await query.where(
        and(
          eq(transactions.communityId, communityId),
          eq(transactions.ownerId, ownerId)
        )
      );
    } else if (communityId) {
      return await query.where(eq(transactions.communityId, communityId));
    } else if (ownerId) {
      return await query.where(eq(transactions.ownerId, ownerId));
    }
    
    return await query;
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction;
  }

  async createTransaction(transactionData: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db.insert(transactions).values(transactionData).returning();
    return transaction;
  }

  async updateTransaction(id: string, transactionData: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const [transaction] = await db
      .update(transactions)
      .set({ ...transactionData, updatedAt: new Date() })
      .where(eq(transactions.id, id))
      .returning();
    return transaction;
  }

  async deleteTransaction(id: string): Promise<void> {
    await db.delete(transactions).where(eq(transactions.id, id));
  }

  async getNotifications(userId: string, limit: number = 50): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  }

  async getUnreadNotificationsCount(userId: string): Promise<number> {
    const result = await db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        )
      );
    return result.length;
  }

  async markNotificationAsRead(id: string, userId: string): Promise<boolean> {
    const result = await db
      .update(notifications)
      .set({ isRead: true })
      .where(
        and(
          eq(notifications.id, id),
          eq(notifications.userId, userId)
        )
      )
      .returning();
    return result.length > 0;
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));
  }

  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const [notification] = await db.insert(notifications).values(notificationData).returning();
    return notification;
  }

  async getRatings(providerId: string): Promise<Rating[]> {
    return await db
      .select()
      .from(ratings)
      .where(eq(ratings.providerId, providerId))
      .orderBy(desc(ratings.createdAt));
  }

  async getRating(id: string): Promise<Rating | undefined> {
    const [rating] = await db.select().from(ratings).where(eq(ratings.id, id));
    return rating;
  }

  async createRating(ratingData: InsertRating): Promise<Rating> {
    const [rating] = await db.insert(ratings).values(ratingData).returning();
    return rating;
  }

  async addProviderReply(id: string, providerId: string, reply: string): Promise<Rating | undefined> {
    const rating = await this.getRating(id);
    if (!rating || rating.providerId !== providerId) {
      return undefined;
    }

    const [updated] = await db
      .update(ratings)
      .set({
        providerReply: reply,
        providerReplyDate: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(ratings.id, id))
      .returning();

    return updated;
  }

  async getRatingStats(providerId: string): Promise<{
    averageOverall: number;
    averageQuality: number;
    averageTimeliness: number;
    averageBudgetAdherence: number;
    totalRatings: number;
  }> {
    const providerRatings = await db
      .select()
      .from(ratings)
      .where(eq(ratings.providerId, providerId));

    if (providerRatings.length === 0) {
      return {
        averageOverall: 0,
        averageQuality: 0,
        averageTimeliness: 0,
        averageBudgetAdherence: 0,
        totalRatings: 0,
      };
    }

    const totalOverall = providerRatings.reduce((sum, r) => sum + r.overallRating, 0);
    const totalQuality = providerRatings.reduce((sum, r) => sum + r.qualityRating, 0);
    const totalTimeliness = providerRatings.reduce((sum, r) => sum + r.timelinessRating, 0);
    const totalBudget = providerRatings.reduce((sum, r) => sum + r.budgetAdherenceRating, 0);

    return {
      averageOverall: Math.round((totalOverall / providerRatings.length) * 10) / 10,
      averageQuality: Math.round((totalQuality / providerRatings.length) * 10) / 10,
      averageTimeliness: Math.round((totalTimeliness / providerRatings.length) * 10) / 10,
      averageBudgetAdherence: Math.round((totalBudget / providerRatings.length) * 10) / 10,
      totalRatings: providerRatings.length,
    };
  }
}

export const storage = new DatabaseStorage();