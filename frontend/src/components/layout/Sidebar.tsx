import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  PenSquare,
  Layers,
  Sparkles,
  Users2,
  BarChart3,
  FileText,
  BrainCircuit,
  Zap,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  postCounts?: { scheduled: number; total: number; drafts: number };
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  postCounts = { scheduled: 0, total: 0, drafts: 0 },
}) => {
  const { user, logout } = useAuth();

  const sections = [
    {
      title: 'Publishing',
      items: [
        { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
        { id: 'composer', label: 'Post Composer', icon: PenSquare },
        { id: 'calendar', label: 'Calendar', icon: Calendar, badge: postCounts.scheduled || null },
        { id: 'posts', label: 'Posts & Queue', icon: Layers, badge: postCounts.total || null },
      ],
    },
    {
      title: 'AI & Content Studio',
      items: [
        { id: 'campaigns', label: 'Campaign Studio', icon: Zap },
        { id: 'brand', label: 'Brand Memory (RAG)', icon: BrainCircuit },
        { id: 'ai-studio', label: 'AI Content Lab', icon: Sparkles },
      ],
    },
    {
      title: 'Configuration',
      items: [
        { id: 'accounts', label: 'Social Channels', icon: Users2 },
        { id: 'templates', label: 'Post Templates', icon: FileText },
        { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3 },
      ],
    },
  ];

  return (
    <aside className="w-60 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 h-screen sticky top-0 shadow-subtle select-none z-20">
      <div>
        {/* Brand Header */}
        <div className="h-14 px-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="PostWave Logo"
              className="w-7 h-7 rounded-md object-contain bg-white border border-slate-200"
            />
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-slate-900 tracking-tight">PostWave</span>
              <span className="text-[10px] font-semibold px-1 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                PRO
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="p-3 space-y-4">
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <div className="px-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                {section.title}
              </div>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentTab(item.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== null && item.badge !== undefined && (
                      <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                        isActive ? 'bg-indigo-200/60 text-indigo-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* User Profile & Logout Footer */}
      <div className="p-3 border-t border-slate-200 space-y-2">
        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={user?.name || 'User'}
              className="w-7 h-7 rounded-md object-cover border border-slate-200 shrink-0"
            />
            <div className="overflow-hidden text-left">
              <div className="text-xs font-semibold text-slate-900 truncate">{user?.name || 'Alex Vance'}</div>
              <div className="text-[10px] text-slate-400 truncate">{user?.email}</div>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Log out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 font-medium">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> PostgreSQL Synced
          </span>
          <span>Worker: Active</span>
        </div>
      </div>
    </aside>
  );
};
