import { useEffect, useRef } from 'react';
import { ArrowDown, BookOpen, Users, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const { clientX, clientY } = e;
      const { width, height } = heroRef.current.getBoundingClientRect();
      const x = (clientX / width - 0.5) * 20;
      const y = (clientY / height - 0.5) * 20;
      
      heroRef.current.style.setProperty('--mouse-x', `${x}px`);
      heroRef.current.style.setProperty('--mouse-y', `${y}px`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const scrollToAbout = () => {
    document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section ref={heroRef} className="hero-section relative">
      {/* Animated Background Elements */}
      <div className="hero-overlay absolute inset-0" />
      
      {/* Floating Geometric Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-40 right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/4 w-32 h-32 border border-white/10 rounded-2xl rotate-45 animate-pulse-glow" />
        <div className="absolute top-1/3 right-1/3 w-24 h-24 border border-accent/20 rounded-full animate-float" />
      </div>

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />

      <div className="relative container mx-auto px-4 min-h-screen flex flex-col justify-center items-center text-center text-white pt-20">
        {/* Badge */}
        <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm">
            <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            Established 2001 • NAAC Accredited
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="heading-display max-w-5xl mb-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          Department of{' '}
          <span className="gold-text">Computer Science</span>
          {' '}& Engineering
        </h1>

        {/* Subtitle */}
        <p className="body-large max-w-2xl mb-8 text-white/80 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          Paavai Engineering College — Shaping future technologists with excellence in education, 
          innovation, and industry-ready skills since 2001.
        </p>

        {/* Tagline */}
        <p className="text-lg font-medium text-accent mb-10 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          "One Platform. Three Roles. One Future."
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-16 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <Button 
            size="lg" 
            className="bg-accent text-accent-foreground hover:bg-accent/90 text-base px-8 py-6"
          >
            Explore Programs
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="border-white/30 text-white hover:bg-white/10 text-base px-8 py-6"
          >
            Virtual Tour
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full max-w-4xl animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <StatCard icon={<BookOpen className="w-6 h-6" />} value="20+" label="Years of Excellence" />
          <StatCard icon={<Users className="w-6 h-6" />} value="2000+" label="Alumni Network" />
          <StatCard icon={<Award className="w-6 h-6" />} value="50+" label="Faculty Members" />
          <StatCard icon={<Award className="w-6 h-6" />} value="100+" label="Research Papers" />
        </div>

        {/* Scroll Indicator */}
        <button
          onClick={scrollToAbout}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/60 hover:text-white transition-colors cursor-pointer"
        >
          <span className="text-xs uppercase tracking-widest">Scroll to explore</span>
          <ArrowDown className="w-5 h-5 animate-bounce" />
        </button>
      </div>
    </section>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="stat-card group hover:bg-white/20 transition-all duration-300">
      <div className="text-accent mb-2 flex justify-center">{icon}</div>
      <div className="text-3xl md:text-4xl font-display font-bold mb-1">{value}</div>
      <div className="text-sm text-white/70">{label}</div>
    </div>
  );
}
