import { eq, and, desc } from "drizzle-orm";
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
}

export const storage = new DatabaseStorage();