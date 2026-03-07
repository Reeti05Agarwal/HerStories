import { useState, useEffect } from 'react';
import { BookOpen, Clock, CheckCircle, XCircle, User, Mail, ArrowRight, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import type { Contributor } from '@/types';
import { contributorsApi, isAuthenticated } from '@/services/api';

interface ContributorDashboardProps {
  email: string;
  onLogin: (email: string, password?: string) => void;
  user?: { id: number; email: string; name: string; role: string } | null;
}

export function ContributorDashboard({ email, onLogin, user }: ContributorDashboardProps) {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [contributor, setContributor] = useState<Contributor | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadContributor = async () => {
    if (!email && !user) {
      setContributor(null);
      return;
    }

    if (isAuthenticated()) {
      try {
        const data = await contributorsApi.getMe();
        setContributor(data.contributor);
        return;
      } catch (error) {
        console.error('Failed to load contributor:', error);
      }
    }
  };

  useEffect(() => {
    loadContributor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) return;

    setIsLoading(true);
    try {
      // Try to login with password if provided, otherwise just use email
      if (loginPassword.trim()) {
        await onLogin(loginEmail.trim(), loginPassword.trim());
      } else {
        await onLogin(loginEmail.trim());
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Login failed';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) {
    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8 min-h-screen">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-serif text-3xl font-semibold text-foreground mb-2">
              Contributor Dashboard
            </h1>
            <p className="text-muted-foreground">
              Enter your email to access your contributions and track their status.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password (optional for contributors)</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Loading...' : (
                <>
                  View My Contributions
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>
        </div>
      </section>
    );
  }

  if (!contributor) {
    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8 min-h-screen">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <History className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="font-serif text-3xl font-semibold text-foreground mb-2">
            No Contributions Yet
          </h1>
          <p className="text-muted-foreground mb-6">
            We couldn&apos;t find any contributions associated with {email}. 
            Start sharing stories to see them here!
          </p>
          <Button onClick={() => window.dispatchEvent(new CustomEvent('herstories-navigate', { detail: { view: 'submit' } }))}>
            Submit Your First Story
          </Button>
        </div>
      </section>
    );
  }

  const storyContributions = contributor.contributions.filter(c => c.type === 'story');
  const additionContributions = contributor.contributions.filter(c => c.type === 'addition');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-amber-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Pending Review</Badge>;
    }
  };

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-serif text-4xl font-semibold text-foreground mb-2">
            My Contributions
          </h1>
          <p className="text-muted-foreground">
            Track your submissions and see how you&apos;re helping preserve women&apos;s stories.
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-card rounded-xl border border-border p-6 mb-8 shadow-soft">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="font-serif text-2xl font-semibold text-primary">
                {contributor.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="font-serif text-xl font-semibold">{contributor.name}</h2>
              <p className="text-muted-foreground flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {contributor.email}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
            <div className="text-center">
              <p className="font-serif text-2xl font-semibold">{contributor.contributions.length}</p>
              <p className="text-sm text-muted-foreground">Total Contributions</p>
            </div>
            <div className="text-center">
              <p className="font-serif text-2xl font-semibold text-green-600">
                {contributor.contributions.filter(c => c.status === 'approved').length}
              </p>
              <p className="text-sm text-muted-foreground">Approved</p>
            </div>
            <div className="text-center">
              <p className="font-serif text-2xl font-semibold text-amber-600">
                {contributor.contributions.filter(c => c.status === 'pending').length}
              </p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </div>
        </div>

        {/* Contributions Tabs */}
        <Tabs defaultValue="stories" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stories">
              <BookOpen className="w-4 h-4 mr-2" />
              Stories Submitted
              <Badge variant="secondary" className="ml-2">{storyContributions.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="additions">
              <History className="w-4 h-4 mr-2" />
              Story Additions
              <Badge variant="secondary" className="ml-2">{additionContributions.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stories">
            <div className="space-y-4">
              {storyContributions.length > 0 ? (
                storyContributions.map((contribution, index) => (
                  <div
                    key={index}
                    className="p-5 bg-card rounded-xl border border-border shadow-soft"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-serif text-lg font-semibold">{contribution.storyTitle}</h3>
                        <p className="text-sm text-muted-foreground">
                          Submitted on {new Date(contribution.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      {getStatusBadge(contribution.status)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {getStatusIcon(contribution.status)}
                      <span>
                        {contribution.status === 'approved' 
                          ? 'Your story has been published and is now visible to everyone.'
                          : contribution.status === 'rejected'
                          ? 'Your story was not approved for publication.'
                          : 'Your story is under review. We\'ll notify you once it\'s approved.'
                        }
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="mb-4">You haven&apos;t submitted any stories yet.</p>
                  <Button 
                    variant="outline"
                    onClick={() => window.dispatchEvent(new CustomEvent('herstories-navigate', { detail: { view: 'submit' } }))}
                  >
                    Submit Your First Story
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="additions">
            <div className="space-y-4">
              {additionContributions.length > 0 ? (
                additionContributions.map((contribution, index) => (
                  <div
                    key={index}
                    className="p-5 bg-card rounded-xl border border-border shadow-soft"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-serif text-lg font-semibold">{contribution.storyTitle}</h3>
                        <p className="text-sm text-muted-foreground">
                          Contributed on {new Date(contribution.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      {getStatusBadge(contribution.status)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {getStatusIcon(contribution.status)}
                      <span>
                        {contribution.status === 'approved' 
                          ? 'Your contribution has been added to the story.'
                          : contribution.status === 'rejected'
                          ? 'Your contribution was not approved.'
                          : 'Your contribution is under review.'
                        }
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="mb-4">You haven&apos;t made any contributions to existing stories yet.</p>
                  <Button 
                    variant="outline"
                    onClick={() => window.dispatchEvent(new CustomEvent('herstories-navigate', { detail: { view: 'stories' } }))}
                  >
                    Browse Stories to Contribute
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
