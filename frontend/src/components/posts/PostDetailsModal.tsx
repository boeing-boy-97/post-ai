import React, { useState } from 'react';
import {
  X,
  Instagram,
  Linkedin,
  Twitter,
  Calendar,
  Clock,
  Send,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  ExternalLink,
  Ban
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { api } from '../../lib/api';
import { useToast } from '../ui/Toast';

interface PostDetailsModalProps {
  post: any;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export const PostDetailsModal: React.FC<PostDetailsModalProps> = ({
  post,
  isOpen,
  onClose,
  onRefresh,
}) => {
  const { addToast } = useToast();
  const [retrying, setRetrying] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  if (!post) return null;

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await api.retryPost(post.id);
      addToast('Retrying publication for unfulfilled channels...', 'info');
      onRefresh();
      onClose();
    } catch (err: any) {
      addToast(err.message || 'Retry failed', 'error');
    } finally {
      setRetrying(false);
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await api.cancelPost(post.id);
      addToast('Scheduled post cancelled successfully', 'info');
      onRefresh();
      onClose();
    } catch (err: any) {
      addToast(err.message || 'Cancel failed', 'error');
    } finally {
      setCancelling(false);
    }
  };

  const status = (post.status || '').toUpperCase();
  const isScheduled = status === 'SCHEDULED';
  const isFailed = status === 'FAILED' || status === 'PARTIALLY_PUBLISHED';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Post Publication Timeline & Details" maxWidth="max-w-2xl">
      <div className="space-y-6">
        {/* Top Summary */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Overall Status:</span>
              <Badge
                variant={
                  status === 'PUBLISHED'
                    ? 'emerald'
                    : status === 'SCHEDULED'
                    ? 'amber'
                    : status === 'PARTIALLY_PUBLISHED'
                    ? 'blue'
                    : status === 'FAILED'
                    ? 'rose'
                    : 'slate'
                }
              >
                {status.replace(/_/g, ' ')}
              </Badge>
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {post.scheduledAt
                  ? `Scheduled: ${new Date(post.scheduledAt).toLocaleString()}`
                  : `Created: ${new Date(post.createdAt).toLocaleString()}`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isScheduled && (
              <Button variant="danger" size="sm" loading={cancelling} onClick={handleCancel} icon={<Ban className="w-3.5 h-3.5" />}>
                Cancel Schedule
              </Button>
            )}
            {isFailed && (
              <Button variant="primary" size="sm" loading={retrying} onClick={handleRetry} icon={<RefreshCw className="w-3.5 h-3.5" />}>
                Retry Failed Targets
              </Button>
            )}
          </div>
        </div>

        {/* Media & Content Preview */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 block">Post Content & Attached Media</label>
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
            <p className="text-xs text-slate-800 whitespace-pre-line leading-relaxed font-medium">
              {post.content}
            </p>

            {post.mediaUrls && post.mediaUrls.length > 0 && (
              <div className="rounded-xl overflow-hidden border border-slate-100 max-h-56 bg-slate-50">
                <img src={post.mediaUrls[0]} alt="Post Attachment" className="w-full h-full object-contain" />
              </div>
            )}
          </div>
        </div>

        {/* Channel Execution Targets */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-slate-700 block">Platform Delivery Execution Targets</label>
          <div className="space-y-2">
            {post.postAccounts && post.postAccounts.length > 0 ? (
              post.postAccounts.map((pa: any) => {
                const targetPlatform = (pa.platform || '').toUpperCase();
                const isTargetPublished = pa.status === 'PUBLISHED';
                const isTargetFailed = pa.status === 'FAILED';

                return (
                  <div
                    key={pa.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-xs shrink-0">
                        {targetPlatform === 'INSTAGRAM' ? (
                          <Instagram className="w-4 h-4 text-pink-600" />
                        ) : (
                          <Linkedin className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-slate-900">
                          {pa.account?.accountName || targetPlatform} ({pa.account?.accountHandle ? `@${pa.account.accountHandle}` : targetPlatform})
                        </div>
                        {pa.platformPostId && (
                          <div className="text-[10px] font-mono text-slate-400">
                            Platform ID: {pa.platformPostId}
                          </div>
                        )}
                        {pa.error && (
                          <div className="text-[10px] font-medium text-rose-600">
                            Error: {pa.error}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      {isTargetPublished ? (
                        <Badge variant="emerald" icon={<CheckCircle2 className="w-3 h-3" />}>
                          Published
                        </Badge>
                      ) : isTargetFailed ? (
                        <Badge variant="rose" icon={<AlertCircle className="w-3 h-3" />}>
                          Failed
                        </Badge>
                      ) : (
                        <Badge variant="amber" icon={<Clock className="w-3 h-3" />}>
                          Pending Queue
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 text-xs text-slate-400 text-center">
                No delivery targets attached to this post.
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
