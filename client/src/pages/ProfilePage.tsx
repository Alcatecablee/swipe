import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import UserProfile from "@/components/UserProfile";
import ThemeToggle from "@/components/ThemeToggle";

export default function ProfilePage() {
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
            <h1 className="text-2xl font-bold">My Profile</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="max-w-3xl mx-auto">
          <UserProfile
            name="Thabo Mokoena"
            email="thabo.mokoena@example.com"
            location="Johannesburg, Gauteng"
            skills={[
              "JavaScript",
              "React",
              "Node.js",
              "TypeScript",
              "Git",
              "Customer Service",
              "Communication",
              "Problem Solving",
            ]}
            languages={["English", "Zulu", "Afrikaans"]}
            nqfLevel={6}
            experience={[
              {
                role: "Junior Developer",
                company: "Tech Startup SA",
                duration: "2022 - Present",
              },
              {
                role: "IT Support Specialist",
                company: "Local Business Solutions",
                duration: "2020 - 2022",
              },
            ]}
            onEdit={() => console.log("Edit profile clicked")}
          />
        </div>
      </main>
    </div>
  );
}
