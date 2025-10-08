import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Sparkles, Check, ArrowRight } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";

type OnboardingStep = "welcome" | "resume" | "preferences" | "complete";

interface ParsedResume {
  name?: string;
  email?: string;
  phone?: string;
  skills?: string[];
  experience?: string[];
  education?: string;
  summary?: string;
}

export default function OnboardingPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<OnboardingStep>("welcome");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [parsedData, setParsedData] = useState<ParsedResume>({});
  const [preferences, setPreferences] = useState({
    preferredJobTitle: "",
    preferredSalary: "",
    preferredWorkType: "remote",
    location: "",
  });

  const parseResumeMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await apiRequest("/api/parse-resume", "POST", {
        resumeText: text,
      });
      return response as ParsedResume;
    },
    onSuccess: (data) => {
      setParsedData(data);
      toast({
        title: "Resume parsed successfully!",
        description: "We've extracted your information. Please review and edit if needed.",
      });
      setStep("preferences");
    },
    onError: () => {
      toast({
        title: "Parsing failed",
        description: "We'll use the text as-is. You can edit your profile later.",
        variant: "destructive",
      });
      setStep("preferences");
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/profile", "PATCH", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      setStep("complete");
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Please try again or skip for now.",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setResumeFile(file);
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (file.type.startsWith("image/")) {
        toast({
          title: "Image uploaded",
          description: "Image resume parsing is not yet implemented. Please paste your resume text below.",
        });
      } else {
        setResumeText(text);
      }
    };
    reader.readAsText(file);
  };

  const handleParseResume = () => {
    if (!resumeText.trim()) {
      toast({
        title: "No resume text",
        description: "Please upload a resume or paste the text",
        variant: "destructive",
      });
      return;
    }
    parseResumeMutation.mutate(resumeText);
  };

  const handleCompleteOnboarding = () => {
    const profileData = {
      userId: user?.id,
      name: parsedData.name || user?.email?.split("@")[0],
      phone: parsedData.phone,
      skills: parsedData.skills || [],
      education: parsedData.education,
      resumeText,
      resumeFileName: resumeFile?.name,
      resumeUploadedAt: new Date().toISOString(),
      ...preferences,
    };

    updateProfileMutation.mutate(profileData);
  };

  const renderWelcomeStep = () => (
    <Card className="max-w-2xl mx-auto" data-testid="card-onboarding-welcome">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl" data-testid="text-welcome-title">Welcome to SwipeJob!</CardTitle>
        <CardDescription data-testid="text-welcome-description">
          Let's set up your Sorce Passport in 2-5 minutes. We'll help you land your dream job faster.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              1
            </div>
            <div>
              <h3 className="font-semibold">Upload Your Resume</h3>
              <p className="text-sm text-muted-foreground">
                We'll extract your skills, experience, and education automatically
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              2
            </div>
            <div>
              <h3 className="font-semibold">Set Your Preferences</h3>
              <p className="text-sm text-muted-foreground">
                Tell us what kind of job you're looking for
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              3
            </div>
            <div>
              <h3 className="font-semibold">Start Swiping!</h3>
              <p className="text-sm text-muted-foreground">
                Swipe right to auto-apply with AI-generated cover letters
              </p>
            </div>
          </div>
        </div>
        <Button 
          onClick={() => setStep("resume")} 
          className="w-full" 
          size="lg"
          data-testid="button-get-started"
        >
          Get Started <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );

  const renderResumeStep = () => (
    <Card className="max-w-2xl mx-auto" data-testid="card-onboarding-resume">
      <CardHeader>
        <CardTitle data-testid="text-resume-title">Upload Your Resume</CardTitle>
        <CardDescription data-testid="text-resume-description">
          Upload a PDF or image, or paste your resume text below
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors">
            <input
              type="file"
              id="resume-upload"
              className="hidden"
              accept=".pdf,image/*"
              onChange={handleFileUpload}
              data-testid="input-resume-file"
            />
            <label htmlFor="resume-upload" className="cursor-pointer">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              {resumeFile ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium" data-testid="text-uploaded-filename">{resumeFile.name}</p>
                  <Badge variant="secondary" data-testid="badge-file-uploaded">
                    <Check className="mr-1 h-3 w-3" /> Uploaded
                  </Badge>
                </div>
              ) : (
                <>
                  <p className="text-sm font-medium">Click to upload</p>
                  <p className="text-xs text-muted-foreground">PDF or image (max 5MB)</p>
                </>
              )}
            </label>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or paste text</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="resume-text">Resume Text</Label>
            <Textarea
              id="resume-text"
              placeholder="Paste your resume text here..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              rows={10}
              data-testid="input-resume-text"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={() => setStep("welcome")} 
            variant="outline"
            data-testid="button-back-welcome"
          >
            Back
          </Button>
          <Button 
            onClick={handleParseResume} 
            className="flex-1" 
            disabled={!resumeText.trim() && !resumeFile}
            data-testid="button-parse-resume"
          >
            {parseResumeMutation.isPending ? (
              <>Parsing...</>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Parse Resume
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderPreferencesStep = () => (
    <Card className="max-w-2xl mx-auto" data-testid="card-onboarding-preferences">
      <CardHeader>
        <CardTitle data-testid="text-preferences-title">Set Your Job Preferences</CardTitle>
        <CardDescription data-testid="text-preferences-description">
          Help us find the perfect jobs for you
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {parsedData.name && (
            <div className="space-y-2">
              <Label>Parsed Information</Label>
              <div className="rounded-lg border p-4 space-y-2 bg-muted/50">
                {parsedData.name && <p className="text-sm" data-testid="text-parsed-name"><strong>Name:</strong> {parsedData.name}</p>}
                {parsedData.email && <p className="text-sm" data-testid="text-parsed-email"><strong>Email:</strong> {parsedData.email}</p>}
                {parsedData.phone && <p className="text-sm" data-testid="text-parsed-phone"><strong>Phone:</strong> {parsedData.phone}</p>}
                {parsedData.skills && parsedData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    <strong className="text-sm">Skills:</strong>
                    {parsedData.skills.map((skill, i) => (
                      <Badge key={i} variant="secondary" data-testid={`badge-skill-${i}`}>{skill}</Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="job-title">Preferred Job Title</Label>
            <Input
              id="job-title"
              placeholder="e.g., Software Engineer"
              value={preferences.preferredJobTitle}
              onChange={(e) => setPreferences({ ...preferences, preferredJobTitle: e.target.value })}
              data-testid="input-job-title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="salary">Salary Expectation</Label>
            <Input
              id="salary"
              placeholder="e.g., R30,000 - R50,000"
              value={preferences.preferredSalary}
              onChange={(e) => setPreferences({ ...preferences, preferredSalary: e.target.value })}
              data-testid="input-salary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="work-type">Work Type</Label>
            <Select 
              value={preferences.preferredWorkType} 
              onValueChange={(value) => setPreferences({ ...preferences, preferredWorkType: value })}
            >
              <SelectTrigger data-testid="select-work-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="remote" data-testid="select-item-remote">Remote</SelectItem>
                <SelectItem value="hybrid" data-testid="select-item-hybrid">Hybrid</SelectItem>
                <SelectItem value="onsite" data-testid="select-item-onsite">On-site</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Preferred Location</Label>
            <Input
              id="location"
              placeholder="e.g., Johannesburg, Cape Town"
              value={preferences.location}
              onChange={(e) => setPreferences({ ...preferences, location: e.target.value })}
              data-testid="input-location"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={() => setStep("resume")} 
            variant="outline"
            data-testid="button-back-resume"
          >
            Back
          </Button>
          <Button 
            onClick={handleCompleteOnboarding} 
            className="flex-1"
            disabled={updateProfileMutation.isPending}
            data-testid="button-complete-onboarding"
          >
            {updateProfileMutation.isPending ? "Saving..." : "Complete Setup"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderCompleteStep = () => (
    <Card className="max-w-2xl mx-auto" data-testid="card-onboarding-complete">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
          <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <CardTitle className="text-2xl" data-testid="text-complete-title">You're All Set!</CardTitle>
        <CardDescription data-testid="text-complete-description">
          Your Sorce Passport is ready. Start swiping to find your next opportunity!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg border p-4 space-y-2 bg-muted/50">
          <h3 className="font-semibold">What's Next?</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 mt-0.5 text-primary" />
              <span>Swipe through personalized job matches</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 mt-0.5 text-primary" />
              <span>AI auto-applies with tailored cover letters</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 mt-0.5 text-primary" />
              <span>Track applications in your dashboard</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 mt-0.5 text-primary" />
              <span>Get 50 free swipes daily (invite friends for more!)</span>
            </li>
          </ul>
        </div>

        <Button 
          onClick={() => setLocation("/app")} 
          className="w-full" 
          size="lg"
          data-testid="button-start-swiping"
        >
          Start Swiping! <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <div className="w-full max-w-4xl">
        {step === "welcome" && renderWelcomeStep()}
        {step === "resume" && renderResumeStep()}
        {step === "preferences" && renderPreferencesStep()}
        {step === "complete" && renderCompleteStep()}
      </div>
    </div>
  );
}
