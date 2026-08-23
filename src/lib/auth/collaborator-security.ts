import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: wedding } = await supabase
    .from("weddings")
    .select("created_by")
    .eq("id", weddingId)
    .single();

  const isOwner = wedding?.created_by === user.id;

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
    const { data: collaborator } = await supabase
      .from("wedding_collaborators")
      .select("custom_permissions")
      .eq("wedding_id", weddingId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (collaborator && collaborator.custom_permissions) {
      const perms = collaborator.custom_permissions as any;

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

  return { user, isOwner, allowedEventIds, permissions };
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
      // Restricted users cannot see 'all', default to their first allowed event
      effectiveEventId = availableEvents[0].id;
    } else {
      effectiveEventId = undefined; // represents 'all'
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
