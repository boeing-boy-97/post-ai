import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { requireAuth } from '../../middleware/auth';
import { linkedinService } from '../../services/linkedin.service';
import { encryptToken } from '../../utils/encryption';
import { prisma } from '../../config/database';
import { config } from '../../config';
import { logger } from '../../utils/logger';

const router = Router();

const oauthStates = new Map<string, { userId: string; expiresAt: number }>();

// GET /api/auth/linkedin/connect
router.get('/connect', requireAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const state = crypto.randomBytes(24).toString('hex');
    oauthStates.set(state, { userId, expiresAt: Date.now() + 10 * 60 * 1000 });

    if (!config.linkedin.clientId) {
      return res.json({
        success: false,
        requiresConfig: true,
        message: 'LinkedIn Client ID is not configured. Please set LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET in backend/.env to initiate live OAuth.',
      });
    }

    const authUrl = linkedinService.getAuthorizationUrl(state);
    res.json({ success: true, authUrl });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/linkedin/callback
router.get('/callback', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, state, error, error_description } = req.query;

    if (error) {
      logger.warn('LinkedIn OAuth denied: %s', error_description || error);
      return res.redirect(`${config.frontendUrl}/accounts?error=${encodeURIComponent(String(error_description || error))}`);
    }

    if (!state || !oauthStates.has(String(state))) {
      return res.redirect(`${config.frontendUrl}/accounts?error=${encodeURIComponent('Invalid or expired OAuth state.')}`);
    }

    const stateData = oauthStates.get(String(state))!;
    oauthStates.delete(String(state));

    const tokenData = await linkedinService.exchangeCodeForToken(String(code));
    const encryptedToken = encryptToken(tokenData.accessToken);
    const tokenExpiresAt = tokenData.expiresIn ? new Date(Date.now() + tokenData.expiresIn * 1000) : null;

    await prisma.account.upsert({
      where: {
        userId_platform_platformAccountId: {
          userId: stateData.userId,
          platform: 'LINKEDIN',
          platformAccountId: tokenData.platformAccountId,
        },
      },
      create: {
        userId: stateData.userId,
        platform: 'LINKEDIN',
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

    logger.info('LinkedIn account connected for user %s: %s', stateData.userId, tokenData.accountName);
    res.redirect(`${config.frontendUrl}/accounts?connected=linkedin`);
  } catch (error: any) {
    logger.error('LinkedIn Callback Exception: %s', error.message);
    res.redirect(`${config.frontendUrl}/accounts?error=${encodeURIComponent(error.message)}`);
  }
});

export default router;
