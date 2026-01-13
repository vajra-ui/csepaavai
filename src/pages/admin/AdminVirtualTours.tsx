import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DataTable, Column } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Video, Loader2, Play, ExternalLink } from 'lucide-react';

interface VirtualTour {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  is_visible: boolean;
  display_order: number;
}

export default function AdminVirtualTours() {
  const [tours, setTours] = useState<VirtualTour[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedItem, setSelectedItem] = useState<VirtualTour | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video_url: '',
    thumbnail_url: '',
  });

  const fetchTours = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('virtual_tours')
      .select('*')
      .order('display_order');

    if (error) {
      toast.error('Failed to load virtual tours');
      console.error(error);
    } else {
      setTours(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTours();
  }, []);

  const handleAdd = () => {
    setSelectedItem(null);
    setFormData({
      title: '',
      description: '',
      video_url: '',
      thumbnail_url: '',
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: VirtualTour) => {
    setSelectedItem(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      video_url: item.video_url,
      thumbnail_url: item.thumbnail_url || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (item: VirtualTour) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };

  const handleToggleVisibility = async (item: VirtualTour) => {
    const { error } = await supabase
      .from('virtual_tours')
      .update({ is_visible: !item.is_visible })
      .eq('id', item.id);

    if (error) {
      toast.error('Failed to update visibility');
    } else {
      toast.success(`Tour ${item.is_visible ? 'hidden' : 'shown'}`);
      fetchTours();
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.video_url.trim()) {
      toast.error('Title and video URL are required');
      return;
    }

    setIsSaving(true);

    const payload = {
      title: formData.title,
      description: formData.description || null,
      video_url: formData.video_url,
      thumbnail_url: formData.thumbnail_url || null,
    };

    if (selectedItem) {
      const { error } = await supabase
        .from('virtual_tours')
        .update(payload)
        .eq('id', selectedItem.id);

      if (error) {
        toast.error('Failed to update tour');
      } else {
        toast.success('Tour updated successfully');
        setIsDialogOpen(false);
        fetchTours();
      }
    } else {
      const { error } = await supabase.from('virtual_tours').insert({
        ...payload,
        display_order: tours.length,
      });

      if (error) {
        toast.error('Failed to add tour');
      } else {
        toast.success('Tour added successfully');
        setIsDialogOpen(false);
        fetchTours();
      }
    }

    setIsSaving(false);
  };

  const confirmDelete = async () => {
    if (!selectedItem) return;

    const { error } = await supabase
      .from('virtual_tours')
      .delete()
      .eq('id', selectedItem.id);

    if (error) {
      toast.error('Failed to delete tour');
    } else {
      toast.success('Tour deleted successfully');
      fetchTours();
    }
    setIsDeleteDialogOpen(false);
  };

  const getVideoEmbedUrl = (url: string) => {
    // Convert YouTube URLs to embed format
    const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\s]+)/);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }
    return url;
  };

  const columns: Column<VirtualTour>[] = [
    {
      key: 'title',
      label: 'Tour',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-16 h-10 rounded bg-secondary flex items-center justify-center overflow-hidden">
            {item.thumbnail_url ? (
              <img
                src={item.thumbnail_url}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <Video className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
          <div>
            <span className="font-medium">{item.title}</span>
            {item.description && (
              <p className="text-xs text-muted-foreground line-clamp-1">
                {item.description}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'video_url',
      label: 'Video',
      render: (item) => (
        <a
          href={item.video_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-primary hover:underline text-sm"
        >
          <Play className="w-4 h-4" />
          Watch
          <ExternalLink className="w-3 h-3" />
        </a>
      ),
    },
    { key: 'actions', label: 'Actions', className: 'w-32' },
  ];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="heading-section text-foreground mb-2">
          <span className="text-primary">Virtual Tour</span> Management
        </h1>
        <p className="text-muted-foreground">
          Add and manage virtual tour videos for the landing page
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <DataTable
          data={tours}
          columns={columns}
          onAdd={handleAdd}
          addLabel="Add Video"
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleVisibility={handleToggleVisibility}
          searchKey="title"
          searchPlaceholder="Search videos..."
          emptyMessage="No virtual tour videos added yet. Add your first video!"
        />
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedItem ? 'Edit Video' : 'Add New Video'}
            </DialogTitle>
            <DialogDescription>
              {selectedItem
                ? 'Update the video details below'
                : 'Add a video URL from YouTube or other platforms'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g., Campus Tour 2024"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="video_url">Video URL *</Label>
              <Input
                id="video_url"
                value={formData.video_url}
                onChange={(e) =>
                  setFormData({ ...formData, video_url: e.target.value })
                }
                placeholder="https://www.youtube.com/watch?v=..."
              />
              <p className="text-xs text-muted-foreground">
                Supports YouTube, Vimeo, and direct video links
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnail_url">Thumbnail URL (optional)</Label>
              <Input
                id="thumbnail_url"
                value={formData.thumbnail_url}
                onChange={(e) =>
                  setFormData({ ...formData, thumbnail_url: e.target.value })
                }
                placeholder="https://example.com/thumbnail.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Brief description of the video..."
                rows={3}
              />
            </div>

            {formData.video_url && (
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="aspect-video rounded-lg overflow-hidden bg-secondary">
                  <iframe
                    src={getVideoEmbedUrl(formData.video_url)}
                    title="Video Preview"
                    className="w-full h-full"
                    allowFullScreen
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {selectedItem ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Video?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{selectedItem?.title}". This action
              cannot be undone.
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
