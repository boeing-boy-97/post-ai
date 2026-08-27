import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '8000', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:8000',
  apiUrl: process.env.API_URL || 'http://localhost:8000',

  // Authentication & Security
  jwt: {
    secret: process.env.JWT_SECRET || 'super-secret-production-jwt-key-2026-scheduler',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  encryptionKey: process.env.ENCRYPTION_KEY || 'super-secure-production-encryption-key-32-chars!!',

  // Social Integrations
  instagram: {
    appId: process.env.INSTAGRAM_APP_ID || '',
    appSecret: process.env.INSTAGRAM_APP_SECRET || '',
    redirectUri: process.env.INSTAGRAM_REDIRECT_URI || 'http://localhost:8000/api/auth/instagram/callback',
  },
  linkedin: {
    clientId: process.env.LINKEDIN_CLIENT_ID || '',
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
    redirectUri: process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:8000/api/auth/linkedin/callback',
  },

  // AI
  ai: {
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.AI_MODEL || 'gpt-4o-mini',
    maxTokens: parseInt(process.env.AI_MAX_TOKENS || '800', 10),
  },

  // Media Storage (Cloudinary)
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
};
