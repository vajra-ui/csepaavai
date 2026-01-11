import { useEffect, useRef, useState } from 'react';
import { Trophy, FileText, Users, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const stats = [
  { icon: <FileText className="w-6 h-6" />, value: '100+', label: 'Research Publications' },
  { icon: <Trophy className="w-6 h-6" />, value: '50+', label: 'Awards & Recognitions' },
  { icon: <Users className="w-6 h-6" />, value: '25+', label: 'Funded Projects' },
  { icon: <TrendingUp className="w-6 h-6" />, value: '10+', label: 'Patents Filed' }
];

export function ResearchSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [countStarted, setCountStarted] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setTimeout(() => setCountStarted(true), 500);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="research" ref={sectionRef} className="section-container relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-primary/90" />
      
      {/* Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 border border-white/10 rounded-full animate-float" />
      <div className="absolute bottom-20 right-10 w-48 h-48 border border-accent/20 rounded-3xl rotate-45 animate-float-delayed" />

      <div className="container mx-auto px-4 relative text-white">
        {/* Section Header */}
        <div className={cn(
          'text-center max-w-3xl mx-auto mb-16 transition-all duration-700',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        )}>
          <span className="label-text text-accent mb-4 block">Achievements & Research</span>
          <h2 className="heading-section mb-6">
            Excellence in <span className="gold-text">Research & Innovation</span>
          </h2>
          <p className="body-large text-white/80">
            Our department is at the forefront of cutting-edge research, contributing to 
            advancements in artificial intelligence, data science, and emerging technologies.
          </p>
        </div>

        {/* Stats Grid */}
        <div className={cn(
          'grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 transition-all duration-700 delay-200',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        )}>
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="stat-card group hover:bg-white/20 transition-all duration-300"
            >
              <div className="text-accent mb-3 flex justify-center group-hover:scale-110 transition-transform">
                {stat.icon}
              </div>
              <div className={cn(
                'text-4xl md:text-5xl font-display font-bold mb-2 transition-all duration-500',
                countStarted ? 'opacity-100' : 'opacity-0'
              )}>
                {stat.value}
              </div>
              <div className="text-sm text-white/70">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Research Notice */}
        <div className={cn(
          'max-w-3xl mx-auto text-center transition-all duration-700 delay-300',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        )}>
          <div className="p-8 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
            <h3 className="font-display text-xl font-semibold mb-4">Research Highlights Coming Soon</h3>
            <p className="text-white/80 mb-4">
              Detailed research publications, student achievements, and faculty accomplishments 
              will be displayed here once uploaded by the Department Administrator.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <span className="px-4 py-2 rounded-full bg-white/10 text-sm">AI & Machine Learning</span>
              <span className="px-4 py-2 rounded-full bg-white/10 text-sm">Data Science</span>
              <span className="px-4 py-2 rounded-full bg-white/10 text-sm">Cloud Computing</span>
              <span className="px-4 py-2 rounded-full bg-white/10 text-sm">Cybersecurity</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
