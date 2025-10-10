import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";
import {
  ArrowLeft,
  TrendingUp,
  Briefcase,
  Eye,
  Calendar,
  Award,
  Target,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { InterviewScheduler } from "@/components/InterviewScheduler";
import type { UserAnalytics } from "@shared/schema";

interface ApplicationStats {
  total: number;
  pending: number;
  reviewing: number;
  interview: number;
  accepted: number;
  rejected: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: analytics, isLoading: analyticsLoading } = useQuery<UserAnalytics>({
    queryKey: ['/api/analytics', user?.id],
    enabled: !!user?.id,
  });

  const { data: applicationStats, isLoading: statsLoading } = useQuery<ApplicationStats>({
    queryKey: ['/api/application-stats', user?.id],
    enabled: !!user?.id,
  });

  const { data: profileCompletion } = useQuery<{ score: number; analytics: UserAnalytics }>({
    queryKey: ['/api/profile-completion', user?.id],
    enabled: !!user?.id,
  });

  const completionScore = profileCompletion?.score || analytics?.profileCompletionScore || 0;

  if (analyticsLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Skeleton className="h-8 w-32" />
            <ThemeToggle />
          </div>
        </header>
        <main className="container mx-auto px-4 py-6 space-y-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </main>
      </div>
    );
  }

  const conversionRate = analytics?.applicationConversionRate || "0%";
  const totalSwipes = analytics?.totalSwipes || 0;
  const totalApplications = analytics?.totalApplications || 0;
  const profileViews = analytics?.profileViews || 0;
  const interviewsScheduled = analytics?.interviewsScheduled || 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/")}
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold">Dashboard</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Profile Completion Score */}
          <Card className="p-6" data-testid="card-profile-completion">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Profile Completion</h2>
                    <p className="text-sm text-muted-foreground">
                      Complete your profile to get better matches
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary" data-testid="text-completion-score">
                    {completionScore}%
                  </div>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
              <Progress value={completionScore} className="h-3" data-testid="progress-completion" />
              {completionScore < 100 && (
                <Button
                  variant="outline"
                  onClick={() => setLocation("/profile")}
                  className="w-full"
                  data-testid="button-complete-profile"
                >
                  Complete Your Profile
                </Button>
              )}
            </div>
          </Card>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-6" data-testid="card-total-swipes">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-blue-500/10">
                  <TrendingUp className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Swipes</p>
                  <p className="text-2xl font-bold" data-testid="text-total-swipes">{totalSwipes}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6" data-testid="card-applications">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-green-500/10">
                  <Briefcase className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Applications</p>
                  <p className="text-2xl font-bold" data-testid="text-total-applications">{totalApplications}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6" data-testid="card-profile-views">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-purple-500/10">
                  <Eye className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Profile Views</p>
                  <p className="text-2xl font-bold" data-testid="text-profile-views">{profileViews}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6" data-testid="card-interviews">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-orange-500/10">
                  <Calendar className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Interviews</p>
                  <p className="text-2xl font-bold" data-testid="text-interviews">{interviewsScheduled}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Application Status Breakdown */}
          <Card className="p-6" data-testid="card-application-status">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Application Status
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    Pending
                  </div>
                  <p className="text-2xl font-bold" data-testid="text-status-pending">
                    {applicationStats?.pending || 0}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Eye className="w-4 h-4" />
                    Reviewing
                  </div>
                  <p className="text-2xl font-bold" data-testid="text-status-reviewing">
                    {applicationStats?.reviewing || 0}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    Interview
                  </div>
                  <p className="text-2xl font-bold" data-testid="text-status-interview">
                    {applicationStats?.interview || 0}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                    <CheckCircle2 className="w-4 h-4" />
                    Accepted
                  </div>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="text-status-accepted">
                    {applicationStats?.accepted || 0}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                    <XCircle className="w-4 h-4" />
                    Rejected
                  </div>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400" data-testid="text-status-rejected">
                    {applicationStats?.rejected || 0}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Award className="w-4 h-4" />
                    Total
                  </div>
                  <p className="text-2xl font-bold" data-testid="text-status-total">
                    {applicationStats?.total || 0}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Conversion Rate & Insights */}
          <Card className="p-6" data-testid="card-insights">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Your Insights
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <span className="text-sm font-medium">Application Conversion Rate</span>
                  <span className="text-lg font-bold text-primary" data-testid="text-conversion-rate">
                    {conversionRate}
                  </span>
                </div>
                {totalSwipes > 0 && totalApplications > 0 && (
                  <p className="text-sm text-muted-foreground">
                    You're converting {conversionRate} of your swipes into applications. 
                    {parseFloat(conversionRate) < 15 && " Try swiping on more relevant jobs to improve your conversion rate."}
                    {parseFloat(conversionRate) >= 15 && parseFloat(conversionRate) < 30 && " Great work! Keep refining your job preferences."}
                    {parseFloat(conversionRate) >= 30 && " Excellent! You're finding highly relevant opportunities."}
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Interview Scheduler */}
          {user?.id && (
            <InterviewScheduler userId={user.id} />
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-24 flex flex-col gap-2"
              onClick={() => setLocation("/app")}
              data-testid="button-find-jobs"
            >
              <Briefcase className="w-6 h-6" />
              <span>Find Jobs</span>
            </Button>

            <Button
              variant="outline"
              className="h-24 flex flex-col gap-2"
              onClick={() => setLocation("/applications")}
              data-testid="button-view-applications"
            >
              <FileText className="w-6 h-6" />
              <span>View Applications</span>
            </Button>

            <Button
              variant="outline"
              className="h-24 flex flex-col gap-2"
              onClick={() => setLocation("/profile")}
              data-testid="button-edit-profile"
            >
              <Target className="w-6 h-6" />
              <span>Edit Profile</span>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
