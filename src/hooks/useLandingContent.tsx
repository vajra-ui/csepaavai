import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface LandingSection {
  id: string;
  section_key: string;
  title: string;
  is_visible: boolean;
  display_order: number;
}

export interface LandingContent {
  id: string;
  section_key: string;
  content_key: string;
  title: string | null;
  content: string | null;
  metadata: unknown;
  is_published: boolean;
}

export interface LandingImage {
  id: string;
  section_key: string;
  image_url: string;
  alt_text: string | null;
  caption: string | null;
  display_order: number;
  is_visible: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string | null;
  category: string;
  image_url: string | null;
  achievement_date: string | null;
  is_visible: boolean;
  display_order: number;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string | null;
  end_date: string | null;
  venue: string | null;
  image_url: string | null;
  is_pinned: boolean;
  is_visible: boolean;
}

export interface Faculty {
  id: string;
  name: string;
  designation: string | null;
  specialization: string | null;
  qualification: string | null;
  experience_years: number | null;
  email: string | null;
  phone: string | null;
  image_url: string | null;
  bio: string | null;
  is_visible: boolean;
  display_order: number;
}

export interface Program {
  id: string;
  name: string;
  degree_type: string;
  description: string | null;
  duration: string | null;
  eligibility: string | null;
  is_visible: boolean;
  display_order: number;
}

export interface Infrastructure {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  capacity: number | null;
  equipment: string | null;
  is_visible: boolean;
  display_order: number;
}

export function useLandingContent() {
  const [sections, setSections] = useState<LandingSection[]>([]);
  const [content, setContent] = useState<LandingContent[]>([]);
  const [images, setImages] = useState<LandingImage[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [infrastructure, setInfrastructure] = useState<Infrastructure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [
        sectionsRes,
        contentRes,
        imagesRes,
        achievementsRes,
        eventsRes,
        facultyRes,
        programsRes,
        infrastructureRes,
      ] = await Promise.all([
        supabase.from('landing_page_sections').select('*').order('display_order'),
        supabase.from('landing_page_content').select('*'),
        supabase.from('landing_page_images').select('*').order('display_order'),
        supabase.from('achievements').select('*').order('display_order'),
        supabase.from('events').select('*').order('event_date', { ascending: false }),
        supabase.from('faculty').select('*').order('display_order'),
        supabase.from('programs').select('*').order('display_order'),
        supabase.from('infrastructure').select('*').order('display_order'),
      ]);

      if (sectionsRes.error) throw sectionsRes.error;
      if (contentRes.error) throw contentRes.error;
      if (imagesRes.error) throw imagesRes.error;
      if (achievementsRes.error) throw achievementsRes.error;
      if (eventsRes.error) throw eventsRes.error;
      if (facultyRes.error) throw facultyRes.error;
      if (programsRes.error) throw programsRes.error;
      if (infrastructureRes.error) throw infrastructureRes.error;

      setSections(sectionsRes.data || []);
      setContent(contentRes.data || []);
      setImages(imagesRes.data || []);
      setAchievements(achievementsRes.data || []);
      setEvents(eventsRes.data || []);
      setFaculty(facultyRes.data || []);
      setPrograms(programsRes.data || []);
      setInfrastructure(infrastructureRes.data || []);
    } catch (err) {
      console.error('Error fetching landing content:', err);
      setError(err instanceof Error ? err.message : 'Failed to load content');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const getContentByKey = (sectionKey: string, contentKey: string): LandingContent | undefined => {
    return content.find((c) => c.section_key === sectionKey && c.content_key === contentKey);
  };

  const getSectionImages = (sectionKey: string): LandingImage[] => {
    return images.filter((img) => img.section_key === sectionKey && img.is_visible);
  };

  const isSectionVisible = (sectionKey: string): boolean => {
    const section = sections.find((s) => s.section_key === sectionKey);
    return section?.is_visible ?? true;
  };

  return {
    sections,
    content,
    images,
    achievements,
    events,
    faculty,
    programs,
    infrastructure,
    isLoading,
    error,
    refetch: fetchAllData,
    getContentByKey,
    getSectionImages,
    isSectionVisible,
  };
}
