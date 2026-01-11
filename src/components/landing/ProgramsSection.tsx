import { useEffect, useRef, useState } from 'react';
import { GraduationCap, BookOpen, FlaskConical, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const programs = [
  {
    icon: <GraduationCap className="w-8 h-8" />,
    title: 'B.E – Computer Science and Engineering',
    duration: '4 Years',
    intake: '120 Students',
    description: 'Undergraduate program focusing on core computer science fundamentals, software engineering, and emerging technologies.',
    highlights: ['Data Structures & Algorithms', 'Machine Learning', 'Cloud Computing', 'Full Stack Development']
  },
  {
    icon: <BookOpen className="w-8 h-8" />,
    title: 'M.E – Computer Science and Engineering',
    duration: '2 Years',
    intake: '18 Students',
    description: 'Postgraduate program emphasizing advanced research, specialized domains, and industry-ready skills.',
    highlights: ['Advanced AI/ML', 'Research Methodology', 'Big Data Analytics', 'Cybersecurity']
  },
  {
    icon: <FlaskConical className="w-8 h-8" />,
    title: 'Ph.D Programme',
    duration: 'Research Based',
    intake: 'Limited Seats',
    description: 'Doctoral program for aspiring researchers to contribute original knowledge to the field of computer science.',
    highlights: ['Original Research', 'Publication Focus', 'Industry Collaboration', 'Expert Mentorship']
  }
];

export function ProgramsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
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
    <section id="programs" ref={sectionRef} className="section-container bg-secondary/30 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-50">
        <div className="absolute top-20 right-20 w-40 h-40 border border-primary/10 rounded-3xl rotate-12" />
        <div className="absolute bottom-20 left-20 w-32 h-32 border border-accent/20 rounded-full" />
      </div>

      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <div className={cn(
          'text-center max-w-3xl mx-auto mb-16 transition-all duration-700',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        )}>
          <span className="label-text text-accent mb-4 block">Academic Programs</span>
          <h2 className="heading-section text-foreground mb-6">
            Programs <span className="text-primary">Offered</span>
          </h2>
          <p className="body-large text-muted-foreground">
            Choose from our comprehensive range of programs designed to build strong foundations 
            and prepare you for a successful career in technology.
          </p>
        </div>

        {/* Programs Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {programs.map((program, index) => (
            <div
              key={program.title}
              className={cn(
                'academic-card group relative overflow-hidden transition-all duration-700',
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              )}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Accent Top Border */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />

              {/* Icon */}
              <div className="inline-flex p-4 rounded-2xl bg-primary text-primary-foreground mb-6 group-hover:scale-110 transition-transform duration-300">
                {program.icon}
              </div>

              {/* Title */}
              <h3 className="heading-card text-foreground mb-2">{program.title}</h3>

              {/* Duration & Intake */}
              <div className="flex gap-4 mb-4">
                <span className="text-sm px-3 py-1 rounded-full bg-accent/10 text-accent font-medium">
                  {program.duration}
                </span>
                <span className="text-sm px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                  {program.intake}
                </span>
              </div>

              {/* Description */}
              <p className="body-regular text-muted-foreground mb-6">
                {program.description}
              </p>

              {/* Highlights */}
              <div className="space-y-2 mb-6">
                {program.highlights.map((highlight) => (
                  <div key={highlight} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    {highlight}
                  </div>
                ))}
              </div>

              {/* CTA */}
              <Button 
                variant="ghost" 
                className="group/btn p-0 h-auto font-semibold text-primary hover:text-accent hover:bg-transparent"
              >
                Learn More 
                <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
              </Button>
            </div>
          ))}
        </div>

        {/* Admission CTA */}
        <div className={cn(
          'mt-16 text-center transition-all duration-700 delay-400',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        )}>
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 rounded-2xl bg-primary text-primary-foreground">
            <div className="text-left">
              <p className="font-semibold text-lg">Ready to start your journey?</p>
              <p className="text-primary-foreground/80 text-sm">Applications are now open for the upcoming academic year.</p>
            </div>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90 shrink-0">
              Apply Now
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
