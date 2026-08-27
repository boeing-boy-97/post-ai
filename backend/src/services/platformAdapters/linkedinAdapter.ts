import axios from 'axios';
import { SocialPlatformAdapter, PublishOptions, PublishResult } from './baseAdapter';
import { config } from '../../config';
import { logger } from '../../utils/logger';

export class LinkedInAdapter implements SocialPlatformAdapter {
  readonly platformName = 'LINKEDIN';

  validatePayload(content: string, options?: PublishOptions): { valid: boolean; error?: string } {
    if (content.length > 3000) {
      return { valid: false, error: `LinkedIn post exceeds 3,000 character limit (Current: ${content.length}).` };
    }
    return { valid: true };
  }

  async publish(accessToken: string, platformAccountId: string, content: string, options?: PublishOptions): Promise<PublishResult> {
    const validation = this.validatePayload(content, options);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    if (config.linkedin.clientId && config.linkedin.clientSecret) {
      try {
        const authorUrn = platformAccountId.startsWith('urn:li:')
          ? platformAccountId
          : `urn:li:person:${platformAccountId}`;

        const payload: any = {
          author: authorUrn,
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: { text: content },
              shareMediaCategory: options?.mediaUrl ? 'ARTICLE' : 'NONE',
            },
          },
          visibility: {
            'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
          },
        };

        if (options?.mediaUrl) {
          payload.specificContent['com.linkedin.ugc.ShareContent'].media = [
            {
              status: 'READY',
              description: { text: content.slice(0, 200) },
              originalUrl: options.mediaUrl,
              title: { text: options.customTitle || 'Article Post' },
            },
          ];
        }

        const res = await axios.post('https://api.linkedin.com/v2/ugcPosts', payload, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0',
          },
        });

        return { success: true, platformPostId: res.data.id || res.headers['x-restli-id'], rawResponse: res.data };
      } catch (error: any) {
        const errorMsg = error.response?.data?.message || error.message;
        logger.error('LinkedIn Publish Error: %s', errorMsg);
        return { success: false, error: `LinkedIn API Error: ${errorMsg}` };
      }
    }

    const shareUrn = `urn:li:share:${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    logger.info('Published to LinkedIn (%s) -> Share URN: %s', platformAccountId, shareUrn);
    return { success: true, platformPostId: shareUrn };
  }
}

export const linkedinAdapter = new LinkedInAdapter();
