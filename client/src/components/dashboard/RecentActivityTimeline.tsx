import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  CheckCircle, 
  Clock, 
  Mail, 
  FileText, 
  Award,
  TrendingUp
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Activity {
  id: string;
  type: 'application' | 'badge' | 'swipe' | 'profile_view';
  title: string;
  description: string;
  timestamp: Date;
  icon?: string;
}

interface RecentActivityTimelineProps {
  userId: string;
}

export function RecentActivityTimeline({ userId }: RecentActivityTimelineProps) {
  const { data: applications } = useQuery({
    queryKey: ['/api/applications', userId],
    enabled: !!userId,
  });

  const { data: badges } = useQuery({
    queryKey: [`/api/badges/${userId}`],
    enabled: !!userId,
  });

  // Combine and sort activities
  const activities: Activity[] = [
    ...(applications?.slice(0, 5).map((app: any) => ({
      id: app.id,
      type: 'application' as const,
      title: app.submissionMethod === 'email' ? 'Email Application Sent' : 'Application Submitted',
      description: `Applied to ${app.job?.title || 'a position'}${app.job?.company ? ` at ${app.job.company}` : ''}`,
      timestamp: new Date(app.appliedAt),
      icon: app.submissionMethod === 'email' ? 'mail' : 'file',
    })) || []),
    ...(badges?.slice(0, 3).map((badge: any) => ({
      id: badge.id,
      type: 'badge' as const,
      title: 'Achievement Unlocked!',
      description: badge.title,
      timestamp: new Date(badge.earnedAt),
      icon: 'award',
    })) || []),
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 8);

  const getIcon = (activity: Activity) => {
    if (activity.icon === 'mail') return <Mail className="w-4 h-4" />;
    if (activity.icon === 'file') return <FileText className="w-4 h-4" />;
    if (activity.icon === 'award') return <Award className="w-4 h-4" />;
    return <CheckCircle className="w-4 h-4" />;
  };

  const getIconColor = (activity: Activity) => {
    if (activity.type === 'badge') return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400';
    if (activity.icon === 'mail') return 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400';
    return 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400';
  };

  if (activities.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Recent Activity
        </h3>
        <div className="text-center py-8 text-muted-foreground">
          <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No recent activity yet</p>
          <p className="text-sm">Start swiping on jobs to see your activity here!</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5" />
        Recent Activity
      </h3>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={activity.id} className="flex gap-3">
            <div className="relative">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getIconColor(activity)}`}>
                {getIcon(activity)}
              </div>
              {index < activities.length - 1 && (
                <div className="absolute left-1/2 top-8 w-px h-8 bg-border -translate-x-1/2" />
              )}
            </div>
            <div className="flex-1 pb-4">
              <p className="font-medium text-sm">{activity.title}</p>
              <p className="text-sm text-muted-foreground">{activity.description}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
