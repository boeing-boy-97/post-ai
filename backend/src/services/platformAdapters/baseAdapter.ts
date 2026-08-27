export interface PublishOptions {
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'carousel' | 'text';
  customTitle?: string;
  isDraft?: boolean;
}

export interface PublishResult {
  success: boolean;
  platformPostId?: string;
  error?: string;
  rawResponse?: any;
}

export interface SocialPlatformAdapter {
  readonly platformName: string;
  publish(
    accessToken: string,
    platformAccountId: string,
    content: string,
    options?: PublishOptions
  ): Promise<PublishResult>;
  validatePayload(content: string, options?: PublishOptions): { valid: boolean; error?: string };
}
