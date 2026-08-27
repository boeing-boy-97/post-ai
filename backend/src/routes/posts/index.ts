import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validateRequest';
import { prisma } from '../../config/database';
import { queueService } from '../../services/queue.service';
import { processPublishJob } from '../../workers/postPublisher.worker';
import { toPostDTO } from '../../dto';
import { logger } from '../../utils/logger';

const router = Router();
router.use(requireAuth);

const createPostSchema = z.object({
  body: z.object({
    content: z.string().min(1, 'Post content/caption is required'),
    accountIds: z.array(z.string()).min(1, 'At least one social account must be selected'),
    targetPlatforms: z.array(z.string()).default([]),
    platformVariants: z.record(z.string()).optional(),
    mediaUrls: z.array(z.string()).default([]),
    mediaType: z.enum(['image', 'video', 'carousel', 'text']).default('image'),
    status: z.enum(['DRAFT', 'SCHEDULED', 'PUBLISHED']).default('SCHEDULED'),
    scheduledAt: z.string().optional(),
    timezone: z.string().default('UTC'),
  }),
});

// GET /api/posts - Get user posts with status/platform filtering
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { status, platform, search } = req.query;

    const whereClause: any = { userId };

    if (status && status !== 'all' && status !== 'ALL') {
      whereClause.status = String(status).toUpperCase();
    }

    if (platform && platform !== 'all' && platform !== 'ALL') {
      whereClause.postAccounts = {
        some: {
          platform: String(platform).toUpperCase(),
        },
      };
    }

    if (search) {
      whereClause.content = {
        contains: String(search),
      };
    }

    const posts = await prisma.post.findMany({
      where: whereClause,
      include: {
        postAccounts: {
          include: {
            account: true,
          },
        },
        analytics: true,
      },
      orderBy: [
        { scheduledAt: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    res.json({
      success: true,
      count: posts.length,
      data: posts.map(toPostDTO),
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/posts/:id - Get single post
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const id = String(req.params.id);

    const post = await prisma.post.findFirst({
      where: { id, userId },
      include: {
        postAccounts: {
          include: {
            account: true,
          },
        },
        analytics: true,
        jobs: true,
      },
    });

    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found or access denied.' });
    }

    res.json({
      success: true,
      data: toPostDTO(post),
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/posts - Create / Schedule a new post
router.post('/', validateRequest(createPostSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { content, accountIds, targetPlatforms, platformVariants, mediaUrls, mediaType, status, scheduledAt, timezone } = req.body;

    const userAccounts = await prisma.account.findMany({
      where: {
        id: { in: accountIds },
        userId,
      },
    });

    if (userAccounts.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'None of the selected social accounts are connected to your profile.',
      });
    }

    const platforms = targetPlatforms && targetPlatforms.length > 0
      ? targetPlatforms
      : [...new Set(userAccounts.map((a) => a.platform))];

    let scheduledDate: Date | null = null;
    if (status === 'SCHEDULED') {
      if (!scheduledAt) {
        return res.status(400).json({ success: false, error: 'A scheduled date & time is required for scheduled posts.' });
      }
      scheduledDate = new Date(scheduledAt);
      if (isNaN(scheduledDate.getTime())) {
        return res.status(400).json({ success: false, error: 'Invalid scheduled date & time format.' });
      }
    }

    const initialStatus = status === 'PUBLISHED' ? 'PUBLISHING' : status;

    const post = await prisma.post.create({
      data: {
        userId,
        content,
        platformVariants: platformVariants ? JSON.stringify(platformVariants) : null,
        mediaUrls: JSON.stringify(mediaUrls || []),
        mediaType,
        status: initialStatus,
        scheduledAt: scheduledDate,
        timezone,
        targetPlatforms: JSON.stringify(platforms),
        postAccounts: {
          create: userAccounts.map((acc) => ({
            accountId: acc.id,
            platform: acc.platform,
            customContent: platformVariants?.[acc.platform] || null,
            status: 'PENDING',
          })),
        },
      },
      include: {
        postAccounts: {
          include: {
            account: true,
          },
        },
      },
    });

    logger.info('Post %s created by user %s with initial status %s', post.id, userId, initialStatus);

    if (status === 'PUBLISHED') {
      const publishResult = await processPublishJob(post.id);
      const updated = await prisma.post.findUnique({
        where: { id: post.id },
        include: { postAccounts: { include: { account: true } }, analytics: true },
      });
      return res.status(201).json({
        success: true,
        data: toPostDTO(updated),
        publishResult,
      });
    }

    if (status === 'SCHEDULED' && scheduledDate) {
      await queueService.schedulePostJob(post.id, scheduledDate);
    }

    res.status(201).json({
      success: true,
      data: toPostDTO(post),
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/posts/:id/publish - Publish a post immediately
router.post('/:id/publish', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const id = String(req.params.id);

    const post = await prisma.post.findFirst({
      where: { id, userId },
    });

    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found or access denied.' });
    }

    await queueService.cancelPostJob(id);
    const publishResult = await processPublishJob(id);

    const updated = await prisma.post.findUnique({
      where: { id },
      include: { postAccounts: { include: { account: true } }, analytics: true },
    });

    res.json({
      success: true,
      data: toPostDTO(updated),
      publishResult,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/posts/:id/cancel - Cancel a scheduled post
router.post('/:id/cancel', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const id = String(req.params.id);

    const post = await prisma.post.findFirst({
      where: { id, userId },
    });

    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found or access denied.' });
    }

    if (post.status === 'PUBLISHED') {
      return res.status(400).json({ success: false, error: 'Cannot cancel a post that has already been published.' });
    }

    await queueService.cancelPostJob(id);

    const updated = await prisma.post.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: { postAccounts: { include: { account: true } } },
    });

    res.json({
      success: true,
      message: 'Post scheduling cancelled successfully.',
      data: toPostDTO(updated),
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/posts/:id/retry - Retry publishing a failed post
router.post('/:id/retry', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const id = String(req.params.id);

    const post = await prisma.post.findFirst({
      where: { id, userId },
    });

    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found or access denied.' });
    }

    if (post.status !== 'FAILED' && post.status !== 'PARTIALLY_PUBLISHED') {
      return res.status(400).json({ success: false, error: 'Only failed or partially published posts can be retried.' });
    }

    await prisma.post.update({
      where: { id },
      data: { retryCount: { increment: 1 } },
    });

    const publishResult = await processPublishJob(id);

    const updated = await prisma.post.findUnique({
      where: { id },
      include: { postAccounts: { include: { account: true } }, analytics: true },
    });

    res.json({
      success: true,
      data: toPostDTO(updated),
      publishResult,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/posts/:id - Delete post
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const id = String(req.params.id);

    const post = await prisma.post.findFirst({
      where: { id, userId },
    });

    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found or access denied.' });
    }

    await queueService.cancelPostJob(id);

    await prisma.post.delete({
      where: { id },
    });

    logger.info('Post %s deleted by user %s', id, userId);
    res.json({ success: true, message: 'Post deleted successfully.', id });
  } catch (error) {
    next(error);
  }
});

export default router;
