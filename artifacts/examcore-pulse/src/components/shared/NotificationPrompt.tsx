import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { useLocation } from "wouter";

const DISMISSED_KEY = "ep_notif_dismissed_at";
const SNOOZE_DAYS = 7;
const SHOW_DELAY_MS = 6000;

function wasDismissedRecently(): boolean {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    if (!raw) return false;
    const ts = parseInt(raw, 10);
    const daysSince = (Date.now() - ts) / (1000 * 60 * 60 * 24);
    return daysSince < SNOOZE_DAYS;
  } catch {
    return false;
  }
}

function markDismissed() {
  try {
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
  } catch {}
}

export function NotificationPrompt() {
  const [visible, setVisible] = useState(false);
  const { isSupported, isSubscribed, permission, isLoading, subscribe } =
    usePushNotifications();
  const [location] = useLocation();

  const isAdminPage = location.startsWith("/admin");

  useEffect(() => {
    if (!isSupported) return;
    if (isSubscribed) return;
    if (permission === "denied" || permission === "granted") return;
    if (isAdminPage) return;
    if (wasDismissedRecently()) return;

    const timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, [isSupported, isSubscribed, permission, isAdminPage]);

  useEffect(() => {
    if (isSubscribed && visible) setVisible(false);
  }, [isSubscribed, visible]);

  const handleEnable = async () => {
    await subscribe();
    setVisible(false);
  };

  const handleDismiss = () => {
    markDismissed();
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[9999] w-[calc(100vw-2rem)] max-w-sm"
          role="dialog"
          aria-label="Enable push notifications"
        >
          <div className="bg-card border border-border rounded-2xl shadow-2xl shadow-black/20 p-5 relative">
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/30">
                <BookOpen className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0 pr-4">
                <p className="font-bold text-foreground text-base leading-snug">
                  Stay ahead of exam updates
                </p>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  Get instant alerts for JAMB, WAEC, NECO &amp; more — straight to your device.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <Button
                className="flex-1 gap-2 font-semibold"
                onClick={handleEnable}
                disabled={isLoading}
              >
                <Bell className="w-4 h-4" />
                {isLoading ? "Enabling…" : "Enable Notifications"}
              </Button>
              <Button
                variant="outline"
                className="shrink-0 text-muted-foreground"
                onClick={handleDismiss}
              >
                Not now
              </Button>
            </div>

            <p className="text-[11px] text-muted-foreground/60 text-center mt-3">
              You can turn this off anytime from the bell icon.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
