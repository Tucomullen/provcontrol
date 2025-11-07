import { sql, relations } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Replit Auth integration - Session storage table
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Enums
export const userRoleEnum = pgEnum("user_role", ["presidente", "propietario", "proveedor"]);
export const incidentStatusEnum = pgEnum("incident_status", ["abierta", "presupuestada", "aprobada", "en_curso", "resuelta"]);
export const invitationStatusEnum = pgEnum("invitation_status", ["pendiente", "aceptada", "expirada", "cancelada"]);
export const providerCategoryEnum = pgEnum("provider_category", [
  "fontaneria",
  "electricidad",
  "albanileria",
  "jardineria",
  "pintura",
  "carpinteria",
  "limpieza",
  "cerrajeria",
  "climatizacion",
  "otros"
]);

// Users table - Replit Auth integration
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: userRoleEnum("role").notNull().default("propietario"),
  communityId: varchar("community_id").references(() => communities.id),
  propertyUnit: varchar("property_unit"),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;

// Communities table
export const communities = pgTable("communities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  postalCode: varchar("postal_code", { length: 10 }).notNull(),
  totalUnits: integer("total_units").notNull(),
  presidentId: varchar("president_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCommunitySchema = createInsertSchema(communities).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type Community = typeof communities.$inferSelect;
export type InsertCommunity = z.infer<typeof insertCommunitySchema>;

// Providers table
export const providers = pgTable("providers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  companyName: varchar("company_name", { length: 255 }).notNull(),
  description: text("description"),
  category: providerCategoryEnum("category").notNull(),
  phone: varchar("phone", { length: 20 }),
  website: varchar("website", { length: 255 }),
  logoUrl: varchar("logo_url"),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }).default("0"),
  totalRatings: integer("total_ratings").default(0),
  totalJobs: integer("total_jobs").default(0),
  avgResponseTime: integer("avg_response_time"),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertProviderSchema = createInsertSchema(providers).omit({
  id: true,
  averageRating: true,
  totalRatings: true,
  totalJobs: true,
  createdAt: true,
  updatedAt: true,
});
export type Provider = typeof providers.$inferSelect;
export type InsertProvider = z.infer<typeof insertProviderSchema>;

// Incidents table
export const incidents = pgTable("incidents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  communityId: varchar("community_id").notNull().references(() => communities.id),
  reportedById: varchar("reported_by_id").notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: providerCategoryEnum("category").notNull(),
  status: incidentStatusEnum("status").notNull().default("abierta"),
  location: varchar("location", { length: 255 }),
  photoUrls: jsonb("photo_urls").$type<string[]>().default([]),
  assignedProviderId: varchar("assigned_provider_id").references(() => providers.id),
  approvedBudgetId: varchar("approved_budget_id").references(() => budgets.id),
  finalInvoiceUrl: varchar("final_invoice_url"),
  finalCost: decimal("final_cost", { precision: 10, scale: 2 }),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertIncidentSchema = createInsertSchema(incidents).omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});
export type Incident = typeof incidents.$inferSelect;
export type InsertIncident = z.infer<typeof insertIncidentSchema>;

// Budgets table
export const budgets = pgTable("budgets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  incidentId: varchar("incident_id").notNull().references(() => incidents.id),
  providerId: varchar("provider_id").notNull().references(() => providers.id),
  description: text("description").notNull(),
  lineItems: jsonb("line_items").$type<Array<{ item: string; quantity: number; unitPrice: number; total: number }>>().notNull(),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }).notNull(),
  estimatedDays: integer("estimated_days"),
  documentUrl: varchar("document_url"),
  isApproved: boolean("is_approved").default(false),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBudgetSchema = createInsertSchema(budgets).omit({
  id: true,
  isApproved: true,
  createdAt: true,
  updatedAt: true,
});
export type Budget = typeof budgets.$inferSelect;
export type InsertBudget = z.infer<typeof insertBudgetSchema>;

// Ratings table - Sistema de rating verificable
export const ratings = pgTable("ratings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  incidentId: varchar("incident_id").notNull().unique().references(() => incidents.id),
  providerId: varchar("provider_id").notNull().references(() => providers.id),
  communityId: varchar("community_id").notNull().references(() => communities.id),
  ratedById: varchar("rated_by_id").notNull().references(() => users.id),
  overallRating: integer("overall_rating").notNull(),
  qualityRating: integer("quality_rating").notNull(),
  timelinessRating: integer("timeliness_rating").notNull(),
  budgetAdherenceRating: integer("budget_adherence_rating").notNull(),
  comment: text("comment").notNull(),
  photoUrls: jsonb("photo_urls").$type<string[]>().default([]),
  isVerified: boolean("is_verified").default(true),
  authorizedByPresidentId: varchar("authorized_by_president_id").notNull().references(() => users.id),
  budgetId: varchar("budget_id").notNull().references(() => budgets.id),
  invoiceUrl: varchar("invoice_url"),
  providerReply: text("provider_reply"),
  providerReplyDate: timestamp("provider_reply_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertRatingSchema = createInsertSchema(ratings).omit({
  id: true,
  isVerified: true,
  createdAt: true,
  updatedAt: true,
});
export type Rating = typeof ratings.$inferSelect;
export type InsertRating = z.infer<typeof insertRatingSchema>;

// Documents table - Gestión documental
export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  communityId: varchar("community_id").notNull().references(() => communities.id),
  uploadedById: varchar("uploaded_by_id").notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  fileUrl: varchar("file_url").notNull(),
  fileSize: integer("file_size"),
  mimeType: varchar("mime_type", { length: 100 }),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

// Forum Posts table - Foros y tablón de anuncios
export const forumPosts = pgTable("forum_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  communityId: varchar("community_id").notNull().references(() => communities.id),
  authorId: varchar("author_id").notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  isPinned: boolean("is_pinned").default(false),
  replyCount: integer("reply_count").default(0),
  lastActivityAt: timestamp("last_activity_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertForumPostSchema = createInsertSchema(forumPosts).omit({
  id: true,
  replyCount: true,
  lastActivityAt: true,
  createdAt: true,
  updatedAt: true,
});
export type ForumPost = typeof forumPosts.$inferSelect;
export type InsertForumPost = z.infer<typeof insertForumPostSchema>;

// Forum Replies table
export const forumReplies = pgTable("forum_replies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull().references(() => forumPosts.id),
  authorId: varchar("author_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertForumReplySchema = createInsertSchema(forumReplies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type ForumReply = typeof forumReplies.$inferSelect;
export type InsertForumReply = z.infer<typeof insertForumReplySchema>;

// Incident Updates table - Timeline de incidencias
export const incidentUpdates = pgTable("incident_updates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  incidentId: varchar("incident_id").notNull().references(() => incidents.id),
  updatedById: varchar("updated_by_id").notNull().references(() => users.id),
  status: incidentStatusEnum("status").notNull(),
  comment: text("comment"),
  photoUrls: jsonb("photo_urls").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertIncidentUpdateSchema = createInsertSchema(incidentUpdates).omit({
  id: true,
  createdAt: true,
});
export type IncidentUpdate = typeof incidentUpdates.$inferSelect;
export type InsertIncidentUpdate = z.infer<typeof insertIncidentUpdateSchema>;

// Community Invitations table - Sistema de invitaciones
export const communityInvitations = pgTable("community_invitations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  communityId: varchar("community_id").notNull().references(() => communities.id),
  invitedBy: varchar("invited_by").notNull().references(() => users.id),
  email: varchar("email").notNull(),
  role: userRoleEnum("role").notNull().default("propietario"),
  propertyUnit: varchar("property_unit"),
  invitationCode: varchar("invitation_code", { length: 8 }).notNull().unique(),
  status: invitationStatusEnum("status").notNull().default("pendiente"),
  expiresAt: timestamp("expires_at").notNull(),
  acceptedAt: timestamp("accepted_at"),
  acceptedById: varchar("accepted_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCommunityInvitationSchema = createInsertSchema(communityInvitations).omit({
  id: true,
  status: true,
  acceptedAt: true,
  acceptedById: true,
  createdAt: true,
});
export type CommunityInvitation = typeof communityInvitations.$inferSelect;
export type InsertCommunityInvitation = z.infer<typeof insertCommunityInvitationSchema>;

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  community: one(communities, {
    fields: [users.communityId],
    references: [communities.id],
  }),
  provider: one(providers, {
    fields: [users.id],
    references: [providers.userId],
  }),
  incidents: many(incidents),
  budgets: many(budgets),
  ratings: many(ratings),
  documents: many(documents),
  forumPosts: many(forumPosts),
  forumReplies: many(forumReplies),
}));

export const communitiesRelations = relations(communities, ({ one, many }) => ({
  president: one(users, {
    fields: [communities.presidentId],
    references: [users.id],
  }),
  members: many(users),
  incidents: many(incidents),
  providers: many(providers),
  documents: many(documents),
  forumPosts: many(forumPosts),
}));

export const providersRelations = relations(providers, ({ one, many }) => ({
  user: one(users, {
    fields: [providers.userId],
    references: [users.id],
  }),
  budgets: many(budgets),
  ratings: many(ratings),
}));

export const incidentsRelations = relations(incidents, ({ one, many }) => ({
  community: one(communities, {
    fields: [incidents.communityId],
    references: [communities.id],
  }),
  reportedBy: one(users, {
    fields: [incidents.reportedById],
    references: [users.id],
  }),
  assignedProvider: one(providers, {
    fields: [incidents.assignedProviderId],
    references: [providers.id],
  }),
  approvedBudget: one(budgets, {
    fields: [incidents.approvedBudgetId],
    references: [budgets.id],
  }),
  budgets: many(budgets),
  updates: many(incidentUpdates),
  rating: one(ratings, {
    fields: [incidents.id],
    references: [ratings.incidentId],
  }),
}));

export const budgetsRelations = relations(budgets, ({ one }) => ({
  incident: one(incidents, {
    fields: [budgets.incidentId],
    references: [incidents.id],
  }),
  provider: one(providers, {
    fields: [budgets.providerId],
    references: [providers.id],
  }),
}));

export const ratingsRelations = relations(ratings, ({ one }) => ({
  incident: one(incidents, {
    fields: [ratings.incidentId],
    references: [incidents.id],
  }),
  provider: one(providers, {
    fields: [ratings.providerId],
    references: [providers.id],
  }),
  community: one(communities, {
    fields: [ratings.communityId],
    references: [communities.id],
  }),
  ratedBy: one(users, {
    fields: [ratings.ratedById],
    references: [users.id],
  }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  community: one(communities, {
    fields: [documents.communityId],
    references: [communities.id],
  }),
  uploadedBy: one(users, {
    fields: [documents.uploadedById],
    references: [users.id],
  }),
}));

export const forumPostsRelations = relations(forumPosts, ({ one, many }) => ({
  community: one(communities, {
    fields: [forumPosts.communityId],
    references: [communities.id],
  }),
  author: one(users, {
    fields: [forumPosts.authorId],
    references: [users.id],
  }),
  replies: many(forumReplies),
}));

export const forumRepliesRelations = relations(forumReplies, ({ one }) => ({
  post: one(forumPosts, {
    fields: [forumReplies.postId],
    references: [forumPosts.id],
  }),
  author: one(users, {
    fields: [forumReplies.authorId],
    references: [users.id],
  }),
}));

export const incidentUpdatesRelations = relations(incidentUpdates, ({ one }) => ({
  incident: one(incidents, {
    fields: [incidentUpdates.incidentId],
    references: [incidents.id],
  }),
  updatedBy: one(users, {
    fields: [incidentUpdates.updatedById],
    references: [users.id],
  }),
}));