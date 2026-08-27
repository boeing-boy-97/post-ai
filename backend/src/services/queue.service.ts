import { prisma } from '../config/database';
import { processPublishJob } from '../workers/postPublisher.worker';
import { logger } from '../utils/logger';

export class QueueSchedulerService {
  private timer: NodeJS.Timeout | null = null;
  private isProcessing = false;

  startWorker() {
    if (this.timer) return;
    logger.info('Starting Background Queue Scheduler & Publisher Worker...');

    // Poll every 10 seconds for scheduled jobs that are due
    this.timer = setInterval(() => {
      this.pollAndExecuteJobs().catch((err) => {
        logger.error('Queue Worker Polling Error: %s', err.message);
      });
    }, 10000);
  }

  stopWorker() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      logger.info('Background Queue Worker stopped.');
    }
  }

  async schedulePostJob(postId: string, scheduledTime: Date): Promise<string> {
    const job = await prisma.job.create({
      data: {
        postId,
        scheduledTime,
        status: 'PENDING',
      },
    });

    logger.info('Scheduled job %s created for Post %s at %s', job.id, postId, scheduledTime.toISOString());
    return job.id;
  }

  async cancelPostJob(postId: string): Promise<void> {
    await prisma.job.updateMany({
      where: { postId, status: 'PENDING' },
      data: { status: 'CANCELLED', completedAt: new Date() },
    });
    logger.info('Cancelled pending jobs for Post %s', postId);
  }

  async pollAndExecuteJobs(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const now = new Date();
      // Find jobs whose scheduledTime is <= now and status is PENDING
      const dueJobs = await prisma.job.findMany({
        where: {
          status: 'PENDING',
          scheduledTime: { lte: now },
        },
        include: {
          post: true,
        },
        take: 10,
      });

      for (const job of dueJobs) {
        if (!job.post || job.post.status === 'CANCELLED') {
          await prisma.job.update({
            where: { id: job.id },
            data: { status: 'CANCELLED', completedAt: new Date() },
          });
          continue;
        }

        try {
          await processPublishJob(job.postId, job.id);
        } catch (jobErr: any) {
          logger.error('Job %s failed with exception: %s', job.id, jobErr.message);
          await prisma.job.update({
            where: { id: job.id },
            data: {
              status: 'FAILED',
              lastError: jobErr.message,
              completedAt: new Date(),
            },
          });
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }
}

export const queueService = new QueueSchedulerService();
