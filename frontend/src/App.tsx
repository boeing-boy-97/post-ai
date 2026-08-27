import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ToastProvider, useToast } from './components/ui/Toast';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { PostComposer } from './components/posts/PostComposer';
import { PostCalendar } from './components/posts/PostCalendar';
import { PostList } from './components/posts/PostList';
import { CampaignStudioView } from './components/campaigns/CampaignStudioView';
import { BrandMemoryView } from './components/brand/BrandMemoryView';
import { AIComposer } from './components/ai/AIComposer';
import { AccountsView } from './components/accounts/AccountsView';
import { TemplatesView } from './components/templates/TemplatesView';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { api } from './lib/api';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [posts, setPosts] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [composerInitialDate, setComposerInitialDate] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [user, currentTab]);

  const refreshData = async () => {
    try {
      const [postsData, analyticsData] = await Promise.all([
        api.getPosts(),
        api.getAnalytics(),
      ]);
      setPosts(postsData || []);
      setAnalytics(analyticsData || null);
    } catch (e) {
      console.error('Data refresh error:', e);
    }
  };

  const handleOpenComposerWithDate = (dateStr: string) => {
    setComposerInitialDate(dateStr);
    setCurrentTab('composer');
  };

  const handleUseContentInComposer = (content: string) => {
    setCurrentTab('composer');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-slate-500">Initializing Secure Session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const scheduledCount = posts.filter((p) => p.status === 'SCHEDULED').length;
  const draftCount = posts.filter((p) => p.status === 'DRAFT').length;

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white">
      <div className="hidden lg:block">
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={(tab) => {
            setComposerInitialDate(undefined);
            setCurrentTab(tab);
          }}
          postCounts={{
            scheduled: scheduledCount,
            total: posts.length,
            drafts: draftCount,
          }}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setComposerInitialDate(undefined);
            setCurrentTab(tab);
          }}
          onOpenComposer={() => {
            setComposerInitialDate(undefined);
            setCurrentTab('composer');
          }}
          onOpenAIStudio={() => setCurrentTab('ai-studio')}
          postCounts={{
            scheduled: scheduledCount,
            total: posts.length,
            drafts: draftCount,
          }}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardPage
              analytics={analytics}
              posts={posts}
              onNavigate={(tab) => setCurrentTab(tab)}
              onOpenComposerWithDate={handleOpenComposerWithDate}
            />
          )}

          {currentTab === 'composer' && (
            <PostComposer
              initialDate={composerInitialDate}
              onPostCreated={() => {
                refreshData();
                setCurrentTab('posts');
              }}
            />
          )}

          {currentTab === 'calendar' && (
            <PostCalendar onScheduleDate={handleOpenComposerWithDate} />
          )}

          {currentTab === 'posts' && (
            <PostList
              onOpenComposer={() => {
                setComposerInitialDate(undefined);
                setCurrentTab('composer');
              }}
            />
          )}

          {currentTab === 'campaigns' && <CampaignStudioView />}

          {currentTab === 'brand' && <BrandMemoryView />}

          {currentTab === 'ai-studio' && (
            <AIComposer onUseContent={handleUseContentInComposer} />
          )}

          {currentTab === 'templates' && (
            <TemplatesView onUseTemplate={handleUseContentInComposer} />
          )}

          {currentTab === 'accounts' && <AccountsView />}

          {currentTab === 'analytics' && <AnalyticsDashboard />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}
