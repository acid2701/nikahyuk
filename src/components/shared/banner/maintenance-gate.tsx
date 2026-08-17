"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";

export function MaintenanceGate() {
  const [maintenance, setMaintenance] = React.useState<{
    isActive: boolean;
    message?: string;
  } | null>(null);

  React.useEffect(() => {
    fetch("/api/public/qris-config")
      .then((res) => res.json())
      .then((data) => {
        if (data?.maintenance?.isActive) {
          setMaintenance(data.maintenance);
        }
      })
      .catch(() => {});
  }, []);

  if (!maintenance?.isActive) return null;

  return (
    <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 shadow-sm text-center">
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <span>
        {maintenance.message ||
          "NikahYuk System Notice: Server sedang dalam pemeliharaan berkala untuk peningkatan performa."}
      </span>
    </div>
  );
}
