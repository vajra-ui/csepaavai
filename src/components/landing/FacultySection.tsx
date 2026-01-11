import { useEffect, useRef, useState } from 'react';
import { Mail, BookOpen, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

// Placeholder faculty data - to be replaced with real data by Admin
const facultyPlaceholder = [
  {
    id: 1,
    name: 'Faculty Name',
    designation: 'Professor & Head',
    specialization: 'Artificial Intelligence, Machine Learning',
    experience: '20+ Years',
    publications: '50+',
    imageUrl: null // Will be uploaded by admin
  },
  {
    id: 2,
    name: 'Faculty Name',
    designation: 'Associate Professor',
    specialization: 'Data Science, Big Data Analytics',
    experience: '15+ Years',
    publications: '35+',
    imageUrl: null
  },
  {
    id: 3,
    name: 'Faculty Name',
    designation: 'Assistant Professor',
    specialization: 'Cloud Computing, DevOps',
    experience: '10+ Years',
    publications: '20+',
    imageUrl: null
  },
  {
    id: 4,
    name: 'Faculty Name',
    designation: 'Assistant Professor',
    specialization: 'Cybersecurity, Network Security',
    experience: '8+ Years',
    publications: '15+',
    imageUrl: null
  }
];

export function FacultySection() {
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
    <section id="faculty" ref={sectionRef} className="section-container bg-background relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-y-1/2 translate-x-1/2" />

      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <div className={cn(
          'text-center max-w-3xl mx-auto mb-16 transition-all duration-700',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        )}>
          <span className="label-text text-accent mb-4 block">Our Faculty</span>
          <h2 className="heading-section text-foreground mb-6">
            Meet Our <span className="text-primary">Distinguished Faculty</span>
          </h2>
          <p className="body-large text-muted-foreground">
            Our experienced faculty members are dedicated to nurturing future technologists 
            with their expertise and guidance.
          </p>
        </div>

        {/* Faculty Notice */}
        <div className={cn(
          'mb-12 p-6 rounded-2xl bg-secondary border-l-4 border-accent transition-all duration-700 delay-100',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        )}>
          <p className="text-muted-foreground text-center">
            <span className="font-semibold text-foreground">Note:</span> Faculty details will be displayed here 
            once uploaded and verified by the Department Administrator. Contact the department office for current faculty information.
          </p>
        </div>

        {/* Faculty Grid - Placeholder Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {facultyPlaceholder.map((faculty, index) => (
            <div
              key={faculty.id}
              className={cn(
                'academic-card text-center group transition-all duration-700',
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              )}
              style={{ transitionDelay: `${(index + 1) * 100}ms` }}
            >
              {/* Avatar Placeholder */}
              <div className="relative w-32 h-32 mx-auto mb-6">
                <div className="w-full h-full rounded-full bg-secondary flex items-center justify-center border-4 border-background shadow-lg">
                  <span className="text-4xl text-muted-foreground/30">👤</span>
                </div>
                <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground text-xs font-bold shadow-lg">
                  {index + 1}
                </div>
              </div>

              {/* Info */}
              <h3 className="font-display text-lg font-semibold text-foreground mb-1">
                {faculty.name}
              </h3>
              <p className="text-sm text-accent font-medium mb-2">{faculty.designation}</p>
              <p className="text-xs text-muted-foreground mb-4">{faculty.specialization}</p>

              {/* Stats */}
              <div className="flex justify-center gap-4 pt-4 border-t border-border">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-primary mb-1">
                    <BookOpen className="w-3 h-3" />
                    <span className="text-sm font-semibold">{faculty.experience}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Experience</span>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-accent mb-1">
                    <Award className="w-3 h-3" />
                    <span className="text-sm font-semibold">{faculty.publications}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Publications</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className={cn(
          'mt-12 text-center transition-all duration-700 delay-500',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        )}>
          <p className="text-muted-foreground mb-4">
            Complete faculty directory will be available after admin activation.
          </p>
        </div>
      </div>
    </section>
  );
}
