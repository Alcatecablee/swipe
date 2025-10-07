import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import JobCard from "@/components/JobCard";
import FilterDrawer from "@/components/FilterDrawer";
import ThemeToggle from "@/components/ThemeToggle";
import { User, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Job } from "@shared/schema";

export default function SwipePage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<
    "left" | "right" | null
  >(null);

  const { data: jobs, isLoading } = useQuery<Job[]>({
    queryKey: ['jobs-swipe', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      // Get already swiped job IDs
      const { data: swipes } = await supabase
        .from('swipes')
        .select('job_id')
        .eq('user_id', user!.id);

      const swipedJobIds = swipes?.map(s => s.job_id) || [];

      // Get jobs not yet swiped
      let query = supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true);

      if (swipedJobIds.length > 0) {
        query = query.not('id', 'in', `(${swipedJobIds.join(',')})`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const swipeMutation = useMutation({
    mutationFn: async ({ jobId, action }: { jobId: string; action: string }) => {
      // Insert swipe with correct snake_case column names
      const { error: swipeError } = await supabase
        .from('swipes')
        .insert({
          user_id: user!.id,
          job_id: jobId,
          action,
        });

      if (swipeError) throw swipeError;

      // If action is "apply", also create an application
      if (action === 'apply') {
        const { error: appError } = await supabase
          .from('applications')
          .insert({
            user_id: user!.id,
            job_id: jobId,
            status: 'pending',
          });

        if (appError) throw appError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs-swipe'] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
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
    try {
      await swipeMutation.mutateAsync({ jobId: currentJob.id, action: 'apply' });
      toast({
        title: "Application submitted!",
        description: `You've applied to ${currentJob.title} at ${currentJob.company}`,
      });
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">SwipeJob</h1>
          <div className="flex items-center gap-2">
            <FilterDrawer />
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
            {...currentJob}
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
    </div>
  );
}
