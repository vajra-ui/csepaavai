import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, Eye, EyeOff, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LandingImage {
  id: string;
  section_key: string;
  image_url: string;
  alt_text: string | null;
  caption: string | null;
  display_order: number;
  is_visible: boolean;
}

const sections = [
  { value: 'hero', label: 'Hero Section' },
  { value: 'about', label: 'About Section' },
  { value: 'achievements', label: 'Achievements' },
  { value: 'events', label: 'Events' },
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'faculty', label: 'Faculty' },
];

export default function AdminImages() {
  const [images, setImages] = useState<LandingImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LandingImage | null>(null);
  const [filterSection, setFilterSection] = useState<string>('all');
  const [formData, setFormData] = useState({
    section_key: 'hero',
    image_url: '',
    alt_text: '',
    caption: '',
  });

  const fetchImages = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('landing_page_images')
      .select('*')
      .order('display_order');

    if (error) {
      toast.error('Failed to load images');
      console.error(error);
    } else {
      setImages(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleAdd = () => {
    setSelectedItem(null);
    setFormData({
      section_key: 'hero',
      image_url: '',
      alt_text: '',
      caption: '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (item: LandingImage) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };

  const handleToggleVisibility = async (item: LandingImage) => {
    const { error } = await supabase
      .from('landing_page_images')
      .update({ is_visible: !item.is_visible })
      .eq('id', item.id);

    if (error) {
      toast.error('Failed to update visibility');
    } else {
      toast.success(`Image ${item.is_visible ? 'hidden' : 'shown'}`);
      fetchImages();
    }
  };

  const handleSave = async () => {
    if (!formData.image_url) {
      toast.error('Please upload an image');
      return;
    }

    setIsSaving(true);

    const payload = {
      section_key: formData.section_key,
      image_url: formData.image_url,
      alt_text: formData.alt_text || null,
      caption: formData.caption || null,
      display_order: images.length,
    };

    const { error } = await supabase.from('landing_page_images').insert(payload);

    if (error) {
      toast.error('Failed to add image');
    } else {
      toast.success('Image added successfully');
      setIsDialogOpen(false);
      fetchImages();
    }

    setIsSaving(false);
  };

  const confirmDelete = async () => {
    if (!selectedItem) return;

    const { error } = await supabase
      .from('landing_page_images')
      .delete()
      .eq('id', selectedItem.id);

    if (error) {
      toast.error('Failed to delete image');
    } else {
      toast.success('Image deleted successfully');
      fetchImages();
    }
    setIsDeleteDialogOpen(false);
  };

  const filteredImages = filterSection === 'all'
    ? images
    : images.filter((img) => img.section_key === filterSection);

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="heading-section text-foreground mb-2">
          <span className="text-primary">Image</span> Management
        </h1>
        <p className="text-muted-foreground">
          Manage images for the landing page sections
        </p>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
        <Select value={filterSection} onValueChange={setFilterSection}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by section" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sections</SelectItem>
            {sections.map((section) => (
              <SelectItem key={section.value} value={section.value}>
                {section.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Image
        </Button>
      </div>

      {/* Images Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredImages.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center">
            <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No images yet</h3>
            <p className="text-muted-foreground mb-4">
              Upload images to display on the landing page
            </p>
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Image
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredImages.map((image) => (
            <Card
              key={image.id}
              className={cn(
                'overflow-hidden',
                !image.is_visible && 'opacity-50'
              )}
            >
              <div className="relative aspect-video">
                <img
                  src={image.image_url}
                  alt={image.alt_text || 'Landing page image'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-2 left-2">
                  <span className="text-xs text-white bg-black/50 px-2 py-1 rounded capitalize">
                    {image.section_key}
                  </span>
                </div>
              </div>
              <CardContent className="p-3">
                {image.caption && (
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {image.caption}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleVisibility(image)}
                    title={image.is_visible ? 'Hide' : 'Show'}
                  >
                    {image.is_visible ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(image)}
                    className="text-destructive hover:text-destructive"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Image Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Image</DialogTitle>
            <DialogDescription>
              Upload an image for the landing page
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Section</Label>
              <Select
                value={formData.section_key}
                onValueChange={(value) =>
                  setFormData({ ...formData, section_key: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((section) => (
                    <SelectItem key={section.value} value={section.value}>
                      {section.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Image</Label>
              <ImageUploader
                currentImage={formData.image_url}
                onUpload={(url) => setFormData({ ...formData, image_url: url })}
                section={formData.section_key}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="alt_text">Alt Text</Label>
              <Input
                id="alt_text"
                value={formData.alt_text}
                onChange={(e) =>
                  setFormData({ ...formData, alt_text: e.target.value })
                }
                placeholder="Describe the image for accessibility"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="caption">Caption (optional)</Label>
              <Input
                id="caption"
                value={formData.caption}
                onChange={(e) =>
                  setFormData({ ...formData, caption: e.target.value })
                }
                placeholder="Image caption"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !formData.image_url}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Image?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this image. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
