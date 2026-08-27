import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  FileText,
  Plus,
  Trash2,
  Sparkles,
  Save,
  CheckCircle2,
  BookOpen,
  Tag,
  Search,
  RefreshCw,
  Info
} from 'lucide-react';
import { api } from '../../lib/api';
import { useToast } from '../ui/Toast';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';

export const BrandMemoryView: React.FC = () => {
  const { addToast } = useToast();
  const [docs, setDocs] = useState<any[]>([]);
  const [brandVoice, setBrandVoice] = useState('');
  const [loading, setLoading] = useState(false);
  const [savingVoice, setSavingVoice] = useState(false);
  const [search, setSearch] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDocType, setNewDocType] = useState('GUIDELINE');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');
  const [submittingDoc, setSubmittingDoc] = useState(false);

  useEffect(() => {
    loadBrandData();
  }, []);

  const loadBrandData = async () => {
    setLoading(true);
    try {
      const data = await api.getBrandDocs();
      setDocs(data.data || []);
      setBrandVoice(data.brandVoice || 'Professional, clear, insightful, and engaging');
    } catch (err: any) {
      addToast(err.message || 'Failed to load brand memory', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveVoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingVoice(true);
    try {
      await api.updateBrandVoice(brandVoice);
      addToast('Brand Voice profile updated successfully!', 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to update brand voice', 'error');
    } finally {
      setSavingVoice(false);
    }
  };

  const handleCreateDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      addToast('Please enter document title and content', 'error');
      return;
    }

    setSubmittingDoc(true);
    try {
      const tagsArray = newTags.split(',').map((t) => t.trim()).filter(Boolean);
      await api.createBrandDoc({
        title: newTitle,
        docType: newDocType,
        content: newContent,
        tags: tagsArray,
      });

      addToast('Knowledge base document ingested & indexed for AI RAG!', 'success');
      setShowModal(false);
      setNewTitle('');
      setNewContent('');
      setNewTags('');
      loadBrandData();
    } catch (err: any) {
      addToast(err.message || 'Failed to ingest document', 'error');
    } finally {
      setSubmittingDoc(false);
    }
  };

  const handleDeleteDoc = async (id: string, title: string) => {
    if (!window.confirm(`Remove "${title}" from brand knowledge base?`)) return;
    try {
      await api.deleteBrandDoc(id);
      addToast('Document removed from memory', 'info');
      setDocs(docs.filter((d) => d.id !== id));
    } catch (err: any) {
      addToast('Failed to delete document', 'error');
    }
  };

  const filteredDocs = docs.filter(
    (d) =>
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-indigo-600" />
            Brand Memory & Knowledge Base (RAG)
          </h2>
          <p className="text-xs text-slate-500">
            Feed guidelines, product specifications, and FAQs so AI generates grounded, accurate, brand-aligned content.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setShowModal(true)}
          icon={<Plus className="w-3.5 h-3.5" />}
        >
          Ingest Knowledge Document
        </Button>
      </div>

      {/* Brand Voice Editor Card */}
      <form
        onSubmit={handleSaveVoice}
        className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-card space-y-4"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-600" />
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              Global Brand Voice & Style Directives
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Injected into all AI generation prompts</span>
        </div>

        <div className="space-y-2">
          <textarea
            rows={3}
            value={brandVoice}
            onChange={(e) => setBrandVoice(e.target.value)}
            placeholder="e.g. Professional, data-backed, confident, concise, never use buzzwords, emphasize ROI and engineer productivity."
            className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:outline-none text-xs text-slate-800 leading-relaxed font-medium"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Active for all connected social platforms</span>
          </div>
          <Button variant="primary" size="sm" type="submit" loading={savingVoice} icon={<Save className="w-3.5 h-3.5" />}>
            Update Brand Voice
          </Button>
        </div>
      </form>

      {/* Search & Documents Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Ingested Brand Knowledge ({filteredDocs.length})
          </h3>

          <div className="relative sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search knowledge docs..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 focus:border-indigo-500 focus:outline-none text-xs text-slate-800 shadow-xs"
            />
          </div>
        </div>

        {filteredDocs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-subtle hover:shadow-card-hover transition-all p-6 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <Badge variant={doc.docType === 'PRODUCT_SPEC' ? 'indigo' : doc.docType === 'FAQ' ? 'amber' : 'blue'}>
                      {doc.docType.replace(/_/g, ' ')}
                    </Badge>
                    <button
                      onClick={() => handleDeleteDoc(doc.id, doc.title)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h4 className="text-sm font-extrabold text-slate-900 tracking-tight line-clamp-1">{doc.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    {doc.content}
                  </p>

                  {doc.tags && doc.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {doc.tags.map((tag: string, i: number) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-medium">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Indexed {new Date(doc.createdAt).toLocaleDateString()}</span>
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> RAG Ready
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 rounded-3xl bg-white border border-dashed border-slate-200 text-center space-y-3 shadow-subtle">
            <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">No brand documents in knowledge base</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Ingest your product feature sheets, company overview, or tone guidelines to anchor all AI generations in factual brand context.
            </p>
            <Button variant="primary" size="md" onClick={() => setShowModal(true)}>
              Ingest First Document
            </Button>
          </div>
        )}
      </div>

      {/* Ingest Document Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Ingest Brand Knowledge Document" maxWidth="max-w-lg">
        <form onSubmit={handleCreateDoc} className="space-y-4">
          <Input
            label="Document Title"
            required
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="e.g. PostWave v2 Core Architecture & Feature Matrix"
          />

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Category / Type</label>
            <select
              value={newDocType}
              onChange={(e) => setNewDocType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:outline-none text-xs text-slate-900 font-semibold"
            >
              <option value="GUIDELINE">Brand Voice & Style Guide</option>
              <option value="PRODUCT_SPEC">Product Specification & Features</option>
              <option value="FAQ">Customer FAQs & Objections</option>
              <option value="WEBSITE">Website / Landing Page Copy</option>
              <option value="TOP_POST">Historical Top Performing Post</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Document Text Content</label>
            <textarea
              rows={6}
              required
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Paste raw text from your whitepaper, pitch deck, customer FAQ, or product brief..."
              className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:outline-none text-xs text-slate-900 leading-relaxed font-normal"
            />
          </div>

          <Input
            label="Semantic Tags (Comma separated)"
            value={newTags}
            onChange={(e) => setNewTags(e.target.value)}
            placeholder="e.g. features, pricing, architecture, b2b"
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="secondary" size="md" type="button" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit" loading={submittingDoc}>
              Index Document
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
