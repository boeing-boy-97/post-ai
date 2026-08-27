import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../../middleware/auth';
import { prisma } from '../../config/database';

const router = Router();
router.use(requireAuth);

// GET /api/analytics - Get real metrics for authenticated user
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const [posts, analyticsRecords, accounts] = await Promise.all([
      prisma.post.findMany({
        where: { userId },
        include: {
          postAccounts: {
            include: { account: true },
          },
          analytics: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.analytics.findMany({
        where: { userId },
      }),
      prisma.account.findMany({
        where: { userId },
      }),
    ]);

    const scheduled = posts.filter((p) => p.status === 'SCHEDULED');
    const published = posts.filter((p) => p.status === 'PUBLISHED' || p.status === 'PARTIALLY_PUBLISHED');
    const drafts = posts.filter((p) => p.status === 'DRAFT');
    const failed = posts.filter((p) => p.status === 'FAILED');

    let totalImpressions = 0;
    let totalReach = 0;
    let totalLikes = 0;
    let totalComments = 0;
    let totalShares = 0;
    let engagementRateSum = 0;

    let igPosts = 0;
    let igReach = 0;
    let igEngagementSum = 0;

    let liPosts = 0;
    let liReach = 0;
    let liEngagementSum = 0;

    analyticsRecords.forEach((a) => {
      totalImpressions += a.impressions;
      totalReach += a.reach;
      totalLikes += a.likes;
      totalComments += a.comments;
      totalShares += a.shares;
      engagementRateSum += a.engagementRate;

      if (a.platform === 'INSTAGRAM') {
        igPosts++;
        igReach += a.reach;
        igEngagementSum += a.engagementRate;
      } else if (a.platform === 'LINKEDIN') {
        liPosts++;
        liReach += a.reach;
        liEngagementSum += a.engagementRate;
      }
    });

    const avgEngagement = analyticsRecords.length > 0
      ? parseFloat((engagementRateSum / analyticsRecords.length).toFixed(2))
      : 0.0;

    const igAvgEngagement = igPosts > 0 ? parseFloat((igEngagementSum / igPosts).toFixed(2)) : 0.0;
    const liAvgEngagement = liPosts > 0 ? parseFloat((liEngagementSum / liPosts).toFixed(2)) : 0.0;

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyTrend = daysOfWeek.map((day) => {
      // Find published posts on this day
      const dayRecords = analyticsRecords.filter((r) => {
        const d = new Date(r.recordedAt);
        return daysOfWeek[d.getDay()] === day;
      });
      const reach = dayRecords.reduce((acc, curr) => acc + curr.reach, 0);
      const eng = dayRecords.length > 0
        ? parseFloat((dayRecords.reduce((acc, curr) => acc + curr.engagementRate, 0) / dayRecords.length).toFixed(1))
        : 0;
      return {
        day,
        reach,
        engagement: eng,
        posts: dayRecords.length,
      };
    });

    const topPosts = published
      .map((p) => ({
        ...p,
        mediaUrls: JSON.parse(p.mediaUrls || '[]'),
        targetPlatforms: JSON.parse(p.targetPlatforms || '[]'),
        totalReach: p.analytics.reduce((sum, a) => sum + a.reach, 0),
        totalLikes: p.analytics.reduce((sum, a) => sum + a.likes, 0),
        totalComments: p.analytics.reduce((sum, a) => sum + a.comments, 0),
      }))
      .sort((a, b) => b.totalReach - a.totalReach)
      .slice(0, 5);

    const summary = {
      totalPosts: posts.length,
      scheduledCount: scheduled.length,
      publishedCount: published.length,
      draftCount: drafts.length,
      failedCount: failed.length,
      connectedAccountsCount: accounts.length,
      totalImpressions,
      totalReach,
      totalLikes,
      totalComments,
      totalShares,
      averageEngagementRate: avgEngagement,
      platformBreakdown: {
        instagram: { posts: igPosts, reach: igReach, avgEngagement: igAvgEngagement },
        linkedin: { posts: liPosts, reach: liReach, avgEngagement: liAvgEngagement },
      },
      weeklyTrend,
      topPosts,
    };

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
