import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, BookOpen, MessageSquare, Users, Clock, ArrowRight, Search, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import type { Story, StorySubmission, Contribution, StoryCategory } from '@/types';
import { CATEGORY_LABELS, ERA_OPTIONS, REGION_OPTIONS } from '@/types';
import {
  submissionsApi,
  contributionsApi,
  statsApi,
  storiesApi,
} from '@/services/api';

interface AdminPanelProps {
  onLogout: () => void;
  onStoryApproved: () => void;
  onStoryRejected: () => void;
}

interface StoryFormData {
  title: string;
  subject: string;
  summary: string;
  content: string;
  category: StoryCategory;
  era: string;
  region: string;
  imageUrl: string;
  featured: boolean;
}

export function AdminPanel({ onLogout, onStoryApproved, onStoryRejected }: AdminPanelProps) {
  const [submissions, setSubmissions] = useState<StorySubmission[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [stats, setStats] = useState({
    totalStories: 0,
    pendingSubmissions: 0,
    pendingContributions: 0,
    totalContributors: 0,
  });
  const [selectedSubmission, setSelectedSubmission] = useState<StorySubmission | null>(null);
  const [selectedContribution, setSelectedContribution] = useState<Contribution | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending-stories');

  // Story form state
  const [showStoryForm, setShowStoryForm] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [storyForm, setStoryForm] = useState<StoryFormData>({
    title: '',
    subject: '',
    summary: '',
    content: '',
    category: 'science',
    era: '19th Century',
    region: 'North America',
    imageUrl: '',
    featured: false,
  });
  const [isSubmittingStory, setIsSubmittingStory] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [submissionsData, contributionsData, statsData, storiesData] = await Promise.all([
        submissionsApi.getAll(),
        contributionsApi.getAll(),
        statsApi.getAdminStats(),
        storiesApi.getAll(),
      ]);
      setSubmissions(submissionsData.submissions || []);
      setContributions(contributionsData.contributions || []);
      setStories(storiesData.stories || []);
      setStats(statsData.stats || {});
    } catch (error: unknown) {
      console.error('Failed to load data:', error);
      const message = error instanceof Error ? error.message : 'Failed to load admin data';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveSubmission = async (id: string) => {
    try {
      const result = await submissionsApi.approve(id, adminNotes);
      toast.success(`Approved: ${result.story.title}`);
      loadData();
      onStoryApproved();
      setSelectedSubmission(null);
      setAdminNotes('');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to approve submission';
      toast.error(message);
    }
  };

  const handleRejectSubmission = async (id: string) => {
    try {
      const result = await submissionsApi.reject(id, adminNotes);
      toast.info(`Rejected: ${result.submission.title}`);
      loadData();
      onStoryRejected();
      setSelectedSubmission(null);
      setAdminNotes('');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to reject submission';
      toast.error(message);
    }
  };

  const handleApproveContribution = async (id: string) => {
    try {
      await contributionsApi.approve(id);
      toast.success('Contribution approved');
      loadData();
      setSelectedContribution(null);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to approve contribution';
      toast.error(message);
    }
  };

  const handleRejectContribution = async (id: string) => {
    try {
      await contributionsApi.reject(id);
      toast.info('Contribution rejected');
      loadData();
      setSelectedContribution(null);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to reject contribution';
      toast.error(message);
    }
  };

  // Story management handlers
  const handleOpenCreateStory = () => {
    setEditingStory(null);
    setStoryForm({
      title: '',
      subject: '',
      summary: '',
      content: '',
      category: 'science',
      era: '19th Century',
      region: 'North America',
      imageUrl: '',
      featured: false,
    });
    setShowStoryForm(true);
    setActiveTab('manage-stories');
  };

  const handleOpenEditStory = (story: Story) => {
    setEditingStory(story);
    setStoryForm({
      title: story.title,
      subject: story.subject,
      summary: story.summary,
      content: story.content,
      category: story.category,
      era: story.era,
      region: story.region,
      imageUrl: story.imageUrl || '',
      featured: story.featured,
    });
    setShowStoryForm(true);
  };

  const handleDeleteStory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this story?')) return;

    try {
      await storiesApi.delete(id);
      toast.success('Story deleted successfully');
      loadData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete story';
      toast.error(message);
    }
  };

  const handleSaveStory = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmittingStory(true);
      if (editingStory) {
        await storiesApi.update(editingStory.id, storyForm as unknown as Record<string, unknown>);
        toast.success('Story updated successfully');
      } else {
        await storiesApi.create(storyForm as unknown as Record<string, unknown>);
        toast.success('Story created successfully');
      }
      setShowStoryForm(false);
      setEditingStory(null);
      loadData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to save story';
      toast.error(message);
    } finally {
      setIsSubmittingStory(false);
    }
  };

  const handleStoryFormChange = (field: keyof StoryFormData, value: string | boolean) => {
    setStoryForm(prev => ({ ...prev, [field]: value }));
  };

  const filteredSubmissions = submissions.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.submittedBy.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredContributions = contributions.filter(c =>
    c.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.submittedBy.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingSubmissions = filteredSubmissions.filter(s => s.status === 'pending');
  const pendingContributions = filteredContributions.filter(c => c.status === 'pending');
  const allSubmissions = filteredSubmissions;
  const allContributions = filteredContributions;

  if (isLoading) {
    return (
      <section className="py-12 px-4 sm:px-6 lg:px-8 min-h-screen">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-4xl font-semibold text-foreground mb-2">
              Admin Panel
            </h1>
            <p className="text-muted-foreground">
              Review and manage story submissions and contributions.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleOpenCreateStory}>
              <Plus className="w-4 h-4 mr-2" />
              Add Story
            </Button>
            <Button variant="outline" onClick={onLogout}>
              Logout
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-6 bg-card rounded-xl border border-border shadow-soft">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <span className="text-2xl font-serif font-semibold">{stats.totalStories}</span>
            </div>
            <p className="text-sm text-muted-foreground">Published Stories</p>
          </div>

          <div className="p-6 bg-card rounded-xl border border-border shadow-soft">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <span className="text-2xl font-serif font-semibold">{stats.pendingSubmissions}</span>
            </div>
            <p className="text-sm text-muted-foreground">Pending Stories</p>
          </div>

          <div className="p-6 bg-card rounded-xl border border-border shadow-soft">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-2xl font-serif font-semibold">{stats.pendingContributions}</span>
            </div>
            <p className="text-sm text-muted-foreground">Pending Contributions</p>
          </div>

          <div className="p-6 bg-card rounded-xl border border-border shadow-soft">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-green-500" />
              </div>
              <span className="text-2xl font-serif font-semibold">{stats.totalContributors}</span>
            </div>
            <p className="text-sm text-muted-foreground">Contributors</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search submissions and contributions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
            <TabsTrigger value="pending-stories">
              Pending Stories
              {pendingSubmissions.length > 0 && (
                <Badge variant="secondary" className="ml-2">{pendingSubmissions.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="pending-contributions">
              Pending Contributions
              {pendingContributions.length > 0 && (
                <Badge variant="secondary" className="ml-2">{pendingContributions.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="all-stories">All Stories</TabsTrigger>
            <TabsTrigger value="all-contributions">All Contributions</TabsTrigger>
            <TabsTrigger value="manage-stories">Manage Stories</TabsTrigger>
          </TabsList>

          {/* Pending Stories */}
          <TabsContent value="pending-stories">
            {selectedSubmission ? (
              <div className="space-y-6">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedSubmission(null)}
                  className="-ml-2"
                >
                  ← Back to List
                </Button>

                <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">{CATEGORY_LABELS[selectedSubmission.category]}</Badge>
                      <Badge variant="outline">{selectedSubmission.era}</Badge>
                      <Badge variant="outline">{selectedSubmission.region}</Badge>
                    </div>
                    <h2 className="font-serif text-2xl font-semibold">{selectedSubmission.title}</h2>
                    <p className="text-lg text-muted-foreground">{selectedSubmission.subject}</p>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="font-medium text-sm text-muted-foreground mb-1">Summary</p>
                    <p>{selectedSubmission.summary}</p>
                  </div>

                  <div>
                    <p className="font-medium text-sm text-muted-foreground mb-2">Full Story</p>
                    <div className="whitespace-pre-line">{selectedSubmission.content}</div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Submitted by: {selectedSubmission.submittedBy}</span>
                    <span>•</span>
                    <span>{selectedSubmission.submitterEmail}</span>
                    <span>•</span>
                    <span>{new Date(selectedSubmission.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Admin Notes (optional)</label>
                    <Textarea
                      placeholder="Add notes about this decision..."
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleApproveSubmission(selectedSubmission.id)}
                      className="flex-1"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleRejectSubmission(selectedSubmission.id)}
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingSubmissions.length > 0 ? (
                  pendingSubmissions.map((submission) => (
                    <div
                      key={submission.id}
                      onClick={() => setSelectedSubmission(submission)}
                      className="p-4 bg-card rounded-xl border border-border cursor-pointer hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-serif text-lg font-semibold">{submission.title}</h3>
                          <p className="text-muted-foreground">{submission.subject}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {CATEGORY_LABELS[submission.category]}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              by {submission.submittedBy}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              • {new Date(submission.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No pending story submissions</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Pending Contributions */}
          <TabsContent value="pending-contributions">
            {selectedContribution ? (
              <div className="space-y-6">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedContribution(null)}
                  className="-ml-2"
                >
                  ← Back to List
                </Button>

                <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                  <div>
                    <h2 className="font-serif text-2xl font-semibold">Contribution Review</h2>
                    <p className="text-muted-foreground">
                      Story ID: {selectedContribution.storyId}
                    </p>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="font-medium text-sm text-muted-foreground mb-1">Content</p>
                    <p className="whitespace-pre-line">{selectedContribution.content}</p>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Submitted by: {selectedContribution.submittedBy}</span>
                    <span>•</span>
                    <span>{selectedContribution.submitterEmail}</span>
                    <span>•</span>
                    <span>{new Date(selectedContribution.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleApproveContribution(selectedContribution.id)}
                      className="flex-1"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleRejectContribution(selectedContribution.id)}
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingContributions.length > 0 ? (
                  pendingContributions.map((contribution) => (
                    <div
                      key={contribution.id}
                      onClick={() => setSelectedContribution(contribution)}
                      className="p-4 bg-card rounded-xl border border-border cursor-pointer hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="line-clamp-2">{contribution.content}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-muted-foreground">
                              by {contribution.submittedBy}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              • {new Date(contribution.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No pending contributions</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* All Stories */}
          <TabsContent value="all-stories">
            <div className="space-y-4">
              {stories.length > 0 ? (
                stories.map((story) => (
                  <div
                    key={story.id}
                    className="p-4 bg-card rounded-xl border border-border"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-serif text-lg font-semibold">{story.title}</h3>
                          <Badge variant="default" className="text-xs">
                            {story.status}
                          </Badge>
                          {story.featured && (
                            <Badge variant="secondary" className="text-xs">Featured</Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground">{story.subject}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {CATEGORY_LABELS[story.category]}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            by {story.submittedBy}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            • {new Date(story.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEditStory(story)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteStory(story.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No stories found</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* All Contributions */}
          <TabsContent value="all-contributions">
            <div className="space-y-4">
              {allContributions.length > 0 ? (
                allContributions.map((contribution) => (
                  <div
                    key={contribution.id}
                    className="p-4 bg-card rounded-xl border border-border"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant={contribution.status === 'approved' ? 'default' :
                                    contribution.status === 'rejected' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {contribution.status}
                          </Badge>
                        </div>
                        <p className="line-clamp-2">{contribution.content}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-muted-foreground">
                            by {contribution.submittedBy}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            • {new Date(contribution.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No contributions found</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Manage Stories Tab */}
          <TabsContent value="manage-stories">
            {showStoryForm ? (
              <div className="space-y-6">
                <Button
                  variant="ghost"
                  onClick={() => setShowStoryForm(false)}
                  className="-ml-2"
                >
                  ← Back to List
                </Button>

                <form onSubmit={handleSaveStory} className="space-y-8">
                  <div className="space-y-6">
                    <h2 className="font-serif text-xl font-semibold text-foreground pb-2 border-b border-border">
                      Story Information
                    </h2>

                    <div className="space-y-2">
                      <Label htmlFor="title">
                        Story Title <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="title"
                        placeholder="e.g., The Woman Who Mapped the Stars"
                        value={storyForm.title}
                        onChange={(e) => handleStoryFormChange('title', e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">
                        Subject Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="subject"
                        placeholder="e.g., Annie Jump Cannon"
                        value={storyForm.subject}
                        onChange={(e) => handleStoryFormChange('subject', e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">
                          Category <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={storyForm.category}
                          onValueChange={(value) => handleStoryFormChange('category', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                              <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="era">
                          Time Period <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={storyForm.era}
                          onValueChange={(value) => handleStoryFormChange('era', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select era" />
                          </SelectTrigger>
                          <SelectContent>
                            {ERA_OPTIONS.map((era) => (
                              <SelectItem key={era} value={era}>{era}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="region">
                          Region <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={storyForm.region}
                          onValueChange={(value) => handleStoryFormChange('region', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select region" />
                          </SelectTrigger>
                          <SelectContent>
                            {REGION_OPTIONS.map((region) => (
                              <SelectItem key={region} value={region}>{region}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h2 className="font-serif text-xl font-semibold text-foreground pb-2 border-b border-border">
                      Story Content
                    </h2>

                    <div className="space-y-2">
                      <Label htmlFor="summary">
                        Brief Summary <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="summary"
                        placeholder="A one or two sentence summary of the story..."
                        value={storyForm.summary}
                        onChange={(e) => handleStoryFormChange('summary', e.target.value)}
                        rows={2}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="content">
                        Full Story <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="content"
                        placeholder="Write the full story here..."
                        value={storyForm.content}
                        onChange={(e) => handleStoryFormChange('content', e.target.value)}
                        rows={10}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="imageUrl">Image URL (optional)</Label>
                      <Input
                        id="imageUrl"
                        placeholder="https://example.com/image.jpg"
                        value={storyForm.imageUrl}
                        onChange={(e) => handleStoryFormChange('imageUrl', e.target.value)}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={storyForm.featured}
                        onChange={(e) => handleStoryFormChange('featured', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <Label htmlFor="featured">Featured Story</Label>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                      type="submit"
                      size="lg"
                      disabled={isSubmittingStory}
                      className="flex-1"
                    >
                      {isSubmittingStory ? 'Saving...' : (editingStory ? 'Update Story' : 'Create Story')}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={() => setShowStoryForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="space-y-4">
                {stories.length > 0 ? (
                  stories.map((story) => (
                    <div
                      key={story.id}
                      className="p-4 bg-card rounded-xl border border-border"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-serif text-lg font-semibold">{story.title}</h3>
                            {story.featured && (
                              <Badge variant="default" className="text-xs">Featured</Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground">{story.subject}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {CATEGORY_LABELS[story.category]}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {story.era}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              • {story.region}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEditStory(story)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteStory(story.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No stories found</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
