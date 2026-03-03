import { Heart, Mail, Github, Twitter } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: 'home' | 'stories' | 'submit' | 'admin' | 'dashboard') => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/50 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-serif text-lg font-semibold">H</span>
              </div>
              <span className="font-serif text-xl font-semibold text-foreground">
                HerStories
              </span>
            </div>
            <p className="text-muted-foreground max-w-md mb-6">
              Preserving and sharing the untold stories of remarkable women who have 
              shaped our world. Join us in celebrating their contributions to history.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-serif text-lg font-semibold text-foreground mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('stories')}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  All Stories
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('submit')}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Submit a Story
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  My Contributions
                </button>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-serif text-lg font-semibold text-foreground mb-4">
              Categories
            </h3>
            <ul className="space-y-3">
              <li className="text-muted-foreground">Science & Research</li>
              <li className="text-muted-foreground">Arts & Culture</li>
              <li className="text-muted-foreground">Politics & Leadership</li>
              <li className="text-muted-foreground">Activism & Social Justice</li>
              <li className="text-muted-foreground">Technology & Innovation</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground text-center sm:text-left">
            © {currentYear} HerStories. Made with{' '}
            <Heart className="w-4 h-4 inline text-primary" /> for untold voices.
          </p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <button className="hover:text-primary transition-colors">
              Privacy Policy
            </button>
            <button className="hover:text-primary transition-colors">
              Terms of Service
            </button>
            <button className="hover:text-primary transition-colors">
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
