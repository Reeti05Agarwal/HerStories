import { useState, useMemo } from 'react';
import { ArrowRight, Search, Filter, Clock, MapPin, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Story, StoryCategory } from '@/types';
import { CATEGORY_LABELS, ERA_OPTIONS, REGION_OPTIONS } from '@/types';

interface StoriesSectionProps {
  stories: Story[];
  onStoryClick: (story: Story) => void;
  onViewAll?: () => void;
  featured?: boolean;
  showFilters?: boolean;
  isLoading?: boolean;
}

export function StoriesSection({ 
  stories, 
  onStoryClick, 
  onViewAll, 
  featured = false,
  showFilters = false 
}: StoriesSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<StoryCategory | 'all'>('all');
  const [selectedEra, setSelectedEra] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');

  const filteredStories = useMemo(() => {
    let result = [...stories];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(story =>
        story.title.toLowerCase().includes(query) ||
        story.subject.toLowerCase().includes(query) ||
        story.summary.toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter(story => story.category === selectedCategory);
    }

    if (selectedEra !== 'all') {
      result = result.filter(story => story.era === selectedEra);
    }

    if (selectedRegion !== 'all') {
      result = result.filter(story => story.region === selectedRegion);
    }

    return result;
  }, [stories, searchQuery, selectedCategory, selectedEra, selectedRegion]);

  const displayStories = featured ? stories.slice(0, 3) : filteredStories;

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl sm:text-5xl font-semibold text-foreground mb-4">
            {featured ? 'Featured Stories' : 'All Stories'}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {featured 
              ? 'Discover remarkable women whose stories inspire and empower.'
              : 'Explore our collection of untold stories from women across history and the globe.'
            }
          </p>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mb-10 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search stories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as StoryCategory | 'all')}>
                  <SelectTrigger className="w-[160px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedEra} onValueChange={setSelectedEra}>
                  <SelectTrigger className="w-[160px]">
                    <Clock className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Era" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Eras</SelectItem>
                    {ERA_OPTIONS.map((era) => (
                      <SelectItem key={era} value={era}>{era}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger className="w-[160px]">
                    <MapPin className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    {REGION_OPTIONS.map((region) => (
                      <SelectItem key={region} value={region}>{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(searchQuery || selectedCategory !== 'all' || selectedEra !== 'all' || selectedRegion !== 'all') && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Active filters:</span>
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1">
                    Search: {searchQuery}
                    <button onClick={() => setSearchQuery('')} className="ml-1 hover:text-foreground">×</button>
                  </Badge>
                )}
                {selectedCategory !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    {CATEGORY_LABELS[selectedCategory]}
                    <button onClick={() => setSelectedCategory('all')} className="ml-1 hover:text-foreground">×</button>
                  </Badge>
                )}
                {selectedEra !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    {selectedEra}
                    <button onClick={() => setSelectedEra('all')} className="ml-1 hover:text-foreground">×</button>
                  </Badge>
                )}
                {selectedRegion !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    {selectedRegion}
                    <button onClick={() => setSelectedRegion('all')} className="ml-1 hover:text-foreground">×</button>
                  </Badge>
                )}
              </div>
            )}
          </div>
        )}

        {/* Stories Grid */}
        {displayStories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayStories.map((story, index) => (
              <div
                key={story.id}
                onClick={() => onStoryClick(story)}
                className="group cursor-pointer bg-card rounded-xl overflow-hidden border border-border shadow-soft hover-lift"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Image */}
                <div className="aspect-[16/10] overflow-hidden bg-muted">
                  {story.imageUrl ? (
                    <img
                      src={story.imageUrl}
                      alt={story.subject}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                      <span className="font-serif text-4xl text-muted-foreground/30">
                        {story.subject.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary" className="text-xs">
                      <Tag className="w-3 h-3 mr-1" />
                      {CATEGORY_LABELS[story.category]}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{story.era}</span>
                  </div>

                  <h3 className="font-serif text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {story.title}
                  </h3>

                  <p className="text-sm font-medium text-muted-foreground mb-3">
                    {story.subject}
                  </p>

                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {story.summary}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {story.region}
                    </span>
                    <span className="text-sm font-medium text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                      Read More
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
              No stories found
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters to find what you&apos;re looking for.
            </p>
          </div>
        )}

        {/* View All Button */}
        {featured && onViewAll && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg" onClick={onViewAll} className="group">
              View All Stories
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        )}

        {/* Results count */}
        {showFilters && (
          <div className="mt-8 text-center text-sm text-muted-foreground">
            Showing {displayStories.length} of {stories.length} stories
          </div>
        )}
      </div>
    </section>
  );
}
