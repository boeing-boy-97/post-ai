import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  ArrowRight
} from 'lucide-react';
import { api } from '../../lib/api';
import { useToast } from '../ui/Toast';
import { PageHeader } from '../layout/PageHeader';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { EmptyState } from '../ui/EmptyState';

interface TemplatesViewProps {
  onUseTemplate: (content: string) => void;
}

export const TemplatesView: React.FC<TemplatesViewProps> = ({ onUseTemplate }) => {
  const { addToast } = useToast();
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const data = await api.getTemplates();
      setTemplates(data || []);
    } catch (e: any) {
      addToast(e.message || 'Failed to load templates', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      addToast('Please fill out title and content', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await api.createTemplate({ title, content });
      addToast('Template saved successfully!', 'success');
      setTitle('');
      setContent('');
      setShowModal(false);
      loadTemplates();
    } catch (err: any) {
      addToast(err.message || 'Failed to save template', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.deleteTemplate(id);
      addToast('Template deleted', 'info');
      setTemplates(templates.filter((t) => t.id !== id));
    } catch (err: any) {
      addToast('Failed to delete template', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        breadcrumb="Publishing"
        title="Saved Post Templates"
        subtitle="Reusable content blueprints, frameworks, and standardized announcements."
        actions={
          <Button variant="primary" size="md" onClick={() => setShowModal(true)} icon={<Plus className="w-3.5 h-3.5" />}>
            New Template
          </Button>
        }
      />

      {/* Templates Grid */}
      {templates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="bg-white rounded-xl border border-slate-200 shadow-subtle p-4 space-y-3 flex flex-col justify-between hover:border-slate-300 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 line-clamp-1">{tpl.title}</h3>
                  <button
                    onClick={(e) => handleDelete(tpl.id, e)}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete template"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-slate-700 whitespace-pre-line line-clamp-4 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-normal">
                  {tpl.content}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-medium">
                  {new Date(tpl.createdAt).toLocaleDateString()}
                </span>
                <Button variant="outline" size="sm" onClick={() => onUseTemplate(tpl.content)} icon={<ArrowRight className="w-3 h-3" />}>
                  Use in Composer
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<FileText className="w-6 h-6" />}
          title="No saved post templates"
          description="Save reusable post outlines or weekly update formats to accelerate your publishing cadence."
          actionLabel="Create First Template"
          onAction={() => setShowModal(true)}
        />
      )}

      {/* Create Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create New Post Template" maxWidth="max-w-lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Template Title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Weekly Product Milestone Announcement"
          />

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Template Body</label>
            <textarea
              rows={6}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your reusable post text with placeholders like [Feature Name], [Link], etc."
              className="w-full p-3 bg-white border border-slate-200 focus:border-indigo-600 focus:outline-none rounded-lg text-xs text-slate-900 leading-relaxed font-normal shadow-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="secondary" size="md" type="button" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit" loading={submitting}>
              Save Template
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
