import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { requireAuth } from '../../middleware/auth';
import { instagramService } from '../../services/instagram.service';
import { encryptToken } from '../../utils/encryption';
import { prisma } from '../../config/database';
import { config } from '../../config';
import { logger } from '../../utils/logger';

const router = Router();

const oauthStates = new Map<string, { userId: string; expiresAt: number }>();

// GET /api/auth/instagram/connect
router.get('/connect', requireAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const state = crypto.randomBytes(24).toString('hex');
    oauthStates.set(state, { userId, expiresAt: Date.now() + 10 * 60 * 1000 });

    const now = Date.now();
    for (const [k, v] of oauthStates.entries()) {
      if (v.expiresAt < now) oauthStates.delete(k);
    }

    if (!config.instagram.appId) {
      return res.json({
        success: false,
        requiresConfig: true,
        message: 'Instagram App ID is not configured. Please configure INSTAGRAM_APP_ID and INSTAGRAM_APP_SECRET in backend/.env to initiate live OAuth.',
      });
    }

    const authUrl = instagramService.getAuthorizationUrl(state);
    res.json({ success: true, authUrl });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/instagram/callback
router.get('/callback', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, state, error, error_description } = req.query;

    if (error) {
      logger.warn('Instagram OAuth denied: %s', error_description || error);
      return res.redirect(`${config.frontendUrl}/accounts?error=${encodeURIComponent(String(error_description || error))}`);
    }

    if (!state || !oauthStates.has(String(state))) {
      return res.redirect(`${config.frontendUrl}/accounts?error=${encodeURIComponent('Invalid or expired OAuth state.')}`);
    }

    const stateData = oauthStates.get(String(state))!;
    oauthStates.delete(String(state));

    const tokenData = await instagramService.exchangeCodeForToken(String(code));
    const encryptedToken = encryptToken(tokenData.accessToken);
    const tokenExpiresAt = tokenData.expiresIn ? new Date(Date.now() + tokenData.expiresIn * 1000) : null;

    await prisma.account.upsert({
      where: {
        userId_platform_platformAccountId: {
          userId: stateData.userId,
          platform: 'INSTAGRAM',
          platformAccountId: tokenData.platformAccountId,
        },
      },
      create: {
        userId: stateData.userId,
        platform: 'INSTAGRAM',
        platformAccountId: tokenData.platformAccountId,
        accountName: tokenData.accountName,
        accountHandle: tokenData.accountHandle,
        status: 'CONNECTED',
        accessTokenEnc: encryptedToken,
        tokenExpiresAt,
      },
      update: {
        accountName: tokenData.accountName,
        accountHandle: tokenData.accountHandle,
        status: 'CONNECTED',
        accessTokenEnc: encryptedToken,
        tokenExpiresAt,
      },
    });

    logger.info('Instagram account connected for user %s: @%s', stateData.userId, tokenData.accountHandle);
    res.redirect(`${config.frontendUrl}/accounts?connected=instagram`);
  } catch (error: any) {
    logger.error('Instagram Callback Exception: %s', error.message);
    res.redirect(`${config.frontendUrl}/accounts?error=${encodeURIComponent(error.message)}`);
  }
});

export default router;
