import { Bell, BellOff, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePushNotifications } from "@/hooks/use-push-notifications";

export function NotificationButton() {
  const { isSupported, isSubscribed, permission, isLoading, subscribe, unsubscribe } =
    usePushNotifications();

  if (!isSupported || permission === "denied") return null;

  const handleClick = () => {
    if (isSubscribed) {
      unsubscribe();
    } else {
      subscribe();
    }
  };

  const label = isSubscribed ? "Disable notifications" : "Get notified of new posts";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClick}
          disabled={isLoading}
          aria-label={label}
          className="relative"
        >
          {isSubscribed ? (
            <BellOff className="h-5 w-5" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          {isSubscribed && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export function NotificationBanner() {
  const { isSupported, isSubscribed, permission, isLoading, subscribe } =
    usePushNotifications();

  if (!isSupported || isSubscribed || permission === "denied" || permission === "granted") {
    return null;
  }

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        <BellRing className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-foreground">Stay up to date</p>
        <p className="text-xs text-muted-foreground">
          Enable notifications to get alerts when new exam news is published.
        </p>
      </div>
      <Button size="sm" onClick={subscribe} disabled={isLoading} className="shrink-0">
        {isLoading ? "Enabling…" : "Enable"}
      </Button>
    </div>
  );
}
