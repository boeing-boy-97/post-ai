import React, { useState, useEffect } from 'react';
import {
  Layers,
  Search,
  Plus,
  RefreshCw,
  Clock,
  Calendar,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  Facebook,
  CheckCircle2,
  AlertCircle,
  Eye,
  Heart,
  MessageCircle,
  Send,
  Trash2,
  Ban,
  SlidersHorizontal
} from 'lucide-react';
import { api } from '../../lib/api';
import { PageHeader } from '../layout/PageHeader';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { PostDetailsModal } from './PostDetailsModal';
import { PostCardSkeleton } from '../ui/Skeleton';
import { EmptyState } from '../ui/EmptyState';
import { useToast } from '../ui/Toast';

interface PostListProps {
  onOpenComposer: () => void;
}

export const PostList: React.FC<PostListProps> = ({ onOpenComposer }) => {
  const { addToast } = useToast();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedPost, setSelectedPost] = useState<any | null>(null);

  useEffect(() => {
    fetchPosts();
  }, [statusFilter, platformFilter]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await api.getPosts(statusFilter, platformFilter);
      setPosts(data || []);
    } catch (err: any) {
      addToast(err.message || 'Failed to fetch posts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishNow = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.publishPostNow(id);
      addToast('Post published immediately!', 'success');
      fetchPosts();
    } catch (err: any) {
      addToast(err.message || 'Publish failed', 'error');
    }
  };

  const handleCancel = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.cancelPost(id);
      addToast('Post schedule cancelled', 'info');
      fetchPosts();
    } catch (err: any) {
      addToast(err.message || 'Cancel failed', 'error');
    }
  };

  const handleRetry = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.retryPost(id);
      addToast('Retrying publication for unfulfilled channels...', 'info');
      fetchPosts();
    } catch (err: any) {
      addToast(err.message || 'Retry failed', 'error');
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await api.deletePost(id);
      addToast('Post deleted', 'info');
      setPosts(posts.filter((p) => p.id !== id));
    } catch (err: any) {
      addToast('Delete failed', 'error');
    }
  };

  const filteredPosts = posts.filter((p) =>
    p.content.toLowerCase().includes(search.toLowerCase())
  );

  const statusTabs = [
    { id: 'all', label: 'All Content' },
    { id: 'scheduled', label: 'Scheduled Queue' },
    { id: 'published', label: 'Published' },
    { id: 'draft', label: 'Drafts' },
    { id: 'failed', label: 'Failed / Action Needed' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        breadcrumb="Publishing"
        title="Post Queue & Publication History"
        subtitle="Review real-time multi-channel delivery states, inspect platform execution IDs, and manage scheduling."
        actions={
          <Button variant="primary" size="md" onClick={onOpenComposer} icon={<Plus className="w-3.5 h-3.5" />}>
            Create Post
          </Button>
        }
      />

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg overflow-x-auto">
          {statusTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === tab.id
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Channel Filter */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search content..."
              className="h-8 pl-8 pr-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-indigo-600 shadow-xs w-44 sm:w-56"
            />
          </div>

          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="h-8 px-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 font-semibold focus:outline-none focus:border-indigo-600 shadow-xs"
          >
            <option value="all">All Channels</option>
            <option value="INSTAGRAM">Instagram</option>
            <option value="LINKEDIN">LinkedIn</option>
            <option value="TWITTER">X / Twitter</option>
            <option value="YOUTUBE">YouTube</option>
          </select>

          <Button variant="outline" size="sm" onClick={fetchPosts} icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}>
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <PostCardSkeleton />
          <PostCardSkeleton />
          <PostCardSkeleton />
        </div>
      ) : filteredPosts.length > 0 ? (
        <div className="space-y-3">
          {filteredPosts.map((post) => {
            const status = (post.status || '').toUpperCase();
            const isScheduled = status === 'SCHEDULED';
            const isPublished = status === 'PUBLISHED';
            const isPartial = status === 'PARTIALLY_PUBLISHED';
            const isFailed = status === 'FAILED';
            const isDraft = status === 'DRAFT';

            return (
              <div
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-subtle hover:border-slate-300 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left Media & Content */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  {post.mediaUrls?.[0] ? (
                    <img
                      src={post.mediaUrls[0]}
                      alt="Thumbnail"
                      className="w-14 h-14 rounded-lg object-cover border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 text-[10px] font-semibold shrink-0">
                      Text
                    </div>
                  )}

                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={
                          isPublished
                            ? 'emerald'
                            : isScheduled
                            ? 'amber'
                            : isPartial
                            ? 'blue'
                            : isFailed
                            ? 'rose'
                            : 'slate'
                        }
                      >
                        {status.replace(/_/g, ' ')}
                      </Badge>

                      <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                        {post.targetPlatforms?.map((plat: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-semibold text-[10px]"
                          >
                            {plat}
                          </span>
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-slate-800 font-medium line-clamp-2 leading-relaxed">
                      {post.content}
                    </p>

                    {isFailed && post.failureReason && (
                      <p className="text-[11px] text-rose-600 font-medium line-clamp-1">
                        Reason: {post.failureReason}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Timing & Action Buttons */}
                <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="text-left md:text-right text-[11px] text-slate-500 font-medium">
                    {isPublished && post.publishedAt ? (
                      <div>Published {new Date(post.publishedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</div>
                    ) : post.scheduledAt ? (
                      <div>Scheduled {new Date(post.scheduledAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(post.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    ) : (
                      <div>Created {new Date(post.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isScheduled && (
                      <Button variant="outline" size="sm" onClick={(e) => handleCancel(post.id, e)}>
                        Cancel
                      </Button>
                    )}

                    {(isFailed || isPartial) && (
                      <Button variant="primary" size="sm" onClick={(e) => handleRetry(post.id, e)} icon={<RefreshCw className="w-3 h-3" />}>
                        Retry
                      </Button>
                    )}

                    {isDraft && (
                      <Button variant="primary" size="sm" onClick={(e) => handlePublishNow(post.id, e)} icon={<Send className="w-3 h-3" />}>
                        Publish
                      </Button>
                    )}

                    <button
                      onClick={(e) => handleDelete(post.id, e)}
                      className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete post"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<Layers className="w-6 h-6" />}
          title="No posts found matching filter"
          description="There are no posts in this view. Create a new post or select another filter."
          actionLabel="Create Post"
          onAction={onOpenComposer}
        />
      )}

      {/* Details & Target Execution Modal */}
      {selectedPost && (
        <PostDetailsModal
          post={selectedPost}
          isOpen={Boolean(selectedPost)}
          onClose={() => setSelectedPost(null)}
          onRefresh={fetchPosts}
        />
      )}
    </div>
  );
};
