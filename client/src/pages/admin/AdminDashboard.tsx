import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { 
  Users, 
  Briefcase, 
  FileText, 
  TrendingUp, 
  Mail, 
  CheckCircle,
  Clock,
  XCircle,
  Crown
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalJobs: number;
  totalApplications: number;
  activeJobs: number;
  recentSignups: number;
  premiumUsers: number;
  recentApplications: number;
  emailApplications: number;
  applicationsByStatus: Array<{
    status: string;
    count: number;
  }>;
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/admin/dashboard'],
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
      case 'auto_applied':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load dashboard data</p>
      </div>
    );
  }

  const emailPercentage = stats.totalApplications > 0 
    ? Math.round((stats.emailApplications / stats.totalApplications) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          Platform Overview
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Users</p>
              <p className="text-3xl font-bold mt-2">{stats.totalUsers}</p>
              <p className="text-xs text-muted-foreground mt-1">
                +{stats.recentSignups} this week
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Jobs</p>
              <p className="text-3xl font-bold mt-2">{stats.totalJobs}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.activeJobs} active
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Applications</p>
              <p className="text-3xl font-bold mt-2">{stats.totalApplications}</p>
              <p className="text-xs text-muted-foreground mt-1">
                +{stats.recentApplications} today
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Premium Users</p>
              <p className="text-3xl font-bold mt-2">{stats.premiumUsers}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalUsers > 0 ? Math.round((stats.premiumUsers / stats.totalUsers) * 100) : 0}% conversion
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Crown className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Application Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Application Methods
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Email Applications</span>
                <span className="text-sm text-muted-foreground">
                  {stats.emailApplications} ({emailPercentage}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${emailPercentage}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Manual Applications</span>
                <span className="text-sm text-muted-foreground">
                  {stats.totalApplications - stats.emailApplications} ({100 - emailPercentage}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${100 - emailPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Application Status
          </h3>
          <div className="space-y-3">
            {stats.applicationsByStatus.map(status => (
              <div key={status.status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(status.status)}
                  <span className="text-sm font-medium capitalize">
                    {status.status.replace('_', ' ')}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground font-medium">
                  {status.count}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Platform Health</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{stats.recentSignups}</p>
            <p className="text-xs text-muted-foreground mt-1">New users (7 days)</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{stats.recentApplications}</p>
            <p className="text-xs text-muted-foreground mt-1">Applications (24h)</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">{stats.activeJobs}</p>
            <p className="text-xs text-muted-foreground mt-1">Active job listings</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600">
              {stats.totalApplications > 0 ? Math.round(stats.totalApplications / stats.totalUsers) : 0}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Avg apps per user</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
