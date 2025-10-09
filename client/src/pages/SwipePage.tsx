import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import JobCard from "@/components/JobCard";
import FilterDrawer from "@/components/FilterDrawer";
import ThemeToggle from "@/components/ThemeToggle";
import AssistedApplyModal from "@/components/AssistedApplyModal";
import { User, BarChart3, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Job, User as UserType } from "@shared/schema";

export default function SwipePage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<
    "left" | "right" | null
  >(null);
  const [showApplicationDialog, setShowApplicationDialog] = useState(false);
  const [coverLetter, setCoverLetter] = useState<string>("");
  const [applicationData, setApplicationData] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: userProfile } = useQuery<UserType>({
    queryKey: ['/api/profile', user?.id],
    enabled: !!user?.id,
  });

  const { data: jobs, isLoading, error: jobsError } = useQuery<Job[]>({
    queryKey: ['jobs-swipe', user?.id],
    enabled: !!user?.id && !!supabase,
    queryFn: async () => {
      if (!supabase) throw new Error("Supabase not initialized");
      
      // Get already swiped job IDs
      const { data: swipes, error: swipesError } = await supabase
        .from('swipes')
        .select('job_id')
        .eq('user_id', user!.id);

      if (swipesError) {
        console.error('Error fetching swipes:', swipesError);
        toast({
          variant: "destructive",
          title: "Error loading your swipes",
          description: "We couldn't load your previous swipes. Please refresh the page.",
        });
        throw swipesError;
      }

      const swipedJobIds = swipes?.map(s => s.job_id) || [];

      // Get jobs not yet swiped
      let query = supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true);

      if (swipedJobIds.length > 0) {
        query = query.not('id', 'in', `(${swipedJobIds.map(id => `"${id}"`).join(',')})`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching jobs:', error);
        toast({
          variant: "destructive",
          title: "Error loading jobs",
          description: "We couldn't load job listings. Please try again.",
        });
        throw error;
      }
      return data || [];
    },
  });

  // Check swipe limits
  const { data: swipeLimits, refetch: refetchLimits } = useQuery<{ allowed: boolean; remaining: number }>({
    queryKey: [`/api/swipe-limits/${user?.id}`],
    enabled: !!user?.id,
  });

  const swipeMutation = useMutation({
    mutationFn: async ({ jobId, action }: { jobId: string; action: string }) => {
      // Use backend API with limit enforcement
      const response = await apiRequest("POST", "/api/swipe", {
        jobId,
        action,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs-swipe'] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      refetchLimits(); // Update swipe limits display
    },
    onError: (error: any) => {
      if (error.message?.includes("limit reached")) {
        toast({
          variant: "destructive",
          title: "Daily limit reached!",
          description: "You've used all your free swipes for today. Come back tomorrow or upgrade to Premium for unlimited swipes!",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to swipe",
        });
      }
    },
  });

  const currentJob = jobs?.[currentIndex];

  const handleSwipe = (direction: "left" | "right") => {
    setSwipeDirection(direction);
    setTimeout(() => {
      setSwipeDirection(null);
      if (jobs && currentIndex < jobs.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCurrentIndex(0);
      }
    }, 300);
  };

  const handleSkip = async () => {
    if (!currentJob) return;
    try {
      await swipeMutation.mutateAsync({ jobId: currentJob.id, action: 'skip' });
      handleSwipe("left");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleApply = async () => {
    if (!currentJob) return;
    // Reset state and show dialog
    setCoverLetter("");
    setApplicationData(null);
    setShowApplicationDialog(true);
  };

  const handleGenerateApplicationData = async () => {
    if (!currentJob || !userProfile) return;
    
    setIsGenerating(true);
    try {
      const response = await apiRequest("POST", "/api/generate-application-data", {
        jobId: currentJob.id,
      });
      const data = await response.json();
      
      setCoverLetter(data.coverLetter);
      setApplicationData({
        fullName: userProfile.name || "",
        email: user?.email || "",
        phone: userProfile.phone || "",
        location: userProfile.location || "",
        whyInterested: data.whyInterested || "",
        keyQualifications: data.keyQualifications || [],
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Generation failed",
        description: error.message || "Failed to generate application materials",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirmApplication = async () => {
    if (!currentJob) return;
    try {
      await swipeMutation.mutateAsync({ jobId: currentJob.id, action: 'apply' });
      toast({
        title: "Application submitted!",
        description: `You've applied to ${currentJob.title} at ${currentJob.company}`,
      });
      setShowApplicationDialog(false);
      handleSwipe("right");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading jobs...</p>
        </div>
      </div>
    );
  }

  if (jobsError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 p-4">
          <h2 className="text-2xl font-semibold text-destructive">Error Loading Jobs</h2>
          <p className="text-muted-foreground">
            We couldn't load job listings. Please refresh the page or try again later.
          </p>
          <Button onClick={() => window.location.reload()} data-testid="button-retry">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-primary">SwipeJob</h1>
            {swipeLimits && (
              <Badge 
                variant={swipeLimits.remaining === 0 ? "destructive" : swipeLimits.remaining < 10 ? "secondary" : "default"}
                data-testid="badge-swipe-counter"
              >
                {swipeLimits.remaining === -1 ? (
                  "∞ Unlimited"
                ) : (
                  `${swipeLimits.remaining} swipes left`
                )}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <FilterDrawer />
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={() => setLocation("/dashboard")}
              data-testid="button-dashboard"
            >
              <LayoutDashboard className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={() => setLocation("/applications")}
              data-testid="button-applications"
            >
              <BarChart3 className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={() => setLocation("/profile")}
              data-testid="button-profile"
            >
              <User className="w-5 h-5" />
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        {currentJob ? (
          <JobCard
            id={currentJob.id}
            title={currentJob.title}
            company={currentJob.company}
            salary={currentJob.salary}
            location={currentJob.location}
            skills={currentJob.skills}
            description={currentJob.description}
            workType={currentJob.workType}
            sector={currentJob.sector}
            nqfLevel={currentJob.nqfLevel}
            onSkip={handleSkip}
            onApply={handleApply}
            swipeDirection={swipeDirection}
          />
        ) : (
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-semibold">No more jobs to show</h2>
            <p className="text-muted-foreground">
              Check back later for new opportunities
            </p>
          </div>
        )}
      </main>

      <div className="text-center py-4 text-sm text-muted-foreground">
        {jobs && jobs.length > 0 ? `${currentIndex + 1} of ${jobs.length} jobs` : 'No jobs available'}
      </div>

      {/* Assisted Apply Modal */}
      {currentJob && userProfile && (
        <AssistedApplyModal
          open={showApplicationDialog}
          onClose={() => setShowApplicationDialog(false)}
          job={currentJob}
          user={userProfile}
          coverLetter={coverLetter}
          applicationData={applicationData}
          isGenerating={isGenerating}
          onGenerate={handleGenerateApplicationData}
          onConfirmApply={handleConfirmApplication}
        />
      )}
    </div>
  );
}
