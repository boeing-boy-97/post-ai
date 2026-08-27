import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validateRequest';
import { prisma } from '../../config/database';
import { toTemplateDTO } from '../../dto';

const router = Router();
router.use(requireAuth);

const templateSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    content: z.string().min(1, 'Content is required'),
    mediaUrls: z.array(z.string()).optional(),
    platforms: z.array(z.string()).optional(),
  }),
});

// GET /api/templates
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const templates = await prisma.template.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({
      success: true,
      data: templates.map(toTemplateDTO),
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/templates
router.post('/', validateRequest(templateSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { title, content, mediaUrls, platforms } = req.body;

    const template = await prisma.template.create({
      data: {
        userId,
        title,
        content,
        mediaUrls: mediaUrls ? JSON.stringify(mediaUrls) : null,
        platforms: platforms ? JSON.stringify(platforms) : null,
      },
    });

    res.status(201).json({
      success: true,
      data: toTemplateDTO(template),
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/templates/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const id = String(req.params.id);

    const existing = await prisma.template.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Template not found or access denied.' });
    }

    await prisma.template.delete({ where: { id } });
    res.json({ success: true, message: 'Template deleted', id });
  } catch (error) {
    next(error);
  }
});

export default router;
