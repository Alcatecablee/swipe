import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Clock, Sparkles, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";

export interface ApplicationCardProps {
  id: string;
  jobTitle: string;
  company: string;
  companyLogo?: string;
  status: "pending" | "reviewing" | "interview" | "rejected" | "accepted" | "auto_applied";
  appliedAt: Date;
  coverLetter?: string;
  applicationUrl?: string;
  aiProcessed?: boolean;
}

const STATUS_CONFIG = {
  pending: { label: "Pending", variant: "secondary" as const },
  reviewing: { label: "Under Review", variant: "default" as const },
  interview: { label: "Interview", variant: "default" as const },
  rejected: { label: "Not Selected", variant: "destructive" as const },
  accepted: { label: "Accepted", variant: "default" as const },
  auto_applied: { label: "AI Auto-Applied", variant: "default" as const },
};

export default function ApplicationCard({
  jobTitle,
  company,
  companyLogo,
  status,
  appliedAt,
  coverLetter,
  applicationUrl,
  aiProcessed,
}: ApplicationCardProps) {
  const statusConfig = STATUS_CONFIG[status];

  return (
    <Card
      className="p-4 hover:shadow-lg transition-shadow hover-elevate"
      data-testid="card-application"
    >
      <div className="flex items-start gap-4">
        <div
          className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center flex-shrink-0"
          data-testid="img-application-logo"
        >
          {companyLogo ? (
            <img
              src={companyLogo}
              alt={company}
              className="w-full h-full rounded-lg object-cover"
            />
          ) : (
            <Briefcase className="w-7 h-7 text-muted-foreground" />
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <h3
                className="font-semibold text-base truncate"
                data-testid="text-application-title"
              >
                {jobTitle}
              </h3>
              <p
                className="text-sm text-muted-foreground truncate"
                data-testid="text-application-company"
              >
                {company}
              </p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span data-testid="text-application-date">
                  {formatDistanceToNow(appliedAt, { addSuffix: true })}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {aiProcessed && (
                <Badge variant="outline" className="gap-1">
                  <Sparkles className="w-3 h-3" />
                  AI
                </Badge>
              )}
              <Badge variant={statusConfig.variant} data-testid="badge-application-status">
                {statusConfig.label}
              </Badge>
            </div>
          </div>
          
          {coverLetter && (
            <div className="mt-3 p-3 bg-muted/50 rounded-md">
              <p className="text-xs text-muted-foreground font-medium mb-1">AI-Generated Cover Letter:</p>
              <p className="text-sm line-clamp-3">{coverLetter}</p>
            </div>
          )}
          
          {applicationUrl && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="gap-2"
              data-testid="button-view-application"
            >
              <a href={applicationUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" />
                View Application Link
              </a>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
