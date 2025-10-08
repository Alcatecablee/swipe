import { useState, useEffect } from "react";
import { Bell, BellOff } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  isSubscribedToPushNotifications,
  isPushNotificationSupported,
} from "@/lib/push-notifications";

interface NotificationSettingsProps {
  userId: string;
}

export function NotificationSettings({ userId }: NotificationSettingsProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkSupport = async () => {
      const supported = isPushNotificationSupported();
      setIsSupported(supported);

      if (supported) {
        const subscribed = await isSubscribedToPushNotifications();
        setIsSubscribed(subscribed);
      }
    };

    checkSupport();
  }, []);

  const handleTogglePushNotifications = async (enabled: boolean) => {
    setIsLoading(true);
    try {
      if (enabled) {
        const subscription = await subscribeToPushNotifications(userId);
        if (subscription) {
          setIsSubscribed(true);
          toast({
            title: "Push notifications enabled",
            description: "You'll receive push notifications for important updates.",
          });
        } else {
          setIsSubscribed(false);
          toast({
            title: "Failed to enable push notifications",
            description: "Please check your browser settings and try again.",
            variant: "destructive",
          });
        }
      } else {
        const success = await unsubscribeFromPushNotifications();
        if (success) {
          setIsSubscribed(false);
          toast({
            title: "Push notifications disabled",
            description: "You won't receive push notifications anymore.",
          });
        }
      }
    } catch (error) {
      console.error("Error toggling push notifications:", error);
      toast({
        title: "Error",
        description: "Failed to update notification settings.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Push notifications are not supported in your browser
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Push Notifications
        </CardTitle>
        <CardDescription>
          Receive real-time notifications for application updates, new badges, and more
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="push-notifications">Enable push notifications</Label>
            <p className="text-sm text-muted-foreground">
              Get notified about application status changes
            </p>
          </div>
          <Switch
            id="push-notifications"
            checked={isSubscribed}
            onCheckedChange={handleTogglePushNotifications}
            disabled={isLoading}
            data-testid="switch-push-notifications"
          />
        </div>

        {!isSubscribed && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Enable push notifications to stay updated on your job applications even when you're not on the site.
            </p>
          </div>
        )}

        {isSubscribed && (
          <Button
            variant="outline"
            onClick={() => handleTogglePushNotifications(false)}
            disabled={isLoading}
            data-testid="button-disable-notifications"
          >
            <BellOff className="h-4 w-4 mr-2" />
            Disable Notifications
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
