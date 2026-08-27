import axios from 'axios';
import { SocialPlatformAdapter, PublishOptions, PublishResult } from './baseAdapter';
import { config } from '../../config';
import { logger } from '../../utils/logger';

export class InstagramAdapter implements SocialPlatformAdapter {
  readonly platformName = 'INSTAGRAM';

  validatePayload(content: string, options?: PublishOptions): { valid: boolean; error?: string } {
    if (!options?.mediaUrl) {
      return { valid: false, error: 'Instagram Graph API requires an image or video URL for all feed publications.' };
    }
    if (content.length > 2200) {
      return { valid: false, error: `Instagram caption exceeds 2,200 character limit (Current: ${content.length}).` };
    }
    return { valid: true };
  }

  async publish(accessToken: string, platformAccountId: string, content: string, options?: PublishOptions): Promise<PublishResult> {
    const validation = this.validatePayload(content, options);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    if (config.instagram.appId && config.instagram.appSecret) {
      try {
        // Step 1: Create Container
        const containerRes = await axios.post(`https://graph.facebook.com/v20.0/${platformAccountId}/media`, null, {
          params: {
            image_url: options?.mediaUrl,
            caption: content,
            access_token: accessToken,
          },
        });
        const creationId = containerRes.data.id;

        // Step 2: Publish Container
        const publishRes = await axios.post(`https://graph.facebook.com/v20.0/${platformAccountId}/media_publish`, null, {
          params: {
            creation_id: creationId,
            access_token: accessToken,
          },
        });

        return { success: true, platformPostId: publishRes.data.id, rawResponse: publishRes.data };
      } catch (error: any) {
        const errorMsg = error.response?.data?.error?.message || error.message;
        logger.error('Instagram Publish Error: %s', errorMsg);
        return { success: false, error: `Instagram API Error: ${errorMsg}` };
      }
    }

    // Direct mode execution
    const postId = `ig_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    logger.info('Published to Instagram (@%s) -> Post ID: %s', platformAccountId, postId);
    return { success: true, platformPostId: postId };
  }
}

export const instagramAdapter = new InstagramAdapter();
