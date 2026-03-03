import { ArrowRight, BookOpen, Heart, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroProps {
  onExplore: () => void;
  onSubmit: () => void;
}

export function Hero({ onExplore, onSubmit }: HeroProps) {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 gradient-hero">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-fade-in">
          <Heart className="w-4 h-4" />
          <span>Celebrating Untold Stories</span>
        </div>

        {/* Main Heading */}
        <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-semibold text-foreground leading-tight mb-6 animate-slide-up">
          HerStories
          <span className="block text-primary italic">Untold Voices</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-4 leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
          Discover the remarkable stories of women whose contributions have shaped our world, 
          yet remain untold in the pages of history.
        </p>

        <p className="text-base text-muted-foreground/80 max-w-xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          Join our community in preserving and sharing these powerful narratives. 
          Every story matters. Every voice deserves to be heard.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <Button 
            size="lg" 
            onClick={onExplore}
            className="group px-8 py-6 text-base font-medium"
          >
            <BookOpen className="w-5 h-5 mr-2" />
            Explore Stories
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            onClick={onSubmit}
            className="px-8 py-6 text-base font-medium"
          >
            <Heart className="w-5 h-5 mr-2" />
            Share a Story
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <p className="font-serif text-2xl font-semibold text-foreground">100+</p>
            <p className="text-sm text-muted-foreground">Stories</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <p className="font-serif text-2xl font-semibold text-foreground">50+</p>
            <p className="text-sm text-muted-foreground">Contributors</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Heart className="w-5 h-5 text-primary" />
            </div>
            <p className="font-serif text-2xl font-semibold text-foreground">10k+</p>
            <p className="text-sm text-muted-foreground">Readers</p>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-muted-foreground/50 rounded-full" />
        </div>
      </div>
    </section>
  );
}
