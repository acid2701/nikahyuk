"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  fetchNotificationsAction,
  markNotificationReadAction,
  markAllNotificationsReadAction,
  UserNotificationItem,
} from "@/actions/notification-actions";
import {
  Bell,
  CheckCheck,
  UserPlus,
  DollarSign,
  Users,
  Clock,
  ShieldAlert,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export interface NotificationBellProps {
  weddingId?: string;
}

export function NotificationBell({ weddingId }: NotificationBellProps) {
  const [notifications, setNotifications] = React.useState<UserNotificationItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const loadNotifications = React.useCallback(async () => {
    try {
      const data = await fetchNotificationsAction(weddingId);
      setNotifications(data);
    } catch {
      // fallback silent
    }
  }, [weddingId]);

  React.useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  async function handleMarkRead(id: string, actionUrl?: string | null) {
    try {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      await markNotificationReadAction(id, weddingId);
      if (actionUrl) {
        router.push(actionUrl);
      }
    } catch {
      // fallback
    }
  }

  async function handleMarkAllRead() {
    setLoading(true);
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      await markAllNotificationsReadAction(weddingId);
      toast({
        title: "Notifikasi Dibaca",
        description: "Seluruh notifikasi telah ditandai sebagai dibaca.",
        variant: "success",
      });
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  }

  function getNotificationIcon(type: UserNotificationItem["type"]) {
    switch (type) {
      case "invite":
        return <UserPlus className="h-4 w-4 text-blue-500 shrink-0" />;
      case "payment":
        return <DollarSign className="h-4 w-4 text-amber-500 shrink-0" />;
      case "rsvp":
        return <Users className="h-4 w-4 text-emerald-500 shrink-0" />;
      case "rundown":
        return <Clock className="h-4 w-4 text-purple-500 shrink-0" />;
      default:
        return <ShieldAlert className="h-4 w-4 text-primary shrink-0" />;
    }
  }

  function formatTimeAgo(dateString: string) {
    const diffMs = new Date().getTime() - new Date(dateString).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} mnt lalu`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} jam lalu`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} hari lalu`;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 text-foreground hover:bg-accent rounded-full cursor-pointer"
          aria-label="Pemberitahuan Notifikasi"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 sm:w-96 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-3 pb-2">
          <div className="flex items-center gap-2">
            <span className="font-sans font-bold text-sm text-foreground">
              Notifikasi
            </span>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                {unreadCount} Baru
              </Badge>
            )}
          </div>

          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-[11px] h-7 text-primary hover:underline px-2 gap-1 cursor-pointer"
              onClick={handleMarkAllRead}
              disabled={loading}
            >
              <CheckCheck className="h-3 w-3" /> Tandai Dibaca
            </Button>
          )}
        </div>

        <DropdownMenuSeparator />

        <div className="divide-y divide-border/60">
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <DropdownMenuItem
                key={n.id}
                onClick={() => handleMarkRead(n.id, n.action_url)}
                className={`p-3 flex items-start gap-3 cursor-pointer transition-colors ${
                  !n.is_read ? "bg-accent/40 font-medium" : "opacity-80"
                }`}
              >
                <div className="mt-0.5">{getNotificationIcon(n.type)}</div>
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-semibold text-foreground truncate">
                      {n.title}
                    </span>
                    <span className="text-[9px] text-muted-foreground shrink-0">
                      {formatTimeAgo(n.created_at)}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-tight line-clamp-2">
                    {n.message}
                  </p>
                </div>
                {!n.is_read && (
                  <span className="h-2 w-2 rounded-full bg-primary shrink-0 self-center" />
                )}
              </DropdownMenuItem>
            ))
          ) : (
            <div className="p-6 text-center text-xs text-muted-foreground space-y-1">
              <Bell className="h-6 w-6 text-muted-foreground/50 mx-auto" />
              <p>Belum ada notifikasi baru.</p>
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
