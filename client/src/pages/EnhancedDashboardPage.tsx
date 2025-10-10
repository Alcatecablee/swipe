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
  Target,
  FileText,
  Sparkles,
  Mail,
  MousePointer2,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { RecentActivityTimeline } from "@/components/dashboard/RecentActivityTimeline";
import { BadgeShowcase } from "@/components/dashboard/BadgeShowcase";
import { ReferralWidget } from "@/components/dashboard/ReferralWidget";
import { SwipeLimitsWidget } from "@/components/dashboard/SwipeLimitsWidget";
import { RecentApplications } from "@/components/dashboard/RecentApplications";
import { SuccessTipsCard } from "@/components/dashboard/SuccessTipsCard";
import type { UserAnalytics } from "@shared/schema";

interface ApplicationStats {
  total: number;
  pending: number;
  reviewing: number;
  interview: number;
  accepted: number;
  rejected: number;
}

export default function EnhancedDashboardPage() {
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  const conversionRate = parseFloat(analytics?.applicationConversionRate?.replace('%', '') || "0");
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
          {/* Welcome Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">
                Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
              </h2>
              <p className="text-muted-foreground mt-1">
                Here's your job search overview
              </p>
            </div>
            <Button
              onClick={() => setLocation("/app")}
              className="bg-gradient-to-r from-primary to-green-600"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Find Jobs
            </Button>
          </div>

          {/* Profile Completion - Prominent */}
          {completionScore < 100 && (
            <Card className="p-6 border-primary/50 bg-gradient-to-r from-primary/5 to-green-500/5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Target className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">Complete Your Profile</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {completionScore}% complete - Add more details to get better job matches
                  </p>
                  <Progress value={completionScore} className="h-2" />
                </div>
                <Button
                  onClick={() => setLocation("/profile")}
                  variant="default"
                >
                  Complete Profile
                </Button>
              </div>
            </Card>
          )}

          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Swipes</p>
                  <p className="text-3xl font-bold mt-2">{totalSwipes}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                  <MousePointer2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Applications</p>
                  <p className="text-3xl font-bold mt-2">{totalApplications}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Profile Views</p>
                  <p className="text-3xl font-bold mt-2">{profileViews}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                  <Eye className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Interviews</p>
                  <p className="text-3xl font-bold mt-2">{interviewsScheduled}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </Card>
          </div>

          {/* Application Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Application Breakdown
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                  <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                    {applicationStats?.pending || 0}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Pending</p>
                </div>

                <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {applicationStats?.reviewing || 0}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Reviewing</p>
                </div>

                <div className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {applicationStats?.interview || 0}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Interview</p>
                </div>

                <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {applicationStats?.accepted || 0}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Accepted</p>
                </div>

                <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                    {applicationStats?.rejected || 0}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Rejected</p>
                </div>

                <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <p className="text-3xl font-bold text-primary">
                    {applicationStats?.total || 0}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Total</p>
                </div>
              </div>

              {/* Conversion Rate */}
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Conversion Rate</span>
                  <span className="text-2xl font-bold text-primary">
                    {conversionRate.toFixed(1)}%
                  </span>
                </div>
                <Progress value={conversionRate} className="mt-2 h-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {conversionRate < 15 && "Try to be more selective with your swipes"}
                  {conversionRate >= 15 && conversionRate < 30 && "Good! You're finding relevant opportunities"}
                  {conversionRate >= 30 && "Excellent! You're highly selective and focused"}
                </p>
              </div>
            </Card>

            {/* Success Tips */}
            <SuccessTipsCard
              applicationCount={totalApplications}
              conversionRate={conversionRate}
              profileCompletionScore={completionScore}
            />
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - 2/3 width */}
            <div className="lg:col-span-2 space-y-6">
              {/* Recent Applications */}
              {user?.id && <RecentApplications userId={user.id} />}

              {/* Recent Activity */}
              {user?.id && <RecentActivityTimeline userId={user.id} />}

              {/* Email vs Manual Stats */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Application Methods
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium">Instant Email Applications</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Fast & automated
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Jobs with "Instant Apply" badge get submitted automatically via email
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">Assisted Applications</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Browser extension helps
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Forms auto-fill on Pnet, Careers24, Indeed, and 1000+ sites
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setLocation('/extension-sync')}
                  >
                    Install Browser Extension
                  </Button>
                </div>
              </Card>
            </div>

            {/* Right Column - 1/3 width */}
            <div className="space-y-6">
              {/* Swipe Limits */}
              {user?.id && <SwipeLimitsWidget userId={user.id} />}

              {/* Badges */}
              {user?.id && <BadgeShowcase userId={user.id} />}

              {/* Referral Widget */}
              {user?.id && <ReferralWidget userId={user.id} />}
            </div>
          </div>

          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2"
                onClick={() => setLocation("/app")}
              >
                <Briefcase className="w-6 h-6" />
                <span className="text-sm">Find Jobs</span>
              </Button>

              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2"
                onClick={() => setLocation("/applications")}
              >
                <FileText className="w-6 h-6" />
                <span className="text-sm">Applications</span>
              </Button>

              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2"
                onClick={() => setLocation("/profile")}
              >
                <Target className="w-6 h-6" />
                <span className="text-sm">Edit Profile</span>
              </Button>

              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2"
                onClick={() => setLocation("/extension-sync")}
              >
                <Mail className="w-6 h-6" />
                <span className="text-sm">Extension</span>
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
