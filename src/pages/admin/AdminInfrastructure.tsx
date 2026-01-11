import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DataTable, Column } from '@/components/admin/DataTable';
import { ImageUploader } from '@/components/admin/ImageUploader';
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
import { Building2, Loader2 } from 'lucide-react';

interface Infrastructure {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  capacity: number | null;
  equipment: string | null;
  is_visible: boolean;
  display_order: number;
}

export default function AdminInfrastructure() {
  const [infrastructure, setInfrastructure] = useState<Infrastructure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Infrastructure | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    capacity: '',
    equipment: '',
  });

  const fetchInfrastructure = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('infrastructure')
      .select('*')
      .order('display_order');

    if (error) {
      toast.error('Failed to load infrastructure');
      console.error(error);
    } else {
      setInfrastructure(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchInfrastructure();
  }, []);

  const handleAdd = () => {
    setSelectedItem(null);
    setFormData({
      name: '',
      description: '',
      image_url: '',
      capacity: '',
      equipment: '',
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: Infrastructure) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      image_url: item.image_url || '',
      capacity: item.capacity?.toString() || '',
      equipment: item.equipment || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (item: Infrastructure) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };

  const handleToggleVisibility = async (item: Infrastructure) => {
    const { error } = await supabase
      .from('infrastructure')
      .update({ is_visible: !item.is_visible })
      .eq('id', item.id);

    if (error) {
      toast.error('Failed to update visibility');
    } else {
      toast.success(`Lab ${item.is_visible ? 'hidden' : 'shown'}`);
      fetchInfrastructure();
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    setIsSaving(true);

    const payload = {
      name: formData.name,
      description: formData.description || null,
      image_url: formData.image_url || null,
      capacity: formData.capacity ? parseInt(formData.capacity) : null,
      equipment: formData.equipment || null,
    };

    if (selectedItem) {
      const { error } = await supabase
        .from('infrastructure')
        .update(payload)
        .eq('id', selectedItem.id);

      if (error) {
        toast.error('Failed to update infrastructure');
      } else {
        toast.success('Infrastructure updated successfully');
        setIsDialogOpen(false);
        fetchInfrastructure();
      }
    } else {
      const { error } = await supabase.from('infrastructure').insert({
        ...payload,
        display_order: infrastructure.length,
      });

      if (error) {
        toast.error('Failed to add infrastructure');
      } else {
        toast.success('Infrastructure added successfully');
        setIsDialogOpen(false);
        fetchInfrastructure();
      }
    }

    setIsSaving(false);
  };

  const confirmDelete = async () => {
    if (!selectedItem) return;

    const { error } = await supabase
      .from('infrastructure')
      .delete()
      .eq('id', selectedItem.id);

    if (error) {
      toast.error('Failed to delete infrastructure');
    } else {
      toast.success('Infrastructure deleted successfully');
      fetchInfrastructure();
    }
    setIsDeleteDialogOpen(false);
  };

  const columns: Column<Infrastructure>[] = [
    {
      key: 'name',
      label: 'Lab/Facility',
      render: (item) => (
        <div className="flex items-center gap-3">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              className="w-10 h-10 rounded-lg object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <Building2 className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
          <span className="font-medium">{item.name}</span>
        </div>
      ),
    },
    {
      key: 'capacity',
      label: 'Capacity',
      render: (item) => (item.capacity ? `${item.capacity} seats` : '-'),
    },
    { key: 'actions', label: 'Actions', className: 'w-32' },
  ];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="heading-section text-foreground mb-2">
          <span className="text-primary">Infrastructure</span> Management
        </h1>
        <p className="text-muted-foreground">
          Manage labs and facilities
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <DataTable
          data={infrastructure}
          columns={columns}
          onAdd={handleAdd}
          addLabel="Add Lab/Facility"
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleVisibility={handleToggleVisibility}
          searchKey="name"
          searchPlaceholder="Search labs..."
          emptyMessage="No labs added yet. Add your first lab!"
        />
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedItem ? 'Edit Lab/Facility' : 'Add New Lab/Facility'}
            </DialogTitle>
            <DialogDescription>
              {selectedItem
                ? 'Update the details below'
                : 'Fill in the details for the new lab/facility'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Advanced Computing Lab"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) =>
                  setFormData({ ...formData, capacity: e.target.value })
                }
                placeholder="e.g., 60"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="equipment">Equipment</Label>
              <Input
                id="equipment"
                value={formData.equipment}
                onChange={(e) =>
                  setFormData({ ...formData, equipment: e.target.value })
                }
                placeholder="e.g., 60 High-end PCs, Projector"
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
                placeholder="Describe the lab/facility..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Photo</Label>
              <ImageUploader
                currentImage={formData.image_url}
                onUpload={(url) => setFormData({ ...formData, image_url: url })}
                section="infrastructure"
              />
            </div>
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
            <AlertDialogTitle>Delete Lab/Facility?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{selectedItem?.name}". This action
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
