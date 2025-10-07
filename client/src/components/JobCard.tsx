import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Briefcase, DollarSign, X, Check } from "lucide-react";
import { useState } from "react";

export interface JobCardProps {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  salary: string;
  location: string;
  skills: string[];
  description: string;
  onSkip?: () => void;
  onApply?: () => void;
  swipeDirection?: "left" | "right" | null;
}

export default function JobCard({
  title,
  company,
  companyLogo,
  salary,
  location,
  skills,
  description,
  onSkip,
  onApply,
  swipeDirection,
}: JobCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      className={`w-full max-w-sm mx-auto min-h-[600px] flex flex-col transition-all duration-300 ${
        swipeDirection === "left"
          ? "opacity-0 -rotate-12 -translate-x-96"
          : swipeDirection === "right"
          ? "opacity-0 rotate-12 translate-x-96"
          : "opacity-100"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid="card-job"
    >
      {swipeDirection && (
        <div
          className={`absolute inset-0 flex items-center justify-center rounded-2xl z-10 ${
            swipeDirection === "right"
              ? "bg-primary/20"
              : "bg-destructive/20"
          }`}
        >
          {swipeDirection === "right" ? (
            <Check className="w-32 h-32 text-primary" strokeWidth={3} />
          ) : (
            <X className="w-32 h-32 text-destructive" strokeWidth={3} />
          )}
        </div>
      )}

      <div className="p-6 flex flex-col gap-4 flex-1">
        <div className="flex items-start gap-4">
          <div
            className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0"
            data-testid="img-company-logo"
          >
            {companyLogo ? (
              <img
                src={companyLogo}
                alt={company}
                className="w-full h-full rounded-lg object-cover"
              />
            ) : (
              <Briefcase className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2
              className="text-2xl font-semibold text-primary truncate"
              data-testid="text-job-title"
            >
              {title}
            </h2>
            <p
              className="text-base text-muted-foreground truncate"
              data-testid="text-company-name"
            >
              {company}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div
            className="flex items-center gap-2 text-lg font-semibold text-chart-2"
            data-testid="text-salary"
          >
            <DollarSign className="w-5 h-5" />
            {salary}
          </div>
          <div
            className="flex items-center gap-2 text-base text-foreground"
            data-testid="text-location"
          >
            <MapPin className="w-4 h-4" />
            {location}
          </div>
        </div>

        <div className="flex flex-wrap gap-2" data-testid="container-skills">
          {skills.slice(0, 6).map((skill, idx) => (
            <Badge
              key={idx}
              variant="secondary"
              className="bg-primary/10 text-primary hover:bg-primary/20"
              data-testid={`badge-skill-${idx}`}
            >
              {skill}
            </Badge>
          ))}
        </div>

        <div className="flex-1 overflow-hidden">
          <p
            className="text-base text-foreground line-clamp-3"
            data-testid="text-description"
          >
            {description}
          </p>
        </div>

        <div className="flex gap-3 pt-4 mt-auto">
          <Button
            variant="outline"
            className="flex-1"
            size="lg"
            onClick={onSkip}
            data-testid="button-skip"
          >
            <X className="w-5 h-5 mr-2" />
            Skip
          </Button>
          <Button
            variant="default"
            className="flex-1"
            size="lg"
            onClick={onApply}
            data-testid="button-apply"
          >
            <Check className="w-5 h-5 mr-2" />
            Apply
          </Button>
        </div>
      </div>
    </Card>
  );
}
