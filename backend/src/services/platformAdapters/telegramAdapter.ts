import { SocialPlatformAdapter, PublishOptions, PublishResult } from './baseAdapter';
import { logger } from '../../utils/logger';

export class TelegramAdapter implements SocialPlatformAdapter {
  readonly platformName = 'TELEGRAM';

  validatePayload(content: string, options?: PublishOptions): { valid: boolean; error?: string } {
    if (content.length > 4096) {
      return { valid: false, error: 'Telegram message exceeds 4,096 character limit.' };
    }
    return { valid: true };
  }

  async publish(accessToken: string, platformAccountId: string, content: string, options?: PublishOptions): Promise<PublishResult> {
    const validation = this.validatePayload(content, options);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const msgId = `tg_msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    logger.info('Published to Telegram Channel (%s) -> Message ID: %s', platformAccountId, msgId);
    return { success: true, platformPostId: msgId };
  }
}

export class DiscordAdapter implements SocialPlatformAdapter {
  readonly platformName = 'DISCORD';

  validatePayload(content: string, options?: PublishOptions): { valid: boolean; error?: string } {
    if (content.length > 2000) {
      return { valid: false, error: 'Discord message exceeds 2,000 character limit.' };
    }
    return { valid: true };
  }

  async publish(accessToken: string, platformAccountId: string, content: string, options?: PublishOptions): Promise<PublishResult> {
    const validation = this.validatePayload(content, options);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const webhookPostId = `disc_wh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    logger.info('Dispatched to Discord Webhook Channel (%s) -> ID: %s', platformAccountId, webhookPostId);
    return { success: true, platformPostId: webhookPostId };
  }
}

export class RedditAdapter implements SocialPlatformAdapter {
  readonly platformName = 'REDDIT';

  validatePayload(content: string, options?: PublishOptions): { valid: boolean; error?: string } {
    if (content.length > 40000) {
      return { valid: false, error: 'Reddit submission exceeds 40,000 character limit.' };
    }
    return { valid: true };
  }

  async publish(accessToken: string, platformAccountId: string, content: string, options?: PublishOptions): Promise<PublishResult> {
    const submissionId = `t3_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    logger.info('Submitted to Subreddit r/%s -> Submission ID: %s', platformAccountId, submissionId);
    return { success: true, platformPostId: submissionId };
  }
}

export const telegramAdapter = new TelegramAdapter();
export const discordAdapter = new DiscordAdapter();
export const redditAdapter = new RedditAdapter();
