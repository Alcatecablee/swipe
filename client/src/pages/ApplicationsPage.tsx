import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import ApplicationCard from "@/components/ApplicationCard";
import ThemeToggle from "@/components/ThemeToggle";

const MOCK_APPLICATIONS = [
  {
    id: "1",
    jobTitle: "Frontend Developer",
    company: "Shoprite Digital",
    status: "reviewing" as const,
    appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: "2",
    jobTitle: "Junior Data Analyst",
    company: "Discovery Limited",
    status: "interview" as const,
    appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: "3",
    jobTitle: "Customer Service Representative",
    company: "MTN Group",
    status: "pending" as const,
    appliedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
  {
    id: "4",
    jobTitle: "Sales Associate",
    company: "Takealot",
    status: "accepted" as const,
    appliedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: "5",
    jobTitle: "Software Engineer",
    company: "Tech Startup",
    status: "rejected" as const,
    appliedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
];

export default function ApplicationsPage() {
  const [, setLocation] = useLocation();

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
          {MOCK_APPLICATIONS.map((application) => (
            <ApplicationCard key={application.id} {...application} />
          ))}
        </div>
      </main>
    </div>
  );
}
