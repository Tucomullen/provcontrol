/**
 * Data Mappers
 * 
 * Converts between Drizzle ORM types and domain types.
 * This separation allows storage implementations to be independent of the ORM.
 * 
 * NOTE: Currently, IStorage interface still uses Drizzle types for compatibility.
 * Future refactoring can update IStorage to use domain types, and these mappers
 * will be used in DatabaseStorage to convert between Drizzle and domain types.
 * 
 * @module server/storage/mappers
 */

import type {
  User,
  Community,
  Provider,
  Incident,
  Budget,
  Rating,
  Document,
  ForumPost,
  ForumReply,
  CommunityInvitation,
  Transaction,
  Notification,
  AuditLog,
} from "@shared/schema";

import type {
  DomainUser,
  DomainCommunity,
  DomainProvider,
  DomainIncident,
  DomainBudget,
  DomainRating,
  DomainDocument,
  DomainForumPost,
  DomainForumReply,
  DomainCommunityInvitation,
  DomainTransaction,
  DomainNotification,
  DomainAuditLog,
} from "@shared/types";

/**
 * Convert Drizzle User to Domain User
 */
export function drizzleUserToDomain(user: User): DomainUser {
  return {
    id: user.id,
    email: user.email,
    passwordHash: user.passwordHash,
    firstName: user.firstName ?? undefined,
    lastName: user.lastName ?? undefined,
    profileImageUrl: user.profileImageUrl ?? undefined,
    role: user.role,
    communityId: user.communityId ?? undefined,
    propertyUnit: user.propertyUnit ?? undefined,
    emailVerified: user.emailVerified ?? false,
    emailVerificationToken: user.emailVerificationToken ?? undefined,
    emailVerificationExpires: user.emailVerificationExpires ?? undefined,
    createdAt: user.createdAt ?? new Date(),
    updatedAt: user.updatedAt ?? new Date(),
  };
}

/**
 * Convert Drizzle Community to Domain Community
 */
export function drizzleCommunityToDomain(community: Community): DomainCommunity {
  return {
    id: community.id,
    name: community.name,
    slug: community.slug,
    address: community.address,
    city: community.city,
    postalCode: community.postalCode,
    totalUnits: community.totalUnits,
    description: community.description ?? undefined,
    logoUrl: community.logoUrl ?? undefined,
    presidentId: community.presidentId ?? undefined,
    createdAt: community.createdAt ?? new Date(),
  };
}

/**
 * Convert Drizzle Provider to Domain Provider
 */
export function drizzleProviderToDomain(provider: Provider): DomainProvider {
  return {
    id: provider.id,
    userId: provider.userId,
    companyName: provider.companyName,
    description: provider.description ?? undefined,
    category: provider.category,
    phone: provider.phone ?? undefined,
    website: provider.website ?? undefined,
    logoUrl: provider.logoUrl ?? undefined,
    averageRating: provider.averageRating ?? "0",
    totalRatings: provider.totalRatings ?? 0,
    totalJobs: provider.totalJobs ?? 0,
    avgResponseTime: provider.avgResponseTime ?? undefined,
    isVerified: provider.isVerified ?? false,
    createdAt: provider.createdAt ?? new Date(),
    updatedAt: provider.updatedAt ?? new Date(),
  };
}

/**
 * Convert Drizzle Incident to Domain Incident
 */
export function drizzleIncidentToDomain(incident: Incident): DomainIncident {
  return {
    id: incident.id,
    communityId: incident.communityId,
    reportedById: incident.reportedById,
    title: incident.title,
    description: incident.description,
    photos: incident.photos ?? undefined,
    status: incident.status,
    assignedProviderId: incident.assignedProviderId ?? undefined,
    approvedBudgetId: incident.approvedBudgetId ?? undefined,
    finalCost: incident.finalCost ?? undefined,
    invoiceUrl: incident.invoiceUrl ?? undefined,
    resolvedAt: incident.resolvedAt ?? undefined,
    createdAt: incident.createdAt ?? new Date(),
    updatedAt: incident.updatedAt ?? new Date(),
  };
}

/**
 * Convert Drizzle Budget to Domain Budget
 */
export function drizzleBudgetToDomain(budget: Budget): DomainBudget {
  return {
    id: budget.id,
    incidentId: budget.incidentId,
    providerId: budget.providerId,
    amount: budget.amount,
    description: budget.description ?? undefined,
    status: budget.status,
    approvedAt: budget.approvedAt ?? undefined,
    approvedById: budget.approvedById ?? undefined,
    createdAt: budget.createdAt ?? new Date(),
    updatedAt: budget.updatedAt ?? new Date(),
  };
}

/**
 * Convert Drizzle Rating to Domain Rating
 */
export function drizzleRatingToDomain(rating: Rating): DomainRating {
  return {
    id: rating.id,
    providerId: rating.providerId,
    communityId: rating.communityId,
    incidentId: rating.incidentId,
    ratedById: rating.ratedById,
    overallRating: rating.overallRating,
    qualityRating: rating.qualityRating,
    timelinessRating: rating.timelinessRating,
    budgetAdherenceRating: rating.budgetAdherenceRating,
    comment: rating.comment ?? undefined,
    photos: rating.photos ?? undefined,
    providerReply: rating.providerReply ?? undefined,
    providerReplyDate: rating.providerReplyDate ?? undefined,
    helpfulCount: rating.helpfulCount ?? 0,
    createdAt: rating.createdAt ?? new Date(),
    updatedAt: rating.updatedAt ?? new Date(),
  };
}

/**
 * Convert Drizzle Document to Domain Document
 */
export function drizzleDocumentToDomain(document: Document): DomainDocument {
  return {
    id: document.id,
    communityId: document.communityId,
    uploadedById: document.uploadedById,
    title: document.title,
    description: document.description ?? undefined,
    fileUrl: document.fileUrl,
    documentType: document.documentType,
    createdAt: document.createdAt ?? new Date(),
    updatedAt: document.updatedAt ?? new Date(),
  };
}

/**
 * Convert Drizzle ForumPost to Domain ForumPost
 */
export function drizzleForumPostToDomain(post: ForumPost): DomainForumPost {
  return {
    id: post.id,
    communityId: post.communityId,
    authorId: post.authorId,
    title: post.title,
    content: post.content,
    isPinned: post.isPinned ?? false,
    lastActivityAt: post.lastActivityAt ?? post.createdAt ?? new Date(),
    createdAt: post.createdAt ?? new Date(),
    updatedAt: post.updatedAt ?? new Date(),
  };
}

/**
 * Convert Drizzle ForumReply to Domain ForumReply
 */
export function drizzleForumReplyToDomain(reply: ForumReply): DomainForumReply {
  return {
    id: reply.id,
    postId: reply.postId,
    authorId: reply.authorId,
    content: reply.content,
    createdAt: reply.createdAt ?? new Date(),
    updatedAt: reply.updatedAt ?? new Date(),
  };
}

/**
 * Convert Drizzle CommunityInvitation to Domain CommunityInvitation
 */
export function drizzleInvitationToDomain(invitation: CommunityInvitation): DomainCommunityInvitation {
  return {
    id: invitation.id,
    communityId: invitation.communityId,
    invitedBy: invitation.invitedBy,
    email: invitation.email ?? undefined,
    role: invitation.role,
    propertyUnit: invitation.propertyUnit ?? undefined,
    invitationCode: invitation.invitationCode,
    status: invitation.status,
    expiresAt: invitation.expiresAt,
    acceptedAt: invitation.acceptedAt ?? undefined,
    acceptedById: invitation.acceptedById ?? undefined,
    createdAt: invitation.createdAt ?? new Date(),
  };
}

/**
 * Convert Drizzle Transaction to Domain Transaction
 */
export function drizzleTransactionToDomain(transaction: Transaction): DomainTransaction {
  return {
    id: transaction.id,
    communityId: transaction.communityId,
    ownerId: transaction.ownerId ?? undefined,
    transactionType: transaction.transactionType,
    category: transaction.category,
    amount: transaction.amount,
    description: transaction.description ?? undefined,
    transactionDate: transaction.transactionDate,
    relatedIncidentId: transaction.relatedIncidentId ?? undefined,
    relatedBudgetId: transaction.relatedBudgetId ?? undefined,
    createdAt: transaction.createdAt ?? new Date(),
    updatedAt: transaction.updatedAt ?? new Date(),
  };
}

/**
 * Convert Drizzle Notification to Domain Notification
 */
export function drizzleNotificationToDomain(notification: Notification): DomainNotification {
  return {
    id: notification.id,
    userId: notification.userId,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    relatedEntityType: notification.relatedEntityType ?? undefined,
    relatedEntityId: notification.relatedEntityId ?? undefined,
    isRead: notification.isRead ?? false,
    createdAt: notification.createdAt ?? new Date(),
  };
}

/**
 * Convert Drizzle AuditLog to Domain AuditLog
 */
export function drizzleAuditLogToDomain(log: AuditLog): DomainAuditLog {
  return {
    id: log.id,
    userId: log.userId ?? undefined,
    action: log.action,
    entityType: log.entityType ?? undefined,
    entityId: log.entityId ?? undefined,
    metadata: log.metadata ?? undefined,
    createdAt: log.createdAt ?? new Date(),
  };
}

