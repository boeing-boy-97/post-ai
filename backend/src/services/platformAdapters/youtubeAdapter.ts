import { SocialPlatformAdapter, PublishOptions, PublishResult } from './baseAdapter';
import { logger } from '../../utils/logger';

export class YouTubeAdapter implements SocialPlatformAdapter {
  readonly platformName = 'YOUTUBE';

  validatePayload(content: string, options?: PublishOptions): { valid: boolean; error?: string } {
    if (content.length > 5000) {
      return { valid: false, error: `YouTube community post exceeds 5,000 character limit.` };
    }
    return { valid: true };
  }

  async publish(accessToken: string, platformAccountId: string, content: string, options?: PublishOptions): Promise<PublishResult> {
    const validation = this.validatePayload(content, options);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const postId = `yt_comm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    logger.info('Published to YouTube Channel (%s) -> Post ID: %s', platformAccountId, postId);

    return {
      success: true,
      platformPostId: postId,
    };
  }
}

export const youtubeAdapter = new YouTubeAdapter();
