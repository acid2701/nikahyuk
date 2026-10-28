"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

export interface RoleUserPayload {
  role?: string | null;
  userType?: string | null;
}

/**
 * Reusable hook to direct authenticated users to their canonical dashboard
 */
export function useAuthRoleRedirect() {
  const router = useRouter();

  const redirectByRole = useCallback(
    (user?: RoleUserPayload | null) => {
      const isSuperadmin = user?.role === "superadmin" || user?.role === "admin";
      const isVendor = user?.userType === "vendor";

      const targetPath = isSuperadmin
        ? "/admin"
        : isVendor
        ? "/vendor/dashboard"
        : "/dashboard";

      router.push(targetPath);
      router.refresh();
      return targetPath;
    },
    [router]
  );

  return { redirectByRole };
}
