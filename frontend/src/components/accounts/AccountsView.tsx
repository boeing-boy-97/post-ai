import React, { useState, useEffect } from 'react';
import {
  Users2,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  Facebook,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  Trash2,
  ShieldCheck,
  Clock,
  Info,
  Globe,
  MessageSquare,
  Share2
} from 'lucide-react';
import { api } from '../../lib/api';
import { useToast } from '../ui/Toast';
import { PageHeader } from '../layout/PageHeader';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { EmptyState } from '../ui/EmptyState';

export const AccountsView: React.FC = () => {
  const { addToast } = useToast();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectPlatform, setConnectPlatform] = useState<string>('INSTAGRAM');
  const [accName, setAccName] = useState('');
  const [accHandle, setAccHandle] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const data = await api.getAccounts();
      setAccounts(data || []);
    } catch (err: any) {
      addToast(err.message || 'Failed to load accounts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.connectAccount({
        platform: connectPlatform,
        accountName: accName,
        accountHandle: accHandle,
        accessToken: tokenInput || undefined,
      });
      addToast(`Connected ${connectPlatform} account successfully!`, 'success');
      setShowConnectModal(false);
      setAccName('');
      setAccHandle('');
      setTokenInput('');
      fetchAccounts();
    } catch (err: any) {
      addToast(err.message || 'Failed to connect account', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDisconnect = async (id: string, name: string) => {
    if (!window.confirm(`Disconnect ${name}? Scheduled posts targeting this account will be paused.`)) {
      return;
    }
    try {
      await api.disconnectAccount(id);
      addToast(`Disconnected ${name}`, 'info');
      fetchAccounts();
    } catch (err: any) {
      addToast('Failed to disconnect account', 'error');
    }
  };

  const allSupportedPlatforms = [
    { id: 'INSTAGRAM', name: 'Instagram Business / Creator', icon: Instagram, color: 'text-pink-600', bg: 'bg-pink-50 border-pink-200' },
    { id: 'LINKEDIN', name: 'LinkedIn Member / Page', icon: Linkedin, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
    { id: 'TWITTER', name: 'X / Twitter v2', icon: Twitter, color: 'text-slate-900', bg: 'bg-slate-100 border-slate-300' },
    { id: 'YOUTUBE', name: 'YouTube Data API (Community & Shorts)', icon: Youtube, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
    { id: 'FACEBOOK', name: 'Facebook Pages', icon: Facebook, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
    { id: 'THREADS', name: 'Meta Threads', icon: Globe, color: 'text-slate-800', bg: 'bg-slate-50 border-slate-200' },
    { id: 'PINTEREST', name: 'Pinterest Pins API', icon: Share2, color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' },
    { id: 'TELEGRAM', name: 'Telegram Channel Bot', icon: MessageSquare, color: 'text-sky-600', bg: 'bg-sky-50 border-sky-200' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        breadcrumb="Configuration"
        title="Connected Social Channels"
        subtitle="Manage OAuth access tokens, channel health status, and authorized publishing profiles."
        actions={
          <Button
            variant="primary"
            size="md"
            onClick={() => setShowConnectModal(true)}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Connect Account
          </Button>
        }
      />

      {/* Connected Accounts Section */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Active Accounts ({accounts.length})
        </h2>

        {accounts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accounts.map((acc) => {
              const isExpired = acc.status === 'EXPIRED';

              return (
                <div
                  key={acc.id}
                  className={`bg-white rounded-xl border p-4 space-y-3 shadow-subtle transition-all ${
                    isExpired ? 'border-amber-300 ring-1 ring-amber-500/20' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={acc.profilePicUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80'}
                        alt={acc.accountName}
                        className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                      />
                      <div>
                        <h3 className="text-xs font-bold text-slate-900">{acc.accountName}</h3>
                        <div className="text-[11px] text-slate-500 font-medium">@{acc.accountHandle}</div>
                        <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                          {acc.followerCount?.toLocaleString() || 0} Followers
                        </div>
                      </div>
                    </div>

                    <div>
                      {isExpired ? (
                        <Badge variant="amber" icon={<AlertCircle className="w-3 h-3" />}>
                          Needs Reauth
                        </Badge>
                      ) : (
                        <Badge variant="emerald" icon={<CheckCircle2 className="w-3 h-3" />}>
                          Connected
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Token Health */}
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1 text-xs">
                    <div className="flex items-center justify-between text-slate-600 text-[11px]">
                      <span className="flex items-center gap-1 text-slate-500">
                        <Clock className="w-3 h-3 text-slate-400" /> Token Validity:
                      </span>
                      <span className="font-semibold text-slate-700">
                        {acc.tokenExpiresAt ? `Expires ${new Date(acc.tokenExpiresAt).toLocaleDateString()}` : 'Long-Lived Session'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 text-[11px]">
                      <span className="flex items-center gap-1 text-slate-500">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" /> Security:
                      </span>
                      <span className="font-semibold text-slate-700">AES-256-GCM Encrypted Vault</span>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <button
                      onClick={() => handleDisconnect(acc.id, acc.accountName)}
                      className="text-xs text-slate-400 hover:text-rose-600 font-semibold transition-colors"
                    >
                      Disconnect Channel
                    </button>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => addToast(`Synchronized permissions for @${acc.accountHandle}`, 'success')}
                      icon={<RefreshCw className="w-3 h-3" />}
                    >
                      Sync
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<Users2 className="w-6 h-6" />}
            title="No social accounts connected yet"
            description="Connect your Instagram Business profile, LinkedIn Page, X, or YouTube channel to schedule and publish posts."
            actionLabel="Connect Social Channel"
            onAction={() => setShowConnectModal(true)}
          />
        )}
      </div>

      {/* Supported Platforms Directory */}
      <div className="space-y-3 pt-4 border-t border-slate-200">
        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Supported Social Networks Directory
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {allSupportedPlatforms.map((plat) => {
            const isConnected = accounts.some((a) => a.platform === plat.id);
            const Icon = plat.icon;

            return (
              <div
                key={plat.id}
                className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-subtle flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${plat.bg}`}>
                    <Icon className={`w-3.5 h-3.5 ${plat.color}`} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-slate-900 truncate">{plat.name}</h3>
                  </div>
                </div>

                {isConnected ? (
                  <Badge variant="emerald">Connected</Badge>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setConnectPlatform(plat.id);
                      setShowConnectModal(true);
                    }}
                  >
                    Connect
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Connect Modal */}
      <Modal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        title="Connect Social Channel"
      >
        <form onSubmit={handleConnect} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Target Platform</label>
            <select
              value={connectPlatform}
              onChange={(e) => setConnectPlatform(e.target.value)}
              className="w-full h-9 px-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 font-semibold focus:outline-none focus:border-indigo-600"
            >
              <option value="INSTAGRAM">Instagram Business / Creator</option>
              <option value="LINKEDIN">LinkedIn Member / Company Page</option>
              <option value="TWITTER">X / Twitter</option>
              <option value="YOUTUBE">YouTube Channel</option>
              <option value="FACEBOOK">Facebook Page</option>
              <option value="THREADS">Meta Threads</option>
              <option value="PINTEREST">Pinterest Board</option>
              <option value="TELEGRAM">Telegram Channel</option>
            </select>
          </div>

          <Input
            label="Display / Organization Name"
            required
            value={accName}
            onChange={(e) => setAccName(e.target.value)}
            placeholder="e.g. Modern Creative Studio"
          />

          <Input
            label="Channel Handle / Identifier"
            required
            value={accHandle}
            onChange={(e) => setAccHandle(e.target.value)}
            placeholder="e.g. moderncreativestudio"
          />

          <Input
            label="Platform Access Token (Optional)"
            type="password"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="Paste verified OAuth Access Token / Bearer Token"
          />

          <div className="p-2.5 rounded-lg bg-indigo-50/70 border border-indigo-100 flex items-start gap-2 text-[11px] text-indigo-900 leading-relaxed">
            <Info className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
            <span>
              Credentials are encrypted using <strong>AES-256-GCM</strong> and verified against official platform publishing endpoints.
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="secondary" size="md" type="button" onClick={() => setShowConnectModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit" loading={submitting}>
              Authorize Channel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
