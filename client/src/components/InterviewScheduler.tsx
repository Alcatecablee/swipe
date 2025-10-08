import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar, Plus, Video, Phone, MapPin, Monitor } from "lucide-react";
import { format } from "date-fns";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { InterviewSchedule } from "@shared/schema";

interface InterviewSchedulerProps {
  userId: string;
  applicationId?: string;
  jobId?: string;
}

export function InterviewScheduler({ userId, applicationId, jobId }: InterviewSchedulerProps) {
  const [open, setOpen] = useState(false);
  const [interviewType, setInterviewType] = useState<string>("video");
  const [scheduledAt, setScheduledAt] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const { toast } = useToast();

  const { data: interviews, isLoading } = useQuery<InterviewSchedule[]>({
    queryKey: ['/api/interviews', userId],
    enabled: !!userId,
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create interview');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/interviews', userId] });
      toast({
        title: "Interview scheduled",
        description: "Your interview has been added to your calendar.",
      });
      setOpen(false);
      resetForm();
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to schedule interview.",
      });
    },
  });

  const resetForm = () => {
    setInterviewType("video");
    setScheduledAt("");
    setLocation("");
    setNotes("");
  };

  const handleSubmit = () => {
    if (!scheduledAt) {
      toast({
        variant: "destructive",
        title: "Missing date/time",
        description: "Please select a date and time for the interview.",
      });
      return;
    }

    createMutation.mutate({
      userId,
      applicationId,
      jobId,
      interviewType,
      scheduledAt,
      location: location || null,
      notes: notes || null,
    });
  };

  const getInterviewIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="w-4 h-4" />;
      case "phone":
        return <Phone className="w-4 h-4" />;
      case "in_person":
        return <MapPin className="w-4 h-4" />;
      case "technical":
        return <Monitor className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const upcomingInterviews = interviews?.filter(
    (interview) => new Date(interview.scheduledAt) > new Date() && interview.status === 'scheduled'
  ) || [];

  return (
    <Card className="p-6" data-testid="card-interview-scheduler">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Upcoming Interviews
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {upcomingInterviews.length} scheduled
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" data-testid="button-add-interview">
                <Plus className="w-4 h-4 mr-2" />
                Add Interview
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="dialog-add-interview">
              <DialogHeader>
                <DialogTitle>Schedule Interview</DialogTitle>
                <DialogDescription>
                  Add an upcoming interview to your calendar
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Interview Type</Label>
                  <Select value={interviewType} onValueChange={setInterviewType}>
                    <SelectTrigger id="type" data-testid="select-interview-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">Video Call</SelectItem>
                      <SelectItem value="phone">Phone Call</SelectItem>
                      <SelectItem value="in_person">In Person</SelectItem>
                      <SelectItem value="technical">Technical Assessment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="datetime">Date & Time</Label>
                  <Input
                    id="datetime"
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    data-testid="input-interview-datetime"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location/Link</Label>
                  <Input
                    id="location"
                    placeholder="Meeting link or address"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    data-testid="input-interview-location"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Preparation notes, interviewer names, etc."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    data-testid="textarea-interview-notes"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  data-testid="button-cancel-interview"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={createMutation.isPending}
                  data-testid="button-save-interview"
                >
                  {createMutation.isPending ? "Scheduling..." : "Schedule Interview"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading interviews...</div>
        ) : upcomingInterviews.length > 0 ? (
          <div className="space-y-3">
            {upcomingInterviews.slice(0, 5).map((interview) => (
              <div
                key={interview.id}
                className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                data-testid={`interview-${interview.id}`}
              >
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  {getInterviewIcon(interview.interviewType)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium capitalize">
                    {interview.interviewType.replace('_', ' ')} Interview
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(interview.scheduledAt), "PPp")}
                  </p>
                  {interview.location && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {interview.location}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No upcoming interviews scheduled</p>
          </div>
        )}
      </div>
    </Card>
  );
}
