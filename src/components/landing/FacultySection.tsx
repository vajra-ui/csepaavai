import { useEffect, useRef, useState } from 'react';
import { Mail, BookOpen, Award, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface Faculty {
  id: string;
  name: string;
  designation: string | null;
  specialization: string | null;
  experience_years: number | null;
  image_url: string | null;
  is_visible: boolean;
}

export function FacultySection() {
  const [isVisible, setIsVisible] = useState(false);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchFaculty = async () => {
      const { data, error } = await supabase
        .from('faculty')
        .select('id, name, designation, specialization, experience_years, image_url, is_visible')
        .eq('is_visible', true)
        .order('display_order');

      if (!error && data) {
        setFaculty(data);
      }
      setIsLoading(false);
    };

    fetchFaculty();
  }, []);

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

        {/* Faculty Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : faculty.length === 0 ? (
          <div className={cn(
            'mb-12 p-6 rounded-2xl bg-secondary border-l-4 border-accent transition-all duration-700 delay-100',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          )}>
            <p className="text-muted-foreground text-center">
              <span className="font-semibold text-foreground">Note:</span> Faculty details will be displayed here 
              once uploaded and verified by the Department Administrator. Contact the department office for current faculty information.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {faculty.map((member, index) => (
              <div
                key={member.id}
                className={cn(
                  'academic-card text-center group transition-all duration-700',
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                )}
                style={{ transitionDelay: `${(index + 1) * 100}ms` }}
              >
                {/* Avatar */}
                <div className="relative w-32 h-32 mx-auto mb-6">
                  {member.image_url ? (
                    <img
                      src={member.image_url}
                      alt={member.name}
                      className="w-full h-full rounded-full object-cover border-4 border-background shadow-lg"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-secondary flex items-center justify-center border-4 border-background shadow-lg">
                      <User className="w-12 h-12 text-muted-foreground/50" />
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground text-xs font-bold shadow-lg">
                    {index + 1}
                  </div>
                </div>

                {/* Info */}
                <h3 className="font-display text-lg font-semibold text-foreground mb-1">
                  {member.name}
                </h3>
                <p className="text-sm text-accent font-medium mb-2">{member.designation || 'Faculty'}</p>
                <p className="text-xs text-muted-foreground mb-4">{member.specialization || '-'}</p>

                {/* Stats */}
                <div className="flex justify-center gap-4 pt-4 border-t border-border">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-primary mb-1">
                      <BookOpen className="w-3 h-3" />
                      <span className="text-sm font-semibold">
                        {member.experience_years ? `${member.experience_years}+` : '-'}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">Years Exp.</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View All Button */}
        <div className={cn(
          'mt-12 text-center transition-all duration-700 delay-500',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        )}>
          {faculty.length > 0 && (
            <p className="text-muted-foreground">
              Showing {faculty.length} faculty members
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
