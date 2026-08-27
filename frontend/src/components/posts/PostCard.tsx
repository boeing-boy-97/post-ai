import React, { useState } from 'react';
import {
  Instagram,
  Linkedin,
  Twitter,
  Calendar,
  Clock,
  Send,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  Heart,
  MessageCircle,
  Repeat2,
  Ban,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { api } from '../../lib/api';
import { useToast } from '../ui/Toast';
import { PostDetailsModal } from './PostDetailsModal';

interface PostCardProps {
  post: any;
  onRefresh: () => void;
  onEdit?: (post: any) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onRefresh, onEdit }) => {
  const { addToast } = useToast();
  const [showDetails, setShowDetails] = useState(false);

  const handlePublishNow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.publishPostNow(post.id);
      addToast('Post published immediately!', 'success');
      onRefresh();
    } catch (err: any) {
      addToast(err.message || 'Failed to publish post', 'error');
    }
  };

  const handleCancel = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.cancelPost(post.id);
      addToast('Scheduled post cancelled', 'info');
      onRefresh();
    } catch (err: any) {
      addToast(err.message || 'Failed to cancel post', 'error');
    }
  };

  const handleRetry = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.retryPost(post.id);
      addToast('Retrying post publishing...', 'info');
      onRefresh();
    } catch (err: any) {
      addToast(err.message || 'Retry failed', 'error');
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.deletePost(post.id);
      addToast('Post deleted', 'info');
      onRefresh();
    } catch (err: any) {
      addToast('Failed to delete post', 'error');
    }
  };

  const status = (post.status || '').toUpperCase();
  const isPublished = status === 'PUBLISHED';
  const isPartiallyPublished = status === 'PARTIALLY_PUBLISHED';
  const isScheduled = status === 'SCHEDULED';
  const isDraft = status === 'DRAFT';
  const isFailed = status === 'FAILED';
  const isCancelled = status === 'CANCELLED';

  const platforms = Array.isArray(post.targetPlatforms) ? post.targetPlatforms.map((p: string) => p.toUpperCase()) : [];

  const analytics = Array.isArray(post.analytics) && post.analytics.length > 0
    ? post.analytics[0]
    : null;

  return (
    <>
      <div
        onClick={() => setShowDetails(true)}
        className="bg-white rounded-3xl border border-slate-200/80 shadow-subtle hover:shadow-card-hover transition-all duration-200 overflow-hidden flex flex-col justify-between group cursor-pointer"
      >
        {/* Top Media & Platforms Header */}
        <div>
          <div className="relative aspect-[16/9] bg-slate-100 overflow-hidden">
            {post.mediaUrls && post.mediaUrls[0] ? (
              <img
                src={post.mediaUrls[0]}
                alt="Post media"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                No Media
              </div>
            )}

            {/* Status Badge Over Image */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5">
              {isPublished && (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500 text-white shadow-xs flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Published
                </span>
              )}
              {isPartiallyPublished && (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-500 text-white shadow-xs flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Partial
                </span>
              )}
              {isScheduled && (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-500 text-white shadow-xs flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Scheduled
                </span>
              )}
              {isDraft && (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-700 text-white shadow-xs">
                  Draft
                </span>
              )}
              {isFailed && (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-600 text-white shadow-xs flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Failed
                </span>
              )}
              {isCancelled && (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-500 text-white shadow-xs flex items-center gap-1">
                  <Ban className="w-3 h-3" /> Cancelled
                </span>
              )}
            </div>

            {/* Target Platforms Overlay */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full shadow-xs border border-white/80">
              {platforms.includes('INSTAGRAM') && (
                <Instagram className="w-3.5 h-3.5 text-pink-600" />
              )}
              {platforms.includes('LINKEDIN') && (
                <Linkedin className="w-3.5 h-3.5 text-blue-600" />
              )}
              {platforms.includes('TWITTER') && (
                <Twitter className="w-3.5 h-3.5 text-slate-900" />
              )}
            </div>
          </div>

          {/* Content Body */}
          <div className="p-5 space-y-3">
            <p className="text-xs text-slate-800 line-clamp-3 leading-relaxed font-medium">
              {post.content}
            </p>

            {/* Error Banner if Failed */}
            {isFailed && post.failureReason && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-[11px] text-rose-700 leading-tight">
                <strong>Failure reason:</strong> {post.failureReason}
              </div>
            )}

            {/* Date Info */}
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {isPublished && post.publishedAt
                  ? `Published ${new Date(post.publishedAt).toLocaleDateString()} at ${new Date(post.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                  : post.scheduledAt
                  ? `Scheduled for ${new Date(post.scheduledAt).toLocaleDateString()} at ${new Date(post.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                  : `Created ${new Date(post.createdAt).toLocaleDateString()}`}
              </span>
            </div>

            {/* Analytics Stats Pill (if published) */}
            {isPublished && analytics && (
              <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs text-slate-600 font-semibold">
                <div className="flex items-center gap-1 text-pink-600">
                  <Heart className="w-3.5 h-3.5" />
                  <span>{analytics.likes}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-600">
                  <MessageCircle className="w-3.5 h-3.5 text-slate-400" />
                  <span>{analytics.comments}</span>
                </div>
                <div className="flex items-center gap-1 text-indigo-600 font-bold">
                  <Eye className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{analytics.reach?.toLocaleString()} Reach</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Action Bar */}
        <div className="p-4 pt-0 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
          <button
            onClick={handleDelete}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Delete Post"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-2">
            {isScheduled && (
              <>
                <button
                  onClick={handleCancel}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePublishNow}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-[11px] font-bold flex items-center gap-1 shadow-xs transition-all"
                >
                  <Send className="w-3 h-3" />
                  <span>Publish Now</span>
                </button>
              </>
            )}

            {(isFailed || isPartiallyPublished) && (
              <button
                onClick={handleRetry}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs transition-all"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retry</span>
              </button>
            )}

            {isDraft && (
              <button
                onClick={handlePublishNow}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs transition-all"
              >
                <Send className="w-3 h-3" />
                <span>Publish</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Post Details & Delivery Targets Modal */}
      {showDetails && (
        <PostDetailsModal
          post={post}
          isOpen={showDetails}
          onClose={() => setShowDetails(false)}
          onRefresh={onRefresh}
        />
      )}
    </>
  );
};
