import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff, GripVertical, Save } from 'lucide-react';

interface Section {
  id: string;
  section_key: string;
  title: string;
  is_visible: boolean;
  display_order: number;
}

export default function AdminSettings() {
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSections = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('landing_page_sections')
      .select('*')
      .order('display_order');

    if (error) {
      toast.error('Failed to load sections');
      console.error(error);
    } else {
      setSections(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const handleToggleVisibility = async (section: Section) => {
    const { error } = await supabase
      .from('landing_page_sections')
      .update({ is_visible: !section.is_visible })
      .eq('id', section.id);

    if (error) {
      toast.error('Failed to update section visibility');
    } else {
      toast.success(`${section.title} ${section.is_visible ? 'hidden' : 'shown'}`);
      fetchSections();
    }
  };

  const handleSaveOrder = async () => {
    setIsSaving(true);

    const updates = sections.map((section, index) => ({
      id: section.id,
      display_order: index,
    }));

    for (const update of updates) {
      const { error } = await supabase
        .from('landing_page_sections')
        .update({ display_order: update.display_order })
        .eq('id', update.id);

      if (error) {
        toast.error('Failed to save order');
        setIsSaving(false);
        return;
      }
    }

    toast.success('Section order saved');
    setIsSaving(false);
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === sections.length - 1)
    ) {
      return;
    }

    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
    setSections(newSections);
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
          <span className="text-primary">Settings</span>
        </h1>
        <p className="text-muted-foreground">
          Control section visibility and order on the landing page
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Section Visibility & Order
          </CardTitle>
          <CardDescription>
            Toggle sections on/off and reorder them as needed. Changes to visibility apply immediately.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sections.map((section, index) => (
              <div
                key={section.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-secondary/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => moveSection(index, 'up')}
                      disabled={index === 0}
                      className="p-1 hover:bg-secondary rounded disabled:opacity-30"
                    >
                      <GripVertical className="w-4 h-4 rotate-180" />
                    </button>
                    <button
                      onClick={() => moveSection(index, 'down')}
                      disabled={index === sections.length - 1}
                      className="p-1 hover:bg-secondary rounded disabled:opacity-30"
                    >
                      <GripVertical className="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <h3 className="font-medium">{section.title}</h3>
                    <p className="text-sm text-muted-foreground capitalize">
                      {section.section_key}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {section.is_visible ? (
                      <Eye className="w-4 h-4 text-green-600" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    )}
                    <Label htmlFor={`visibility-${section.id}`} className="text-sm">
                      {section.is_visible ? 'Visible' : 'Hidden'}
                    </Label>
                  </div>
                  <Switch
                    id={`visibility-${section.id}`}
                    checked={section.is_visible}
                    onCheckedChange={() => handleToggleVisibility(section)}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t">
            <Button onClick={handleSaveOrder} disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Save className="w-4 h-4 mr-2" />
              Save Order
            </Button>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
