import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Mail,
  Eye,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useLocation } from 'wouter';

interface RecentApplicationsProps {
  userId: string;
}

export function RecentApplications({ userId }: RecentApplicationsProps) {
  const [, setLocation] = useLocation();

  const { data: applications, isLoading } = useQuery({
    queryKey: ['/api/applications', userId],
    enabled: !!userId,
  });

  const recentApps = applications?.slice(0, 5) || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
      case 'auto_applied':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'reviewing':
        return <Eye className="w-4 h-4 text-blue-600" />;
      case 'interview':
        return <Calendar className="w-4 h-4 text-purple-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'accepted':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
      case 'auto_applied':
      case 'accepted':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200';
      case 'reviewing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200';
      case 'interview':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Recent Applications
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation('/applications')}
        >
          View All
        </Button>
      </div>

      {recentApps.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No applications yet</p>
          <p className="text-sm">Start swiping right on jobs you like!</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => setLocation('/app')}
          >
            Find Jobs
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {recentApps.map((app: any) => (
            <div
              key={app.id}
              className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => setLocation('/applications')}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium truncate">{app.job?.title || 'Position'}</p>
                    {app.submissionMethod === 'email' && (
                      <Mail className="w-3 h-3 text-green-600 flex-shrink-0" title="Email application" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {app.job?.company || 'Company'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(app.appliedAt), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant="secondary" className={`${getStatusColor(app.status)} flex items-center gap-1`}>
                    {getStatusIcon(app.status)}
                    <span className="capitalize">{app.status.replace('_', ' ')}</span>
                  </Badge>
                  {app.applicationUrl && (
                    <ExternalLink className="w-3 h-3 text-muted-foreground" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
