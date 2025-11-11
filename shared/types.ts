/**
 * Domain Types
 * 
 * These types represent the domain model independent of any ORM or database implementation.
 * They are used by the IStorage interface to ensure storage implementations are swappable.
 * 
 * These types are based on the Drizzle schema types but don't depend on Drizzle itself,
 * making them portable across different storage backends (PostgreSQL, PocketBase, etc.).
 * 
 * @module shared/types
 */

/**
 * User domain type
 */
export interface DomainUser {
  id: string;
  email: string;
  passwordHash?: string; // Only present in storage layer, never returned to API
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
  role: "presidente" | "propietario" | "proveedor";
  communityId?: string | null;
  propertyUnit?: string | null;
  emailVerified: boolean;
  emailVerificationToken?: string | null;
  emailVerificationExpires?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Community domain type
 */
export interface DomainCommunity {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  postalCode: string;
  totalUnits: number;
  description?: string | null;
  logoUrl?: string | null;
  presidentId?: string | null;
  createdAt: Date;
}

/**
 * Provider domain type
 */
export interface DomainProvider {
  id: string;
  userId: string;
  companyName: string;
  description?: string | null;
  category: string;
  phone?: string | null;
  website?: string | null;
  logoUrl?: string | null;
  averageRating: string;
  totalRatings: number;
  totalJobs: number;
  avgResponseTime?: number | null;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Incident domain type
 */
export interface DomainIncident {
  id: string;
  communityId: string;
  reportedById: string;
  title: string;
  description: string;
  photos?: string[] | null;
  status: "abierta" | "presupuestada" | "aprobada" | "en_curso" | "resuelta";
  assignedProviderId?: string | null;
  approvedBudgetId?: string | null;
  finalCost?: string | null;
  invoiceUrl?: string | null;
  resolvedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Budget domain type
 */
export interface DomainBudget {
  id: string;
  incidentId: string;
  providerId: string;
  amount: string;
  description?: string | null;
  status: "pendiente" | "aprobado" | "rechazado";
  approvedAt?: Date | null;
  approvedById?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Rating domain type
 */
export interface DomainRating {
  id: string;
  providerId: string;
  communityId: string;
  incidentId: string;
  ratedById: string;
  overallRating: number;
  qualityRating: number;
  timelinessRating: number;
  budgetAdherenceRating: number;
  comment?: string | null;
  photos?: string[] | null;
  providerReply?: string | null;
  providerReplyDate?: Date | null;
  helpfulCount: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Document domain type
 */
export interface DomainDocument {
  id: string;
  communityId: string;
  uploadedById: string;
  title: string;
  description?: string | null;
  fileUrl: string;
  documentType: "acta" | "estatuto" | "factura" | "presupuesto" | "contrato" | "otro";
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Forum Post domain type
 */
export interface DomainForumPost {
  id: string;
  communityId: string;
  authorId: string;
  title: string;
  content: string;
  isPinned: boolean;
  lastActivityAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Forum Reply domain type
 */
export interface DomainForumReply {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Community Invitation domain type
 */
export interface DomainCommunityInvitation {
  id: string;
  communityId: string;
  invitedBy: string;
  email?: string | null;
  role: "presidente" | "propietario" | "proveedor";
  propertyUnit?: string | null;
  invitationCode: string;
  status: "pendiente" | "aceptada" | "expirada" | "cancelada";
  expiresAt: Date;
  acceptedAt?: Date | null;
  acceptedById?: string | null;
  createdAt: Date;
}

/**
 * Transaction domain type
 */
export interface DomainTransaction {
  id: string;
  communityId: string;
  ownerId?: string | null;
  transactionType: "gasto" | "ingreso";
  category: string;
  amount: string;
  description?: string | null;
  transactionDate: Date;
  relatedIncidentId?: string | null;
  relatedBudgetId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Notification domain type
 */
export interface DomainNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  relatedEntityType?: string | null;
  relatedEntityId?: string | null;
  isRead: boolean;
  createdAt: Date;
}

/**
 * Audit Log domain type
 */
export interface DomainAuditLog {
  id: string;
  userId?: string | null;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: Record<string, any> | null;
  createdAt: Date;
}

