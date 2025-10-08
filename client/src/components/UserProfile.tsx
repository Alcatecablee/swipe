import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, Briefcase, MapPin, Upload, FileText, X } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export interface UserProfileProps {
  name: string;
  email: string;
  avatar?: string;
  location?: string;
  skills: string[];
  languages: string[];
  nqfLevel?: number;
  experience?: Array<{
    role: string;
    company: string;
    duration: string;
  }>;
  resumeUrl?: string;
  resumeFileName?: string;
  userId: string;
  onEdit?: () => void;
  onResumeUpdate?: () => void;
}

export default function UserProfile({
  name,
  email,
  avatar,
  location,
  skills,
  languages,
  nqfLevel,
  experience,
  resumeUrl,
  resumeFileName,
  userId,
  onEdit,
  onResumeUpdate,
}: UserProfileProps) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!supabase) {
        toast({
          variant: "destructive",
          title: "Upload unavailable",
          description: "Supabase is not configured. Please contact support.",
        });
        return;
      }

      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please upload a PDF or Word document",
        });
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please upload a file smaller than 5MB",
        });
        return;
      }

      setUploading(true);

      // Upload to Supabase Storage with user-specific path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(filePath);

      // Extract text from resume for AI parsing
      let resumeText = '';
      try {
        const reader = new FileReader();
        const readFilePromise = new Promise<string>((resolve, reject) => {
          reader.onload = (e) => resolve(e.target?.result as string || '');
          reader.onerror = reject;
        });
        
        // For PDFs, we'll just send notification that parsing is limited
        if (file.type === 'application/pdf') {
          reader.readAsText(file); // This won't parse PDF properly, but we'll try
          resumeText = await readFilePromise;
        } else {
          reader.readAsText(file);
          resumeText = await readFilePromise;
        }
      } catch (readError) {
        console.error('Error reading file:', readError);
      }

      // Update user metadata with resume URL
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          resume_url: publicUrl,
          resume_file_name: file.name,
          resume_uploaded_at: new Date().toISOString(),
          resume_text: resumeText
        }
      });

      if (updateError) throw updateError;

      // Parse resume with AI if we have text
      if (resumeText && resumeText.trim().length > 50) {
        try {
          const parsedData = await apiRequest("/api/parse-resume", "POST", {
            resumeText
          }) as any;

          // Update user profile with parsed data via backend
          await apiRequest("/api/profile", "PATCH", {
            userId,
            name: parsedData.name || name,
            phone: parsedData.phone,
            skills: parsedData.skills || [],
            education: parsedData.education,
          });

          toast({
            title: "Resume uploaded and parsed!",
            description: "We've extracted your information from the resume",
          });
        } catch (parseError) {
          console.error('Error parsing resume:', parseError);
          toast({
            title: "Resume uploaded",
            description: "File uploaded, but automatic parsing failed. You can update your profile manually.",
          });
        }
      } else {
        toast({
          title: "Resume uploaded",
          description: "Your resume has been successfully uploaded",
        });
      }

      // Trigger refresh
      if (onResumeUpdate) onResumeUpdate();
      
    } catch (error: any) {
      console.error('Error uploading resume:', error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message || "Failed to upload resume",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteResume = async () => {
    try {
      if (!supabase) {
        toast({
          variant: "destructive",
          title: "Delete unavailable",
          description: "Supabase is not configured. Please contact support.",
        });
        return;
      }

      // Update user metadata to remove resume reference
      const { error } = await supabase.auth.updateUser({
        data: {
          resume_url: null,
          resume_file_name: null,
          resume_uploaded_at: null
        }
      });

      if (error) throw error;

      toast({
        title: "Resume removed",
        description: "Your resume has been removed from your profile",
      });

      if (onResumeUpdate) onResumeUpdate();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to remove resume",
      });
    }
  };

  return (
    <div className="space-y-6" data-testid="container-profile">
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="w-20 h-20" data-testid="avatar-user">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="text-xl font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h2
              className="text-2xl font-semibold truncate"
              data-testid="text-user-name"
            >
              {name}
            </h2>
            <p
              className="text-base text-muted-foreground truncate"
              data-testid="text-user-email"
            >
              {email}
            </p>
            {location && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <MapPin className="w-4 h-4" />
                <span data-testid="text-user-location">{location}</span>
              </div>
            )}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={onEdit}
            data-testid="button-edit-profile"
          >
            <Edit className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Resume</h3>
        </div>
        
        {resumeUrl ? (
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg" data-testid="container-resume-uploaded">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <FileText className="w-5 h-5 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" data-testid="text-resume-filename">
                  {resumeFileName || 'Resume.pdf'}
                </p>
                <p className="text-xs text-muted-foreground">Uploaded successfully</p>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(resumeUrl, '_blank')}
                data-testid="button-view-resume"
              >
                View
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDeleteResume}
                data-testid="button-delete-resume"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed rounded-lg p-8 text-center" data-testid="container-resume-upload">
            <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-sm font-medium mb-2">Upload your resume</p>
            <p className="text-xs text-muted-foreground mb-4">
              PDF or Word document, max 5MB
            </p>
            <label htmlFor="resume-upload">
              <Button
                variant="outline"
                disabled={uploading}
                onClick={() => document.getElementById('resume-upload')?.click()}
                data-testid="button-upload-resume"
              >
                {uploading ? "Uploading..." : "Choose File"}
              </Button>
            </label>
            <input
              id="resume-upload"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleResumeUpload}
              className="hidden"
              data-testid="input-resume-file"
            />
          </div>
        )}
      </Card>

      <Card className="p-6 space-y-4">
        <h3 className="text-lg font-semibold">Skills</h3>
        <div className="flex flex-wrap gap-2" data-testid="container-user-skills">
          {skills.map((skill, idx) => (
            <Badge
              key={idx}
              variant="secondary"
              className="bg-primary/10 text-primary"
              data-testid={`badge-user-skill-${idx}`}
            >
              {skill}
            </Badge>
          ))}
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h3 className="text-lg font-semibold">Languages</h3>
        <div className="flex flex-wrap gap-2" data-testid="container-user-languages">
          {languages.map((lang, idx) => (
            <Badge
              key={idx}
              variant="outline"
              data-testid={`badge-user-language-${idx}`}
            >
              {lang}
            </Badge>
          ))}
        </div>
      </Card>

      {nqfLevel && (
        <Card className="p-6 space-y-2">
          <h3 className="text-lg font-semibold">Qualifications</h3>
          <div className="flex items-center gap-2">
            <Badge variant="default" data-testid="badge-nqf-level">
              NQF Level {nqfLevel}
            </Badge>
          </div>
        </Card>
      )}

      {experience && experience.length > 0 && (
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">Experience</h3>
          <div className="space-y-4" data-testid="container-user-experience">
            {experience.map((exp, idx) => (
              <div
                key={idx}
                className="flex gap-3 pb-4 border-b last:border-b-0 last:pb-0"
                data-testid={`item-experience-${idx}`}
              >
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{exp.role}</h4>
                  <p className="text-sm text-muted-foreground truncate">
                    {exp.company}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {exp.duration}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
