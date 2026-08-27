import React, { useState, useEffect } from 'react';
import {
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  Facebook,
  Image as ImageIcon,
  Sparkles,
  Calendar,
  Clock,
  Send,
  Save,
  CheckCircle2,
  AlertCircle,
  Hash,
  Smile,
  Copy,
  Check,
  RefreshCw,
  X,
  Upload,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  ThumbsUp,
  Repeat2,
  Globe,
  Sliders,
  Layers,
  Wand2,
  Pin,
  MessageSquare
} from 'lucide-react';
import { api } from '../../lib/api';
import { useToast } from '../ui/Toast';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface PostComposerProps {
  initialDate?: string;
  onPostCreated?: () => void;
  onClose?: () => void;
}

export const PostComposer: React.FC<PostComposerProps> = ({
  initialDate,
  onPostCreated,
  onClose,
}) => {
  const { addToast } = useToast();

  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [activeEditorTab, setActiveEditorTab] = useState<string>('MASTER');
  const [previewPlatform, setPreviewPlatform] = useState<string>('INSTAGRAM');

  // Master Content & Platform Variants
  const [masterContent, setMasterContent] = useState('');
  const [platformVariants, setPlatformVariants] = useState<Record<string, string>>({
    INSTAGRAM: '',
    LINKEDIN: '',
    TWITTER: '',
    YOUTUBE: '',
    FACEBOOK: '',
    THREADS: '',
    PINTEREST: '',
    TELEGRAM: '',
  });

  const [mediaUrl, setMediaUrl] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');

  const defaultSchedule = initialDate
    ? new Date(initialDate).toISOString().slice(0, 16)
    : new Date(Date.now() + 86400000).toISOString().slice(0, 16);
  const [scheduledDateTime, setScheduledDateTime] = useState(defaultSchedule);
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adapting, setAdapting] = useState(false);

  // AI Assistant Drawer
  const [showAIDrawer, setShowAIDrawer] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiTone, setAiTone] = useState('Professional & Engaging');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);

  // Stock presets
  const [stockPresets, setStockPresets] = useState<any[]>([]);
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [accs, presets] = await Promise.all([
        api.getAccounts(),
        api.getStockPresets(),
      ]);
      setAccounts(accs || []);
      if (accs && accs.length > 0) {
        setSelectedAccountIds(accs.map((a: any) => a.id));
      }
      setStockPresets(presets || []);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleAccount = (accId: string, platform: string) => {
    if (selectedAccountIds.includes(accId)) {
      if (selectedAccountIds.length === 1) {
        addToast('At least one connected channel must be selected', 'info');
        return;
      }
      setSelectedAccountIds(selectedAccountIds.filter((id) => id !== accId));
    } else {
      setSelectedAccountIds([...selectedAccountIds, accId]);
      setPreviewPlatform(platform);
    }
  };

  const handleAdaptAll = async () => {
    if (!masterContent.trim()) {
      addToast('Please enter master content idea first', 'error');
      return;
    }

    setAdapting(true);
    try {
      const res = await api.adaptAllPlatforms(masterContent);
      setPlatformVariants((prev) => ({
        ...prev,
        ...res.variants,
      }));
      addToast('Synthesized native variants for Instagram, LinkedIn, X, YouTube, Facebook, Threads & Pinterest!', 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to adapt content', 'error');
    } finally {
      setAdapting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await api.uploadMedia(file);
      setMediaUrl(url);
      addToast('Media uploaded to server successfully!', 'success');
      setShowMediaPicker(false);
    } catch (err: any) {
      addToast(err.message || 'Upload failed', 'error');
    }
  };

  const handleAIGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiTopic.trim()) {
      addToast('Please enter an idea/topic', 'error');
      return;
    }

    setAiLoading(true);
    try {
      const res = await api.generateAIContent({
        topic: aiTopic,
        platform: previewPlatform,
        tone: aiTone,
      });
      setAiResult(res);
      addToast('AI content generated!', 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to generate content', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const insertAIContent = (text: string, hashtags: string[] = []) => {
    const combined = hashtags.length > 0 ? `${text}\n\n${hashtags.join(' ')}` : text;
    setMasterContent(combined);
    setShowAIDrawer(false);
    addToast('Inserted into Master Content Editor', 'success');
  };

  const handleSavePost = async (status: 'SCHEDULED' | 'PUBLISHED' | 'DRAFT') => {
    const activeText = activeEditorTab === 'MASTER' ? masterContent : (platformVariants[activeEditorTab] || masterContent);
    if (!activeText.trim()) {
      addToast('Please enter post content/caption', 'error');
      return;
    }

    if (selectedAccountIds.length === 0) {
      addToast('Please select at least one social account to post to', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedAccObjects = accounts.filter((a) => selectedAccountIds.includes(a.id));
      const targetPlatforms = [...new Set(selectedAccObjects.map((a) => a.platform))];

      const payload = {
        accountIds: selectedAccountIds,
        targetPlatforms,
        content: masterContent || activeText,
        platformVariants,
        mediaUrls: [mediaUrl],
        mediaType,
        status,
        scheduledAt: status === 'SCHEDULED' ? new Date(scheduledDateTime).toISOString() : undefined,
        timezone,
      };

      await api.createPost(payload);

      if (status === 'PUBLISHED') {
        addToast('Post published immediately across selected channels!', 'success');
      } else if (status === 'SCHEDULED') {
        addToast(`Post scheduled for ${new Date(scheduledDateTime).toLocaleDateString()} at ${new Date(scheduledDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}!`, 'success');
      } else {
        addToast('Draft saved successfully', 'info');
      }

      if (onPostCreated) onPostCreated();
      if (onClose) onClose();
    } catch (err: any) {
      addToast(err.message || 'Failed to save post', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const charLimits: Record<string, number> = {
    INSTAGRAM: 2200,
    LINKEDIN: 3000,
    TWITTER: 280,
    YOUTUBE: 5000,
    FACEBOOK: 63206,
    THREADS: 500,
    PINTEREST: 500,
    TELEGRAM: 4096,
  };
  const currentText = activeEditorTab === 'MASTER' ? masterContent : (platformVariants[activeEditorTab] || '');
  const activeLimit = charLimits[activeEditorTab] || 3000;
  const charsUsed = currentText.length;
  const isOverLimit = charsUsed > activeLimit;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-subtle p-5 space-y-5 animate-in fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Social Studio & Multi-Channel Publisher
          </h2>
          <p className="text-xs text-slate-500">Draft once, adapt natively across Instagram, LinkedIn, X, YouTube, and Facebook, and publish.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAIDrawer(!showAIDrawer)}
            icon={<Sparkles className="w-3.5 h-3.5 text-indigo-600" />}
          >
            AI Assistant
          </Button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* AI Assistant Drawer */}
      {showAIDrawer && (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-xs space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                AI Prompt & Hook Synthesizer
              </span>
            </div>
            <button onClick={() => setShowAIDrawer(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <form onSubmit={handleAIGenerate} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-8">
                <input
                  type="text"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="e.g. Announcing our 2026 automated workflow pipeline for creators"
                  className="w-full h-9 px-3 rounded-lg bg-white border border-slate-200 focus:border-indigo-600 focus:outline-none text-xs text-slate-900 placeholder-slate-400 shadow-xs"
                />
              </div>

              <div className="sm:col-span-4">
                <select
                  value={aiTone}
                  onChange={(e) => setAiTone(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-white border border-slate-200 focus:border-indigo-600 focus:outline-none text-xs text-slate-800 shadow-xs font-medium"
                >
                  <option value="Professional & Engaging">Professional & Engaging</option>
                  <option value="Viral & High Hook">Viral & High Hook</option>
                  <option value="Storytelling & Reflective">Storytelling & Reflective</option>
                  <option value="Witty & Casual">Witty & Casual</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                <span>Optimizing for:</span>
                <span className="font-semibold text-indigo-700">{previewPlatform}</span>
              </div>

              <Button variant="primary" size="sm" type="submit" loading={aiLoading} icon={<Sparkles className="w-3 h-3" />}>
                Synthesize
              </Button>
            </div>
          </form>

          {aiResult && (
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-900">Primary AI Output</span>
                  <button
                    type="button"
                    onClick={() => insertAIContent(aiResult.primaryContent, aiResult.suggestedHashtags)}
                    className="px-2 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Check className="w-3 h-3" />
                    <span>Insert into Master Content</span>
                  </button>
                </div>
                <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">{aiResult.primaryContent}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Grid: Left Editor & Right Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-7 space-y-4">
          {/* Target Accounts Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">Target Social Channels</label>
            <div className="flex flex-wrap gap-2">
              {accounts.length > 0 ? (
                accounts.map((acc) => {
                  const isSelected = selectedAccountIds.includes(acc.id);
                  const plat = acc.platform.toUpperCase();

                  return (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => toggleAccount(acc.id, acc.platform)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        isSelected
                          ? plat === 'INSTAGRAM'
                            ? 'bg-pink-50 border-pink-300 text-pink-700'
                            : plat === 'LINKEDIN'
                            ? 'bg-blue-50 border-blue-300 text-blue-700'
                            : plat === 'TWITTER' || plat === 'X'
                            ? 'bg-slate-900 border-slate-900 text-white'
                            : 'bg-indigo-50 border-indigo-300 text-indigo-700'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {plat === 'INSTAGRAM' && <Instagram className="w-3.5 h-3.5 text-pink-600" />}
                      {plat === 'LINKEDIN' && <Linkedin className="w-3.5 h-3.5 text-blue-600" />}
                      {(plat === 'TWITTER' || plat === 'X') && <Twitter className="w-3.5 h-3.5" />}
                      {plat === 'YOUTUBE' && <Youtube className="w-3.5 h-3.5 text-rose-600" />}
                      {plat === 'FACEBOOK' && <Facebook className="w-3.5 h-3.5 text-blue-600" />}
                      <span>{acc.accountName}</span>
                      {isSelected && <CheckCircle2 className="w-3 h-3 ml-0.5" />}
                    </button>
                  );
                })
              ) : (
                <div className="text-xs text-slate-500 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                  No accounts connected yet. Please connect an account in the Social Channels tab.
                </div>
              )}
            </div>
          </div>

          {/* Master Content & Platform Variant Tabs */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg overflow-x-auto">
                {['MASTER', 'INSTAGRAM', 'LINKEDIN', 'TWITTER', 'YOUTUBE', 'FACEBOOK', 'THREADS', 'PINTEREST'].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveEditorTab(tab)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors whitespace-nowrap ${
                      activeEditorTab === tab ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {tab === 'MASTER' ? 'Master Idea' : tab}
                  </button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                type="button"
                loading={adapting}
                onClick={handleAdaptAll}
                icon={<Wand2 className="w-3 h-3 text-indigo-600" />}
              >
                Adapt for All
              </Button>
            </div>

            {/* Active Content Editor */}
            <div className="rounded-lg border border-slate-200 bg-white focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all shadow-xs">
              <textarea
                rows={6}
                value={activeEditorTab === 'MASTER' ? masterContent : (platformVariants[activeEditorTab] || '')}
                onChange={(e) => {
                  if (activeEditorTab === 'MASTER') {
                    setMasterContent(e.target.value);
                  } else {
                    setPlatformVariants({ ...platformVariants, [activeEditorTab]: e.target.value });
                  }
                }}
                placeholder={
                  activeEditorTab === 'MASTER'
                    ? "Type your core idea or announcement here. Then click 'Adapt for All' to synthesize native variants..."
                    : `Customize ${activeEditorTab} specific copy...`
                }
                className="w-full p-3 rounded-t-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none resize-y leading-relaxed font-normal"
              />

              <div className="p-2 border-t border-slate-100 bg-slate-50/60 rounded-b-lg flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-slate-400 font-medium pl-1">Insert:</span>
                  <button type="button" onClick={() => setMasterContent((p) => p + '✨ ')} className="p-1 rounded hover:bg-white text-xs">✨</button>
                  <button type="button" onClick={() => setMasterContent((p) => p + '🚀 ')} className="p-1 rounded hover:bg-white text-xs">🚀</button>
                  <button type="button" onClick={() => setMasterContent((p) => p + '💡 ')} className="p-1 rounded hover:bg-white text-xs">💡</button>
                  <button type="button" onClick={() => setMasterContent((p) => p + ' #SocialStrategy')} className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] text-slate-600 font-medium">#SocialStrategy</button>
                </div>

                <div className="text-[11px] font-mono font-semibold text-slate-400">
                  {charsUsed} / {activeLimit} chars
                </div>
              </div>
            </div>
          </div>

          {/* Media Creative */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">Attached Media Creative</label>
              <button
                type="button"
                onClick={() => setShowMediaPicker(!showMediaPicker)}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
              >
                {showMediaPicker ? 'Hide Gallery' : 'Preset Gallery'}
              </button>
            </div>

            <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <img src={mediaUrl} alt="Media" className="w-12 h-12 rounded-md object-cover border border-slate-200 shadow-xs" />
                <div>
                  <span className="text-xs font-semibold text-slate-800 block truncate max-w-[200px]">Attached Media</span>
                  <span className="text-[11px] text-slate-400">Ready for multi-channel dispatch</span>
                </div>
              </div>

              <label className="h-8 px-3 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 cursor-pointer shadow-xs flex items-center gap-1.5 transition-colors">
                <Upload className="w-3.5 h-3.5 text-indigo-600" />
                <span>Upload File</span>
                <input type="file" accept="image/*,video/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            {showMediaPicker && (
              <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-sm space-y-1.5 animate-in fade-in">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Curated Presets</span>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {stockPresets.map((img) => (
                    <div
                      key={img.id}
                      onClick={() => setMediaUrl(img.url)}
                      className={`relative rounded-md overflow-hidden cursor-pointer border-2 transition-all ${
                        mediaUrl === img.url ? 'border-indigo-600' : 'border-transparent hover:opacity-80'
                      }`}
                    >
                      <img src={img.url} alt={img.title} className="w-full h-14 object-cover" />
                      {mediaUrl === img.url && (
                        <div className="absolute inset-0 bg-indigo-600/30 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Schedule Date & Time */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                Publishing Schedule
              </span>
              <span className="text-[10px] font-medium text-slate-500">
                Timezone: {timezone}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">Target Date & Time</label>
                <input
                  type="datetime-local"
                  value={scheduledDateTime}
                  onChange={(e) => setScheduledDateTime(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-md bg-white border border-slate-200 focus:border-indigo-600 focus:outline-none text-xs text-slate-800 font-semibold"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">Quick Slots</label>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setHours(18, 30, 0, 0);
                      setScheduledDateTime(d.toISOString().slice(0, 16));
                    }}
                    className="text-[10px] px-2 py-1.5 rounded bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 font-semibold"
                  >
                    Today 6:30 PM
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date(Date.now() + 86400000);
                      d.setHours(9, 30, 0, 0);
                      setScheduledDateTime(d.toISOString().slice(0, 16));
                    }}
                    className="text-[10px] px-2 py-1.5 rounded bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 font-semibold"
                  >
                    Tomorrow 9:30 AM
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Submission Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
            <Button variant="secondary" size="md" type="button" onClick={() => handleSavePost('DRAFT')} disabled={isSubmitting} icon={<Save className="w-3.5 h-3.5" />}>
              Save Draft
            </Button>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="md" type="button" onClick={() => handleSavePost('PUBLISHED')} disabled={isSubmitting || isOverLimit} icon={<Send className="w-3.5 h-3.5" />}>
                Publish Immediately
              </Button>

              <Button variant="primary" size="md" type="button" onClick={() => handleSavePost('SCHEDULED')} loading={isSubmitting} disabled={isOverLimit} icon={<Calendar className="w-3.5 h-3.5" />}>
                Schedule Post
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Feed Simulation */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Channel Feed Preview</span>
            <div className="flex rounded-md bg-slate-100 p-0.5 border border-slate-200">
              {['INSTAGRAM', 'LINKEDIN', 'TWITTER', 'YOUTUBE', 'FACEBOOK', 'THREADS'].map((plat) => (
                <button
                  key={plat}
                  type="button"
                  onClick={() => setPreviewPlatform(plat)}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold ${previewPlatform === plat ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500'}`}
                >
                  {plat.slice(0, 2)}
                </button>
              ))}
            </div>
          </div>

          {/* Instagram Feed Preview */}
          {previewPlatform === 'INSTAGRAM' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden max-w-sm mx-auto animate-in fade-in duration-150">
              <div className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 p-0.5">
                    <img src="/logo.png" alt="Logo" className="w-full h-full rounded-full object-cover border border-white bg-white" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 leading-tight">moderncreativestudio</div>
                    <div className="text-[10px] text-slate-400 font-medium">Original audio</div>
                  </div>
                </div>
                <div className="text-slate-400 text-xs">•••</div>
              </div>

              <div className="relative bg-slate-900 aspect-square">
                <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>

              <div className="p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Heart className="w-4 h-4 text-slate-800" />
                    <MessageCircle className="w-4 h-4 text-slate-800" />
                    <Share2 className="w-4 h-4 text-slate-800" />
                  </div>
                  <Bookmark className="w-4 h-4 text-slate-800" />
                </div>
                <div className="text-xs font-bold text-slate-900">1,248 likes</div>
                <div className="text-xs text-slate-800 leading-relaxed font-normal">
                  <span className="font-bold mr-1.5">moderncreativestudio</span>
                  <span className="whitespace-pre-line">
                    {platformVariants.INSTAGRAM || masterContent || 'Your dynamic Instagram caption previews here...'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* LinkedIn Feed Preview */}
          {previewPlatform === 'LINKEDIN' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-card p-4 space-y-2.5 max-w-sm mx-auto animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded object-cover border border-slate-200 bg-white p-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 leading-tight">Nexus Tech Innovations</div>
                    <div className="text-[10px] text-slate-500">14,890 followers • 1d • <Globe className="w-2.5 h-2.5 inline" /></div>
                  </div>
                </div>
                <span className="text-blue-600 font-bold text-xs">+ Follow</span>
              </div>

              <div className="text-xs text-slate-800 whitespace-pre-line leading-relaxed font-normal">
                {platformVariants.LINKEDIN || masterContent || 'Your LinkedIn thought leadership update previews here...'}
              </div>

              <div className="rounded-lg overflow-hidden border border-slate-100">
                <img src={mediaUrl} alt="Preview" className="w-full h-40 object-cover" />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-slate-600 text-xs font-medium">
                <div className="flex items-center gap-1 text-blue-600"><ThumbsUp className="w-3.5 h-3.5" /><span>Like</span></div>
                <div className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /><span>Comment</span></div>
                <div className="flex items-center gap-1"><Repeat2 className="w-3.5 h-3.5" /><span>Repost</span></div>
              </div>
            </div>
          )}

          {/* X / Twitter Preview */}
          {previewPlatform === 'TWITTER' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-card p-4 space-y-2.5 max-w-sm mx-auto animate-in fade-in duration-150">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="Logo" className="w-7 h-7 rounded-full object-cover border bg-white" />
                <div>
                  <div className="text-xs font-bold text-slate-900">PostWave Creator</div>
                  <div className="text-[10px] text-slate-400">@postwave_pro</div>
                </div>
              </div>

              <div className="text-xs text-slate-800 whitespace-pre-line leading-relaxed font-normal">
                {platformVariants.TWITTER || masterContent || 'Your X/Twitter tweet & thread previews here...'}
              </div>

              <div className="rounded-lg overflow-hidden border border-slate-100 max-h-36">
                <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          {/* YouTube Community Preview */}
          {previewPlatform === 'YOUTUBE' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-card p-4 space-y-2.5 max-w-sm mx-auto animate-in fade-in duration-150">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center">
                  <Youtube className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">PostWave Official</div>
                  <div className="text-[10px] text-slate-400">12.8K subscribers • Community</div>
                </div>
              </div>

              <div className="text-xs text-slate-800 whitespace-pre-line leading-relaxed font-normal">
                {platformVariants.YOUTUBE || masterContent || 'Your YouTube community update previews here...'}
              </div>

              <div className="rounded-lg overflow-hidden border border-slate-100 max-h-36">
                <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          {/* Facebook Preview */}
          {previewPlatform === 'FACEBOOK' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-card p-4 space-y-2.5 max-w-sm mx-auto animate-in fade-in duration-150">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center">
                  <Facebook className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Modern Studio Page</div>
                  <div className="text-[10px] text-slate-400">Just now • <Globe className="w-2.5 h-2.5 inline" /></div>
                </div>
              </div>

              <div className="text-xs text-slate-800 whitespace-pre-line leading-relaxed font-normal">
                {platformVariants.FACEBOOK || masterContent || 'Your Facebook page post previews here...'}
              </div>

              <div className="rounded-lg overflow-hidden border border-slate-100 max-h-36">
                <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          {/* Meta Threads Preview */}
          {previewPlatform === 'THREADS' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-card p-4 space-y-2 max-w-sm mx-auto animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src="/logo.png" alt="Logo" className="w-7 h-7 rounded-full object-cover border" />
                  <span className="text-xs font-bold text-slate-900">postwave.threads</span>
                </div>
                <span className="text-[10px] text-slate-400">1h</span>
              </div>

              <div className="text-xs text-slate-800 whitespace-pre-line leading-relaxed font-normal">
                {platformVariants.THREADS || masterContent || 'Your Threads post previews here...'}
              </div>

              <div className="rounded-lg overflow-hidden border border-slate-100 max-h-36">
                <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
