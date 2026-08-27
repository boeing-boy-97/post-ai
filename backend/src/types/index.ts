export type PlatformType = 'instagram' | 'linkedin' | 'twitter';
export type PostStatus = 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed';
export type MediaType = 'image' | 'video' | 'carousel' | 'text';

export interface User {
  id?: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Account {
  id?: string;
  userId: string;
  platform: PlatformType;
  accountName: string;
  accountHandle: string;
  profilePicUrl?: string;
  followerCount: number;
  status: 'connected' | 'expired' | 'disconnected';
  tokenExpiresAt: string;
  accessToken: string;
  connectedAt: string;
}

export interface Post {
  id?: string;
  userId: string;
  accountIds: string[];
  platforms: PlatformType[];
  content: string;
  mediaUrls: string[];
  mediaType: MediaType;
  status: PostStatus;
  scheduledAt?: string;
  publishedAt?: string;
  platformPostIds?: Record<string, string>;
  aiGenerated?: boolean;
  hashtags?: string[];
  error?: string;
  analytics?: {
    likes: number;
    comments: number;
    shares: number;
    impressions: number;
    reach: number;
    engagementRate: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AIContentRecord {
  id?: string;
  userId: string;
  prompt: string;
  platform: PlatformType;
  tone: string;
  generatedContent: string;
  suggestedHashtags: string[];
  variations: string[];
  createdAt: string;
}

export interface AnalyticsSummary {
  totalPosts: number;
  scheduledPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalImpressions: number;
  totalReach: number;
  averageEngagementRate: number;
  followersGrowth: number;
  platformBreakdown: {
    instagram: { posts: number; reach: number; engagement: number };
    linkedin: { posts: number; reach: number; engagement: number };
  };
  weeklyTrend: { day: string; reach: number; engagement: number; posts: number }[];
  bestPostingTimes: { day: string; time: string; engagementScore: number }[];
  topPosts: Post[];
}
