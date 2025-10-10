import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Zap, Crown, RefreshCw } from 'lucide-react';
import { useLocation } from 'wouter';

interface SwipeLimitsWidgetProps {
  userId: string;
}

export function SwipeLimitsWidget({ userId }: SwipeLimitsWidgetProps) {
  const [, setLocation] = useLocation();

  const { data: swipeLimits } = useQuery<{ allowed: boolean; remaining: number }>({
    queryKey: [`/api/swipe-limits/${userId}`],
    enabled: !!userId,
  });

  const { data: userProfile } = useQuery({
    queryKey: ['/api/profile', userId],
    enabled: !!userId,
  });

  const isPremium = userProfile?.isPremium || false;
  const remaining = swipeLimits?.remaining ?? 50;
  const dailyLimit = userProfile?.dailySwipeLimit || 50;
  const percentage = isPremium ? 100 : Math.round((remaining / dailyLimit) * 100);

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Daily Swipes
          </h3>
          {isPremium && (
            <div className="flex items-center gap-1 text-sm text-yellow-600 dark:text-yellow-400">
              <Crown className="w-4 h-4" />
              Premium
            </div>
          )}
        </div>

        {isPremium ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">Unlimited</p>
            <p className="text-sm text-muted-foreground mt-1">Swipe as much as you want!</p>
          </div>
        ) : (
          <>
            <div>
              <div className="flex items-end justify-between mb-2">
                <span className="text-3xl font-bold">{remaining}</span>
                <span className="text-sm text-muted-foreground">/ {dailyLimit} left</span>
              </div>
              <Progress value={percentage} className="h-2" />
            </div>

            {remaining < 10 && (
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Running low on swipes! Upgrade to Premium for unlimited swipes.
                </p>
              </div>
            )}

            {remaining === 0 && (
              <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2 mb-2">
                  <RefreshCw className="w-4 h-4 text-red-800 dark:text-red-200" />
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">
                    Out of swipes for today
                  </p>
                </div>
                <p className="text-xs text-red-700 dark:text-red-300">
                  Resets at midnight. Upgrade for unlimited swipes!
                </p>
              </div>
            )}

            <Button
              variant="default"
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700"
              onClick={() => setLocation('/premium')}
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Premium
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}
