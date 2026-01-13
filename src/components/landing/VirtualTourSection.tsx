import { useEffect, useRef, useState } from 'react';
import { Play, Video, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface VirtualTour {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
}

export function VirtualTourSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [tours, setTours] = useState<VirtualTour[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTours = async () => {
      const { data, error } = await supabase
        .from('virtual_tours')
        .select('*')
        .eq('is_visible', true)
        .order('display_order');

      if (!error && data) {
        setTours(data);
      }
      setIsLoading(false);
    };

    fetchTours();
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

  const getVideoEmbedUrl = (url: string) => {
    const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\s]+)/);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1`;
    }
    return url;
  };

  const getYouTubeThumbnail = (url: string) => {
    const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\s]+)/);
    if (youtubeMatch) {
      return `https://img.youtube.com/vi/${youtubeMatch[1]}/maxresdefault.jpg`;
    }
    return null;
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % tours.length);
    setActiveVideo(null);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + tours.length) % tours.length);
    setActiveVideo(null);
  };

  if (isLoading) {
    return null;
  }

  if (tours.length === 0) {
    return null;
  }

  const currentTour = tours[currentIndex];
  const thumbnail = currentTour.thumbnail_url || getYouTubeThumbnail(currentTour.video_url);

  return (
    <section id="virtual-tour" ref={sectionRef} className="section-container bg-secondary/30 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 border border-primary/10 rounded-full animate-float" />
        <div className="absolute bottom-20 right-10 w-48 h-48 border border-accent/10 rounded-3xl rotate-12 animate-float-delayed" />
      </div>

      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <div className={cn(
          'text-center max-w-3xl mx-auto mb-12 transition-all duration-700',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        )}>
          <span className="label-text text-accent mb-4 block">Explore Our Campus</span>
          <h2 className="heading-section text-foreground mb-6">
            Virtual <span className="text-primary">Tour</span>
          </h2>
          <p className="body-large text-muted-foreground">
            Take a virtual tour of our state-of-the-art facilities and experience 
            campus life from anywhere in the world.
          </p>
        </div>

        {/* Video Player */}
        <div className={cn(
          'max-w-4xl mx-auto transition-all duration-700 delay-200',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        )}>
          <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl bg-secondary">
            {activeVideo === currentTour.id ? (
              <iframe
                src={getVideoEmbedUrl(currentTour.video_url)}
                title={currentTour.title}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            ) : (
              <>
                {thumbnail ? (
                  <img
                    src={thumbnail}
                    alt={currentTour.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                    <Video className="w-24 h-24 text-muted-foreground" />
                  </div>
                )}
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Button
                    size="lg"
                    className="w-20 h-20 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground"
                    onClick={() => setActiveVideo(currentTour.id)}
                  >
                    <Play className="w-8 h-8 ml-1" />
                  </Button>
                </div>
              </>
            )}

            {/* Navigation Arrows */}
            {tours.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full"
                  onClick={prevSlide}
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full"
                  onClick={nextSlide}
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </>
            )}
          </div>

          {/* Video Info */}
          <div className="mt-6 text-center">
            <h3 className="text-xl font-semibold text-foreground mb-2">{currentTour.title}</h3>
            {currentTour.description && (
              <p className="text-muted-foreground">{currentTour.description}</p>
            )}
          </div>

          {/* Thumbnail Navigation */}
          {tours.length > 1 && (
            <div className="flex justify-center gap-3 mt-6">
              {tours.map((tour, index) => (
                <button
                  key={tour.id}
                  onClick={() => {
                    setCurrentIndex(index);
                    setActiveVideo(null);
                  }}
                  className={cn(
                    'w-20 h-12 rounded-lg overflow-hidden border-2 transition-all',
                    currentIndex === index
                      ? 'border-primary scale-105'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  )}
                >
                  {tour.thumbnail_url || getYouTubeThumbnail(tour.video_url) ? (
                    <img
                      src={tour.thumbnail_url || getYouTubeThumbnail(tour.video_url) || ''}
                      alt={tour.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-secondary flex items-center justify-center">
                      <Video className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
