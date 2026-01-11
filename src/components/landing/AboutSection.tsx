import { useEffect, useRef, useState } from 'react';
import { Target, Eye, Lightbulb, Users, Building } from 'lucide-react';
import { cn } from '@/lib/utils';

const visionMissionData = [
  {
    icon: <Eye className="w-6 h-6" />,
    title: 'Vision',
    content: 'To be a center of excellence in Computer Science and Engineering education, research, and innovation that produces globally competent professionals.'
  },
  {
    icon: <Target className="w-6 h-6" />,
    title: 'Mission',
    content: 'To provide quality education with state-of-the-art infrastructure, foster research culture, develop industry partnerships, and inculcate ethical values in students.'
  }
];

const highlights = [
  {
    icon: <Lightbulb className="w-8 h-8" />,
    title: 'Industry Ready',
    description: 'Curriculum aligned with current industry requirements and emerging technologies.'
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: 'Strong Alumni Network',
    description: 'Over 2000+ alumni placed in top multinational companies worldwide.'
  },
  {
    icon: <Building className="w-8 h-8" />,
    title: 'Modern Infrastructure',
    description: 'Well-equipped labs with latest hardware and software facilities.'
  }
];

export function AboutSection() {
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
    <section id="about" ref={sectionRef} className="section-container bg-background relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <div className={cn(
          'text-center max-w-3xl mx-auto mb-16 transition-all duration-700',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        )}>
          <span className="label-text text-accent mb-4 block">About the Department</span>
          <h2 className="heading-section text-foreground mb-6">
            Pioneering Excellence in{' '}
            <span className="text-primary">Computer Science</span> Education
          </h2>
          <p className="body-large text-muted-foreground">
            The Department of Computer Science and Engineering was started in 2001 with the primary 
            objective of providing world-class education in the field of Computer Science and Engineering. 
            The department strives to develop technically competent and socially responsible engineers.
          </p>
        </div>

        {/* Vision & Mission Cards */}
        <div className={cn(
          'grid md:grid-cols-2 gap-6 mb-16 transition-all duration-700 delay-200',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        )}>
          {visionMissionData.map((item, index) => (
            <div
              key={item.title}
              className="academic-card gradient-border group"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary text-primary-foreground shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h3 className="heading-card text-foreground mb-3">{item.title}</h3>
                  <p className="body-regular text-muted-foreground">{item.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Highlights Grid */}
        <div className={cn(
          'grid md:grid-cols-3 gap-6 transition-all duration-700 delay-300',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        )}>
          {highlights.map((item, index) => (
            <div
              key={item.title}
              className="academic-card text-center group hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
            >
              <div className="inline-flex p-4 rounded-2xl bg-accent/10 text-accent group-hover:bg-white/20 group-hover:text-primary-foreground mb-4 transition-colors">
                {item.icon}
              </div>
              <h3 className="heading-card mb-2 group-hover:text-primary-foreground">{item.title}</h3>
              <p className="body-regular text-muted-foreground group-hover:text-primary-foreground/80">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        {/* Extended About Content */}
        <div className={cn(
          'mt-16 bg-secondary/50 rounded-3xl p-8 md:p-12 transition-all duration-700 delay-400',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        )}>
          <div className="max-w-4xl mx-auto">
            <h3 className="heading-card text-foreground mb-6">Our Commitment to Excellence</h3>
            <div className="space-y-4 text-muted-foreground body-regular">
              <p>
                The department is committed to developing globally competent professionals through quality 
                education, research, and innovation. Our curriculum is designed to meet the evolving needs 
                of the IT industry while fostering creativity and critical thinking.
              </p>
              <p>
                We focus on holistic development of students by providing exposure to cutting-edge 
                technologies, industry interactions, and ethical practices. Our faculty members are 
                dedicated to mentoring students and guiding them towards successful careers.
              </p>
              <p>
                The department maintains strong ties with industry leaders and research institutions, 
                ensuring our students gain practical experience alongside theoretical knowledge. Our 
                alumni have excelled in various domains including software development, data science, 
                artificial intelligence, and entrepreneurship.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
