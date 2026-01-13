import { Navbar } from '@/components/landing/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { AboutSection } from '@/components/landing/AboutSection';
import { ProgramsSection } from '@/components/landing/ProgramsSection';
import { FacultySection } from '@/components/landing/FacultySection';
import { ResearchSection } from '@/components/landing/ResearchSection';
import { EventsSection } from '@/components/landing/EventsSection';
import { InfrastructureSection } from '@/components/landing/InfrastructureSection';
import { VirtualTourSection } from '@/components/landing/VirtualTourSection';
import { Footer } from '@/components/landing/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <ProgramsSection />
        <FacultySection />
        <ResearchSection />
        <EventsSection />
        <InfrastructureSection />
        <VirtualTourSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
