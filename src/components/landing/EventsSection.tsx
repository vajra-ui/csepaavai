import { useEffect, useRef, useState } from 'react';
import { Calendar, MapPin, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Placeholder - Real events will be added by Admin
const eventsPlaceholder = [
  {
    id: 1,
    title: 'Event Title',
    date: 'Date TBA',
    time: 'Time TBA',
    venue: 'Venue TBA',
    type: 'Workshop',
    description: 'Event details will be updated by the department administrator.',
    imageUrl: null
  },
  {
    id: 2,
    title: 'Event Title',
    date: 'Date TBA',
    time: 'Time TBA',
    venue: 'Venue TBA',
    type: 'Seminar',
    description: 'Event details will be updated by the department administrator.',
    imageUrl: null
  },
  {
    id: 3,
    title: 'Event Title',
    date: 'Date TBA',
    time: 'Time TBA',
    venue: 'Venue TBA',
    type: 'Conference',
    description: 'Event details will be updated by the department administrator.',
    imageUrl: null
  }
];

const typeColors: Record<string, string> = {
  Workshop: 'bg-accent text-accent-foreground',
  Seminar: 'bg-primary text-primary-foreground',
  Conference: 'bg-success text-success-foreground'
};

export function EventsSection() {
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
    <section id="events" ref={sectionRef} className="section-container bg-secondary/30 relative">
      {/* Background Decoration */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <div className={cn(
          'text-center max-w-3xl mx-auto mb-16 transition-all duration-700',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        )}>
          <span className="label-text text-accent mb-4 block">What's Happening</span>
          <h2 className="heading-section text-foreground mb-6">
            Events & <span className="text-primary">Announcements</span>
          </h2>
          <p className="body-large text-muted-foreground">
            Stay updated with the latest events, workshops, seminars, and announcements 
            from the Department of Computer Science and Engineering.
          </p>
        </div>

        {/* Events Notice */}
        <div className={cn(
          'mb-12 p-6 rounded-2xl bg-background border border-border transition-all duration-700 delay-100',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        )}>
          <div className="flex items-center justify-center gap-3 text-muted-foreground">
            <Calendar className="w-5 h-5 text-accent" />
            <p className="text-center">
              <span className="font-semibold text-foreground">Upcoming Events:</span> Real event details 
              will be published here by the Department Administrator.
            </p>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {eventsPlaceholder.map((event, index) => (
            <div
              key={event.id}
              className={cn(
                'academic-card group overflow-hidden transition-all duration-700',
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              )}
              style={{ transitionDelay: `${(index + 1) * 100}ms` }}
            >
              {/* Image Placeholder */}
              <div className="h-40 -mx-6 -mt-6 mb-6 bg-secondary flex items-center justify-center">
                <div className="text-center text-muted-foreground/50">
                  <Calendar className="w-10 h-10 mx-auto mb-2" />
                  <span className="text-sm">Event Image</span>
                </div>
              </div>

              {/* Type Badge */}
              <span className={cn(
                'inline-block px-3 py-1 rounded-full text-xs font-medium mb-3',
                typeColors[event.type] || 'bg-secondary text-secondary-foreground'
              )}>
                {event.type}
              </span>

              {/* Title */}
              <h3 className="heading-card text-foreground mb-3">{event.title}</h3>

              {/* Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 text-accent" />
                  {event.date}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 text-accent" />
                  {event.time}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 text-accent" />
                  {event.venue}
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-4">{event.description}</p>

              {/* CTA */}
              <Button 
                variant="ghost" 
                className="group/btn p-0 h-auto font-semibold text-primary hover:text-accent hover:bg-transparent"
                disabled
              >
                View Details 
                <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
              </Button>
            </div>
          ))}
        </div>

        {/* View All Events */}
        <div className={cn(
          'mt-12 text-center transition-all duration-700 delay-400',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        )}>
          <p className="text-muted-foreground text-sm">
            Check back soon for upcoming events and announcements.
          </p>
        </div>
      </div>
    </section>
  );
}
