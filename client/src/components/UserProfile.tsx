import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, Briefcase, MapPin } from "lucide-react";

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
  onEdit?: () => void;
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
  onEdit,
}: UserProfileProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

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
