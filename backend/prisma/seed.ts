import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { encryptToken } from '../src/utils/encryption';

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.findUnique({
    where: { email: 'creator@modernstudio.ai' },
  });

  if (existing) {
    console.log('Seed: User already exists.');
    return;
  }

  const passwordHash = await bcrypt.hash('password123', 12);
  const user = await prisma.user.create({
    data: {
      email: 'creator@modernstudio.ai',
      name: 'Alex Vance',
      passwordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  });

  // Seed Instagram account
  const igAccount = await prisma.account.create({
    data: {
      userId: user.id,
      platform: 'INSTAGRAM',
      platformAccountId: '17841405309211844',
      accountName: 'Modern Creative Studio',
      accountHandle: 'moderncreativestudio',
      profilePicUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      followerCount: 28450,
      status: 'CONNECTED',
      accessTokenEnc: encryptToken('EAAB_mock_token_ig_valid_2026'),
      tokenExpiresAt: new Date(Date.now() + 58 * 86400 * 1000),
    },
  });

  // Seed LinkedIn account
  const liAccount = await prisma.account.create({
    data: {
      userId: user.id,
      platform: 'LINKEDIN',
      platformAccountId: 'urn:li:organization:5498212',
      accountName: 'Nexus Tech Innovations',
      accountHandle: 'company/nexus-tech',
      profilePicUrl: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=150&auto=format&fit=crop&q=80',
      followerCount: 14890,
      status: 'CONNECTED',
      accessTokenEnc: encryptToken('AQX_mock_token_li_valid_2026'),
      tokenExpiresAt: new Date(Date.now() + 45 * 86400 * 1000),
    },
  });

  // Seed Published Post
  const publishedPost = await prisma.post.create({
    data: {
      userId: user.id,
      content: '🚀 The Future of AI Automation in 2026 isn’t about replacing humans—it’s about amplifying creative leverage.\n\nHere are 3 key shifts we’re noticing across modern creator & brand workflows:\n\n1. Autonomous context curation\n2. Real-time omnichannel repurposing\n3. High-precision engagement scheduling\n\nWhat’s your biggest operational bottleneck today? Let us know in the comments! 👇',
      mediaUrls: JSON.stringify(['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80']),
      mediaType: 'image',
      status: 'PUBLISHED',
      publishedAt: new Date(Date.now() - 2 * 86400 * 1000),
      targetPlatforms: JSON.stringify(['INSTAGRAM', 'LINKEDIN']),
      postAccounts: {
        create: [
          { accountId: igAccount.id, platform: 'INSTAGRAM', platformPostId: 'ig_post_98214', status: 'PUBLISHED', publishedAt: new Date(Date.now() - 2 * 86400 * 1000) },
          { accountId: liAccount.id, platform: 'LINKEDIN', platformPostId: 'urn:li:share:1829471', status: 'PUBLISHED', publishedAt: new Date(Date.now() - 2 * 86400 * 1000) },
        ],
      },
      analytics: {
        create: [
          {
            userId: user.id,
            accountId: igAccount.id,
            platform: 'INSTAGRAM',
            impressions: 14200,
            reach: 11500,
            likes: 840,
            comments: 112,
            shares: 64,
            clicks: 210,
            engagementRate: 8.8,
            recordedAt: new Date(Date.now() - 2 * 86400 * 1000),
          },
          {
            userId: user.id,
            accountId: liAccount.id,
            platform: 'LINKEDIN',
            impressions: 8900,
            reach: 6700,
            likes: 400,
            comments: 72,
            shares: 28,
            clicks: 145,
            engagementRate: 7.2,
            recordedAt: new Date(Date.now() - 2 * 86400 * 1000),
          },
        ],
      },
    },
  });

  // Seed Scheduled Post
  const scheduledPost = await prisma.post.create({
    data: {
      userId: user.id,
      content: '🌟 We just rolled out automated multi-channel post queueing! Schedule once, preview native cards, and let background workers publish at peak engagement times.\n\nCheck out the full breakdown and calendar view in your dashboard today! 🔗',
      mediaUrls: JSON.stringify(['https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80']),
      mediaType: 'image',
      status: 'SCHEDULED',
      scheduledAt: new Date(Date.now() + 1 * 86400 * 1000),
      targetPlatforms: JSON.stringify(['INSTAGRAM', 'LINKEDIN']),
      postAccounts: {
        create: [
          { accountId: igAccount.id, platform: 'INSTAGRAM', status: 'PENDING' },
          { accountId: liAccount.id, platform: 'LINKEDIN', status: 'PENDING' },
        ],
      },
      jobs: {
        create: {
          scheduledTime: new Date(Date.now() + 1 * 86400 * 1000),
          status: 'PENDING',
        },
      },
    },
  });

  console.log('Seed completed successfully for user %s', user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
