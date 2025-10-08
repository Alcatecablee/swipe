import { useState } from "react";
import { Shield, FileText, Lock, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { POPIA_NOTICE } from "@shared/sa-constants";

interface POPIAConsentProps {
  onConsent: (consented: boolean) => void;
  required?: boolean;
}

export function POPIAConsent({ onConsent, required = false }: POPIAConsentProps) {
  const [consented, setConsented] = useState(false);

  const handleConsentChange = (checked: boolean) => {
    setConsented(checked);
    onConsent(checked);
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          POPIA Data Protection Notice
        </CardTitle>
        <CardDescription>
          Protection of Personal Information Act (POPIA) Compliance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground space-y-2">
          <p>{POPIA_NOTICE}</p>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
            <Eye className="h-4 w-4 mt-0.5 text-primary" />
            <div className="text-sm">
              <p className="font-medium">What we collect:</p>
              <ul className="list-disc list-inside mt-1 text-muted-foreground">
                <li>Personal details (name, email, phone)</li>
                <li>Professional information (skills, experience, education)</li>
                <li>Job preferences and application history</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
            <Lock className="h-4 w-4 mt-0.5 text-primary" />
            <div className="text-sm">
              <p className="font-medium">How we protect your data:</p>
              <ul className="list-disc list-inside mt-1 text-muted-foreground">
                <li>Encrypted storage and transmission</li>
                <li>Row-level security policies</li>
                <li>No third-party sharing without consent</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="popia-consent"
            checked={consented}
            onCheckedChange={handleConsentChange}
            data-testid="checkbox-popia-consent"
          />
          <label
            htmlFor="popia-consent"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            I consent to the processing of my personal information as described
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="w-full" data-testid="button-view-full-policy">
              <FileText className="h-4 w-4 mr-2" />
              View Full Privacy Policy
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Privacy Policy & POPIA Compliance</DialogTitle>
              <DialogDescription>
                Full details on how we collect, use, and protect your personal information
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4 text-sm">
                <section>
                  <h3 className="font-semibold mb-2">1. Information We Collect</h3>
                  <p className="text-muted-foreground">
                    We collect information you provide during registration, profile creation, and job applications, including:
                    personal details, professional experience, educational background, skills, and job preferences.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold mb-2">2. How We Use Your Information</h3>
                  <p className="text-muted-foreground">
                    Your data is used to match you with suitable job opportunities, improve our AI-powered recommendations,
                    and communicate application updates. We do not sell your data to third parties.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold mb-2">3. Data Security</h3>
                  <p className="text-muted-foreground">
                    We implement industry-standard security measures including encryption, secure authentication,
                    and Row-Level Security (RLS) to protect your personal information.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold mb-2">4. Your Rights Under POPIA</h3>
                  <p className="text-muted-foreground mb-2">
                    Under the Protection of Personal Information Act (POPIA), you have the right to:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Access your personal information</li>
                    <li>Correct inaccurate information</li>
                    <li>Request deletion of your data</li>
                    <li>Object to processing</li>
                    <li>Withdraw consent at any time</li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-semibold mb-2">5. Data Retention</h3>
                  <p className="text-muted-foreground">
                    We retain your information for as long as your account is active or as needed to provide services.
                    You may request deletion at any time through your account settings.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold mb-2">6. Contact Information</h3>
                  <p className="text-muted-foreground">
                    For privacy concerns or to exercise your POPIA rights, contact our Information Officer at
                    privacy@swipejob.co.za
                  </p>
                </section>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
