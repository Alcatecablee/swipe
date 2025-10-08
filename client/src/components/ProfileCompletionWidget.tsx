import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Target, CheckCircle2, Circle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useEffect } from "react";

interface ProfileCompletionWidgetProps {
  userId: string;
  compact?: boolean;
}

interface ProfileCompletionData {
  score: number;
  analytics: {
    profileCompletionScore: number;
  };
}

export function ProfileCompletionWidget({ userId, compact = false }: ProfileCompletionWidgetProps) {
  const { data: profileCompletion, isLoading } = useQuery<ProfileCompletionData>({
    queryKey: ['/api/profile-completion', userId],
    enabled: !!userId,
  });

  const calculateMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/profile-completion/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to calculate profile completion');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile-completion', userId] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics', userId] });
    },
  });

  // Calculate score on mount if not already calculated
  useEffect(() => {
    if (userId && !isLoading && !profileCompletion) {
      calculateMutation.mutate();
    }
  }, [userId, isLoading, profileCompletion]);

  const score = profileCompletion?.score || 0;

  const completionItems = [
    { field: 'name', label: 'Full Name', points: 10 },
    { field: 'email', label: 'Email Address', points: 10 },
    { field: 'phone', label: 'Phone Number', points: 5 },
    { field: 'location', label: 'Location', points: 10 },
    { field: 'skills', label: 'Skills (at least 1)', points: 15 },
    { field: 'languages', label: 'Languages', points: 10 },
    { field: 'education', label: 'Education', points: 10 },
    { field: 'resumeUrl', label: 'Resume Upload', points: 20 },
    { field: 'preferredJobTitle', label: 'Preferred Job Title', points: 10 },
  ];

  if (compact) {
    return (
      <Card className="p-4" data-testid="widget-profile-completion-compact">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <span className="font-semibold">Profile Completion</span>
            </div>
            <span className="text-2xl font-bold text-primary" data-testid="text-score">
              {score}%
            </span>
          </div>
          <Progress value={score} className="h-2" data-testid="progress-score" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6" data-testid="widget-profile-completion">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Profile Completion
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Complete your profile to attract more employers
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary" data-testid="text-score-full">
              {score}%
            </div>
            <p className="text-xs text-muted-foreground">Complete</p>
          </div>
        </div>

        <Progress value={score} className="h-3" data-testid="progress-score-full" />

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            Complete these items to improve your profile:
          </h4>
          <div className="space-y-2">
            {completionItems.map((item) => {
              const isComplete = score >= item.points;
              return (
                <div
                  key={item.field}
                  className="flex items-center gap-3 text-sm"
                  data-testid={`item-${item.field}`}
                >
                  {isComplete ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className={isComplete ? "text-muted-foreground" : ""}>
                    {item.label}
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    +{item.points}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {score < 100 && (
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              {score < 50 && "Complete your basic information to get started"}
              {score >= 50 && score < 80 && "Great progress! Keep adding details"}
              {score >= 80 && score < 100 && "Almost there! Just a few more items"}
            </p>
          </div>
        )}

        {score === 100 && (
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-sm font-medium text-green-700 dark:text-green-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Profile Complete! You're ready to attract top employers.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
