import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Lock } from 'lucide-react';
import { useLocation } from 'wouter';

interface BadgeShowcaseProps {
  userId: string;
}

export function BadgeShowcase({ userId }: BadgeShowcaseProps) {
  const [, setLocation] = useLocation();
  
  const { data: badges, isLoading } = useQuery({
    queryKey: [`/api/badges/${userId}`],
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  const earnedBadges = badges || [];
  const displayBadges = earnedBadges.slice(0, 6);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Award className="w-5 h-5" />
          Achievements
        </h3>
        {earnedBadges.length > 0 && (
          <Badge variant="secondary">{earnedBadges.length} earned</Badge>
        )}
      </div>

      {earnedBadges.length === 0 ? (
        <div className="text-center py-6">
          <Lock className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-sm text-muted-foreground">
            Complete actions to earn achievement badges!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {displayBadges.map((badge: any) => (
            <div
              key={badge.id}
              className="p-3 rounded-lg bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border border-yellow-200 dark:border-yellow-800 text-center group hover:scale-105 transition-transform cursor-pointer"
              title={badge.description}
            >
              <div className="text-2xl mb-1">{badge.iconName === 'award' ? '🏆' : '⭐'}</div>
              <p className="text-xs font-medium text-yellow-900 dark:text-yellow-100">
                {badge.title}
              </p>
            </div>
          ))}
        </div>
      )}

      {earnedBadges.length > 6 && (
        <button
          onClick={() => setLocation('/profile')}
          className="w-full mt-4 text-sm text-primary hover:underline"
        >
          View all {earnedBadges.length} badges →
        </button>
      )}
    </Card>
  );
}
