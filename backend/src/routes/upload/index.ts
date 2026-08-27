import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { requireAuth } from '../../middleware/auth';
import { mediaUploadService } from '../../services/cloudinary.service';

const router = Router();
router.use(requireAuth);

const upload = multer({
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are supported.'));
    }
  },
});

// Curated stock photos for rapid composition
const STOCK_PRESETS = [
  { id: 'stock_1', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80', title: 'Gradient Aesthetic' },
  { id: 'stock_2', url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80', title: 'Minimalist Workspace' },
  { id: 'stock_3', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80', title: 'Data Analytics Screen' },
  { id: 'stock_4', url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80', title: 'Digital Growth Chart' },
  { id: 'stock_5', url: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80', title: 'UI UX Design Flow' },
];

// GET /api/upload/presets
router.get('/presets', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: STOCK_PRESETS,
  });
});

// POST /api/upload
router.post('/', upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      const { url } = req.body;
      if (url) {
        return res.json({ success: true, url, format: 'url', size: 0 });
      }
      return res.status(400).json({ success: false, error: 'No media file provided.' });
    }

    const uploaded = await mediaUploadService.uploadFile(req.file);
    res.json({
      success: true,
      ...uploaded,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
