import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Zap, TrendingUp, Mail, Chrome, CheckCircle2, ArrowRight } from "lucide-react";

export default function EnhancedSignupPage() {
  const [, setLocation] = useLocation();
  const { signUp } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signUp(email, password, name);
      toast({
        title: "Welcome to SwipeJob!",
        description: "Let's set up your profile in 2 minutes",
      });
      // Redirect to onboarding instead of /app
      setLocation("/onboarding");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Signup failed",
        description: error.message || "Could not create account",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Value Proposition */}
        <div className="hidden lg:block space-y-8">
          <div>
            <h1 className="text-5xl font-bold mb-4">
              Land Your Dream Job
              <span className="block text-primary mt-2">10x Faster</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              The AI-powered job platform built for South Africa
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Instant Email Applications</h3>
                <p className="text-muted-foreground">
                  30-40% of jobs get auto-applied via email. Zero clicks needed.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                <Chrome className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Auto-Fill Forms</h3>
                <p className="text-muted-foreground">
                  Browser extension fills 80% of job applications automatically
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">AI Cover Letters</h3>
                <p className="text-muted-foreground">
                  Personalized cover letters generated in seconds
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Smart Matching</h3>
                <p className="text-muted-foreground">
                  Swipe through jobs matched to your skills and experience
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-8 pt-6 border-t">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">90%+</p>
              <p className="text-sm text-muted-foreground">Jobs Covered</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">10 mins</p>
              <p className="text-sm text-muted-foreground">Saved per App</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">FREE</p>
              <p className="text-sm text-muted-foreground">50 swipes/day</p>
            </div>
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <Card className="border-2">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-green-600 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl text-center">Join SwipeJob</CardTitle>
            <CardDescription className="text-center text-base">
              Create your free account and start applying in minutes
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSignup}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-12"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-lg bg-gradient-to-r from-primary to-green-600 hover:from-primary/90 hover:to-green-600/90"
                disabled={loading}
              >
                {loading ? "Creating your account..." : "Create Free Account"}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>

              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>50 free swipes daily</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>Cancel anytime</span>
                </div>
              </div>

              <div className="text-center pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="text-primary hover:underline font-medium"
                    onClick={() => setLocation("/login")}
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </CardContent>
          </form>
        </Card>

        {/* Mobile Value Props */}
        <div className="lg:hidden space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">90%+</p>
              <p className="text-xs text-muted-foreground">Coverage</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">10 min</p>
              <p className="text-xs text-muted-foreground">Saved</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">FREE</p>
              <p className="text-xs text-muted-foreground">50/day</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
