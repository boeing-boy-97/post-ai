import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validateRequest';
import { prisma } from '../../config/database';
import { toBrandDocumentDTO } from '../../dto';
import { logger } from '../../utils/logger';

const router = Router();
router.use(requireAuth);

const createDocSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Title is required'),
    docType: z.enum(['GUIDELINE', 'PRODUCT_SPEC', 'FAQ', 'WEBSITE', 'TOP_POST']).default('GUIDELINE'),
    content: z.string().min(10, 'Content must be at least 10 characters'),
    summary: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

const updateVoiceSchema = z.object({
  body: z.object({
    brandVoice: z.string().min(5, 'Brand voice guidelines must be at least 5 characters'),
  }),
});

// GET /api/brand - Get all user's brand documents
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const [docs, user] = await Promise.all([
      prisma.brandDocument.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { brandVoice: true },
      }),
    ]);

    res.json({
      success: true,
      brandVoice: user?.brandVoice || 'Professional, clear, insightful, and engaging',
      data: docs.map(toBrandDocumentDTO),
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/brand - Ingest brand knowledge document
router.post('/', validateRequest(createDocSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { title, docType, content, summary, tags } = req.body;

    const doc = await prisma.brandDocument.create({
      data: {
        userId,
        title,
        docType,
        content,
        summary: summary || content.slice(0, 150) + '...',
        tags: tags ? JSON.stringify(tags) : JSON.stringify([]),
      },
    });

    logger.info('Brand document ingested: %s (User: %s)', title, userId);
    res.status(201).json({
      success: true,
      data: toBrandDocumentDTO(doc),
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/brand/voice - Update Brand Voice guidelines
router.put('/voice', validateRequest(updateVoiceSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { brandVoice } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { brandVoice },
      select: { id: true, brandVoice: true },
    });

    res.json({ success: true, brandVoice: user.brandVoice });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/brand/:id - Delete brand knowledge document
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const id = String(req.params.id);

    const existing = await prisma.brandDocument.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Document not found or access denied.' });
    }

    await prisma.brandDocument.delete({ where: { id } });
    res.json({ success: true, message: 'Document deleted successfully', id });
  } catch (error) {
    next(error);
  }
});

export default router;
