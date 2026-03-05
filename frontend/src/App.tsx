import { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { Navigation } from '@/components/Navigation';
import { Hero } from '@/sections/Hero';
import { StoriesSection } from '@/sections/StoriesSection';
import { StoryDetail } from '@/sections/StoryDetail';
import { SubmitStory } from '@/sections/SubmitStory';
import { AdminPanel } from '@/sections/AdminPanel';
import { ContributorDashboard } from '@/sections/ContributorDashboard';
import { Footer } from '@/sections/Footer';
import type { Story } from '@/types';
import { storiesApi, authApi, setToken, removeToken, isAuthenticated } from '@/services/api';
import './App.css';

type View = 'home' | 'stories' | 'story-detail' | 'submit' | 'admin' | 'dashboard';

function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [contributorEmail, setContributorEmail] = useState('');
  const [user, setUser] = useState<{ id: number; email: string; name: string; role: string } | null>(null);

  // Load stories and check authentication on mount
  useEffect(() => {
    loadStories();
    checkAuth();

    // Listen for login success events
    const handleLoginSuccess = (event: CustomEvent<{ email: string; user: { id: number; email: string; name: string; role: string } | null; isAdmin: boolean }>) => {
      const { email, user: loginUser, isAdmin: newIsAdmin } = event.detail;
      setContributorEmail(email);
      if (loginUser) {
        setUser(loginUser);
      }
      if (newIsAdmin) {
        setIsAdmin(true);
        toast.success('Welcome, Administrator');
        setCurrentView('admin');
      } else {
        toast.success('Welcome back!');
        setCurrentView('dashboard');
      }
    };

    window.addEventListener('herstories-login-success', handleLoginSuccess as EventListener);
    return () => {
      window.removeEventListener('herstories-login-success', handleLoginSuccess as EventListener);
    };
  }, []);

  const loadStories = async () => {
    try {
      setIsLoading(true);
      const data = await storiesApi.getAll();
      setStories(data.stories || []);
    } catch (error) {
      console.error('Failed to load stories:', error);
      toast.error('Failed to load stories');
    } finally {
      setIsLoading(false);
    }
  };

  const checkAuth = async () => {
    if (!isAuthenticated()) return;

    try {
      const data = await authApi.me();
      if (data.user) {
        setUser(data.user);
        setContributorEmail(data.user.email);
        if (data.user.role === 'admin') {
          setIsAdmin(true);
          setCurrentView('admin');
        } else {
          setCurrentView('dashboard');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Don't remove token on 404 - might be CORS or network issue
      const err = error as Error;
      if (err.message !== 'Not found') {
        removeToken();
      }
    }
  };

  const handleNavigate = (view: View) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStoryClick = (story: Story) => {
    setSelectedStory(story);
    setCurrentView('story-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStorySubmitted = () => {
    toast.success('Your story has been submitted for review!', {
      description: 'Thank you for contributing to HerStories.',
    });
    handleNavigate('stories');
  };

  const handleContributionSubmitted = () => {
    toast.success('Your contribution has been submitted for review!', {
      description: 'Thank you for helping preserve these stories.',
    });
    loadStories();
  };

  const handleAdminLogin = async (email: string, password?: string) => {
    try {
      if (password) {
        const data = await authApi.login(email, password);
        setToken(data.token);
        setUser(data.user);
        setContributorEmail(data.user.email);

        if (data.user.role === 'admin') {
          setIsAdmin(true);
          toast.success('Welcome, Administrator');
          setCurrentView('admin');
        } else {
          toast.success('Welcome back!');
          setCurrentView('dashboard');
        }
      } else {
        // For non-admin users, just set the email
        setContributorEmail(email);
        toast.success('Welcome back!');
        setCurrentView('dashboard');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Login failed';
      toast.error(message);
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    setContributorEmail('');
    setUser(null);
    removeToken();
    toast.info('Logged out successfully');
    handleNavigate('home');
  };

  const handleStoriesRefresh = () => {
    loadStories();
  };

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return (
          <>
            <Hero onExplore={() => handleNavigate('stories')} onSubmit={() => handleNavigate('submit')} />
            <StoriesSection
              stories={stories.slice(0, 3)}
              onStoryClick={handleStoryClick}
              onViewAll={() => handleNavigate('stories')}
              featured
            />
          </>
        );
      case 'stories':
        return (
          <StoriesSection
            stories={stories}
            onStoryClick={handleStoryClick}
            showFilters
            isLoading={isLoading}
          />
        );
      case 'story-detail':
        return selectedStory ? (
          <StoryDetail
            story={selectedStory}
            onBack={() => handleNavigate('stories')}
            onContributionSubmitted={handleContributionSubmitted}
          />
        ) : (
          <StoriesSection
            stories={stories}
            onStoryClick={handleStoryClick}
            showFilters
          />
        );
      case 'submit':
        return (
          <SubmitStory
            onSubmit={handleStorySubmitted}
            onCancel={() => handleNavigate('stories')}
          />
        );
      case 'admin':
        return isAdmin ? (
          <AdminPanel
            onLogout={handleAdminLogout}
            onStoryApproved={handleStoriesRefresh}
            onStoryRejected={handleStoriesRefresh}
          />
        ) : (
          <ContributorDashboard
            email={contributorEmail}
            onLogin={handleAdminLogin}
          />
        );
      case 'dashboard':
        return (
          <ContributorDashboard
            email={contributorEmail}
            onLogin={handleAdminLogin}
            user={user}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster
        position="top-center"
        richColors
        closeButton
        toastOptions={{
          style: {
            fontFamily: 'Inter, sans-serif',
          },
        }}
      />
      <Navigation
        currentView={currentView}
        onNavigate={handleNavigate}
        isAdmin={isAdmin}
        contributorEmail={contributorEmail}
        onLogout={handleAdminLogout}
      />
      <main className="pt-16">
        {renderView()}
      </main>
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default App;
