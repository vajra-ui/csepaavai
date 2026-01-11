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
import { User, Loader2 } from 'lucide-react';

interface Faculty {
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

export default function AdminFaculty() {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Faculty | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    specialization: '',
    qualification: '',
    experience_years: '',
    email: '',
    phone: '',
    image_url: '',
    bio: '',
  });

  const fetchFaculty = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('faculty')
      .select('*')
      .order('display_order');

    if (error) {
      toast.error('Failed to load faculty');
      console.error(error);
    } else {
      setFaculty(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  const handleAdd = () => {
    setSelectedItem(null);
    setFormData({
      name: '',
      designation: '',
      specialization: '',
      qualification: '',
      experience_years: '',
      email: '',
      phone: '',
      image_url: '',
      bio: '',
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: Faculty) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      designation: item.designation || '',
      specialization: item.specialization || '',
      qualification: item.qualification || '',
      experience_years: item.experience_years?.toString() || '',
      email: item.email || '',
      phone: item.phone || '',
      image_url: item.image_url || '',
      bio: item.bio || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (item: Faculty) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };

  const handleToggleVisibility = async (item: Faculty) => {
    const { error } = await supabase
      .from('faculty')
      .update({ is_visible: !item.is_visible })
      .eq('id', item.id);

    if (error) {
      toast.error('Failed to update visibility');
    } else {
      toast.success(`Faculty ${item.is_visible ? 'hidden' : 'shown'}`);
      fetchFaculty();
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
      designation: formData.designation || null,
      specialization: formData.specialization || null,
      qualification: formData.qualification || null,
      experience_years: formData.experience_years ? parseInt(formData.experience_years) : null,
      email: formData.email || null,
      phone: formData.phone || null,
      image_url: formData.image_url || null,
      bio: formData.bio || null,
    };

    if (selectedItem) {
      const { error } = await supabase
        .from('faculty')
        .update(payload)
        .eq('id', selectedItem.id);

      if (error) {
        toast.error('Failed to update faculty');
      } else {
        toast.success('Faculty updated successfully');
        setIsDialogOpen(false);
        fetchFaculty();
      }
    } else {
      const { error } = await supabase.from('faculty').insert({
        ...payload,
        display_order: faculty.length,
      });

      if (error) {
        toast.error('Failed to add faculty');
      } else {
        toast.success('Faculty added successfully');
        setIsDialogOpen(false);
        fetchFaculty();
      }
    }

    setIsSaving(false);
  };

  const confirmDelete = async () => {
    if (!selectedItem) return;

    const { error } = await supabase
      .from('faculty')
      .delete()
      .eq('id', selectedItem.id);

    if (error) {
      toast.error('Failed to delete faculty');
    } else {
      toast.success('Faculty deleted successfully');
      fetchFaculty();
    }
    setIsDeleteDialogOpen(false);
  };

  const columns: Column<Faculty>[] = [
    {
      key: 'name',
      label: 'Faculty',
      render: (item) => (
        <div className="flex items-center gap-3">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              <User className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
          <div>
            <span className="font-medium">{item.name}</span>
            {item.designation && (
              <p className="text-xs text-muted-foreground">{item.designation}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'specialization',
      label: 'Specialization',
      render: (item) => item.specialization || '-',
    },
    {
      key: 'experience_years',
      label: 'Experience',
      render: (item) =>
        item.experience_years ? `${item.experience_years} years` : '-',
    },
    { key: 'actions', label: 'Actions', className: 'w-32' },
  ];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="heading-section text-foreground mb-2">
          <span className="text-primary">Faculty</span> Management
        </h1>
        <p className="text-muted-foreground">
          Manage department faculty profiles
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <DataTable
          data={faculty}
          columns={columns}
          onAdd={handleAdd}
          addLabel="Add Faculty"
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleVisibility={handleToggleVisibility}
          searchKey="name"
          searchPlaceholder="Search faculty..."
          emptyMessage="No faculty added yet. Add your first faculty member!"
        />
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedItem ? 'Edit Faculty' : 'Add New Faculty'}
            </DialogTitle>
            <DialogDescription>
              {selectedItem
                ? 'Update the faculty details below'
                : 'Fill in the details for the new faculty member'}
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
                placeholder="Enter faculty name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="designation">Designation</Label>
                <Input
                  id="designation"
                  value={formData.designation}
                  onChange={(e) =>
                    setFormData({ ...formData, designation: e.target.value })
                  }
                  placeholder="e.g., Professor"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience">Experience (years)</Label>
                <Input
                  id="experience"
                  type="number"
                  value={formData.experience_years}
                  onChange={(e) =>
                    setFormData({ ...formData, experience_years: e.target.value })
                  }
                  placeholder="e.g., 10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="qualification">Qualification</Label>
              <Input
                id="qualification"
                value={formData.qualification}
                onChange={(e) =>
                  setFormData({ ...formData, qualification: e.target.value })
                }
                placeholder="e.g., Ph.D. in Computer Science"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization</Label>
              <Input
                id="specialization"
                value={formData.specialization}
                onChange={(e) =>
                  setFormData({ ...formData, specialization: e.target.value })
                }
                placeholder="e.g., Machine Learning, AI"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                placeholder="Brief biography..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Photo</Label>
              <ImageUploader
                currentImage={formData.image_url}
                onUpload={(url) => setFormData({ ...formData, image_url: url })}
                section="faculty"
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
            <AlertDialogTitle>Delete Faculty?</AlertDialogTitle>
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
