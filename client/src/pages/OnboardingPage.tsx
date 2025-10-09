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
import { Upload, FileText, Sparkles, Check, ArrowRight, X, Edit } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";

type OnboardingStep = "welcome" | "resume" | "preview" | "preferences" | "complete";

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
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<OnboardingStep>("welcome");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [parsedData, setParsedData] = useState<ParsedResume>({});
  const [isDragging, setIsDragging] = useState(false);
  const [preferences, setPreferences] = useState({
    preferredJobTitle: "",
    preferredSalary: "",
    preferredWorkType: "remote",
    location: "",
  });

  const uploadResumeMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('userId', user?.id || '');

      // Get auth token from session
      const headers: HeadersInit = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch('/api/upload-resume', {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload resume');
      }

      return await response.json();
    },
    onSuccess: (data) => {
      setResumeText(data.resumeText);
      setParsedData(data.parsedData);
      if (data.resumeUrl) {
        setResumeUrl(data.resumeUrl);
      }
      toast({
        title: "Resume processed successfully!",
        description: "We've extracted your information. Please review and edit if needed.",
      });
      setStep("preview");
    },
    onError: (error: any) => {
      console.error("Upload error details:", error);
      const errorMessage = error?.message || error?.error_description || "Failed to process resume. Please try again.";
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      // Get auth token from session
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      return await response.json();
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or image file (JPG, PNG)",
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

    if (!user || !session) {
      toast({
        title: "Authentication required",
        description: "Please log in to upload your resume.",
        variant: "destructive",
      });
      return;
    }

    setResumeFile(file);
    uploadResumeMutation.mutate(file);
  };

  const handleUpdateParsedData = (field: keyof ParsedResume, value: any) => {
    setParsedData(prev => ({ ...prev, [field]: value }));
  };

  const handleCompleteOnboarding = () => {
    const profileData = {
      userId: user?.id,
      name: parsedData.name || user?.email?.split("@")[0],
      phone: parsedData.phone,
      skills: parsedData.skills || [],
      education: parsedData.education,
      resumeText,
      resumeUrl: resumeUrl || undefined,
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
                Swipe through jobs and apply with one tap
              </p>
            </div>
          </div>
        </div>

        <Button 
          onClick={() => setStep("resume")} 
          className="w-full" 
          size="lg"
          data-testid="button-start-onboarding"
        >
          Get started in minutes
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );

  const renderResumeStep = () => (
    <Card className="max-w-2xl mx-auto" data-testid="card-onboarding-resume">
      <CardHeader>
        <CardTitle data-testid="text-resume-title">Upload Your Resume</CardTitle>
        <CardDescription data-testid="text-resume-description">
          Upload your resume (PDF or image) and we'll extract your information using AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer
            ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-accent'}
          `}
          data-testid="dropzone-resume"
        >
          <input
            type="file"
            id="resume-upload"
            className="hidden"
            accept="application/pdf,image/jpeg,image/png,image/jpg"
            onChange={handleFileInput}
            data-testid="input-resume-file"
          />
          <label htmlFor="resume-upload" className="cursor-pointer">
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">
              {isDragging ? 'Drop your resume here' : 'Drag & drop your resume'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              or click to browse (PDF or Image, max 5MB)
            </p>
            {uploadResumeMutation.isPending && (
              <Badge variant="secondary" data-testid="badge-processing">
                Processing...
              </Badge>
            )}
          </label>
        </div>

        {resumeFile && !uploadResumeMutation.isPending && (
          <div className="flex items-center gap-3 p-4 bg-accent rounded-lg" data-testid="file-preview">
            <FileText className="h-8 w-8 text-primary" />
            <div className="flex-1">
              <p className="font-medium" data-testid="text-filename">{resumeFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setResumeFile(null);
                setResumeText("");
                setParsedData({});
              }}
              data-testid="button-remove-file"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setStep("welcome")}
            data-testid="button-back-to-welcome"
          >
            Back
          </Button>
          <Button
            onClick={() => setStep("preferences")}
            className="flex-1"
            variant="ghost"
            data-testid="button-skip-resume"
          >
            Skip for now
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderPreviewStep = () => (
    <Card className="max-w-2xl mx-auto" data-testid="card-onboarding-preview">
      <CardHeader>
        <CardTitle data-testid="text-preview-title">Review Your Information</CardTitle>
        <CardDescription data-testid="text-preview-description">
          We've extracted the following information. Please review and edit as needed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="preview-name">Full Name</Label>
            <Input
              id="preview-name"
              value={parsedData.name || ''}
              onChange={(e) => handleUpdateParsedData('name', e.target.value)}
              placeholder="Your full name"
              data-testid="input-preview-name"
            />
          </div>

          <div>
            <Label htmlFor="preview-email">Email</Label>
            <Input
              id="preview-email"
              value={parsedData.email || user?.email || ''}
              onChange={(e) => handleUpdateParsedData('email', e.target.value)}
              placeholder="your.email@example.com"
              data-testid="input-preview-email"
            />
          </div>

          <div>
            <Label htmlFor="preview-phone">Phone Number</Label>
            <Input
              id="preview-phone"
              value={parsedData.phone || ''}
              onChange={(e) => handleUpdateParsedData('phone', e.target.value)}
              placeholder="+27 XX XXX XXXX"
              data-testid="input-preview-phone"
            />
          </div>

          <div>
            <Label htmlFor="preview-skills">Skills</Label>
            <Input
              id="preview-skills"
              value={parsedData.skills?.join(', ') || ''}
              onChange={(e) => handleUpdateParsedData('skills', e.target.value.split(',').map(s => s.trim()))}
              placeholder="JavaScript, React, Node.js"
              data-testid="input-preview-skills"
            />
            <p className="text-xs text-muted-foreground mt-1">Separate skills with commas</p>
          </div>

          <div>
            <Label htmlFor="preview-education">Education</Label>
            <Input
              id="preview-education"
              value={parsedData.education || ''}
              onChange={(e) => handleUpdateParsedData('education', e.target.value)}
              placeholder="Bachelor's Degree in Computer Science"
              data-testid="input-preview-education"
            />
          </div>

          <div>
            <Label htmlFor="preview-summary">Professional Summary</Label>
            <Textarea
              id="preview-summary"
              value={parsedData.summary || ''}
              onChange={(e) => handleUpdateParsedData('summary', e.target.value)}
              placeholder="Brief professional summary..."
              rows={3}
              data-testid="textarea-preview-summary"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setStep("resume")}
            data-testid="button-back-to-resume"
          >
            Back
          </Button>
          <Button
            onClick={() => setStep("preferences")}
            className="flex-1"
            data-testid="button-continue-to-preferences"
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderPreferencesStep = () => (
    <Card className="max-w-2xl mx-auto" data-testid="card-onboarding-preferences">
      <CardHeader>
        <CardTitle data-testid="text-preferences-title">Job Preferences</CardTitle>
        <CardDescription data-testid="text-preferences-description">
          Tell us what kind of job you're looking for
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="job-title">Preferred Job Title</Label>
            <Input
              id="job-title"
              value={preferences.preferredJobTitle}
              onChange={(e) => setPreferences({ ...preferences, preferredJobTitle: e.target.value })}
              placeholder="e.g., Software Engineer, Data Analyst"
              data-testid="input-job-title"
            />
          </div>

          <div>
            <Label htmlFor="salary">Expected Salary</Label>
            <Input
              id="salary"
              value={preferences.preferredSalary}
              onChange={(e) => setPreferences({ ...preferences, preferredSalary: e.target.value })}
              placeholder="e.g., R30,000 - R50,000 per month"
              data-testid="input-salary"
            />
          </div>

          <div>
            <Label htmlFor="work-type">Work Type</Label>
            <Select
              value={preferences.preferredWorkType}
              onValueChange={(value) => setPreferences({ ...preferences, preferredWorkType: value })}
            >
              <SelectTrigger id="work-type" data-testid="select-work-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="remote">Remote</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
                <SelectItem value="onsite">On-site</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="location">Preferred Location</Label>
            <Input
              id="location"
              value={preferences.location}
              onChange={(e) => setPreferences({ ...preferences, location: e.target.value })}
              placeholder="e.g., Johannesburg, Cape Town"
              data-testid="input-location"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setStep(resumeFile ? "preview" : "resume")}
            data-testid="button-back-to-preview"
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
            <Check className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderCompleteStep = () => (
    <Card className="max-w-2xl mx-auto text-center" data-testid="card-onboarding-complete">
      <CardHeader>
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
          <Check className="h-8 w-8 text-green-500" />
        </div>
        <CardTitle className="text-2xl" data-testid="text-complete-title">All Set!</CardTitle>
        <CardDescription data-testid="text-complete-description">
          Your Sorce Passport is ready. Let's find your dream job!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-accent p-6 rounded-lg space-y-2">
          <p className="text-sm text-muted-foreground">Profile Completion</p>
          <p className="text-3xl font-bold text-primary">
            {parsedData.name && parsedData.skills && parsedData.skills.length > 0 ? "85%" : "60%"}
          </p>
          <p className="text-xs text-muted-foreground">
            Great start! You can always update your profile later
          </p>
        </div>

        <Button
          onClick={() => setLocation("/swipe")}
          size="lg"
          className="w-full"
          data-testid="button-start-swiping"
        >
          Start Swiping Jobs
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          onClick={() => setLocation("/profile")}
          data-testid="button-go-to-profile"
        >
          Complete my profile first
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {step === "welcome" && renderWelcomeStep()}
        {step === "resume" && renderResumeStep()}
        {step === "preview" && renderPreviewStep()}
        {step === "preferences" && renderPreferencesStep()}
        {step === "complete" && renderCompleteStep()}
      </div>
    </div>
  );
}
