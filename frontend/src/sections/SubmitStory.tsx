import { useState } from 'react';
import { Send, ArrowLeft, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import type { StoryCategory } from '@/types';
import { CATEGORY_LABELS, ERA_OPTIONS, REGION_OPTIONS } from '@/types';
import { submissionsApi } from '@/services/api';

interface SubmitStoryProps {
  onSubmit: () => void;
  onCancel: () => void;
}

export function SubmitStory({ onSubmit, onCancel }: SubmitStoryProps) {
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    summary: '',
    content: '',
    category: '' as StoryCategory | '',
    era: '',
    region: '',
    submittedBy: '',
    submitterEmail: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const requiredFields = ['title', 'subject', 'summary', 'content', 'category', 'era', 'region', 'submittedBy', 'submitterEmail'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);

    if (missingFields.length > 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      await submissionsApi.create({
        title: formData.title,
        subject: formData.subject,
        summary: formData.summary,
        content: formData.content,
        category: formData.category as StoryCategory,
        era: formData.era,
        region: formData.region,
        submittedBy: formData.submittedBy,
        submitterEmail: formData.submitterEmail,
      });

      toast.success('Story submitted successfully!', {
        description: 'Thank you for contributing to HerStories. Your submission will be reviewed shortly.',
      });

      onSubmit();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit story. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={onCancel}
          className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Stories
        </Button>

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-foreground mb-4">
            Share a Story
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Help us preserve the untold stories of remarkable women. 
            Your contribution helps ensure these voices are heard.
          </p>
        </div>

        {/* Info Alert */}
        <Alert className="mb-8 bg-primary/5 border-primary/20">
          <Info className="h-4 w-4 text-primary" />
          <AlertDescription className="text-foreground">
            All submissions are reviewed before being published. You&apos;ll be able to track 
            your contribution status in your dashboard.
          </AlertDescription>
        </Alert>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Story Information */}
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
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">
                Subject Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="subject"
                placeholder="e.g., Annie Jump Cannon"
                value={formData.subject}
                onChange={(e) => handleChange('subject', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">
                  Category <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleChange('category', value)}
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
                  value={formData.era}
                  onValueChange={(value) => handleChange('era', value)}
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
                  value={formData.region}
                  onValueChange={(value) => handleChange('region', value)}
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

          {/* Story Content */}
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
                value={formData.summary}
                onChange={(e) => handleChange('summary', e.target.value)}
                rows={2}
              />
              <p className="text-sm text-muted-foreground">
                This will be displayed in story cards and search results.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">
                Full Story <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="content"
                placeholder="Write the full story here. Include key details, achievements, challenges, and impact..."
                value={formData.content}
                onChange={(e) => handleChange('content', e.target.value)}
                rows={10}
              />
              <p className="text-sm text-muted-foreground">
                Be as detailed as possible. Include dates, locations, and specific accomplishments.
              </p>
            </div>
          </div>

          {/* Contributor Information */}
          <div className="space-y-6">
            <h2 className="font-serif text-xl font-semibold text-foreground pb-2 border-b border-border">
              Your Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="submittedBy">
                  Your Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="submittedBy"
                  placeholder="Jane Doe"
                  value={formData.submittedBy}
                  onChange={(e) => handleChange('submittedBy', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="submitterEmail">
                  Your Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="submitterEmail"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.submitterEmail}
                  onChange={(e) => handleChange('submitterEmail', e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  We&apos;ll use this to notify you when your story is published.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                'Submitting...'
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Story
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={onCancel}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
