import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, ExternalLink, Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Job, User } from "@shared/schema";

interface AssistedApplyModalProps {
  open: boolean;
  onClose: () => void;
  job: Job;
  user: User;
  coverLetter?: string;
  applicationData?: {
    fullName: string;
    email: string;
    phone?: string;
    location?: string;
    whyInterested: string;
    keyQualifications: string[];
  };
  isGenerating: boolean;
  onGenerate: () => void;
  onConfirmApply: () => void;
}

export default function AssistedApplyModal({
  open,
  onClose,
  job,
  user,
  coverLetter,
  applicationData,
  isGenerating,
  onGenerate,
  onConfirmApply
}: AssistedApplyModalProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState<Record<string, boolean>>({});

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied({ ...copied, [field]: true });
      toast({
        title: "Copied!",
        description: `${field} copied to clipboard`,
      });
      setTimeout(() => {
        setCopied({ ...copied, [field]: false });
      }, 2000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Copy failed",
        description: "Please manually copy the text",
      });
    }
  };

  const openJobApplication = () => {
    const applicationUrl = `https://www.google.com/search?q=${encodeURIComponent(
      `${job.company} ${job.title} application South Africa`
    )}`;
    window.open(applicationUrl, '_blank');
    onConfirmApply();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="dialog-assisted-apply">
        <DialogHeader>
          <DialogTitle className="text-2xl">Assisted Application for {job.title}</DialogTitle>
          <DialogDescription>
            We've generated personalized application materials for you. Copy and paste them when you apply.
          </DialogDescription>
        </DialogHeader>

        {!coverLetter && !applicationData && !isGenerating && (
          <div className="py-8 text-center">
            <p className="text-muted-foreground mb-4">
              Generate AI-powered cover letter and application data to help you apply faster.
            </p>
            <Button onClick={onGenerate} size="lg" data-testid="button-generate-materials">
              Generate Application Materials
            </Button>
          </div>
        )}

        {isGenerating && (
          <div className="py-12 flex flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Generating personalized application materials...</p>
          </div>
        )}

        {(coverLetter || applicationData) && (
          <div className="space-y-6">
            {/* Personal Information */}
            {applicationData && (
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Full Name</Label>
                    <div className="flex gap-2">
                      <Input value={applicationData.fullName} readOnly data-testid="input-full-name" />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(applicationData.fullName, "Name")}
                        data-testid="button-copy-name"
                      >
                        {copied.Name ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <div className="flex gap-2">
                      <Input value={applicationData.email} readOnly data-testid="input-email" />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(applicationData.email, "Email")}
                        data-testid="button-copy-email"
                      >
                        {copied.Email ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  {applicationData.phone && (
                    <div>
                      <Label>Phone</Label>
                      <div className="flex gap-2">
                        <Input value={applicationData.phone} readOnly data-testid="input-phone" />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => copyToClipboard(applicationData.phone!, "Phone")}
                          data-testid="button-copy-phone"
                        >
                          {copied.Phone ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  )}
                  {applicationData.location && (
                    <div>
                      <Label>Location</Label>
                      <div className="flex gap-2">
                        <Input value={applicationData.location} readOnly data-testid="input-location" />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => copyToClipboard(applicationData.location!, "Location")}
                          data-testid="button-copy-location"
                        >
                          {copied.Location ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {applicationData.whyInterested && (
                  <div>
                    <Label>Why You're Interested</Label>
                    <div className="flex gap-2">
                      <Textarea 
                        value={applicationData.whyInterested} 
                        readOnly 
                        rows={3} 
                        className="resize-none"
                        data-testid="textarea-why-interested"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(applicationData.whyInterested, "Why Interested")}
                        data-testid="button-copy-why-interested"
                      >
                        {copied["Why Interested"] ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                )}

                {applicationData.keyQualifications && applicationData.keyQualifications.length > 0 && (
                  <div>
                    <Label>Key Qualifications</Label>
                    <div className="flex gap-2">
                      <Textarea 
                        value={applicationData.keyQualifications.join('\n• ')} 
                        readOnly 
                        rows={4}
                        className="resize-none"
                        data-testid="textarea-qualifications"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(applicationData.keyQualifications.join('\n• '), "Qualifications")}
                        data-testid="button-copy-qualifications"
                      >
                        {copied.Qualifications ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Cover Letter */}
            {coverLetter && (
              <div>
                <Label className="text-lg font-semibold">Cover Letter</Label>
                <div className="mt-2 flex gap-2">
                  <Textarea 
                    value={coverLetter} 
                    readOnly 
                    rows={12}
                    className="resize-none font-serif"
                    data-testid="textarea-cover-letter"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(coverLetter, "Cover Letter")}
                    data-testid="button-copy-cover-letter"
                  >
                    {copied["Cover Letter"] ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}

            {/* POPIA Compliance Notice */}
            <div className="bg-muted p-4 rounded-lg text-sm">
              <p className="font-medium mb-2">Privacy Notice (POPIA Compliance)</p>
              <p className="text-muted-foreground">
                By proceeding, you consent to SwipeJob sharing your application data with {job.company} for recruitment purposes only. 
                Your data will be processed in accordance with the Protection of Personal Information Act (POPIA). 
                You have the right to access, correct, or delete your information at any time.
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose} data-testid="button-cancel-apply">
            Cancel
          </Button>
          {(coverLetter || applicationData) && (
            <Button 
              onClick={openJobApplication} 
              className="gap-2"
              data-testid="button-open-application"
            >
              Open Application Page <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
