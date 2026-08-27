import React, { useState } from 'react';
import {
  Sparkles,
  Instagram,
  Linkedin,
  Twitter,
  Copy,
  Check,
  RefreshCw,
  ArrowRight,
  Hash,
  Wand2
} from 'lucide-react';
import { api } from '../../lib/api';
import { useToast } from '../ui/Toast';
import { PageHeader } from '../layout/PageHeader';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface AIComposerProps {
  onUseContent: (content: string) => void;
}

export const AIComposer: React.FC<AIComposerProps> = ({ onUseContent }) => {
  const { addToast } = useToast();
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('INSTAGRAM');
  const [tone, setTone] = useState('Professional & Engaging');
  const [targetAudience, setTargetAudience] = useState('Founders, Creators & Operations Leaders');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copiedKey, setCopiedKey] = useState('');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      addToast('Please enter a topic or concept', 'error');
      return;
    }

    setLoading(true);
    try {
      const data = await api.generateAIContent({
        topic,
        platform,
        tone,
        targetAudience,
      });
      setResult(data);
      addToast('AI content & variations synthesized!', 'success');
    } catch (err: any) {
      addToast(err.message || 'Generation failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    addToast('Copied to clipboard!', 'success');
    setTimeout(() => setCopiedKey(''), 2000);
  };

  const prefillIdea = (top: string, plat: string, tn: string) => {
    setTopic(top);
    setPlatform(plat);
    setTone(tn);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        breadcrumb="AI Studio"
        title="AI Content Generation Lab"
        subtitle="Synthesize platform-native captions, A/B hook angles, and hashtag clusters grounded in your brand guidelines."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form */}
        <div className="lg:col-span-5 space-y-4">
          <form onSubmit={handleGenerate} className="bg-white rounded-xl border border-slate-200 p-5 shadow-subtle space-y-4">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Generation Parameters
            </h2>

            {/* Quick Starters */}
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">Preset Ideas</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => prefillIdea('5 Growth Frameworks for B2B Teams in 2026', 'LINKEDIN', 'Professional & Engaging')}
                  className="text-[10px] px-2 py-1 rounded bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 font-semibold transition-colors"
                >
                  💼 B2B Strategy
                </button>
                <button
                  type="button"
                  onClick={() => prefillIdea('Behind the scenes building our new multi-channel scheduler', 'INSTAGRAM', 'Viral & High Hook')}
                  className="text-[10px] px-2 py-1 rounded bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 font-semibold transition-colors"
                >
                  ✨ Product Milestone
                </button>
              </div>
            </div>

            {/* Topic Input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Topic / Core Idea *</label>
              <textarea
                rows={3}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Announcing our 2026 multi-channel social publishing engine"
                className="w-full p-3 rounded-lg bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white focus:outline-none text-xs text-slate-900 leading-relaxed font-normal"
              />
            </div>

            {/* Platform & Tone */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Target Channel</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:outline-none text-xs text-slate-800 font-semibold"
                >
                  <option value="INSTAGRAM">Instagram</option>
                  <option value="LINKEDIN">LinkedIn</option>
                  <option value="TWITTER">X / Twitter</option>
                  <option value="YOUTUBE">YouTube</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Tone of Voice</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:outline-none text-xs text-slate-800 font-semibold"
                >
                  <option value="Professional & Engaging">Professional & Engaging</option>
                  <option value="Viral & High Hook">Viral & High Hook</option>
                  <option value="Storytelling & Reflective">Storytelling & Reflective</option>
                  <option value="Witty & Casual">Witty & Casual</option>
                </select>
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              type="submit"
              loading={loading}
              className="w-full"
              icon={<Wand2 className="w-3.5 h-3.5" />}
            >
              Generate Content
            </Button>
          </form>
        </div>

        {/* Right Output */}
        <div className="lg:col-span-7 space-y-4">
          {result ? (
            <div className="space-y-4 animate-in fade-in">
              {/* Primary Output */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-subtle p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="indigo">Primary AI Output</Badge>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyText(result.primaryContent, 'primary')}
                      icon={copiedKey === 'primary' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    >
                      {copiedKey === 'primary' ? 'Copied' : 'Copy'}
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onUseContent(result.primaryContent)}
                      icon={<ArrowRight className="w-3 h-3" />}
                    >
                      Use in Composer
                    </Button>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 whitespace-pre-line leading-relaxed font-normal">
                  {result.primaryContent}
                </div>

                {/* Hashtags */}
                {result.suggestedHashtags && result.suggestedHashtags.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                      <Hash className="w-3 h-3 text-indigo-600" /> High-Reach Hashtags
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {result.suggestedHashtags.map((h: string, i: number) => (
                        <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 font-medium">
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* A/B Hook Variations */}
              {result.variations && result.variations.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-subtle p-5 space-y-3">
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">A/B Angle Variations</h2>
                  <div className="space-y-2">
                    {result.variations.map((v: string, idx: number) => (
                      <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-indigo-700">Variation {idx + 1}</span>
                          <button
                            onClick={() => onUseContent(v)}
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                          >
                            Use this →
                          </button>
                        </div>
                        <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">{v}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 rounded-xl bg-white border border-dashed border-slate-200 text-center space-y-2 shadow-subtle">
              <Sparkles className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-xs font-bold text-slate-700">No content generated yet</h3>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                Fill in the topic parameters on the left and click "Generate Content" to craft your multi-channel copy.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
