import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  User, 
  MapPin, 
  Briefcase, 
  Award, 
  Languages, 
  FileText,
  Sparkles 
} from "lucide-react";

interface UserProfile {
  name?: string;
  email: string;
  location?: string;
  skills?: string[];
  languages?: string[];
  nqfLevel?: number;
  experience?: Array<{
    role: string;
    company: string;
    duration: string;
  }>;
}

interface JobDetails {
  title: string;
  company: string;
  location: string;
  salary: string;
  description: string;
  skills: string[];
  sector?: string;
  nqfLevel?: number;
  workType?: string;
}

interface ApplicationTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userProfile: UserProfile | null;
  job: JobDetails | null;
  onConfirm: () => void;
  isProcessing?: boolean;
}

export default function ApplicationTemplateDialog({
  open,
  onOpenChange,
  userProfile,
  job,
  onConfirm,
  isProcessing = false,
}: ApplicationTemplateDialogProps) {
  if (!userProfile || !job) return null;

  const matchedSkills = job.skills.filter(skill => 
    userProfile.skills?.some(userSkill => 
      userSkill.toLowerCase().includes(skill.toLowerCase()) ||
      skill.toLowerCase().includes(userSkill.toLowerCase())
    )
  );

  const skillMatchPercentage = job.skills.length > 0 
    ? Math.round((matchedSkills.length / job.skills.length) * 100)
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]" data-testid="dialog-application-template">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Application Preview
          </DialogTitle>
          <DialogDescription>
            Review your pre-filled application for {job.title} at {job.company}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4">
            {/* Skill Match Indicator */}
            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Skill Match</p>
                  <p className="text-xs text-muted-foreground">
                    {matchedSkills.length} of {job.skills.length} required skills
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {skillMatchPercentage}%
                  </div>
                </div>
              </div>
              {matchedSkills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {matchedSkills.map((skill, idx) => (
                    <Badge key={idx} variant="default" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              )}
            </Card>

            {/* Your Information */}
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Your Information
              </h3>
              <Card className="p-4 space-y-3">
                <div>
                  <p className="text-sm font-medium">{userProfile.name || "Name not set"}</p>
                  <p className="text-xs text-muted-foreground">{userProfile.email}</p>
                </div>
                
                {userProfile.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{userProfile.location}</span>
                  </div>
                )}

                {userProfile.nqfLevel && (
                  <div className="flex items-center gap-2 text-sm">
                    <Award className="w-4 h-4 text-muted-foreground" />
                    <span>NQF Level {userProfile.nqfLevel}</span>
                  </div>
                )}

                {userProfile.languages && userProfile.languages.length > 0 && (
                  <div className="flex items-start gap-2 text-sm">
                    <Languages className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div className="flex flex-wrap gap-1">
                      {userProfile.languages.map((lang, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {userProfile.skills && userProfile.skills.length > 0 && (
                  <div className="flex items-start gap-2 text-sm">
                    <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div className="flex flex-wrap gap-1">
                      {userProfile.skills.slice(0, 5).map((skill, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {userProfile.skills.length > 5 && (
                        <Badge variant="secondary" className="text-xs">
                          +{userProfile.skills.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* Experience */}
            {userProfile.experience && userProfile.experience.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Your Experience
                </h3>
                <Card className="p-4 space-y-3">
                  {userProfile.experience.slice(0, 3).map((exp, idx) => (
                    <div key={idx} className="text-sm">
                      <p className="font-medium">{exp.role}</p>
                      <p className="text-xs text-muted-foreground">
                        {exp.company} • {exp.duration}
                      </p>
                    </div>
                  ))}
                  {userProfile.experience.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{userProfile.experience.length - 3} more positions
                    </p>
                  )}
                </Card>
              </div>
            )}

            <Separator />

            {/* AI Cover Letter Note */}
            <Card className="p-4 bg-muted/50">
              <div className="flex gap-3">
                <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium mb-1">AI-Generated Cover Letter</p>
                  <p className="text-xs text-muted-foreground">
                    After you confirm, our AI will generate a personalized cover letter 
                    highlighting your {matchedSkills.length > 0 ? "matching skills" : "relevant experience"} and 
                    how they align with this {job.title} position.
                  </p>
                </div>
              </div>
            </Card>

            {/* Warning if low match */}
            {skillMatchPercentage < 50 && (
              <Card className="p-4 bg-amber-500/10 border-amber-500/20">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  ⚠️ Your skill match is below 50%. Consider adding relevant skills to your profile 
                  or applying to positions that better match your experience.
                </p>
              </Card>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
            data-testid="button-cancel-application"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isProcessing}
            data-testid="button-confirm-application"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Confirm & Apply
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
