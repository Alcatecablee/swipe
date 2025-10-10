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
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Sparkles, Check, ArrowRight, X, Zap, Target, Rocket } from "lucide-react";
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

export default function EnhancedOnboardingPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
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

      const response = await fetch('/api/upload-resume', {
        method: 'POST',
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
        title: "Resume processed!",
        description: "AI extracted your information successfully",
      });
      setStep("preview");
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to process resume",
        variant: "destructive",
      });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
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
        description: "Please try again",
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

  const handleQuickStart = () => {
    // Skip to preferences with minimal data
    setStep("preferences");
  };

  const getStepProgress = () => {
    switch (step) {
      case "welcome": return 0;
      case "resume": return 25;
      case "preview": return 50;
      case "preferences": return 75;
      case "complete": return 100;
      default: return 0;
    }
  };

  const renderWelcomeStep = () => (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Progress */}
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">Step 1 of 4</p>
        <Progress value={getStepProgress()} className="h-2" />
      </div>

      <Card className="border-2">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-primary to-green-600 flex items-center justify-center">
            <Rocket className="h-10 w-10 text-white" />
          </div>
          <CardTitle className="text-4xl">Welcome to SwipeJob!</CardTitle>
          <CardDescription className="text-lg">
            Let's build your profile in 2-5 minutes and start applying to jobs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center space-y-3 p-6 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold">Upload Resume</h3>
              <p className="text-sm text-muted-foreground">
                AI extracts your info automatically
              </p>
            </div>

            <div className="text-center space-y-3 p-6 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
              <div className="mx-auto w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold">Set Preferences</h3>
              <p className="text-sm text-muted-foreground">
                Tell us what jobs you want
              </p>
            </div>

            <div className="text-center space-y-3 p-6 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <div className="mx-auto w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold">Start Swiping</h3>
              <p className="text-sm text-muted-foreground">
                Apply to jobs in seconds
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={() => setStep("resume")} 
              className="flex-1 h-14 text-lg bg-gradient-to-r from-primary to-green-600"
              size="lg"
            >
              <Sparkles className="mr-2 w-5 h-5" />
              Start Full Setup (2-5 min)
            </Button>
            <Button 
              onClick={handleQuickStart}
              variant="outline"
              className="flex-1 h-14 text-lg"
              size="lg"
            >
              Quick Start (30 sec)
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              You can always complete your profile later
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderResumeStep = () => (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Progress */}
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">Step 2 of 4</p>
        <Progress value={getStepProgress()} className="h-2" />
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-2xl">Upload Your Resume</CardTitle>
          <CardDescription className="text-base">
            Our AI will extract your skills, experience, and education
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer
              ${isDragging 
                ? 'border-primary bg-primary/10 scale-[1.02]' 
                : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-accent'
              }
            `}
          >
            <input
              type="file"
              id="resume-upload"
              className="hidden"
              accept="application/pdf,image/jpeg,image/png,image/jpg"
              onChange={handleFileInput}
            />
            <label htmlFor="resume-upload" className="cursor-pointer">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-xl mb-2">
                {isDragging ? 'Drop your resume here' : 'Drag & drop your resume'}
              </h3>
              <p className="text-muted-foreground mb-4">
                or click to browse • PDF or Image • Max 5MB
              </p>
              {uploadResumeMutation.isPending && (
                <Badge className="bg-primary/20 text-primary">
                  <Sparkles className="w-3 h-3 mr-1 animate-pulse" />
                  AI Processing...
                </Badge>
              )}
            </label>
          </div>

          {resumeFile && !uploadResumeMutation.isPending && (
            <div className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <FileText className="h-10 w-10 text-green-600 dark:text-green-400" />
              <div className="flex-1">
                <p className="font-medium">{resumeFile.name}</p>
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
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setStep("welcome")}
            >
              Back
            </Button>
            <Button
              onClick={() => setStep("preferences")}
              className="flex-1"
              variant="ghost"
            >
              Skip for now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPreviewStep = () => (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Progress */}
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">Step 3 of 4</p>
        <Progress value={getStepProgress()} className="h-2" />
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-2xl">Review Your Information</CardTitle>
          <CardDescription className="text-base">
            AI extracted this from your resume. Edit anything that needs updating.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="preview-name">Full Name</Label>
              <Input
                id="preview-name"
                value={parsedData.name || ''}
                onChange={(e) => handleUpdateParsedData('name', e.target.value)}
                placeholder="Your full name"
                className="h-12"
              />
            </div>

            <div>
              <Label htmlFor="preview-phone">Phone Number</Label>
              <Input
                id="preview-phone"
                value={parsedData.phone || ''}
                onChange={(e) => handleUpdateParsedData('phone', e.target.value)}
                placeholder="+27 XX XXX XXXX"
                className="h-12"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="preview-skills">Skills</Label>
            <Input
              id="preview-skills"
              value={parsedData.skills?.join(', ') || ''}
              onChange={(e) => handleUpdateParsedData('skills', e.target.value.split(',').map(s => s.trim()))}
              placeholder="JavaScript, React, Node.js, Python"
              className="h-12"
            />
            <p className="text-xs text-muted-foreground mt-1">Separate with commas</p>
          </div>

          <div>
            <Label htmlFor="preview-education">Education</Label>
            <Input
              id="preview-education"
              value={parsedData.education || ''}
              onChange={(e) => handleUpdateParsedData('education', e.target.value)}
              placeholder="Bachelor's in Computer Science"
              className="h-12"
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
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setStep("resume")}
            >
              Back
            </Button>
            <Button
              onClick={() => setStep("preferences")}
              className="flex-1 h-12 bg-gradient-to-r from-primary to-green-600"
            >
              Continue
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPreferencesStep = () => (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Progress */}
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">Step 4 of 4</p>
        <Progress value={getStepProgress()} className="h-2" />
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-2xl">Job Preferences</CardTitle>
          <CardDescription className="text-base">
            Tell us what you're looking for so we can match you with the right jobs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="job-title">Preferred Job Title</Label>
              <Input
                id="job-title"
                value={preferences.preferredJobTitle}
                onChange={(e) => setPreferences({ ...preferences, preferredJobTitle: e.target.value })}
                placeholder="Software Engineer"
                className="h-12"
              />
            </div>

            <div>
              <Label htmlFor="salary">Expected Salary</Label>
              <Input
                id="salary"
                value={preferences.preferredSalary}
                onChange={(e) => setPreferences({ ...preferences, preferredSalary: e.target.value })}
                placeholder="R30,000 - R50,000"
                className="h-12"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="work-type">Work Type</Label>
              <Select
                value={preferences.preferredWorkType}
                onValueChange={(value) => setPreferences({ ...preferences, preferredWorkType: value })}
              >
                <SelectTrigger id="work-type" className="h-12">
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
                placeholder="Johannesburg"
                className="h-12"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setStep(resumeFile ? "preview" : "resume")}
            >
              Back
            </Button>
            <Button
              onClick={handleCompleteOnboarding}
              className="flex-1 h-14 text-lg bg-gradient-to-r from-primary to-green-600"
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? "Saving..." : "Complete Setup"}
              <Check className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="max-w-3xl mx-auto space-y-8">
      <Card className="border-2 text-center">
        <CardHeader className="space-y-6 pb-8">
          <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
            <Check className="h-12 w-12 text-white" />
          </div>
          <CardTitle className="text-4xl">You're All Set!</CardTitle>
          <CardDescription className="text-lg">
            Your profile is complete. Let's find your dream job!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                {parsedData.name && parsedData.skills && parsedData.skills.length > 0 ? "85%" : "60%"}
              </p>
              <p className="text-sm text-muted-foreground">Profile Complete</p>
            </div>

            <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">50</p>
              <p className="text-sm text-muted-foreground">Free Swipes Today</p>
            </div>

            <div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <p className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">90%</p>
              <p className="text-sm text-muted-foreground">Jobs Covered</p>
            </div>
          </div>

          <div className="space-y-4">
            <Button
              onClick={() => setLocation("/swipe")}
              size="lg"
              className="w-full h-16 text-xl bg-gradient-to-r from-primary to-green-600"
            >
              <Zap className="mr-2 w-6 h-6" />
              Start Swiping Jobs
              <ArrowRight className="ml-2 w-6 h-6" />
            </Button>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setLocation("/extension-sync")}
                className="flex-1 h-12"
              >
                Install Extension
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation("/profile")}
                className="flex-1 h-12"
              >
                Complete Profile
              </Button>
            </div>
          </div>

          <div className="pt-6 border-t">
            <p className="text-sm text-muted-foreground">
              Pro tip: Install our browser extension to auto-fill 80% of job applications
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {step === "welcome" && renderWelcomeStep()}
        {step === "resume" && renderResumeStep()}
        {step === "preview" && renderPreviewStep()}
        {step === "preferences" && renderPreferencesStep()}
        {step === "complete" && renderCompleteStep()}
      </div>
    </div>
  );
}
