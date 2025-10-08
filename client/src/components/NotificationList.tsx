import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Bell, Briefcase, Award, AlertCircle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Notification } from "@shared/schema";

interface NotificationListProps {
  notifications: Notification[];
  userId: string;
  onNotificationClick?: () => void;
}

const notificationIcons: Record<string, React.ReactNode> = {
  application_status: <Briefcase className="h-5 w-5" />,
  badge_earned: <Award className="h-5 w-5" />,
  profile_viewed: <Bell className="h-5 w-5" />,
  interview_invite: <AlertCircle className="h-5 w-5" />,
  follow_up_reminder: <Clock className="h-5 w-5" />,
};

export function NotificationList({ notifications, userId, onNotificationClick }: NotificationListProps) {
  const [, setLocation] = useLocation();

  // Mark notification as read mutation
  const markReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      return await apiRequest("PATCH", `/api/notifications/${notificationId}/read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications", userId] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count", userId] });
    },
  });

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read if not already read
    if (!notification.isRead) {
      markReadMutation.mutate(notification.id);
    }

    // Navigate to action URL if provided
    if (notification.actionUrl) {
      setLocation(notification.actionUrl);
    }

    // Call the parent callback to close the popover
    onNotificationClick?.();
  };

  return (
    <div className="divide-y">
      {notifications.map((notification) => (
        <button
          key={notification.id}
          onClick={() => handleNotificationClick(notification)}
          className={cn(
            "w-full text-left p-4 hover:bg-accent transition-colors flex gap-3",
            !notification.isRead && "bg-primary/5"
          )}
          data-testid={`notification-${notification.id}`}
        >
          <div className={cn(
            "flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center",
            notification.type === "badge_earned" && "bg-yellow-100 text-yellow-600",
            notification.type === "application_status" && "bg-blue-100 text-blue-600",
            notification.type === "interview_invite" && "bg-green-100 text-green-600",
            notification.type === "follow_up_reminder" && "bg-orange-100 text-orange-600",
            notification.type === "profile_viewed" && "bg-purple-100 text-purple-600"
          )}>
            {notificationIcons[notification.type] || <Bell className="h-5 w-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className={cn(
                "text-sm font-medium truncate",
                !notification.isRead && "font-semibold"
              )}>
                {notification.title}
              </p>
              {!notification.isRead && (
                <div className="flex-shrink-0 h-2 w-2 rounded-full bg-primary" data-testid="badge-unread" />
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {notification.message}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
