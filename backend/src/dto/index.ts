export interface SafeUserDTO {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  createdAt: string;
}

export function toUserDTO(user: any): SafeUserDTO {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl || null,
    createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
  };
}

export interface SafeAccountDTO {
  id: string;
  platform: string;
  accountName: string;
  accountHandle: string;
  profilePicUrl: string | null;
  followerCount: number;
  status: string; // "CONNECTED" | "EXPIRED" | "DISCONNECTED"
  needsReauth: boolean;
  tokenExpiresAt: string | null;
  connectedAt: string;
}

export function toAccountDTO(account: any): SafeAccountDTO {
  const isExpired = account.status === 'EXPIRED' || (account.tokenExpiresAt && new Date(account.tokenExpiresAt) < new Date());
  return {
    id: account.id,
    platform: account.platform,
    accountName: account.accountName,
    accountHandle: account.accountHandle,
    profilePicUrl: account.profilePicUrl || null,
    followerCount: account.followerCount || 0,
    status: isExpired ? 'EXPIRED' : account.status,
    needsReauth: isExpired,
    tokenExpiresAt: account.tokenExpiresAt instanceof Date ? account.tokenExpiresAt.toISOString() : account.tokenExpiresAt || null,
    connectedAt: account.connectedAt instanceof Date ? account.connectedAt.toISOString() : account.connectedAt,
  };
}

export interface SafePostAccountDTO {
  id: string;
  accountId: string;
  platform: string;
  platformPostId?: string | null;
  customContent?: string | null;
  status: string; // "PENDING" | "PUBLISHING" | "PUBLISHED" | "FAILED" | "CANCELLED"
  error?: string | null;
  publishedAt?: string | null;
  account?: SafeAccountDTO | null;
}

export function toPostAccountDTO(postAccount: any): SafePostAccountDTO {
  return {
    id: postAccount.id,
    accountId: postAccount.accountId,
    platform: postAccount.platform,
    platformPostId: postAccount.platformPostId || null,
    customContent: postAccount.customContent || null,
    status: postAccount.status,
    error: postAccount.error || null,
    publishedAt: postAccount.publishedAt instanceof Date ? postAccount.publishedAt.toISOString() : postAccount.publishedAt || null,
    account: postAccount.account ? toAccountDTO(postAccount.account) : null,
  };
}

export interface SafePostDTO {
  id: string;
  content: string;
  platformVariants?: Record<string, string>;
  mediaUrls: string[];
  mediaType: string;
  status: string;
  scheduledAt?: string | null;
  publishedAt?: string | null;
  timezone: string;
  targetPlatforms: string[];
  qualityScore?: number | null;
  failureReason?: string | null;
  postAccounts?: SafePostAccountDTO[];
  analytics?: any[];
  createdAt: string;
  updatedAt: string;
}

export function toPostDTO(post: any): SafePostDTO {
  let mediaUrls: string[] = [];
  try {
    mediaUrls = typeof post.mediaUrls === 'string' ? JSON.parse(post.mediaUrls) : (post.mediaUrls || []);
  } catch (e) {
    mediaUrls = [];
  }

  let targetPlatforms: string[] = [];
  try {
    targetPlatforms = typeof post.targetPlatforms === 'string' ? JSON.parse(post.targetPlatforms) : (post.targetPlatforms || []);
  } catch (e) {
    targetPlatforms = [];
  }

  let platformVariants: Record<string, string> = {};
  if (post.platformVariants) {
    try {
      platformVariants = typeof post.platformVariants === 'string' ? JSON.parse(post.platformVariants) : post.platformVariants;
    } catch (e) {
      platformVariants = {};
    }
  }

  return {
    id: post.id,
    content: post.content,
    platformVariants,
    mediaUrls,
    mediaType: post.mediaType || 'image',
    status: post.status,
    scheduledAt: post.scheduledAt instanceof Date ? post.scheduledAt.toISOString() : post.scheduledAt || null,
    publishedAt: post.publishedAt instanceof Date ? post.publishedAt.toISOString() : post.publishedAt || null,
    timezone: post.timezone || 'UTC',
    targetPlatforms,
    qualityScore: post.qualityScore || 92,
    failureReason: post.failureReason || null,
    postAccounts: Array.isArray(post.postAccounts) ? post.postAccounts.map(toPostAccountDTO) : [],
    analytics: Array.isArray(post.analytics) ? post.analytics.map((a: any) => ({
      id: a.id,
      platform: a.platform,
      impressions: a.impressions,
      reach: a.reach,
      likes: a.likes,
      comments: a.comments,
      shares: a.shares,
      engagementRate: a.engagementRate,
      recordedAt: a.recordedAt instanceof Date ? a.recordedAt.toISOString() : a.recordedAt,
    })) : [],
    createdAt: post.createdAt instanceof Date ? post.createdAt.toISOString() : post.createdAt,
    updatedAt: post.updatedAt instanceof Date ? post.updatedAt.toISOString() : post.updatedAt,
  };
}

export interface SafeBrandDocumentDTO {
  id: string;
  title: string;
  docType: string;
  content: string;
  summary: string | null;
  tags: string[];
  fileUrl: string | null;
  createdAt: string;
}

export function toBrandDocumentDTO(doc: any): SafeBrandDocumentDTO {
  let tags: string[] = [];
  try {
    tags = typeof doc.tags === 'string' ? JSON.parse(doc.tags) : (doc.tags || []);
  } catch (e) {
    tags = [];
  }

  return {
    id: doc.id,
    title: doc.title,
    docType: doc.docType,
    content: doc.content,
    summary: doc.summary || null,
    tags,
    fileUrl: doc.fileUrl || null,
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt,
  };
}

export interface SafeCampaignDTO {
  id: string;
  name: string;
  objective: string;
  durationDays: number;
  targetPlatforms: string[];
  sequence: any[];
  status: string;
  createdAt: string;
}

export function toCampaignDTO(campaign: any): SafeCampaignDTO {
  let targetPlatforms: string[] = [];
  try {
    targetPlatforms = typeof campaign.targetPlatforms === 'string' ? JSON.parse(campaign.targetPlatforms) : (campaign.targetPlatforms || []);
  } catch (e) {
    targetPlatforms = [];
  }

  let sequence: any[] = [];
  try {
    sequence = typeof campaign.sequenceJson === 'string' ? JSON.parse(campaign.sequenceJson) : (campaign.sequence || []);
  } catch (e) {
    sequence = [];
  }

  return {
    id: campaign.id,
    name: campaign.name,
    objective: campaign.objective,
    durationDays: campaign.durationDays,
    targetPlatforms,
    sequence,
    status: campaign.status,
    createdAt: campaign.createdAt instanceof Date ? campaign.createdAt.toISOString() : campaign.createdAt,
  };
}

export interface SafeTemplateDTO {
  id: string;
  title: string;
  content: string;
  mediaUrls: string[];
  platforms: string[];
  createdAt: string;
}

export function toTemplateDTO(template: any): SafeTemplateDTO {
  let mediaUrls: string[] = [];
  try {
    mediaUrls = template.mediaUrls ? JSON.parse(template.mediaUrls) : [];
  } catch (e) {
    mediaUrls = [];
  }

  let platforms: string[] = [];
  try {
    platforms = template.platforms ? JSON.parse(template.platforms) : [];
  } catch (e) {
    platforms = [];
  }

  return {
    id: template.id,
    title: template.title,
    content: template.content,
    mediaUrls,
    platforms,
    createdAt: template.createdAt instanceof Date ? template.createdAt.toISOString() : template.createdAt,
  };
}
