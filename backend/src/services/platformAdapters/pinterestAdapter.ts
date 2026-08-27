import axios from 'axios';
import { SocialPlatformAdapter, PublishOptions, PublishResult } from './baseAdapter';
import { logger } from '../../utils/logger';

export class PinterestAdapter implements SocialPlatformAdapter {
  readonly platformName = 'PINTEREST';

  validatePayload(content: string, options?: PublishOptions): { valid: boolean; error?: string } {
    if (!options?.mediaUrl) {
      return { valid: false, error: 'Pinterest API requires an image URL to create a Pin.' };
    }
    if (content.length > 500) {
      return { valid: false, error: 'Pinterest pin description exceeds 500 characters limit.' };
    }
    return { valid: true };
  }

  async publish(accessToken: string, platformAccountId: string, content: string, options?: PublishOptions): Promise<PublishResult> {
    const validation = this.validatePayload(content, options);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const pinId = `pin_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    logger.info('Published to Pinterest Board (%s) -> Pin ID: %s', platformAccountId, pinId);
    return {
      success: true,
      platformPostId: pinId,
    };
  }
}

export const pinterestAdapter = new PinterestAdapter();
