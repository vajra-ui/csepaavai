import { useEffect, useRef, useState } from 'react';
import { Monitor, Cpu, Database, Network, Server, Wifi, Building } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface Infrastructure {
  id: string;
  name: string;
  description: string | null;
  capacity: number | null;
  equipment: string | null;
  image_url: string | null;
  is_visible: boolean;
}

const defaultLabs = [
  {
    icon: <Monitor className="w-8 h-8" />,
    name: 'Programming Lab',
    description: 'Equipped with latest workstations for software development and programming practice.',
    specs: ['50+ Workstations', 'Latest IDEs', 'Cloud Access']
  },
  {
    icon: <Cpu className="w-8 h-8" />,
    name: 'AI/ML Lab',
    description: 'High-performance computing facility for artificial intelligence and machine learning projects.',
    specs: ['GPU Workstations', 'Deep Learning', 'Data Processing']
  },
  {
    icon: <Network className="w-8 h-8" />,
    name: 'Networking Lab',
    description: 'Complete networking infrastructure for hands-on learning of network protocols and security.',
    specs: ['Cisco Equipment', 'Network Simulation', 'Security Tools']
  },
  {
    icon: <Database className="w-8 h-8" />,
    name: 'Database Lab',
    description: 'Dedicated lab for database management systems and big data technologies.',
    specs: ['Oracle/MySQL', 'Big Data Tools', 'NoSQL Databases']
  },
  {
    icon: <Server className="w-8 h-8" />,
    name: 'Server Room',
    description: 'Centralized server infrastructure supporting all departmental computing needs.',
    specs: ['24/7 Operation', 'Backup Systems', 'High Availability']
  },
  {
    icon: <Wifi className="w-8 h-8" />,
    name: 'Digital Library',
    description: 'Access to digital resources, e-books, research papers, and online learning platforms.',
    specs: ['E-Resources', 'IEEE Access', 'Online Courses']
  }
];

export function InfrastructureSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [infrastructure, setInfrastructure] = useState<Infrastructure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchInfrastructure = async () => {
      const { data, error } = await supabase
        .from('infrastructure')
        .select('*')
        .eq('is_visible', true)
        .order('display_order');

      if (!error && data) {
        setInfrastructure(data);
      }
      setIsLoading(false);
    };

    fetchInfrastructure();
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

  const showDbData = infrastructure.length > 0;

  return (
    <section id="infrastructure" ref={sectionRef} className="section-container bg-background relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-x-1/2" />
      <div className="absolute bottom-1/3 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -translate-x-1/2" />

      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <div className={cn(
          'text-center max-w-3xl mx-auto mb-16 transition-all duration-700',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        )}>
          <span className="label-text text-accent mb-4 block">Facilities</span>
          <h2 className="heading-section text-foreground mb-6">
            Infrastructure & <span className="text-primary">Laboratories</span>
          </h2>
          <p className="body-large text-muted-foreground">
            State-of-the-art infrastructure and well-equipped laboratories to provide 
            hands-on experience with the latest technologies.
          </p>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : showDbData ? (
          /* Database Data */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {infrastructure.map((item, index) => (
              <div
                key={item.id}
                className={cn(
                  'academic-card group transition-all duration-700',
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                )}
                style={{ transitionDelay: `${(index + 1) * 100}ms` }}
              >
                {/* Image */}
                <div className="h-32 -mx-6 -mt-6 mb-6 bg-secondary flex items-center justify-center rounded-t-xl overflow-hidden">
                  {item.image_url ? (
                    <img 
                      src={item.image_url} 
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="p-4 rounded-2xl bg-primary text-primary-foreground group-hover:scale-110 transition-transform duration-300">
                      <Building className="w-8 h-8" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <h3 className="heading-card text-foreground mb-2">{item.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{item.description || 'No description available.'}</p>

                {/* Specs */}
                <div className="flex flex-wrap gap-2">
                  {item.capacity && (
                    <span className="text-xs px-3 py-1 rounded-full bg-accent/10 text-accent font-medium">
                      Capacity: {item.capacity}
                    </span>
                  )}
                  {item.equipment && item.equipment.split(',').slice(0, 2).map((eq) => (
                    <span 
                      key={eq} 
                      className="text-xs px-3 py-1 rounded-full bg-accent/10 text-accent font-medium"
                    >
                      {eq.trim()}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Default Data */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {defaultLabs.map((lab, index) => (
              <div
                key={lab.name}
                className={cn(
                  'academic-card group transition-all duration-700',
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                )}
                style={{ transitionDelay: `${(index + 1) * 100}ms` }}
              >
                {/* Image Placeholder */}
                <div className="h-32 -mx-6 -mt-6 mb-6 bg-secondary flex items-center justify-center rounded-t-xl">
                  <div className="p-4 rounded-2xl bg-primary text-primary-foreground group-hover:scale-110 transition-transform duration-300">
                    {lab.icon}
                  </div>
                </div>

                {/* Content */}
                <h3 className="heading-card text-foreground mb-2">{lab.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{lab.description}</p>

                {/* Specs */}
                <div className="flex flex-wrap gap-2">
                  {lab.specs.map((spec) => (
                    <span 
                      key={spec} 
                      className="text-xs px-3 py-1 rounded-full bg-accent/10 text-accent font-medium"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Additional Info */}
        <div className={cn(
          'mt-16 grid md:grid-cols-2 gap-8 transition-all duration-700 delay-500',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        )}>
          <div className="p-8 rounded-2xl bg-primary text-primary-foreground">
            <h3 className="font-display text-xl font-semibold mb-4">Computing Resources</h3>
            <ul className="space-y-3 text-primary-foreground/80">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent" />
                High-speed internet connectivity across campus
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent" />
                24/7 access to online learning platforms
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent" />
                Licensed software for all major technologies
              </li>
            </ul>
          </div>

          <div className="p-8 rounded-2xl bg-secondary">
            <h3 className="font-display text-xl font-semibold text-foreground mb-4">Student Facilities</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent" />
                Modern classrooms with smart boards
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent" />
                Seminar halls for presentations and events
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent" />
                Collaborative workspaces for project teams
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
