import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DataTable, Column } from '@/components/admin/DataTable';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Trophy, Loader2 } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string | null;
  category: string;
  image_url: string | null;
  achievement_date: string | null;
  is_visible: boolean;
  display_order: number;
}

const categories = [
  { value: 'student', label: 'Student' },
  { value: 'faculty', label: 'Faculty' },
  { value: 'research', label: 'Research' },
  { value: 'department', label: 'Department' },
];

export default function AdminAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Achievement | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'department',
    image_url: '',
    achievement_date: '',
  });

  const fetchAchievements = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .order('display_order');

    if (error) {
      toast.error('Failed to load achievements');
      console.error(error);
    } else {
      setAchievements(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const handleAdd = () => {
    setSelectedItem(null);
    setFormData({
      title: '',
      description: '',
      category: 'department',
      image_url: '',
      achievement_date: '',
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: Achievement) => {
    setSelectedItem(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      category: item.category,
      image_url: item.image_url || '',
      achievement_date: item.achievement_date || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (item: Achievement) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };

  const handleToggleVisibility = async (item: Achievement) => {
    const { error } = await supabase
      .from('achievements')
      .update({ is_visible: !item.is_visible })
      .eq('id', item.id);

    if (error) {
      toast.error('Failed to update visibility');
    } else {
      toast.success(`Achievement ${item.is_visible ? 'hidden' : 'shown'}`);
      fetchAchievements();
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
      category: formData.category,
      image_url: formData.image_url || null,
      achievement_date: formData.achievement_date || null,
    };

    if (selectedItem) {
      const { error } = await supabase
        .from('achievements')
        .update(payload)
        .eq('id', selectedItem.id);

      if (error) {
        toast.error('Failed to update achievement');
      } else {
        toast.success('Achievement updated successfully');
        setIsDialogOpen(false);
        fetchAchievements();
      }
    } else {
      const { error } = await supabase.from('achievements').insert({
        ...payload,
        display_order: achievements.length,
      });

      if (error) {
        toast.error('Failed to create achievement');
      } else {
        toast.success('Achievement created successfully');
        setIsDialogOpen(false);
        fetchAchievements();
      }
    }

    setIsSaving(false);
  };

  const confirmDelete = async () => {
    if (!selectedItem) return;

    const { error } = await supabase
      .from('achievements')
      .delete()
      .eq('id', selectedItem.id);

    if (error) {
      toast.error('Failed to delete achievement');
    } else {
      toast.success('Achievement deleted successfully');
      fetchAchievements();
    }
    setIsDeleteDialogOpen(false);
  };

  const columns: Column<Achievement>[] = [
    {
      key: 'title',
      label: 'Title',
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
              <Trophy className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
          <span className="font-medium">{item.title}</span>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (item) => (
        <span className="capitalize px-2 py-1 rounded-full bg-secondary text-xs">
          {item.category}
        </span>
      ),
    },
    {
      key: 'achievement_date',
      label: 'Date',
      render: (item) =>
        item.achievement_date
          ? new Date(item.achievement_date).toLocaleDateString()
          : '-',
    },
    { key: 'actions', label: 'Actions', className: 'w-32' },
  ];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="heading-section text-foreground mb-2">
          <span className="text-primary">Achievements</span> Management
        </h1>
        <p className="text-muted-foreground">
          Showcase student, faculty, and department achievements
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <DataTable
          data={achievements}
          columns={columns}
          onAdd={handleAdd}
          addLabel="Add Achievement"
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleVisibility={handleToggleVisibility}
          searchKey="title"
          searchPlaceholder="Search achievements..."
          emptyMessage="No achievements yet. Add your first achievement!"
        />
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedItem ? 'Edit Achievement' : 'Add New Achievement'}
            </DialogTitle>
            <DialogDescription>
              {selectedItem
                ? 'Update the achievement details below'
                : 'Fill in the details for the new achievement'}
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
                placeholder="Enter achievement title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe the achievement..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Achievement Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.achievement_date}
                onChange={(e) =>
                  setFormData({ ...formData, achievement_date: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Image</Label>
              <ImageUploader
                currentImage={formData.image_url}
                onUpload={(url) => setFormData({ ...formData, image_url: url })}
                section="achievements"
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
            <AlertDialogTitle>Delete Achievement?</AlertDialogTitle>
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
