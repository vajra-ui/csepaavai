import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, BookOpen, Calendar, User, Phone, Mail, MapPin, LogOut, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';

interface StudentData {
  id: string;
  name: string;
  roll_number: string;
  register_number: string | null;
  email: string | null;
  phone: string | null;
  date_of_birth: string | null;
  gender: string | null;
  section: string | null;
  batch_year: number | null;
  current_semester: number | null;
  admission_year: number | null;
  parent_name: string | null;
  parent_phone: string | null;
  address: string | null;
  blood_group: string | null;
  avatar_url: string | null;
  department: string | null;
  is_active: boolean | null;
}

export default function StudentPortal() {
  const { user, signOut, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching student data:', error);
        toast.error('Failed to load student data');
      } else {
        setStudentData(data);
      }
      setIsLoading(false);
    };

    if (!authLoading && user) {
      fetchStudentData();
    } else if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              No student record found for your account. Please contact the administrator.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleSignOut} className="w-full">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 shadow-lg">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-8 h-8" />
            <div>
              <h1 className="text-xl font-bold">Student Portal</h1>
              <p className="text-sm text-primary-foreground/70">CSE Department - Paavai Engineering College</p>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Welcome, {studentData.name}!
          </h2>
          <p className="text-muted-foreground">
            View your academic information and stay updated with department activities.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="md:col-span-1">
            <CardHeader className="text-center">
              <Avatar className="w-24 h-24 mx-auto mb-4">
                <AvatarImage src={studentData.avatar_url || undefined} />
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {studentData.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <CardTitle>{studentData.name}</CardTitle>
              <CardDescription>{studentData.roll_number}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center gap-2">
                <Badge variant={studentData.is_active ? 'default' : 'secondary'}>
                  {studentData.is_active ? 'Active' : 'Inactive'}
                </Badge>
                {studentData.section && (
                  <Badge variant="outline">Section {studentData.section}</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Academic Info */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Academic Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                <InfoItem label="Department" value={studentData.department || 'CSE'} />
                <InfoItem label="Register Number" value={studentData.register_number || '-'} />
                <InfoItem label="Batch Year" value={studentData.batch_year?.toString() || '-'} />
                <InfoItem label="Current Semester" value={studentData.current_semester ? `Semester ${studentData.current_semester}` : '-'} />
                <InfoItem label="Admission Year" value={studentData.admission_year?.toString() || '-'} />
                <InfoItem label="Section" value={studentData.section || '-'} />
              </div>
            </CardContent>
          </Card>

          {/* Personal Info */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                <InfoItem 
                  label="Email" 
                  value={studentData.email || '-'} 
                  icon={<Mail className="w-4 h-4" />}
                />
                <InfoItem 
                  label="Phone" 
                  value={studentData.phone || '-'} 
                  icon={<Phone className="w-4 h-4" />}
                />
                <InfoItem 
                  label="Date of Birth" 
                  value={studentData.date_of_birth || '-'} 
                  icon={<Calendar className="w-4 h-4" />}
                />
                <InfoItem label="Gender" value={studentData.gender || '-'} />
                <InfoItem label="Blood Group" value={studentData.blood_group || '-'} />
                <InfoItem 
                  label="Address" 
                  value={studentData.address || '-'} 
                  icon={<MapPin className="w-4 h-4" />}
                />
              </div>
            </CardContent>
          </Card>

          {/* Parent Info */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Parent/Guardian
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoItem label="Name" value={studentData.parent_name || '-'} />
              <InfoItem 
                label="Phone" 
                value={studentData.parent_phone || '-'} 
                icon={<Phone className="w-4 h-4" />}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function InfoItem({ 
  label, 
  value, 
  icon 
}: { 
  label: string; 
  value: string; 
  icon?: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium flex items-center gap-2">
        {icon}
        {value}
      </p>
    </div>
  );
}
