import { useState } from 'react';
import { ArrowLeft, MapPin, Clock, Tag, User, Calendar, Send, CheckCircle, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import type { Story } from '@/types';
import { CATEGORY_LABELS } from '@/types';
import { contributionsApi } from '@/services/api';

interface StoryDetailProps {
  story: Story;
  onBack: () => void;
  onContributionSubmitted: () => void;
}

export function StoryDetail({ story, onBack, onContributionSubmitted }: StoryDetailProps) {
  const [showContributionForm, setShowContributionForm] = useState(false);
  const [contributionName, setContributionName] = useState('');
  const [contributionEmail, setContributionEmail] = useState('');
  const [contributionContent, setContributionContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitContribution = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!contributionName.trim() || !contributionEmail.trim() || !contributionContent.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);

    try {
      await contributionsApi.create({
        storyId: story.id,
        content: contributionContent,
        contributionType: 'addition',
        submittedBy: contributionName,
        submitterEmail: contributionEmail,
      });

      toast.success('Contribution submitted successfully!', {
        description: 'Thank you for helping preserve this story. It will be reviewed shortly.',
      });

      setContributionName('');
      setContributionEmail('');
      setContributionContent('');
      setShowContributionForm(false);
      onContributionSubmitted();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit contribution. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const approvedContributions = story.contributions?.filter(c => c.status === 'approved') || [];

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Stories
        </Button>

        {/* Hero Image */}
        <div className="aspect-[21/9] rounded-2xl overflow-hidden mb-8 bg-muted">
          {story.imageUrl ? (
            <img
              src={story.imageUrl}
              alt={story.subject}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
              <span className="font-serif text-8xl text-muted-foreground/20">
                {story.subject.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge variant="secondary" className="text-sm">
              <Tag className="w-3 h-3 mr-1" />
              {CATEGORY_LABELS[story.category]}
            </Badge>
            <Badge variant="outline" className="text-sm font-normal">
              <Clock className="w-3 h-3 mr-1" />
              {story.era}
            </Badge>
            <Badge variant="outline" className="text-sm font-normal">
              <MapPin className="w-3 h-3 mr-1" />
              {story.region}
            </Badge>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-foreground mb-3">
            {story.title}
          </h1>

          <p className="text-xl text-muted-foreground font-medium">
            {story.subject}
          </p>
        </div>

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8 p-4 bg-muted/50 rounded-lg">
          <span className="flex items-center gap-1">
            <User className="w-4 h-4" />
            Submitted by {story.submittedBy}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {new Date(story.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
          {approvedContributions.length > 0 && (
            <span className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              {approvedContributions.length} contribution{approvedContributions.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Main Content */}
        <div className="prose prose-lg max-w-none mb-12">
          <p className="text-lg text-muted-foreground leading-relaxed mb-6 font-medium">
            {story.summary}
          </p>
          <div className="text-foreground leading-relaxed whitespace-pre-line">
            {story.content}
          </div>
        </div>

        {/* Approved Contributions */}
        {approvedContributions.length > 0 && (
          <div className="mb-12">
            <Separator className="mb-8" />
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-6">
              Community Contributions
            </h2>
            <div className="space-y-6">
              {approvedContributions.map((contribution) => (
                <div
                  key={contribution.id}
                  className="p-6 bg-muted/30 rounded-xl border border-border"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">
                      {contribution.submittedBy}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      • {new Date(contribution.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-foreground leading-relaxed">
                    {contribution.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contribution Section */}
        <Separator className="mb-8" />
        
        {!showContributionForm ? (
          <div className="text-center py-8">
            <h3 className="font-serif text-2xl font-semibold text-foreground mb-3">
              Know More About This Story?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Help us preserve history by sharing additional information, corrections, 
              or personal connections to this story.
            </p>
            <Button onClick={() => setShowContributionForm(true)} size="lg">
              <Send className="w-4 h-4 mr-2" />
              Contribute to This Story
            </Button>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <h3 className="font-serif text-2xl font-semibold text-foreground mb-2">
              Contribute to This Story
            </h3>
            <p className="text-muted-foreground mb-6">
              Your contribution will be reviewed before being added to the story.
            </p>

            <form onSubmit={handleSubmitContribution} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    placeholder="Jane Doe"
                    value={contributionName}
                    onChange={(e) => setContributionName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Your Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={contributionEmail}
                    onChange={(e) => setContributionEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contribution">Your Contribution</Label>
                <Textarea
                  id="contribution"
                  placeholder="Share additional information, personal anecdotes, or corrections..."
                  value={contributionContent}
                  onChange={(e) => setContributionContent(e.target.value)}
                  rows={6}
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    'Submitting...'
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Contribution
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowContributionForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}
