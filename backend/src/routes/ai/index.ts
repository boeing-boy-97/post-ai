import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validateRequest';
import { aiService } from '../../services/ai.service';
import { prisma } from '../../config/database';

const router = Router();
router.use(requireAuth);

const generateSchema = z.object({
  body: z.object({
    topic: z.string().min(2, 'Topic must be at least 2 characters'),
    platform: z.enum(['INSTAGRAM', 'LINKEDIN', 'TWITTER', 'YOUTUBE', 'FACEBOOK', 'ALL']).default('INSTAGRAM'),
    tone: z.string().default('Professional & Engaging'),
    targetAudience: z.string().optional(),
    additionalInstructions: z.string().optional(),
  }),
});

const adaptAllSchema = z.object({
  body: z.object({
    masterContent: z.string().min(5, 'Master content must be at least 5 characters'),
  }),
});

// POST /api/ai/generate
router.post('/generate', validateRequest(generateSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { topic, platform, tone, targetAudience, additionalInstructions } = req.body;

    const result = await aiService.generateContent({
      topic,
      platform,
      tone,
      targetAudience,
      additionalInstructions,
      userId,
    });

    await prisma.aIContent.create({
      data: {
        userId,
        prompt: topic,
        platform,
        tone,
        generatedContent: result.primaryContent,
        suggestedHashtags: JSON.stringify(result.suggestedHashtags || []),
        variations: JSON.stringify(result.variations || []),
      },
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/ai/adapt-all - Adapt a single idea into all platform-native variants
router.post('/adapt-all', validateRequest(adaptAllSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { masterContent } = req.body;

    const result = await aiService.adaptToAllPlatforms(masterContent, userId);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
