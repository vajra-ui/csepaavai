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
import { GraduationCap, Loader2 } from 'lucide-react';

interface Program {
  id: string;
  name: string;
  degree_type: string;
  description: string | null;
  duration: string | null;
  eligibility: string | null;
  is_visible: boolean;
  display_order: number;
}

export default function AdminPrograms() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Program | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    degree_type: '',
    description: '',
    duration: '',
    eligibility: '',
  });

  const fetchPrograms = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .order('display_order');

    if (error) {
      toast.error('Failed to load programs');
      console.error(error);
    } else {
      setPrograms(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const handleAdd = () => {
    setSelectedItem(null);
    setFormData({
      name: '',
      degree_type: '',
      description: '',
      duration: '',
      eligibility: '',
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: Program) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      degree_type: item.degree_type,
      description: item.description || '',
      duration: item.duration || '',
      eligibility: item.eligibility || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (item: Program) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };

  const handleToggleVisibility = async (item: Program) => {
    const { error } = await supabase
      .from('programs')
      .update({ is_visible: !item.is_visible })
      .eq('id', item.id);

    if (error) {
      toast.error('Failed to update visibility');
    } else {
      toast.success(`Program ${item.is_visible ? 'hidden' : 'shown'}`);
      fetchPrograms();
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.degree_type.trim()) {
      toast.error('Name and degree type are required');
      return;
    }

    setIsSaving(true);

    const payload = {
      name: formData.name,
      degree_type: formData.degree_type,
      description: formData.description || null,
      duration: formData.duration || null,
      eligibility: formData.eligibility || null,
    };

    if (selectedItem) {
      const { error } = await supabase
        .from('programs')
        .update(payload)
        .eq('id', selectedItem.id);

      if (error) {
        toast.error('Failed to update program');
      } else {
        toast.success('Program updated successfully');
        setIsDialogOpen(false);
        fetchPrograms();
      }
    } else {
      const { error } = await supabase.from('programs').insert({
        ...payload,
        display_order: programs.length,
      });

      if (error) {
        toast.error('Failed to add program');
      } else {
        toast.success('Program added successfully');
        setIsDialogOpen(false);
        fetchPrograms();
      }
    }

    setIsSaving(false);
  };

  const confirmDelete = async () => {
    if (!selectedItem) return;

    const { error } = await supabase
      .from('programs')
      .delete()
      .eq('id', selectedItem.id);

    if (error) {
      toast.error('Failed to delete program');
    } else {
      toast.success('Program deleted successfully');
      fetchPrograms();
    }
    setIsDeleteDialogOpen(false);
  };

  const columns: Column<Program>[] = [
    {
      key: 'name',
      label: 'Program',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <span className="font-medium">{item.name}</span>
            <p className="text-xs text-muted-foreground">{item.degree_type}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'duration',
      label: 'Duration',
      render: (item) => item.duration || '-',
    },
    { key: 'actions', label: 'Actions', className: 'w-32' },
  ];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="heading-section text-foreground mb-2">
          <span className="text-primary">Programs</span> Management
        </h1>
        <p className="text-muted-foreground">
          Manage department programs and courses
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <DataTable
          data={programs}
          columns={columns}
          onAdd={handleAdd}
          addLabel="Add Program"
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleVisibility={handleToggleVisibility}
          searchKey="name"
          searchPlaceholder="Search programs..."
          emptyMessage="No programs added yet. Add your first program!"
        />
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedItem ? 'Edit Program' : 'Add New Program'}
            </DialogTitle>
            <DialogDescription>
              {selectedItem
                ? 'Update the program details below'
                : 'Fill in the details for the new program'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Program Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Computer Science and Engineering"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="degree_type">Degree Type *</Label>
                <Input
                  id="degree_type"
                  value={formData.degree_type}
                  onChange={(e) =>
                    setFormData({ ...formData, degree_type: e.target.value })
                  }
                  placeholder="e.g., B.E., M.E., Ph.D."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                  placeholder="e.g., 4 years"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="eligibility">Eligibility</Label>
              <Input
                id="eligibility"
                value={formData.eligibility}
                onChange={(e) =>
                  setFormData({ ...formData, eligibility: e.target.value })
                }
                placeholder="e.g., 10+2 with PCM"
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
                placeholder="Program description..."
                rows={4}
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
            <AlertDialogTitle>Delete Program?</AlertDialogTitle>
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
