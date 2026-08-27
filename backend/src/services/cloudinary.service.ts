import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import { logger } from '../utils/logger';

export class MediaUploadService {
  private localUploadsDir = path.join(__dirname, '..', '..', 'public', 'uploads');

  constructor() {
    if (!fs.existsSync(this.localUploadsDir)) {
      fs.mkdirSync(this.localUploadsDir, { recursive: true });
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<{ url: string; publicId: string; size: number; format: string }> {
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '') || 'jpg';

    // If Cloudinary is configured with valid credentials
    if (config.cloudinary.cloudName && config.cloudinary.apiKey && config.cloudinary.apiSecret) {
      try {
        const base64Data = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        const timestamp = Math.round(new Date().getTime() / 1000);
        
        // Cloudinary upload API
        const uploadUrl = `https://api.cloudinary.com/v1_1/${config.cloudinary.cloudName}/auto/upload`;
        const res = await axios.post(uploadUrl, {
          file: base64Data,
          api_key: config.cloudinary.apiKey,
          timestamp,
        });

        return {
          url: res.data.secure_url,
          publicId: res.data.public_id,
          size: res.data.bytes || file.size,
          format: res.data.format || ext,
        };
      } catch (error: any) {
        logger.warn('Cloudinary upload failed (%s), saving to local persistent storage.', error.message);
      }
    }

    // Local persistent storage
    const filename = `media_${Date.now()}_${uuidv4().substring(0, 8)}.${ext}`;
    const filePath = path.join(this.localUploadsDir, filename);
    fs.writeFileSync(filePath, file.buffer);

    const relativeUrl = `/uploads/${filename}`;
    logger.info('Media stored at %s', relativeUrl);

    return {
      url: relativeUrl,
      publicId: filename,
      size: file.size,
      format: ext,
    };
  }
}

export const mediaUploadService = new MediaUploadService();
