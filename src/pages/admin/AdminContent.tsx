import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Save, FileText } from 'lucide-react';

interface ContentItem {
  id: string;
  section_key: string;
  content_key: string;
  title: string | null;
  content: string | null;
}

const sections = [
  { key: 'hero', label: 'Hero Section' },
  { key: 'about', label: 'About Department' },
];

export default function AdminContent() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [editedContent, setEditedContent] = useState<Record<string, { title: string; content: string }>>({});

  const fetchContent = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('landing_page_content')
      .select('*');

    if (error) {
      toast.error('Failed to load content');
      console.error(error);
    } else {
      setContent(data || []);
      
      // Initialize edited content state
      const initial: Record<string, { title: string; content: string }> = {};
      (data || []).forEach((item) => {
        const key = `${item.section_key}-${item.content_key}`;
        initial[key] = {
          title: item.title || '',
          content: item.content || '',
        };
      });
      setEditedContent(initial);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleSave = async (sectionKey: string, contentKey: string) => {
    const key = `${sectionKey}-${contentKey}`;
    const edited = editedContent[key];
    
    if (!edited) return;

    setIsSaving(true);

    const existing = content.find(
      (c) => c.section_key === sectionKey && c.content_key === contentKey
    );

    if (existing) {
      const { error } = await supabase
        .from('landing_page_content')
        .update({
          title: edited.title || null,
          content: edited.content || null,
        })
        .eq('id', existing.id);

      if (error) {
        toast.error('Failed to save content');
      } else {
        toast.success('Content saved successfully');
        fetchContent();
      }
    } else {
      const { error } = await supabase.from('landing_page_content').insert({
        section_key: sectionKey,
        content_key: contentKey,
        title: edited.title || null,
        content: edited.content || null,
      });

      if (error) {
        toast.error('Failed to save content');
      } else {
        toast.success('Content saved successfully');
        fetchContent();
      }
    }

    setIsSaving(false);
  };

  const updateEditedContent = (key: string, field: 'title' | 'content', value: string) => {
    setEditedContent((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  };

  const getContentForKey = (sectionKey: string, contentKey: string) => {
    const key = `${sectionKey}-${contentKey}`;
    return editedContent[key] || { title: '', content: '' };
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="heading-section text-foreground mb-2">
          <span className="text-primary">Content</span> Management
        </h1>
        <p className="text-muted-foreground">
          Edit text content for the landing page sections
        </p>
      </div>

      <Tabs value={activeSection} onValueChange={setActiveSection}>
        <TabsList className="mb-6">
          {sections.map((section) => (
            <TabsTrigger key={section.key} value={section.key}>
              {section.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Hero Section */}
        <TabsContent value="hero">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Hero Section Content
              </CardTitle>
              <CardDescription>
                The main header and tagline displayed at the top of the landing page
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="hero-title">Main Title</Label>
                <Input
                  id="hero-title"
                  value={getContentForKey('hero', 'main').title}
                  onChange={(e) =>
                    updateEditedContent('hero-main', 'title', e.target.value)
                  }
                  placeholder="Enter the main heading"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hero-content">Tagline / Subtitle</Label>
                <Textarea
                  id="hero-content"
                  value={getContentForKey('hero', 'main').content}
                  onChange={(e) =>
                    updateEditedContent('hero-main', 'content', e.target.value)
                  }
                  placeholder="Enter the tagline or subtitle"
                  rows={3}
                />
              </div>
              <Button
                onClick={() => handleSave('hero', 'main')}
                disabled={isSaving}
              >
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <Save className="w-4 h-4 mr-2" />
                Save Hero Content
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* About Section */}
        <TabsContent value="about" className="space-y-6">
          {/* Main About */}
          <Card>
            <CardHeader>
              <CardTitle>About the Department</CardTitle>
              <CardDescription>
                Main description of the department
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Section Title</Label>
                <Input
                  value={getContentForKey('about', 'main').title}
                  onChange={(e) =>
                    updateEditedContent('about-main', 'title', e.target.value)
                  }
                  placeholder="About the Department"
                />
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea
                  value={getContentForKey('about', 'main').content}
                  onChange={(e) =>
                    updateEditedContent('about-main', 'content', e.target.value)
                  }
                  placeholder="Enter department description..."
                  rows={5}
                />
              </div>
              <Button
                onClick={() => handleSave('about', 'main')}
                disabled={isSaving}
              >
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </CardContent>
          </Card>

          {/* Vision */}
          <Card>
            <CardHeader>
              <CardTitle>Vision</CardTitle>
              <CardDescription>
                Department's vision statement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={getContentForKey('about', 'vision').title}
                  onChange={(e) =>
                    updateEditedContent('about-vision', 'title', e.target.value)
                  }
                  placeholder="Vision"
                />
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea
                  value={getContentForKey('about', 'vision').content}
                  onChange={(e) =>
                    updateEditedContent('about-vision', 'content', e.target.value)
                  }
                  placeholder="Enter vision statement..."
                  rows={4}
                />
              </div>
              <Button
                onClick={() => handleSave('about', 'vision')}
                disabled={isSaving}
              >
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </CardContent>
          </Card>

          {/* Mission */}
          <Card>
            <CardHeader>
              <CardTitle>Mission</CardTitle>
              <CardDescription>
                Department's mission statement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={getContentForKey('about', 'mission').title}
                  onChange={(e) =>
                    updateEditedContent('about-mission', 'title', e.target.value)
                  }
                  placeholder="Mission"
                />
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea
                  value={getContentForKey('about', 'mission').content}
                  onChange={(e) =>
                    updateEditedContent('about-mission', 'content', e.target.value)
                  }
                  placeholder="Enter mission statement..."
                  rows={4}
                />
              </div>
              <Button
                onClick={() => handleSave('about', 'mission')}
                disabled={isSaving}
              >
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
