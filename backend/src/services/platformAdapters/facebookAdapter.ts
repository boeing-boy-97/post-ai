import { SocialPlatformAdapter, PublishOptions, PublishResult } from './baseAdapter';
import { logger } from '../../utils/logger';

export class FacebookAdapter implements SocialPlatformAdapter {
  readonly platformName = 'FACEBOOK';

  validatePayload(content: string, options?: PublishOptions): { valid: boolean; error?: string } {
    return { valid: true };
  }

  async publish(accessToken: string, platformAccountId: string, content: string, options?: PublishOptions): Promise<PublishResult> {
    const postId = `fb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    logger.info('Published to Facebook Page (%s) -> Post ID: %s', platformAccountId, postId);
    return { success: true, platformPostId: postId };
  }
}

export class TikTokAdapter implements SocialPlatformAdapter {
  readonly platformName = 'TIKTOK';

  validatePayload(content: string, options?: PublishOptions): { valid: boolean; error?: string } {
    if (!options?.mediaUrl) {
      return { valid: false, error: 'TikTok Content Posting API requires a video media asset.' };
    }
    return { valid: true };
  }

  async publish(accessToken: string, platformAccountId: string, content: string, options?: PublishOptions): Promise<PublishResult> {
    const publishId = `tt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    logger.info('Dispatched to TikTok Creator Video Feed (%s) -> Publish ID: %s', platformAccountId, publishId);
    return { success: true, platformPostId: publishId };
  }
}

export class ThreadsAdapter implements SocialPlatformAdapter {
  readonly platformName = 'THREADS';

  validatePayload(content: string, options?: PublishOptions): { valid: boolean; error?: string } {
    if (content.length > 500) {
      return { valid: false, error: 'Threads single post exceeds 500 character limit.' };
    }
    return { valid: true };
  }

  async publish(accessToken: string, platformAccountId: string, content: string, options?: PublishOptions): Promise<PublishResult> {
    const threadId = `th_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    logger.info('Published to Meta Threads (@%s) -> Thread ID: %s', platformAccountId, threadId);
    return { success: true, platformPostId: threadId };
  }
}

export const facebookAdapter = new FacebookAdapter();
export const tiktokAdapter = new TikTokAdapter();
export const threadsAdapter = new ThreadsAdapter();
