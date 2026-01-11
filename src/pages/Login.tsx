import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, User, Users, Shield, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type PortalType = 'student' | 'faculty' | 'admin' | null;

const portals = [
  {
    id: 'student' as const,
    title: 'Student Portal',
    icon: <User className="w-8 h-8" />,
    description: 'Access your academic dashboard, attendance, and assignments.',
    color: 'bg-accent text-accent-foreground',
    hoverColor: 'hover:border-accent'
  },
  {
    id: 'faculty' as const,
    title: 'Faculty Portal',
    icon: <Users className="w-8 h-8" />,
    description: 'Manage classes, mark attendance, and evaluate students.',
    color: 'bg-primary text-primary-foreground',
    hoverColor: 'hover:border-primary'
  },
  {
    id: 'admin' as const,
    title: 'Admin Portal',
    icon: <Shield className="w-8 h-8" />,
    description: 'Full system access for department administration.',
    color: 'bg-foreground text-background',
    hoverColor: 'hover:border-foreground'
  }
];

export default function Login() {
  const [selectedPortal, setSelectedPortal] = useState<PortalType>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handlePortalSelect = (portalId: PortalType) => {
    setSelectedPortal(portalId);
  };

  const handleBack = () => {
    setSelectedPortal(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex flex-col">
      {/* Header */}
      <header className="p-4">
        <Link to="/" className="inline-flex items-center gap-3 group">
          <div className="p-2 rounded-xl bg-primary">
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <span className="font-display text-lg font-semibold text-primary block leading-tight">
              CSE Department
            </span>
            <span className="text-xs text-muted-foreground">
              Paavai Engineering College
            </span>
          </div>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          {!selectedPortal ? (
            /* Portal Selection */
            <div className="text-center">
              <h1 className="heading-section text-foreground mb-4">
                Portal <span className="text-primary">Access</span>
              </h1>
              <p className="body-regular text-muted-foreground mb-12 max-w-xl mx-auto">
                Select your role to access the corresponding portal. All portals require 
                administrator activation before use.
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                {portals.map((portal) => (
                  <button
                    key={portal.id}
                    onClick={() => handlePortalSelect(portal.id)}
                    className={cn(
                      'academic-card text-left group border-2 border-transparent transition-all duration-300',
                      portal.hoverColor
                    )}
                  >
                    <div className={cn(
                      'inline-flex p-4 rounded-2xl mb-6 transition-transform group-hover:scale-110',
                      portal.color
                    )}>
                      {portal.icon}
                    </div>
                    <h3 className="heading-card text-foreground mb-2">{portal.title}</h3>
                    <p className="text-sm text-muted-foreground">{portal.description}</p>
                  </button>
                ))}
              </div>

              <p className="mt-12 text-sm text-muted-foreground">
                "One Platform. Three Roles. One Future."
              </p>
            </div>
          ) : (
            /* Login Form */
            <div className="max-w-md mx-auto">
              <Button
                variant="ghost"
                onClick={handleBack}
                className="mb-8 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Portal Selection
              </Button>

              <div className="academic-card">
                {/* Portal Header */}
                <div className="text-center mb-8">
                  <div className={cn(
                    'inline-flex p-4 rounded-2xl mb-4',
                    portals.find(p => p.id === selectedPortal)?.color
                  )}>
                    {portals.find(p => p.id === selectedPortal)?.icon}
                  </div>
                  <h2 className="heading-card text-foreground">
                    {portals.find(p => p.id === selectedPortal)?.title}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-2">
                    Enter your credentials to continue
                  </p>
                </div>

                {/* Login Form */}
                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                  {selectedPortal === 'student' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="rollNumber">Register / Roll Number</Label>
                        <Input
                          id="rollNumber"
                          placeholder="Enter your roll number"
                          className="h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dob">Date of Birth</Label>
                        <Input
                          id="dob"
                          type="date"
                          className="h-12"
                        />
                      </div>
                    </>
                  )}

                  {selectedPortal === 'faculty' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="facultyId">Faculty ID</Label>
                        <Input
                          id="facultyId"
                          placeholder="Enter your faculty ID"
                          className="h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dob">Date of Birth</Label>
                        <Input
                          id="dob"
                          type="date"
                          className="h-12"
                        />
                      </div>
                    </>
                  )}

                  {selectedPortal === 'admin' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="adminId">Admin ID</Label>
                        <Input
                          id="adminId"
                          placeholder="Enter your admin ID"
                          className="h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your password"
                            className="h-12 pr-12"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-primary hover:bg-primary/90"
                    disabled
                  >
                    Sign In
                  </Button>
                </form>

                {/* Activation Notice */}
                <div className="mt-6 p-4 rounded-xl bg-secondary text-center">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">Portal Not Activated</span>
                    <br />
                    This portal will be available once the administrator completes the setup.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Department of CSE, Paavai Engineering College
        </p>
      </footer>
    </div>
  );
}
