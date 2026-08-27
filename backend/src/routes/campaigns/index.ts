import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validateRequest';
import { prisma } from '../../config/database';
import { aiService } from '../../services/ai.service';
import { queueService } from '../../services/queue.service';
import { toCampaignDTO } from '../../dto';
import { logger } from '../../utils/logger';

const router = Router();
router.use(requireAuth);

const generateCampaignSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Campaign name is required'),
    objective: z.string().min(2, 'Objective is required'),
    durationDays: z.number().int().min(1).max(30).default(7),
    targetPlatforms: z.array(z.string()).min(1, 'Select at least one platform'),
  }),
});

// GET /api/campaigns - List user campaigns
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const campaigns = await prisma.campaign.findMany({
      where: { userId },
      include: {
        posts: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: campaigns.map(toCampaignDTO),
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/campaigns/generate - Generate 7-Day Campaign Sequence with AI
router.post('/generate', validateRequest(generateCampaignSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { name, objective, durationDays, targetPlatforms } = req.body;

    const sequence = await aiService.generateCampaignSequence(name, objective, durationDays, targetPlatforms);

    const campaign = await prisma.campaign.create({
      data: {
        userId,
        name,
        objective,
        durationDays,
        targetPlatforms: JSON.stringify(targetPlatforms),
        sequenceJson: JSON.stringify(sequence),
        status: 'ACTIVE',
      },
    });

    logger.info('Campaign created by user %s: %s (%d days)', userId, name, durationDays);
    res.status(201).json({
      success: true,
      data: toCampaignDTO(campaign),
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/campaigns/:id/approve-schedule - Approve and schedule entire campaign sequence
router.post('/:id/approve-schedule', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const id = String(req.params.id);

    const campaign = await prisma.campaign.findFirst({
      where: { id, userId },
    });

    if (!campaign) {
      return res.status(404).json({ success: false, error: 'Campaign not found or access denied.' });
    }

    const sequence = JSON.parse(campaign.sequenceJson || '[]');
    const userAccounts = await prisma.account.findMany({
      where: { userId },
    });

    if (userAccounts.length === 0) {
      return res.status(400).json({ success: false, error: 'No social accounts connected to schedule this campaign.' });
    }

    const createdPosts = [];

    for (const item of sequence) {
      const scheduledDate = new Date(item.scheduledAt);
      const platforms = item.targetPlatforms || ['INSTAGRAM', 'LINKEDIN'];
      const matchedAccounts = userAccounts.filter((a) => platforms.includes(a.platform));

      const post = await prisma.post.create({
        data: {
          userId,
          campaignId: campaign.id,
          content: item.masterContent,
          mediaUrls: JSON.stringify(['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80']),
          mediaType: 'image',
          status: 'SCHEDULED',
          scheduledAt: scheduledDate,
          targetPlatforms: JSON.stringify(platforms),
          postAccounts: {
            create: matchedAccounts.map((acc) => ({
              accountId: acc.id,
              platform: acc.platform,
              status: 'PENDING',
            })),
          },
        },
      });

      await queueService.schedulePostJob(post.id, scheduledDate);
      createdPosts.push(post);
    }

    await prisma.campaign.update({
      where: { id },
      data: { status: 'COMPLETED' },
    });

    res.json({
      success: true,
      message: `Successfully scheduled ${createdPosts.length} posts for campaign '${campaign.name}'!`,
      scheduledPostsCount: createdPosts.length,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/campaigns/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const id = String(req.params.id);

    const existing = await prisma.campaign.findFirst({ where: { id, userId } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Campaign not found.' });
    }

    await prisma.campaign.delete({ where: { id } });
    res.json({ success: true, message: 'Campaign deleted', id });
  } catch (error) {
    next(error);
  }
});

export default router;
