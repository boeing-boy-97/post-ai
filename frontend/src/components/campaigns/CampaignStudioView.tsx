import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Calendar,
  Layers,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
  Send,
  Zap,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  Facebook
} from 'lucide-react';
import { api } from '../../lib/api';
import { useToast } from '../ui/Toast';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';

export const CampaignStudioView: React.FC = () => {
  const { addToast } = useToast();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [objective, setObjective] = useState('Product Launch & Growth');
  const [durationDays, setDurationDays] = useState(7);
  const [targetPlatforms, setTargetPlatforms] = useState<string[]>(['INSTAGRAM', 'LINKEDIN', 'TWITTER']);
  const [generating, setGenerating] = useState(false);

  const [activeCampaign, setActiveCampaign] = useState<any>(null);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const data = await api.getCampaigns();
      setCampaigns(data || []);
      if (data && data.length > 0 && !activeCampaign) {
        setActiveCampaign(data[0]);
      }
    } catch (err: any) {
      addToast(err.message || 'Failed to load campaigns', 'error');
    } finally {
      setLoading(false);
    }
  };

  const togglePlatform = (p: string) => {
    if (targetPlatforms.includes(p)) {
      if (targetPlatforms.length === 1) return;
      setTargetPlatforms(targetPlatforms.filter((item) => item !== p));
    } else {
      setTargetPlatforms([...targetPlatforms, p]);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast('Please enter campaign name', 'error');
      return;
    }

    setGenerating(true);
    try {
      const res = await api.generateCampaign({
        name,
        objective,
        durationDays,
        targetPlatforms,
      });

      addToast(`Generated ${durationDays}-day campaign plan for "${name}"!`, 'success');
      setShowModal(false);
      setName('');
      await loadCampaigns();
      setActiveCampaign(res);
    } catch (err: any) {
      addToast(err.message || 'Campaign generation failed', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleApproveAndSchedule = async (campaignId: string) => {
    setApproving(true);
    try {
      const res = await api.approveScheduleCampaign(campaignId);
      addToast(res.message || 'All campaign posts scheduled successfully!', 'success');
      loadCampaigns();
    } catch (err: any) {
      addToast(err.message || 'Failed to schedule campaign', 'error');
    } finally {
      setApproving(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.deleteCampaign(id);
      addToast('Campaign removed', 'info');
      setCampaigns(campaigns.filter((c) => c.id !== id));
      if (activeCampaign?.id === id) {
        setActiveCampaign(null);
      }
    } catch (err: any) {
      addToast('Failed to delete campaign', 'error');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-600" />
            AI Multi-Day Campaign Studio
          </h2>
          <p className="text-xs text-slate-500">
            Convert one core milestone or launch idea into a complete 7-day multi-channel scheduled publishing sequence.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setShowModal(true)}
          icon={<Plus className="w-3.5 h-3.5" />}
        >
          Generate New Campaign
        </Button>
      </div>

      {/* Main Two-Column View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Campaign List */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Active Campaigns ({campaigns.length})
          </h3>

          {campaigns.length > 0 ? (
            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              {campaigns.map((c) => {
                const isSelected = activeCampaign?.id === c.id;
                const isCompleted = c.status === 'COMPLETED';

                return (
                  <div
                    key={c.id}
                    onClick={() => setActiveCampaign(c)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                      isSelected
                        ? 'bg-white border-indigo-600 shadow-card ring-2 ring-indigo-500/10'
                        : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-subtle'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold text-slate-900 truncate max-w-[180px]">{c.name}</h4>
                      <Badge variant={isCompleted ? 'emerald' : 'blue'}>
                        {isCompleted ? 'Scheduled' : 'Draft Plan'}
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      Objective: {c.objective}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-400">
                      <span>{c.durationDays} Days Sequence</span>
                      <button
                        onClick={(e) => handleDelete(c.id, e)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-white border border-dashed border-slate-200 text-center space-y-2">
              <Sparkles className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No campaigns generated</p>
              <p className="text-[11px] text-slate-400">Click "Generate New Campaign" to create a 7-day social narrative.</p>
            </div>
          )}
        </div>

        {/* Right: Active Campaign Sequence Breakdown */}
        <div className="lg:col-span-8 space-y-6">
          {activeCampaign ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 space-y-6">
              {/* Campaign Top Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                      {activeCampaign.durationDays}-Day Strategy
                    </span>
                    <span className="text-xs text-slate-400">Target: {activeCampaign.targetPlatforms?.join(', ')}</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">{activeCampaign.name}</h3>
                  <p className="text-xs text-slate-500">{activeCampaign.objective}</p>
                </div>

                <div>
                  {activeCampaign.status !== 'COMPLETED' ? (
                    <Button
                      variant="primary"
                      size="md"
                      loading={approving}
                      onClick={() => handleApproveAndSchedule(activeCampaign.id)}
                      icon={<Calendar className="w-3.5 h-3.5" />}
                    >
                      Approve & Schedule All ({activeCampaign.sequence?.length || 7} Posts)
                    </Button>
                  ) : (
                    <Badge variant="emerald" size="md" icon={<CheckCircle2 className="w-3.5 h-3.5" />}>
                      All Posts Scheduled in Database
                    </Badge>
                  )}
                </div>
              </div>

              {/* Day-by-Day Post Sequence */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Scheduled Content Narrative Sequence</h4>

                <div className="space-y-3">
                  {activeCampaign.sequence?.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 hover:bg-slate-100/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                            {item.day}
                          </span>
                          <span className="text-xs font-extrabold text-slate-900">{item.title}</span>
                          <Badge variant="slate">{item.type}</Badge>
                        </div>

                        <span className="text-[11px] font-semibold text-slate-500">
                          {new Date(item.scheduledAt).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} at 10:00 AM
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200 font-normal whitespace-pre-line">
                        {item.masterContent}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-16 rounded-3xl bg-white border border-dashed border-slate-200 text-center space-y-3 shadow-subtle">
              <Layers className="w-10 h-10 text-slate-400 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">Select a campaign to inspect publishing sequence</h4>
            </div>
          )}
        </div>
      </div>

      {/* Generate Campaign Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Synthesize Multi-Day Content Campaign" maxWidth="max-w-lg">
        <form onSubmit={handleGenerate} className="space-y-4">
          <Input
            label="Campaign Name / Feature Milestone"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. PostWave v2.4 Enterprise Launch"
          />

          <Input
            label="Campaign Strategic Objective"
            required
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            placeholder="e.g. Drive 500 demo requests and build awareness around automated social publishing"
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Sequence Duration</label>
              <select
                value={durationDays}
                onChange={(e) => setDurationDays(parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:outline-none text-xs text-slate-900 font-semibold"
              >
                <option value={3}>3-Day Sprint (Announcement & Features)</option>
                <option value={5}>5-Day Standard (Problem to Solution)</option>
                <option value={7}>7-Day Complete Narrative (Full Launch)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Target Networks</label>
              <div className="flex gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => togglePlatform('INSTAGRAM')}
                  className={`p-2 rounded-xl border ${targetPlatforms.includes('INSTAGRAM') ? 'bg-pink-50 border-pink-300 text-pink-600 ring-1 ring-pink-500/20' : 'bg-slate-50 text-slate-400'}`}
                >
                  <Instagram className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => togglePlatform('LINKEDIN')}
                  className={`p-2 rounded-xl border ${targetPlatforms.includes('LINKEDIN') ? 'bg-blue-50 border-blue-300 text-blue-600 ring-1 ring-blue-500/20' : 'bg-slate-50 text-slate-400'}`}
                >
                  <Linkedin className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => togglePlatform('TWITTER')}
                  className={`p-2 rounded-xl border ${targetPlatforms.includes('TWITTER') ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400'}`}
                >
                  <Twitter className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="secondary" size="md" type="button" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit" loading={generating} icon={<Sparkles className="w-3.5 h-3.5" />}>
              Synthesize Campaign Plan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
