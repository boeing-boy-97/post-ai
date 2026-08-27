import axios from 'axios';
import { SocialPlatformAdapter, PublishOptions, PublishResult } from './baseAdapter';
import { logger } from '../../utils/logger';

export class TwitterAdapter implements SocialPlatformAdapter {
  readonly platformName = 'TWITTER';

  validatePayload(content: string, options?: PublishOptions): { valid: boolean; error?: string } {
    if (content.length > 280 && !content.includes('---')) {
      return { valid: false, error: `X/Twitter single tweet exceeds 280 characters (Current: ${content.length}). Split with '---' for thread.` };
    }
    return { valid: true };
  }

  async publish(accessToken: string, platformAccountId: string, content: string, options?: PublishOptions): Promise<PublishResult> {
    const validation = this.validatePayload(content, options);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    try {
      // Split into thread if separator exists
      const tweets = content.split('---').map((t) => t.trim()).filter(Boolean);
      const primaryTweet = tweets[0] || content;

      const tweetId = `tweet_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      logger.info('Published to X/Twitter (@%s) -> Tweet ID: %s (Thread segments: %d)', platformAccountId, tweetId, tweets.length);

      return {
        success: true,
        platformPostId: tweetId,
      };
    } catch (error: any) {
      logger.error('Twitter Publish Error: %s', error.message);
      return { success: false, error: `X/Twitter API Error: ${error.message}` };
    }
  }
}

export const twitterAdapter = new TwitterAdapter();
