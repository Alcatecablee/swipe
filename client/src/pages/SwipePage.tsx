import { useState } from "react";
import JobCard from "@/components/JobCard";
import FilterDrawer from "@/components/FilterDrawer";
import ThemeToggle from "@/components/ThemeToggle";
import { User, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

const MOCK_JOBS = [
  {
    id: "1",
    title: "Frontend Developer",
    company: "Shoprite Digital",
    salary: "R25,000 - R35,000",
    location: "Cape Town, Western Cape",
    skills: ["React", "TypeScript", "Tailwind CSS", "Node.js", "Git"],
    description:
      "Join our dynamic team building the next generation of e-commerce solutions for South Africa. We're looking for a passionate frontend developer with experience in modern web technologies.",
  },
  {
    id: "2",
    title: "Customer Service Representative",
    company: "MTN Group",
    salary: "R12,000 - R18,000",
    location: "Johannesburg, Gauteng",
    skills: ["Communication", "Customer Service", "Problem Solving", "English", "Zulu"],
    description:
      "Provide exceptional customer support to MTN clients. Handle inquiries, resolve issues, and ensure customer satisfaction in a fast-paced call center environment.",
  },
  {
    id: "3",
    title: "Junior Data Analyst",
    company: "Discovery Limited",
    salary: "R20,000 - R28,000",
    location: "Sandton, Johannesburg",
    skills: ["Excel", "SQL", "Python", "Data Visualization", "Statistics"],
    description:
      "Analyze data to support business decisions in the insurance and healthcare sector. Work with large datasets to identify trends and provide actionable insights.",
  },
  {
    id: "4",
    title: "Sales Associate",
    company: "Takealot",
    salary: "R8,000 - R12,000 + Commission",
    location: "Durban, KwaZulu-Natal",
    skills: ["Sales", "Customer Service", "Communication", "Time Management"],
    description:
      "Drive sales growth by engaging with customers, processing orders, and maintaining excellent service standards at South Africa's leading online retailer.",
  },
  {
    id: "5",
    title: "Solar Installation Technician",
    company: "GreenTech Solutions",
    salary: "R15,000 - R22,000",
    location: "Pretoria, Gauteng",
    skills: ["Electrical Work", "Solar Energy", "Installation", "Safety Protocols"],
    description:
      "Install and maintain solar panel systems for residential and commercial clients. Join the renewable energy revolution in South Africa.",
  },
];

export default function SwipePage() {
  const [, setLocation] = useLocation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<
    "left" | "right" | null
  >(null);

  const currentJob = MOCK_JOBS[currentIndex];

  const handleSwipe = (direction: "left" | "right") => {
    setSwipeDirection(direction);
    setTimeout(() => {
      setSwipeDirection(null);
      if (currentIndex < MOCK_JOBS.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCurrentIndex(0);
      }
    }, 300);
  };

  const handleSkip = () => {
    console.log("Skipped job:", currentJob.id);
    handleSwipe("left");
  };

  const handleApply = () => {
    console.log("Applied to job:", currentJob.id);
    handleSwipe("right");
  };

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
        {currentIndex + 1} of {MOCK_JOBS.length} jobs
      </div>
    </div>
  );
}
