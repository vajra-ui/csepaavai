import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DataTable, Column } from '@/components/admin/DataTable';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
import { Calendar, Loader2, Pin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Event {
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

export default function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    end_date: '',
    venue: '',
    image_url: '',
    is_pinned: false,
  });

  const fetchEvents = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: false });

    if (error) {
      toast.error('Failed to load events');
      console.error(error);
    } else {
      setEvents(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleAdd = () => {
    setSelectedItem(null);
    setFormData({
      title: '',
      description: '',
      event_date: '',
      end_date: '',
      venue: '',
      image_url: '',
      is_pinned: false,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: Event) => {
    setSelectedItem(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      event_date: item.event_date ? item.event_date.split('T')[0] : '',
      end_date: item.end_date ? item.end_date.split('T')[0] : '',
      venue: item.venue || '',
      image_url: item.image_url || '',
      is_pinned: item.is_pinned,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (item: Event) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };

  const handleToggleVisibility = async (item: Event) => {
    const { error } = await supabase
      .from('events')
      .update({ is_visible: !item.is_visible })
      .eq('id', item.id);

    if (error) {
      toast.error('Failed to update visibility');
    } else {
      toast.success(`Event ${item.is_visible ? 'hidden' : 'shown'}`);
      fetchEvents();
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    setIsSaving(true);

    const payload = {
      title: formData.title,
      description: formData.description || null,
      event_date: formData.event_date ? new Date(formData.event_date).toISOString() : null,
      end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
      venue: formData.venue || null,
      image_url: formData.image_url || null,
      is_pinned: formData.is_pinned,
    };

    if (selectedItem) {
      const { error } = await supabase
        .from('events')
        .update(payload)
        .eq('id', selectedItem.id);

      if (error) {
        toast.error('Failed to update event');
      } else {
        toast.success('Event updated successfully');
        setIsDialogOpen(false);
        fetchEvents();
      }
    } else {
      const { error } = await supabase.from('events').insert(payload);

      if (error) {
        toast.error('Failed to create event');
      } else {
        toast.success('Event created successfully');
        setIsDialogOpen(false);
        fetchEvents();
      }
    }

    setIsSaving(false);
  };

  const confirmDelete = async () => {
    if (!selectedItem) return;

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', selectedItem.id);

    if (error) {
      toast.error('Failed to delete event');
    } else {
      toast.success('Event deleted successfully');
      fetchEvents();
    }
    setIsDeleteDialogOpen(false);
  };

  const columns: Column<Event>[] = [
    {
      key: 'title',
      label: 'Event',
      render: (item) => (
        <div className="flex items-center gap-3">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.title}
              className="w-10 h-10 rounded-lg object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <Calendar className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{item.title}</span>
              {item.is_pinned && (
                <Pin className="w-3 h-3 text-primary" />
              )}
            </div>
            {item.venue && (
              <span className="text-xs text-muted-foreground">{item.venue}</span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'event_date',
      label: 'Date',
      render: (item) => {
        if (!item.event_date) return '-';
        const date = new Date(item.event_date);
        const isPast = date < new Date();
        return (
          <div className="flex items-center gap-2">
            <span>{date.toLocaleDateString()}</span>
            {isPast && (
              <Badge variant="secondary" className="text-xs">Past</Badge>
            )}
          </div>
        );
      },
    },
    { key: 'actions', label: 'Actions', className: 'w-32' },
  ];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="heading-section text-foreground mb-2">
          <span className="text-primary">Events</span> Management
        </h1>
        <p className="text-muted-foreground">
          Manage department events and announcements
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <DataTable
          data={events}
          columns={columns}
          onAdd={handleAdd}
          addLabel="Add Event"
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleVisibility={handleToggleVisibility}
          searchKey="title"
          searchPlaceholder="Search events..."
          emptyMessage="No events yet. Create your first event!"
        />
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedItem ? 'Edit Event' : 'Add New Event'}
            </DialogTitle>
            <DialogDescription>
              {selectedItem
                ? 'Update the event details below'
                : 'Fill in the details for the new event'}
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
                placeholder="Enter event title"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event_date">Start Date</Label>
                <Input
                  id="event_date"
                  type="date"
                  value={formData.event_date}
                  onChange={(e) =>
                    setFormData({ ...formData, event_date: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) =>
                    setFormData({ ...formData, end_date: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="venue">Venue</Label>
              <Input
                id="venue"
                value={formData.venue}
                onChange={(e) =>
                  setFormData({ ...formData, venue: e.target.value })
                }
                placeholder="Enter venue"
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
                placeholder="Describe the event..."
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="is_pinned">Pin this event</Label>
              <Switch
                id="is_pinned"
                checked={formData.is_pinned}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_pinned: checked })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Event Poster/Image</Label>
              <ImageUploader
                currentImage={formData.image_url}
                onUpload={(url) => setFormData({ ...formData, image_url: url })}
                section="events"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {selectedItem ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event?</AlertDialogTitle>
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
