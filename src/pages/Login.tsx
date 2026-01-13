import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { GraduationCap, Users, Shield, ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';

type PortalType = 'student' | 'faculty' | 'admin';

const portals = [
  {
    id: 'student' as PortalType,
    title: 'Student Portal',
    icon: GraduationCap,
    description: 'Access your academic records and information',
    color: 'bg-blue-500',
    redirectPath: '/student-portal',
  },
  {
    id: 'faculty' as PortalType,
    title: 'Faculty Portal',
    icon: Users,
    description: 'Manage courses and view student information',
    color: 'bg-green-500',
    redirectPath: '/faculty-portal',
  },
  {
    id: 'admin' as PortalType,
    title: 'Admin Panel',
    icon: Shield,
    description: 'Administrative controls and content management',
    color: 'bg-purple-500',
    redirectPath: '/admin',
  },
];

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [selectedPortal, setSelectedPortal] = useState<PortalType | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginId, setLoginId] = useState('');
  const [secret, setSecret] = useState('');

  const handlePortalSelect = (portalId: PortalType) => {
    setSelectedPortal(portalId);
    setLoginId('');
    setSecret('');
  };

  const handleBack = () => {
    setSelectedPortal(null);
    setLoginId('');
    setSecret('');
  };

  const handleStudentLogin = async () => {
    const identifier = loginId.trim();
    const dob = secret.trim();

    if (!identifier || !dob) {
      toast.error('Enter Roll/Register Number and Date of Birth');
      return;
    }

    const { data, error } = await supabase.functions.invoke('portal-login', {
      body: {
        portalType: 'student',
        identifier,
        dob,
      },
    });

    if (error) {
      toast.error('Login failed');
      return;
    }

    if (data?.error) {
      toast.error(data.error);
      return;
    }

    if (!data?.access_token || !data?.refresh_token) {
      toast.error('Login failed');
      return;
    }

    const { error: sessionError } = await supabase.auth.setSession({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    });

    if (sessionError) {
      toast.error('Login failed');
      return;
    }

    toast.success('Login successful!');
    navigate('/student-portal');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPortal) {
      toast.error('Please select a portal');
      return;
    }

    setIsLoading(true);

    try {
      if (selectedPortal === 'student') {
        await handleStudentLogin();
        return;
      }

      // Faculty/Admin: email + password
      if (!loginId || !secret) {
        toast.error('Please enter email and password');
        return;
      }

      const { data, error } = await signIn(loginId, secret);

      if (error) {
        toast.error(error.message || 'Login failed');
        return;
      }

      if (data?.user) {
        const portal = portals.find((p) => p.id === selectedPortal);
        toast.success('Login successful!');
        navigate(portal?.redirectPath || '/');
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedPortalData = portals.find((p) => p.id === selectedPortal);
  const isStudent = selectedPortal === 'student';

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <GraduationCap className="w-10 h-10 text-primary" />
            <span className="text-2xl font-bold text-foreground">CSE Department</span>
          </div>
          <p className="text-muted-foreground">Paavai Engineering College</p>
        </div>

        {!selectedPortal ? (
          /* Portal Selection */
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center mb-6">Select Your Portal</h2>
            {portals.map((portal) => (
              <Card
                key={portal.id}
                className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-2 hover:border-primary/50"
                onClick={() => handlePortalSelect(portal.id)}
              >
                <CardContent className="flex items-center gap-4 p-6">
                  <div className={`p-3 rounded-xl ${portal.color} text-white`}>
                    <portal.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{portal.title}</h3>
                    <p className="text-sm text-muted-foreground">{portal.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Login Form */
          <Card className="border-2">
            <CardHeader className="text-center">
              <Button variant="ghost" size="sm" onClick={handleBack} className="absolute left-4 top-4">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <div
                className={`w-16 h-16 rounded-2xl ${selectedPortalData?.color} text-white flex items-center justify-center mx-auto mb-4`}
              >
                {selectedPortalData && <selectedPortalData.icon className="w-8 h-8" />}
              </div>
              <CardTitle>{selectedPortalData?.title}</CardTitle>
              <CardDescription>
                {isStudent ? 'Use Roll/Register Number + Date of Birth' : 'Enter your credentials to continue'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="loginId">{isStudent ? 'Roll / Register Number' : 'Email'}</Label>
                  <Input
                    id="loginId"
                    type={isStudent ? 'text' : 'email'}
                    placeholder={isStudent ? 'Enter roll or register number' : 'Enter your email'}
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    disabled={isLoading}
                    autoCapitalize="none"
                    autoCorrect="off"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secret">{isStudent ? 'Date of Birth' : 'Password'}</Label>
                  <div className="relative">
                    <Input
                      id="secret"
                      type={isStudent ? 'date' : showPassword ? 'text' : 'password'}
                      placeholder={isStudent ? '' : 'Enter your password'}
                      value={secret}
                      onChange={(e) => setSecret(e.target.value)}
                      disabled={isLoading}
                    />

                    {!isStudent && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        )}
                      </Button>
                    )}
                  </div>
                  {isStudent && (
                    <p className="text-xs text-muted-foreground">Format: YYYY-MM-DD (example: 2006-01-24)</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>

              <p className="text-xs text-center text-muted-foreground mt-4">Contact your administrator if you don't have access.</p>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-8">© 2025 CSE Department, Paavai Engineering College</p>
      </div>
    </div>
  );
}
