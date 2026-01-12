import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, BookOpen, User, Phone, Mail, LogOut, GraduationCap, Users, Award, Briefcase } from 'lucide-react';
import { toast } from 'sonner';

interface FacultyData {
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
}

interface StudentData {
  id: string;
  name: string;
  roll_number: string;
  section: string | null;
  batch_year: number | null;
  current_semester: number | null;
  is_active: boolean | null;
}

export default function FacultyPortal() {
  const { user, signOut, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [facultyData, setFacultyData] = useState<FacultyData | null>(null);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      // Fetch faculty data
      const { data: faculty, error: facultyError } = await supabase
        .from('faculty')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (facultyError) {
        console.error('Error fetching faculty data:', facultyError);
        toast.error('Failed to load faculty data');
      } else {
        setFacultyData(faculty);
      }

      // Fetch students for viewing
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('id, name, roll_number, section, batch_year, current_semester, is_active')
        .eq('is_active', true)
        .order('roll_number');

      if (!studentsError) {
        setStudents(studentsData || []);
      }

      setIsLoading(false);
    };

    if (!authLoading && user) {
      fetchData();
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

  if (!facultyData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              No faculty record found for your account. Please contact the administrator.
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
              <h1 className="text-xl font-bold">Faculty Portal</h1>
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
        <div className="mb-8 flex items-center gap-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={facultyData.image_url || undefined} />
            <AvatarFallback className="text-xl bg-primary text-primary-foreground">
              {facultyData.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Welcome, {facultyData.name}!
            </h2>
            <p className="text-muted-foreground">{facultyData.designation}</p>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">My Profile</TabsTrigger>
            <TabsTrigger value="students">View Students</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Professional Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Professional Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <InfoItem label="Designation" value={facultyData.designation || '-'} />
                  <InfoItem label="Qualification" value={facultyData.qualification || '-'} />
                  <InfoItem label="Specialization" value={facultyData.specialization || '-'} />
                  <InfoItem 
                    label="Experience" 
                    value={facultyData.experience_years ? `${facultyData.experience_years} years` : '-'} 
                    icon={<Award className="w-4 h-4" />}
                  />
                </CardContent>
              </Card>

              {/* Contact Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <InfoItem 
                    label="Email" 
                    value={facultyData.email || '-'} 
                    icon={<Mail className="w-4 h-4" />}
                  />
                  <InfoItem 
                    label="Phone" 
                    value={facultyData.phone || '-'} 
                    icon={<Phone className="w-4 h-4" />}
                  />
                </CardContent>
              </Card>

              {/* Bio */}
              {facultyData.bio && (
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      Biography
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{facultyData.bio}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Active Students
                </CardTitle>
                <CardDescription>
                  View all active students in the department
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Roll Number</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Section</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Batch</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Semester</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                            No active students found
                          </td>
                        </tr>
                      ) : (
                        students.map((student) => (
                          <tr key={student.id} className="border-b">
                            <td className="px-4 py-3 font-medium">{student.name}</td>
                            <td className="px-4 py-3 text-muted-foreground">{student.roll_number}</td>
                            <td className="px-4 py-3">
                              <Badge variant="secondary">{student.section || '-'}</Badge>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">{student.batch_year || '-'}</td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {student.current_semester ? `Sem ${student.current_semester}` : '-'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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
