import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff, GripVertical, Save, Key, Lock } from 'lucide-react';

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
  
  // Change password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    setIsChangingPassword(true);

    try {
      // First verify the current password by attempting to sign in
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.email) {
        toast.error('Could not verify current user');
        setIsChangingPassword(false);
        return;
      }

      // Verify current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        toast.error('Current password is incorrect');
        setIsChangingPassword(false);
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        toast.error('Failed to update password: ' + updateError.message);
      } else {
        toast.success('Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      toast.error('An error occurred while changing password');
    } finally {
      setIsChangingPassword(false);
    }
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
          Control section visibility, order, and account settings
        </p>
      </div>

      <div className="grid gap-6">
        {/* Section Visibility & Order */}
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

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              Change Password
            </CardTitle>
            <CardDescription>
              Update your account password. Make sure to use a strong password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    disabled={isChangingPassword}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    disabled={isChangingPassword}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  disabled={isChangingPassword}
                />
              </div>

              <Button type="submit" disabled={isChangingPassword}>
                {isChangingPassword && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <Lock className="w-4 h-4 mr-2" />
                Change Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
