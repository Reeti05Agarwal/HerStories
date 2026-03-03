import { useState } from 'react';
import { BookOpen, Plus, User, Menu, X, Shield, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { authApi, setToken } from '@/services/api';

interface NavigationProps {
  currentView: string;
  onNavigate: (view: 'home' | 'stories' | 'submit' | 'admin' | 'dashboard') => void;
  isAdmin: boolean;
  contributorEmail: string;
  onLogout: () => void;
}

export function Navigation({
  currentView,
  onNavigate,
  isAdmin,
  contributorEmail,
  onLogout
}: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    if (!loginEmail.trim()) {
      toast.error('Please enter your email');
      return;
    }

    setIsLoggingIn(true);
    try {
      // Try to login with password if provided
      if (loginPassword.trim()) {
        const data = await authApi.login(loginEmail, loginPassword);
        setToken(data.token);
        
        // Dispatch custom event for App to handle
        const event = new CustomEvent('herstories-login-success', { 
          detail: { 
            email: data.user.email,
            user: data.user,
            isAdmin: data.user.role === 'admin'
          } 
        });
        window.dispatchEvent(event);
      } else {
        // For non-admin users, just set the email
        const event = new CustomEvent('herstories-login-success', { 
          detail: { email: loginEmail, user: null, isAdmin: false } 
        });
        window.dispatchEvent(event);
      }
      
      setLoginDialogOpen(false);
      setLoginEmail('');
      setLoginPassword('');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const navLinks = [
    { label: 'Home', view: 'home' as const, icon: null },
    { label: 'Stories', view: 'stories' as const, icon: BookOpen },
    { label: 'Submit Story', view: 'submit' as const, icon: Plus },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button 
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 group"
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-serif text-lg font-semibold">H</span>
            </div>
            <span className="font-serif text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
              HerStories
            </span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.view}
                onClick={() => onNavigate(link.view)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentView === link.view
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <span className="flex items-center gap-2">
                  {link.icon && <link.icon className="w-4 h-4" />}
                  {link.label}
                </span>
              </button>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Admin/User Menu */}
            {contributorEmail ? (
              <div className="hidden md:flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate(isAdmin ? 'admin' : 'dashboard')}
                  className="text-muted-foreground"
                >
                  {isAdmin ? (
                    <Shield className="w-4 h-4 mr-2" />
                  ) : (
                    <User className="w-4 h-4 mr-2" />
                  )}
                  {isAdmin ? 'Admin' : 'My Contributions'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLogout}
                  className="text-muted-foreground"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="hidden md:flex text-muted-foreground">
                    <User className="w-4 h-4 mr-2" />
                    Login
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="font-serif text-2xl">Welcome Back</DialogTitle>
                    <DialogDescription>
                      Enter your email to access your contributions or the admin panel.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                      />
                    </div>
                    <Button onClick={handleLogin} className="w-full" disabled={isLoggingIn}>
                      {isLoggingIn ? 'Logging in...' : 'Continue'}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      Use &quot;admin@herstories.org&quot; with password &quot;admin123&quot; for admin access
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-slide-up">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <button
                  key={link.view}
                  onClick={() => {
                    onNavigate(link.view);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 text-left ${
                    currentView === link.view
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    {link.icon && <link.icon className="w-4 h-4" />}
                    {link.label}
                  </span>
                </button>
              ))}
              {contributorEmail ? (
                <>
                  <button
                    onClick={() => {
                      onNavigate(isAdmin ? 'admin' : 'dashboard');
                      setMobileMenuOpen(false);
                    }}
                    className="px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted text-left"
                  >
                    <span className="flex items-center gap-3">
                      {isAdmin ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                      {isAdmin ? 'Admin Panel' : 'My Contributions'}
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      onLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted text-left"
                  >
                    <span className="flex items-center gap-3">
                      <LogOut className="w-4 h-4" />
                      Logout
                    </span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setLoginDialogOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted text-left"
                >
                  <span className="flex items-center gap-3">
                    <User className="w-4 h-4" />
                    Login
                  </span>
                </button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
