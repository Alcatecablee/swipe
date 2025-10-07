import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import ApplicationCard from "@/components/ApplicationCard";
import ThemeToggle from "@/components/ThemeToggle";

interface ApplicationWithJob {
  id: string;
  user_id: string;
  job_id: string;
  status: string;
  applied_at: string;
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

  const { data: applications, isLoading } = useQuery<ApplicationWithJob[]>({
    queryKey: ['/api/applications', { userId: user?.id }],
    enabled: !!user?.id,
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
          {applications && applications.length > 0 ? (
            applications.map((application) => (
              <ApplicationCard
                key={application.id}
                id={application.id}
                jobTitle={application.jobs.title}
                company={application.jobs.company}
                status={application.status as any}
                appliedAt={new Date(application.applied_at)}
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
