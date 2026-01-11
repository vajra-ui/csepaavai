import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Image,
  FileText,
  Trophy,
  Calendar,
  Users,
  GraduationCap,
  Building2,
  TrendingUp,
  Eye,
  EyeOff,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface DashboardStats {
  images: number;
  achievements: number;
  events: number;
  faculty: number;
  programs: number;
  infrastructure: number;
  hiddenSections: number;
  totalSections: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    images: 0,
    achievements: 0,
    events: 0,
    faculty: 0,
    programs: 0,
    infrastructure: 0,
    hiddenSections: 0,
    totalSections: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [
          imagesRes,
          achievementsRes,
          eventsRes,
          facultyRes,
          programsRes,
          infrastructureRes,
          sectionsRes,
        ] = await Promise.all([
          supabase.from('landing_page_images').select('id', { count: 'exact' }),
          supabase.from('achievements').select('id', { count: 'exact' }),
          supabase.from('events').select('id', { count: 'exact' }),
          supabase.from('faculty').select('id', { count: 'exact' }),
          supabase.from('programs').select('id', { count: 'exact' }),
          supabase.from('infrastructure').select('id', { count: 'exact' }),
          supabase.from('landing_page_sections').select('is_visible'),
        ]);

        const hiddenCount = sectionsRes.data?.filter((s) => !s.is_visible).length || 0;

        setStats({
          images: imagesRes.count || 0,
          achievements: achievementsRes.count || 0,
          events: eventsRes.count || 0,
          faculty: facultyRes.count || 0,
          programs: programsRes.count || 0,
          infrastructure: infrastructureRes.count || 0,
          hiddenSections: hiddenCount,
          totalSections: sectionsRes.data?.length || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Images',
      value: stats.images,
      icon: Image,
      href: '/admin/images',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Achievements',
      value: stats.achievements,
      icon: Trophy,
      href: '/admin/achievements',
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    },
    {
      title: 'Events',
      value: stats.events,
      icon: Calendar,
      href: '/admin/events',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Faculty',
      value: stats.faculty,
      icon: Users,
      href: '/admin/faculty',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Programs',
      value: stats.programs,
      icon: GraduationCap,
      href: '/admin/programs',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
    {
      title: 'Infrastructure',
      value: stats.infrastructure,
      icon: Building2,
      href: '/admin/infrastructure',
      color: 'text-teal-600',
      bgColor: 'bg-teal-100',
    },
  ];

  return (
    <AdminLayout>
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="heading-section text-foreground mb-2">
          Welcome to Admin <span className="text-primary">Dashboard</span>
        </h1>
        <p className="text-muted-foreground">
          Manage your department's website content from here.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.title} to={stat.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={cn('p-2 rounded-lg', stat.bgColor)}>
                    <Icon className={cn('w-5 h-5', stat.color)} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {isLoading ? '...' : stat.value}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total {stat.title.toLowerCase()}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Section Visibility Status */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Section Visibility
          </CardTitle>
          <CardDescription>
            Control which sections appear on the landing page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-green-600">
              <Eye className="w-4 h-4" />
              <span>{stats.totalSections - stats.hiddenSections} visible</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <EyeOff className="w-4 h-4" />
              <span>{stats.hiddenSections} hidden</span>
            </div>
          </div>
          <Link
            to="/admin/settings"
            className="mt-4 inline-block text-sm text-primary hover:underline"
          >
            Manage section visibility →
          </Link>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Common tasks for managing your website
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/admin/content"
              className="p-4 rounded-lg border hover:bg-secondary/50 transition-colors"
            >
              <FileText className="w-6 h-6 text-primary mb-2" />
              <h3 className="font-medium">Edit Content</h3>
              <p className="text-sm text-muted-foreground">
                Update hero, about, and other text content
              </p>
            </Link>
            <Link
              to="/admin/images"
              className="p-4 rounded-lg border hover:bg-secondary/50 transition-colors"
            >
              <Image className="w-6 h-6 text-primary mb-2" />
              <h3 className="font-medium">Upload Images</h3>
              <p className="text-sm text-muted-foreground">
                Add new images to the landing page
              </p>
            </Link>
            <Link
              to="/admin/achievements"
              className="p-4 rounded-lg border hover:bg-secondary/50 transition-colors"
            >
              <Trophy className="w-6 h-6 text-primary mb-2" />
              <h3 className="font-medium">Add Achievement</h3>
              <p className="text-sm text-muted-foreground">
                Showcase student and faculty achievements
              </p>
            </Link>
            <Link
              to="/admin/events"
              className="p-4 rounded-lg border hover:bg-secondary/50 transition-colors"
            >
              <Calendar className="w-6 h-6 text-primary mb-2" />
              <h3 className="font-medium">Create Event</h3>
              <p className="text-sm text-muted-foreground">
                Announce upcoming events and activities
              </p>
            </Link>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
