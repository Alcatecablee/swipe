import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface POPIAComplianceProps {
  context: "signup" | "apply" | "resume_upload";
  companyName?: string;
}

export default function POPIACompliance({ context, companyName }: POPIAComplianceProps) {
  const getContent = () => {
    switch (context) {
      case "signup":
        return {
          title: "Privacy & Data Protection (POPIA)",
          description: `By creating an account, you consent to SwipeJob collecting and processing your personal information (name, email, CV, work history) for job matching and application purposes only. Your data is encrypted and stored securely. You have the right to access, update, or delete your information at any time. We comply with the Protection of Personal Information Act, 2013 (POPIA).`
        };
      case "apply":
        return {
          title: "Application Consent (POPIA Compliance)",
          description: `By applying, you consent to SwipeJob sharing your profile and application materials with ${companyName || "this employer"} for recruitment purposes. Your personal information will be processed according to POPIA regulations. The employer is responsible for their own data handling practices. You may withdraw consent at any time by contacting us.`
        };
      case "resume_upload":
        return {
          title: "Resume Processing Notice",
          description: `Your resume will be processed using AI to extract information (skills, experience, education). This helps us match you with relevant jobs. Your documents are encrypted and stored securely in South African data centers. You retain full ownership and can delete your resume at any time. We comply with POPIA data protection requirements.`
        };
      default:
        return {
          title: "Privacy Notice",
          description: "Your data is protected under POPIA regulations."
        };
    }
  };

  const content = getContent();

  return (
    <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800" data-testid="alert-popia-compliance">
      <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      <AlertTitle className="text-blue-800 dark:text-blue-300">{content.title}</AlertTitle>
      <AlertDescription className="text-blue-700 dark:text-blue-400 text-sm">
        {content.description}
      </AlertDescription>
    </Alert>
  );
}

export function POPIAFooter() {
  return (
    <div className="text-xs text-muted-foreground text-center py-4 border-t" data-testid="footer-popia">
      <p>
        <strong>Information Officer:</strong> SwipeJob (Pty) Ltd | 
        <strong> Email:</strong> privacy@swipejob.co.za | 
        <strong> Complaints:</strong> <a href="https://inforegulator.org.za" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
          Information Regulator SA
        </a>
      </p>
      <p className="mt-1">
        We comply with the Protection of Personal Information Act, 2013 (POPIA). 
        <a href="/privacy-policy" className="underline hover:text-foreground ml-1">Privacy Policy</a> | 
        <a href="/terms" className="underline hover:text-foreground ml-1">Terms of Service</a>
      </p>
    </div>
  );
}
