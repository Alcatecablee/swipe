import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export interface ApplicationCardProps {
  id: string;
  jobTitle: string;
  company: string;
  companyLogo?: string;
  status: "pending" | "reviewing" | "interview" | "rejected" | "accepted";
  appliedAt: Date;
}

const STATUS_CONFIG = {
  pending: { label: "Pending", variant: "secondary" as const },
  reviewing: { label: "Under Review", variant: "default" as const },
  interview: { label: "Interview", variant: "default" as const },
  rejected: { label: "Not Selected", variant: "destructive" as const },
  accepted: { label: "Accepted", variant: "default" as const },
};

export default function ApplicationCard({
  jobTitle,
  company,
  companyLogo,
  status,
  appliedAt,
}: ApplicationCardProps) {
  const statusConfig = STATUS_CONFIG[status];

  return (
    <Card
      className="h-32 p-4 flex items-center gap-4 hover:shadow-lg transition-shadow hover-elevate"
      data-testid="card-application"
    >
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

      <div className="flex-1 min-w-0 space-y-1">
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

      <Badge variant={statusConfig.variant} data-testid="badge-application-status">
        {statusConfig.label}
      </Badge>
    </Card>
  );
}
