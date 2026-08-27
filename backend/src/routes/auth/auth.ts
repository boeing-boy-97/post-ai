import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { z } from 'zod';
import { prisma } from '../../config/database';
import { config } from '../../config';
import { requireAuth } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validateRequest';
import { authLimiter } from '../../middleware/rateLimiter';
import { toUserDTO } from '../../dto';
import { logger } from '../../utils/logger';

const router = Router();

const resetTokens = new Map<string, { userId: string; expiresAt: number }>();

const signupSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

const signinSchema = z.object({
  body: z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Please enter a valid email address'),
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Reset token is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  }),
});

// POST /api/auth/signup
router.post('/signup', authLimiter, validateRequest(signupSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'An account with this email address already exists. Please sign in instead.',
        code: 'ACCOUNT_EXISTS',
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash,
      },
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn as any }
    );

    logger.info('New user registered: %s (ID: %s)', user.email, user.id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: toUserDTO(user),
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/signin
router.post('/signin', authLimiter, validateRequest(signinSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Incorrect email or password.',
        code: 'INVALID_CREDENTIALS',
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Incorrect email or password.',
        code: 'INVALID_CREDENTIALS',
      });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn as any }
    );

    logger.info('User authenticated: %s (ID: %s)', user.email, user.id);

    res.json({
      success: true,
      token,
      user: toUserDTO(user),
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', authLimiter, validateRequest(forgotPasswordSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return res.json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been issued.',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    resetTokens.set(resetToken, {
      userId: user.id,
      expiresAt: Date.now() + 60 * 60 * 1000,
    });

    logger.info('Password reset token generated for user %s', user.email);

    res.json({
      success: true,
      message: 'Password reset link generated.',
      resetToken,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', authLimiter, validateRequest(resetPasswordSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, newPassword } = req.body;

    const record = resetTokens.get(token);
    if (!record || record.expiresAt < Date.now()) {
      resetTokens.delete(token);
      return res.status(400).json({
        success: false,
        error: 'Password reset token is invalid or has expired. Please request a new link.',
        code: 'RESET_TOKEN_EXPIRED',
      });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    });

    resetTokens.delete(token);
    logger.info('Password reset completed for user ID %s', record.userId);

    res.json({
      success: true,
      message: 'Your password has been updated successfully. You may now sign in.',
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req: Request, res: Response) => {
  res.json({
    success: true,
    user: toUserDTO(req.user),
  });
});

// POST /api/auth/logout
router.post('/logout', requireAuth, (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

export default router;
