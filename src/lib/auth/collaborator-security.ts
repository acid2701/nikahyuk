import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export interface SecurityContextResult {
  user: any;
  isOwner: boolean;
  allowedEventIds: string[] | null;
  permissions: {
    budget: boolean;
    vendor: boolean;
    rundown: boolean;
    guest: boolean;
    seating: boolean;
    checklist: boolean;
    gift_log: boolean;
    share: boolean;
  };
}

export async function getCollaboratorSecurityContext(
  weddingId: string
): Promise<SecurityContextResult> {
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    redirect("/login");
  }

  const wedding = await prisma.wedding.findUnique({
    where: { id: weddingId },
    select: { createdBy: true },
  });

  const isOwner = wedding?.createdBy === sessionUser.userId;

  let allowedEventIds: string[] | null = null;
  let permissions = {
    budget: true,
    vendor: true,
    rundown: true,
    guest: true,
    seating: true,
    checklist: true,
    gift_log: true,
    share: true,
  };

  if (!isOwner) {
    const collaborator = await prisma.weddingCollaborator.findFirst({
      where: {
        weddingId,
        userId: sessionUser.userId,
      },
    });

    if (collaborator && collaborator.customPermissions) {
      const perms = collaborator.customPermissions as any;

      if (
        Array.isArray(perms.allowed_event_ids) &&
        perms.allowed_event_ids.length > 0 &&
        !perms.allowed_event_ids.includes("all")
      ) {
        allowedEventIds = perms.allowed_event_ids;
      }

      permissions = {
        budget: perms.budget !== false,
        vendor: perms.vendor !== false,
        rundown: perms.rundown !== false,
        guest: perms.guest !== false,
        seating: perms.seating !== false,
        checklist: perms.checklist !== false,
        gift_log: perms.gift_log !== false,
        share: perms.share !== false,
      };
    }
  }

  const formattedUser = {
    id: sessionUser.userId,
    email: sessionUser.email,
    user_metadata: {
      full_name: sessionUser.fullName,
    },
  };

  return { user: formattedUser, isOwner, allowedEventIds, permissions };
}

/**
 * Filter list of event IDs based on security context
 */
export function resolveEffectiveEventIds(
  requestedEventId: string | undefined,
  allEvents: Array<{ id: string; event_name: string }>,
  allowedEventIds: string[] | null
): {
  effectiveEventId: string | undefined;
  effectiveEventIds: string[];
  isRestricted: boolean;
} {
  const isRestricted = Array.isArray(allowedEventIds) && allowedEventIds.length > 0;

  // Available events for this user
  const availableEvents = isRestricted
    ? allEvents.filter((e) => allowedEventIds.includes(e.id))
    : allEvents;

  if (availableEvents.length === 0) {
    return {
      effectiveEventId: undefined,
      effectiveEventIds: [],
      isRestricted,
    };
  }

  let effectiveEventId: string | undefined;

  if (requestedEventId && requestedEventId !== "all") {
    const matched = availableEvents.find((e) => e.id === requestedEventId);
    if (matched) {
      effectiveEventId = matched.id;
    } else {
      // If requested an unauthorized event ID, force fallback to the first allowed event!
      effectiveEventId = availableEvents[0].id;
    }
  } else {
    // If 'all' requested or no event specified
    if (isRestricted) {
      effectiveEventId = availableEvents[0].id;
    } else {
      effectiveEventId = undefined;
    }
  }

  const effectiveEventIds = effectiveEventId
    ? [effectiveEventId]
    : availableEvents.map((e) => e.id);

  return {
    effectiveEventId,
    effectiveEventIds,
    isRestricted,
  };
}
