import { ArrowLeft, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import UserProfile from "@/components/UserProfile";
import ThemeToggle from "@/components/ThemeToggle";
import { ProfileCompletionWidget } from "@/components/ProfileCompletionWidget";
import { useToast } from "@/hooks/use-toast";

interface UserProfileData {
  id: string;
  email: string;
  name: string | null;
  location: string | null;
  nqf_level: number | null;
  skills: string[] | null;
  languages: string[] | null;
  resume_url: string | null;
  resume_file_name: string | null;
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

  const { data: profile, isLoading, error } = useQuery<UserProfileData>({
    queryKey: ['profile', user?.id],
    enabled: !!user?.id && !!supabase,
    queryFn: async () => {
      if (!supabase) throw new Error('Supabase not configured');

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user!.id)
        .single();

      if (userError) {
        console.error('Error fetching user profile:', userError);
        throw userError;
      }

      const { data: experience, error: expError } = await supabase
        .from('user_experience')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (expError) {
        console.error('Error fetching user experience:', expError);
        throw expError;
      }

      // Get resume data from user metadata
      const resumeUrl = user?.user_metadata?.resume_url || null;
      const resumeFileName = user?.user_metadata?.resume_file_name || null;

      return { 
        ...userData, 
        experience,
        resume_url: resumeUrl,
        resume_file_name: resumeFileName
      };
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

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 p-4">
          <h2 className="text-2xl font-semibold text-destructive">Error Loading Profile</h2>
          <p className="text-muted-foreground">
            We couldn't load your profile. This may be because your account setup is incomplete.
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => window.location.reload()} data-testid="button-retry">
              Retry
            </Button>
            <Button variant="outline" onClick={handleSignOut} data-testid="button-signout-error">
              Sign Out
            </Button>
          </div>
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
        <div className="max-w-3xl mx-auto space-y-6">
          {profile && (
            <ProfileCompletionWidget userId={profile.id} />
          )}
          
          {profile ? (
            <UserProfile
              userId={profile.id}
              name={profile.name || "User"}
              email={profile.email}
              location={profile.location || "Not specified"}
              skills={profile.skills || []}
              languages={profile.languages || []}
              nqfLevel={profile.nqf_level || undefined}
              experience={profile.experience || []}
              resumeUrl={profile.resume_url || undefined}
              resumeFileName={profile.resume_file_name || undefined}
              onEdit={() => console.log("Edit profile clicked")}
              onResumeUpdate={() => queryClient.invalidateQueries({ queryKey: ['profile', user?.id] })}
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
