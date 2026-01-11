import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navLinks = [
  { name: 'About', href: '#about' },
  { name: 'Programs', href: '#programs' },
  { name: 'Faculty', href: '#faculty' },
  { name: 'Research', href: '#research' },
  { name: 'Events', href: '#events' },
  { name: 'Infrastructure', href: '#infrastructure' },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-background/95 backdrop-blur-lg shadow-md py-3'
          : 'bg-transparent py-5'
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className={cn(
            'p-2 rounded-xl transition-colors duration-300',
            isScrolled ? 'bg-primary' : 'bg-white/20 backdrop-blur-sm'
          )}>
            <GraduationCap className={cn(
              'h-7 w-7 transition-colors',
              isScrolled ? 'text-primary-foreground' : 'text-white'
            )} />
          </div>
          <div className="flex flex-col">
            <span className={cn(
              'font-display text-lg font-semibold leading-tight transition-colors',
              isScrolled ? 'text-primary' : 'text-white'
            )}>
              CSE Department
            </span>
            <span className={cn(
              'text-xs transition-colors',
              isScrolled ? 'text-muted-foreground' : 'text-white/70'
            )}>
              Paavai Engineering College
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => scrollToSection(link.href)}
              className={cn(
                'nav-link text-sm font-medium',
                isScrolled ? 'text-foreground/80 hover:text-foreground' : 'text-white/80 hover:text-white'
              )}
            >
              {link.name}
            </button>
          ))}
        </div>

        {/* Portal Access */}
        <div className="hidden lg:flex items-center gap-3">
          <Link to="/login">
            <Button
              variant="ghost"
              className={cn(
                'transition-colors',
                isScrolled
                  ? 'text-foreground hover:bg-secondary'
                  : 'text-white hover:bg-white/10'
              )}
            >
              Login
            </Button>
          </Link>
          <Link to="/login">
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
              Portal Access
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className={cn('h-6 w-6', isScrolled ? 'text-foreground' : 'text-white')} />
          ) : (
            <Menu className={cn('h-6 w-6', isScrolled ? 'text-foreground' : 'text-white')} />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-lg border-b shadow-lg">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => scrollToSection(link.href)}
                className="text-left py-3 px-4 text-foreground/80 hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
              >
                {link.name}
              </button>
            ))}
            <hr className="my-2" />
            <Link to="/login" className="w-full">
              <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                Portal Access
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
