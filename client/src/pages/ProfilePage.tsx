import { ArrowLeft, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import UserProfile from "@/components/UserProfile";
import ThemeToggle from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";

interface UserProfileData {
  id: string;
  email: string;
  name: string | null;
  location: string | null;
  nqf_level: number | null;
  skills: string[] | null;
  languages: string[] | null;
  experience?: Array<{
    id: string;
    role: string;
    company: string;
    duration: string;
  }>;
}

export default function ProfilePage() {
  const [, setLocation] = useLocation();
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const { data: profile, isLoading } = useQuery<UserProfileData>({
    queryKey: ['profile', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user!.id)
        .single();

      if (userError) throw userError;

      const { data: experience, error: expError } = await supabase
        .from('user_experience')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (expError) throw expError;

      return { ...userData, experience };
    },
  });

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You've been successfully signed out.",
      });
      setLocation("/login");
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
          <p className="text-muted-foreground">Loading profile...</p>
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
            <h1 className="text-2xl font-bold">My Profile</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="outline"
              size="icon"
              onClick={handleSignOut}
              data-testid="button-signout"
              className="rounded-full"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="max-w-3xl mx-auto">
          {profile ? (
            <UserProfile
              name={profile.name || "User"}
              email={profile.email}
              location={profile.location || "Not specified"}
              skills={profile.skills || []}
              languages={profile.languages || []}
              nqfLevel={profile.nqf_level || undefined}
              experience={profile.experience || []}
              onEdit={() => console.log("Edit profile clicked")}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Profile not found</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
