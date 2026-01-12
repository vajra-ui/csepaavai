import { useEffect, useRef, useState } from 'react';
import { Calendar, MapPin, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string | null;
  venue: string | null;
  image_url: string | null;
  is_pinned: boolean;
  is_visible: boolean;
}

export function EventsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('id, title, description, event_date, venue, image_url, is_pinned, is_visible')
        .eq('is_visible', true)
        .order('is_pinned', { ascending: false })
        .order('event_date', { ascending: false })
        .limit(6);

      if (!error && data) {
        setEvents(data);
      }
      setIsLoading(false);
    };

    fetchEvents();
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Date TBA';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return 'Date TBA';
    }
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return 'Time TBA';
    try {
      return format(new Date(dateString), 'h:mm a');
    } catch {
      return 'Time TBA';
    }
  };

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

        {/* Events Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : events.length === 0 ? (
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
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {events.map((event, index) => (
              <div
                key={event.id}
                className={cn(
                  'academic-card group overflow-hidden transition-all duration-700',
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                )}
                style={{ transitionDelay: `${(index + 1) * 100}ms` }}
              >
                {/* Image */}
                <div className="h-40 -mx-6 -mt-6 mb-6 bg-secondary flex items-center justify-center overflow-hidden">
                  {event.image_url ? (
                    <img 
                      src={event.image_url} 
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="text-center text-muted-foreground/50">
                      <Calendar className="w-10 h-10 mx-auto mb-2" />
                      <span className="text-sm">Event Image</span>
                    </div>
                  )}
                </div>

                {/* Pinned Badge */}
                {event.is_pinned && (
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-accent text-accent-foreground mb-3">
                    Featured
                  </span>
                )}

                {/* Title */}
                <h3 className="heading-card text-foreground mb-3">{event.title}</h3>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 text-accent" />
                    {formatDate(event.event_date)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 text-accent" />
                    {formatTime(event.event_date)}
                  </div>
                  {event.venue && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 text-accent" />
                      {event.venue}
                    </div>
                  )}
                </div>

                {/* Description */}
                {event.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {event.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* View All Events */}
        <div className={cn(
          'mt-12 text-center transition-all duration-700 delay-400',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        )}>
          {events.length > 0 ? (
            <p className="text-muted-foreground text-sm">
              Showing latest {events.length} events
            </p>
          ) : (
            <p className="text-muted-foreground text-sm">
              Check back soon for upcoming events and announcements.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
