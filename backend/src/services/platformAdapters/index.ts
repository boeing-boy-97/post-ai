import { SocialPlatformAdapter } from './baseAdapter';
import { instagramAdapter } from './instagramAdapter';
import { linkedinAdapter } from './linkedinAdapter';
import { twitterAdapter } from './twitterAdapter';
import { youtubeAdapter } from './youtubeAdapter';
import { facebookAdapter, tiktokAdapter, threadsAdapter } from './facebookAdapter';
import { pinterestAdapter } from './pinterestAdapter';
import { blueskyAdapter } from './blueskyAdapter';
import { telegramAdapter, discordAdapter, redditAdapter } from './telegramAdapter';

export const platformAdapters: Record<string, SocialPlatformAdapter> = {
  INSTAGRAM: instagramAdapter,
  LINKEDIN: linkedinAdapter,
  TWITTER: twitterAdapter,
  X: twitterAdapter,
  YOUTUBE: youtubeAdapter,
  FACEBOOK: facebookAdapter,
  THREADS: threadsAdapter,
  TIKTOK: tiktokAdapter,
  PINTEREST: pinterestAdapter,
  BLUESKY: blueskyAdapter,
  TELEGRAM: telegramAdapter,
  DISCORD: discordAdapter,
  REDDIT: redditAdapter,
};

export function getPlatformAdapter(platform: string): SocialPlatformAdapter | undefined {
  return platformAdapters[platform.toUpperCase()];
}
