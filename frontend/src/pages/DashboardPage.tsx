import React from 'react';
import {
  Calendar,
  PenSquare,
  Sparkles,
  Layers,
  TrendingUp,
  Clock,
  Eye,
  Heart,
  Instagram,
  Linkedin,
  Twitter,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Users2,
  Zap,
  Plus
} from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

interface DashboardPageProps {
  analytics: any;
  posts: any[];
  onNavigate: (tab: string) => void;
  onOpenComposerWithDate?: (dateStr: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  analytics,
  posts,
  onNavigate,
}) => {
  const scheduledPosts = posts.filter((p) => p.status === 'SCHEDULED');
  const publishedPosts = posts.filter((p) => p.status === 'PUBLISHED' || p.status === 'PARTIALLY_PUBLISHED');
  const failedPosts = posts.filter((p) => p.status === 'FAILED');

  const statMetrics = [
    {
      label: 'Scheduled in Queue',
      value: scheduledPosts.length,
      subtext: 'Auto-publishing active',
      icon: Clock,
      color: 'text-amber-600',
    },
    {
      label: 'Published Posts',
      value: publishedPosts.length,
      subtext: 'Across all channels',
      icon: CheckCircle2,
      color: 'text-emerald-600',
    },
    {
      label: 'Total Audience Reach',
      value: (analytics?.totalReach || 0).toLocaleString(),
      subtext: 'Actual impressions',
      icon: Eye,
      color: 'text-indigo-600',
    },
    {
      label: 'Avg Engagement Rate',
      value: `${analytics?.averageEngagementRate || 0}%`,
      subtext: 'Calculated from published posts',
      icon: Heart,
      color: 'text-pink-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        breadcrumb="Operations"
        title="Publishing Command Center"
        subtitle="Manage scheduled queues, monitor live multi-channel delivery, and orchestrate AI campaigns."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="md" onClick={() => onNavigate('campaigns')} icon={<Zap className="w-3.5 h-3.5 text-indigo-600" />}>
              Campaign Studio
            </Button>
            <Button variant="primary" size="md" onClick={() => onNavigate('composer')} icon={<PenSquare className="w-3.5 h-3.5" />}>
              Create Post
            </Button>
          </div>
        }
      />

      {/* Priority Attention Banner if Failed Posts exist */}
      {failedPosts.length > 0 && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <div className="text-xs font-bold text-rose-900">
                {failedPosts.length} post{failedPosts.length > 1 ? 's' : ''} encountered delivery errors
              </div>
              <div className="text-[11px] text-rose-700">
                Inspect channel failure reasons and trigger targeted retries from the Posts tab.
              </div>
            </div>
          </div>
          <Button variant="danger" size="sm" onClick={() => onNavigate('posts')}>
            Inspect Errors
          </Button>
        </div>
      )}

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statMetrics.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-white rounded-xl border border-slate-200 p-4 space-y-2 shadow-subtle"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">{stat.label}</span>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold text-slate-900 tracking-tight">{stat.value}</div>
              <div className="text-[11px] text-slate-400 font-medium">{stat.subtext}</div>
            </div>
          );
        })}
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Upcoming Schedule Queue */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-subtle p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Upcoming Scheduled Queue ({scheduledPosts.length})
              </h2>
            </div>
            <button
              onClick={() => onNavigate('posts')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {scheduledPosts.length > 0 ? (
              scheduledPosts.slice(0, 4).map((post) => (
                <div
                  key={post.id}
                  onClick={() => onNavigate('posts')}
                  className="p-3 rounded-lg bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 flex items-start justify-between gap-4 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    {post.mediaUrls?.[0] && (
                      <img
                        src={post.mediaUrls[0]}
                        alt="Media Thumbnail"
                        className="w-11 h-11 rounded-md object-cover border border-slate-200 shrink-0"
                      />
                    )}
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        {post.targetPlatforms?.map((plat: string, idx: number) => (
                          <span
                            key={idx}
                            className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-white text-slate-700 border border-slate-200"
                          >
                            {plat}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-slate-800 font-medium line-clamp-1">
                        {post.content}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 block">
                      {new Date(post.scheduledAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(post.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                <p>No posts currently scheduled in your queue.</p>
                <Button variant="outline" size="sm" onClick={() => onNavigate('composer')}>
                  Schedule Your First Post
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Quick Tools & Workflows */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-subtle p-5 space-y-3">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Workflows & Quick Access
            </h2>

            <div className="space-y-2">
              <button
                onClick={() => onNavigate('composer')}
                className="w-full p-2.5 rounded-lg bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 text-left flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <PenSquare className="w-4 h-4 text-indigo-600" />
                  <div>
                    <div className="text-xs font-semibold text-slate-900">Post Studio</div>
                    <div className="text-[11px] text-slate-500">Draft once, adapt natively across networks</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('campaigns')}
                className="w-full p-2.5 rounded-lg bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 text-left flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Zap className="w-4 h-4 text-violet-600" />
                  <div>
                    <div className="text-xs font-semibold text-slate-900">Campaign Studio</div>
                    <div className="text-[11px] text-slate-500">Synthesize 7-day multi-channel plans</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('brand')}
                className="w-full p-2.5 rounded-lg bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 text-left flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <div>
                    <div className="text-xs font-semibold text-slate-900">Brand Memory (RAG)</div>
                    <div className="text-[11px] text-slate-500">Manage knowledge base and voice profile</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('calendar')}
                className="w-full p-2.5 rounded-lg bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 text-left flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <div>
                    <div className="text-xs font-semibold text-slate-900">Publishing Calendar</div>
                    <div className="text-[11px] text-slate-500">Visual week and month calendar matrix</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
