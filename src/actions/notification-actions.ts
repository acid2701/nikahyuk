"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export interface UserNotificationItem {
  id: string;
  user_id: string;
  wedding_id?: string | null;
  title: string;
  message: string;
  type: "invite" | "payment" | "rsvp" | "rundown" | "system";
  is_read: boolean;
  action_url?: string | null;
  created_at: string;
}

export async function fetchNotificationsAction(
  weddingId?: string
): Promise<UserNotificationItem[]> {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return [];

  try {
    const notifications = await prisma.userNotification.findMany({
      where: {
        userId: sessionUser.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    });

    if (notifications.length === 0) {
      return [];
    }

    return notifications.map((n) => ({
      id: n.id,
      user_id: n.userId,
      wedding_id: weddingId || null,
      title: n.title,
      message: n.message,
      type: (n.type as any) || "system",
      is_read: n.isRead,
      action_url: null,
      created_at: n.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error("Failed to fetch user notifications:", error);
    return [];
  }
}

export async function markNotificationReadAction(
  notificationId: string,
  weddingId?: string
) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return { success: false };

  try {
    await prisma.userNotification.updateMany({
      where: {
        id: notificationId,
        userId: sessionUser.userId,
      },
      data: {
        isRead: true,
      },
    });

    if (weddingId) {
      revalidatePath(`/dashboard/${weddingId}`);
    }
    return { success: true };
  } catch (err) {
    return { success: false };
  }
}

export async function markAllNotificationsReadAction(weddingId?: string) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return { success: false };

  try {
    await prisma.userNotification.updateMany({
      where: {
        userId: sessionUser.userId,
      },
      data: {
        isRead: true,
      },
    });

    if (weddingId) {
      revalidatePath(`/dashboard/${weddingId}`);
    }
    return { success: true };
  } catch (err) {
    return { success: false };
  }
}

export async function createNotificationAction({
  userId,
  weddingId,
  eventId,
  title,
  message,
  type = "system",
  actionUrl,
}: {
  userId: string;
  weddingId?: string;
  eventId?: string;
  title: string;
  message: string;
  type?: "invite" | "payment" | "rsvp" | "rundown" | "system";
  actionUrl?: string;
}) {
  try {
    // 1. Check Collaborator Permissions (Module-level & Sub-event-level)
    if (weddingId) {
      const collab = await prisma.weddingCollaborator.findFirst({
        where: {
          weddingId,
          userId,
        },
      });

      if (collab && collab.customPermissions) {
        const perms = collab.customPermissions as any;

        // A. Module-level permission check
        if (type === "payment" && perms.budget === false) {
          return { skipped: true, reason: "User has no budget access" };
        }
        if (type === "rsvp" && perms.guest === false) {
          return { skipped: true, reason: "User has no guest/rsvp access" };
        }
        if (type === "rundown" && perms.rundown === false) {
          return { skipped: true, reason: "User has no rundown access" };
        }

        // B. Sub-event-level permission check
        if (
          eventId &&
          Array.isArray(perms.allowed_event_ids) &&
          perms.allowed_event_ids.length > 0
        ) {
          if (
            !perms.allowed_event_ids.includes("all") &&
            !perms.allowed_event_ids.includes(eventId)
          ) {
            return {
              skipped: true,
              reason: `User is not authorized for sub-event ${eventId}`,
            };
          }
        }
      }
    }

    // 2. Insert notification row
    const created = await prisma.userNotification.create({
      data: {
        userId,
        title,
        message,
        type,
        isRead: false,
      },
    });

    return {
      success: true,
      data: {
        id: created.id,
        user_id: created.userId,
        title: created.title,
        message: created.message,
        type: created.type,
        is_read: created.isRead,
        created_at: created.createdAt.toISOString(),
      },
    };
  } catch (error: any) {
    return { skipped: true, error: error?.message || "Failed to create notification" };
  }
}
