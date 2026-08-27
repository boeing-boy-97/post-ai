import React, { useState } from 'react';
import {
  PenSquare,
  Sparkles,
  Menu,
  X,
  LayoutDashboard,
  Calendar,
  Layers,
  Users2,
  BarChart3,
  FileText,
  BrainCircuit,
  Zap,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { Button } from '../ui/Button';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenComposer: () => void;
  onOpenAIStudio: () => void;
  postCounts?: { scheduled: number; total: number; drafts: number };
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenComposer,
  onOpenAIStudio,
  postCounts = { scheduled: 0, total: 0, drafts: 0 },
}) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'composer', label: 'Post Composer', icon: PenSquare },
    { id: 'calendar', label: 'Calendar', icon: Calendar, badge: postCounts.scheduled || null },
    { id: 'posts', label: 'Posts & Queue', icon: Layers, badge: postCounts.total || null },
    { id: 'campaigns', label: 'Campaign Studio', icon: Zap },
    { id: 'brand', label: 'Brand Memory (RAG)', icon: BrainCircuit },
    { id: 'ai-studio', label: 'AI Content Lab', icon: Sparkles },
    { id: 'accounts', label: 'Social Channels', icon: Users2 },
    { id: 'templates', label: 'Post Templates', icon: FileText },
    { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3 },
  ];

  return (
    <>
      <header className="h-14 px-4 sm:px-6 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-30 shadow-subtle">
        {/* Left: Mobile Navigation Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-1.5 rounded-md text-slate-600 hover:bg-slate-100 focus:outline-none"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Workspace</span>
            <span>/</span>
            <span className="font-semibold text-slate-900 capitalize">{currentTab.replace('-', ' ')}</span>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenAIStudio}
            icon={<Sparkles className="w-3.5 h-3.5 text-indigo-600" />}
          >
            <span className="hidden sm:inline">AI Studio</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={onOpenComposer}
            icon={<PenSquare className="w-3.5 h-3.5" />}
          >
            <span>Create Post</span>
          </Button>

          <div className="w-px h-5 bg-slate-200" />

          {/* User Profile */}
          <div className="flex items-center gap-2">
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={user?.name || 'User'}
              className="w-7 h-7 rounded-md object-cover border border-slate-200"
            />
            <span className="hidden md:inline text-xs font-semibold text-slate-800">{user?.name || 'Alex Vance'}</span>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden bg-slate-900/30 backdrop-blur-xs flex">
          <div className="w-64 bg-white h-full shadow-dropdown flex flex-col justify-between p-4 animate-in slide-in-from-left duration-150">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <img src="/logo.png" alt="Logo" className="w-6 h-6 rounded object-contain border" />
                  <span className="font-bold text-sm text-slate-900">PostWave AI</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium ${
                        isActive ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-semibold">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-600 truncate">{user?.name}</span>
              <button onClick={logout} className="p-1 text-slate-400 hover:text-rose-600">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
