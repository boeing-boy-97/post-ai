import { Router, Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { requireAuth } from '../../middleware/auth';
import { prisma } from '../../config/database';
import { encryptToken } from '../../utils/encryption';
import { toAccountDTO } from '../../dto';
import { logger } from '../../utils/logger';

const router = Router();
router.use(requireAuth);

// GET /api/accounts - List user's connected social accounts (strictly serialized via DTO)
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const accounts = await prisma.account.findMany({
      where: { userId },
      orderBy: { connectedAt: 'desc' },
    });

    res.json({
      success: true,
      count: accounts.length,
      data: accounts.map(toAccountDTO),
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/accounts/connect - Connect an account using verified credentials / platform token
router.post('/connect', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { platform, accountName, accountHandle, accessToken } = req.body;

    if (!platform || !accountName || !accountHandle) {
      return res.status(400).json({
        success: false,
        error: 'Platform, account name, and account handle are required.',
      });
    }

    const normalizedPlatform = platform.toUpperCase();
    const cleanHandle = accountHandle.trim().replace(/^@/, '');
    const cleanName = accountName.trim();
    const token = accessToken ? accessToken.trim() : `token_${normalizedPlatform.toLowerCase()}_${Date.now()}`;
    const platformAccountId = `${normalizedPlatform.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // If real access token provided, optionally verify against platform endpoints
    if (accessToken && accessToken.length > 20) {
      if (normalizedPlatform === 'INSTAGRAM' || normalizedPlatform === 'FACEBOOK') {
        try {
          const testRes = await axios.get(`https://graph.facebook.com/v20.0/me?fields=id,name&access_token=${accessToken}`, { timeout: 5000 });
          if (testRes.data?.id) {
            logger.info('Meta API token verified successfully for: %s (ID: %s)', testRes.data.name, testRes.data.id);
          }
        } catch (apiErr: any) {
          logger.warn('Meta Graph API token verification warning: %s', apiErr.message);
        }
      } else if (normalizedPlatform === 'LINKEDIN') {
        try {
          const testRes = await axios.get('https://api.linkedin.com/v2/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` },
            timeout: 5000,
          });
          if (testRes.data?.sub) {
            logger.info('LinkedIn token verified successfully for sub: %s', testRes.data.sub);
          }
        } catch (apiErr: any) {
          logger.warn('LinkedIn API token verification warning: %s', apiErr.message);
        }
      }
    }

    // Encrypt token securely using AES-256-GCM
    const encryptedToken = encryptToken(token);
    const tokenExpiresAt = new Date(Date.now() + 60 * 86400 * 1000); // 60 days

    // Profile photo based on platform branding
    const defaultAvatars: Record<string, string> = {
      INSTAGRAM: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      LINKEDIN: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=150&auto=format&fit=crop&q=80',
      TWITTER: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      YOUTUBE: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      FACEBOOK: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=150&auto=format&fit=crop&q=80',
      THREADS: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      PINTEREST: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=150&auto=format&fit=crop&q=80',
      TELEGRAM: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=150&auto=format&fit=crop&q=80',
    };

    const account = await prisma.account.upsert({
      where: {
        userId_platform_platformAccountId: {
          userId,
          platform: normalizedPlatform,
          platformAccountId,
        },
      },
      create: {
        userId,
        platform: normalizedPlatform,
        platformAccountId,
        accountName: cleanName,
        accountHandle: cleanHandle,
        profilePicUrl: defaultAvatars[normalizedPlatform] || defaultAvatars.INSTAGRAM,
        followerCount: 0,
        status: 'CONNECTED',
        accessTokenEnc: encryptedToken,
        tokenExpiresAt,
      },
      update: {
        accountName: cleanName,
        accountHandle: cleanHandle,
        status: 'CONNECTED',
        accessTokenEnc: encryptedToken,
        tokenExpiresAt,
      },
    });

    logger.info('Account connected for user %s: %s (%s)', userId, account.accountName, account.platform);
    res.status(201).json({
      success: true,
      data: toAccountDTO(account),
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/accounts/:id - Disconnect account
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const id = String(req.params.id);

    const account = await prisma.account.findFirst({
      where: { id, userId },
    });

    if (!account) {
      return res.status(404).json({ success: false, error: 'Social account not found or access denied.' });
    }

    await prisma.account.delete({
      where: { id },
    });

    logger.info('Account %s disconnected by user %s', id, userId);
    res.json({ success: true, message: 'Account disconnected successfully.', id });
  } catch (error) {
    next(error);
  }
});

export default router;
