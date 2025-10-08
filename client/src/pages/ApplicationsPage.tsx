import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import ApplicationCard from "@/components/ApplicationCard";
import ThemeToggle from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface ApplicationWithJob {
  id: string;
  user_id: string;
  job_id: string;
  status: string;
  applied_at: string;
  ai_processed: boolean;
  cover_letter?: string;
  application_url?: string;
  jobs: {
    id: string;
    title: string;
    company: string;
    salary: string;
    location: string;
  };
}

export default function ApplicationsPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const autoProcessMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/batch-process-applications", { userId: user!.id });
      return await res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      
      if (data.processed === 0) {
        toast({
          title: "No Applications to Process",
          description: data.message || "All applications have already been processed.",
        });
      } else if (data.failed > 0) {
        toast({
          title: "Partially Completed",
          description: `Processed ${data.processed} applications successfully. ${data.failed} failed.`,
          variant: "default",
        });
      } else {
        toast({
          title: "AI Processing Complete!",
          description: `Successfully processed ${data.processed} applications with AI-generated cover letters.`,
        });
      }
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Processing Failed",
        description: error.message || "Failed to process applications. Please try again.",
      });
    },
  });

  const { data: applications, isLoading, error } = useQuery<ApplicationWithJob[]>({
    queryKey: ['applications', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          jobs:job_id (
            id,
            title,
            company,
            salary,
            location
          )
        `)
        .eq('user_id', user!.id)
        .order('applied_at', { ascending: false });

      if (error) {
        console.error('Error fetching applications:', error);
        throw error;
      }
      return data as ApplicationWithJob[];
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading applications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 p-4">
          <h2 className="text-2xl font-semibold text-destructive">Error Loading Applications</h2>
          <p className="text-muted-foreground">
            We couldn't load your applications. Please try again later.
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
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/")}
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold">My Applications</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {applications && applications.length > 0 && (
            <div className="bg-card border rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    AI Auto-Apply
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Let AI generate professional cover letters and application links for pending applications
                  </p>
                </div>
                <Button
                  onClick={() => autoProcessMutation.mutate()}
                  disabled={autoProcessMutation.isPending}
                  data-testid="button-ai-process"
                >
                  {autoProcessMutation.isPending ? "Processing..." : "Process Applications"}
                </Button>
              </div>
            </div>
          )}
          
          {applications && applications.length > 0 ? (
            applications.map((application) => (
              <ApplicationCard
                key={application.id}
                id={application.id}
                jobTitle={application.jobs.title}
                company={application.jobs.company}
                status={application.status as any}
                appliedAt={new Date(application.applied_at)}
                coverLetter={application.cover_letter}
                applicationUrl={application.application_url}
                aiProcessed={application.ai_processed}
              />
            ))
          ) : (
            <div className="text-center py-12 space-y-4">
              <p className="text-xl text-muted-foreground">No applications yet</p>
              <p className="text-sm text-muted-foreground">
                Start swiping on jobs to submit your applications
              </p>
              <Button onClick={() => setLocation("/")} data-testid="button-start-swiping">
                Start Swiping
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
