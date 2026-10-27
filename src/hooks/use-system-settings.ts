import * as React from "react";
import { useToast } from "@/components/ui/use-toast";

export function useSystemSettings() {
  const [loading, setLoading] = React.useState(false);
  const [fetching, setFetching] = React.useState(true);
  const [settings, setSettings] = React.useState<Record<string, any>>({});
  const { toast } = useToast();

  const loadSettings = React.useCallback(async () => {
    setFetching(true);
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const json = await res.json();
        const map: Record<string, any> = {};
        if (Array.isArray(json.data)) {
          json.data.forEach((item: { key: string; value: any }) => {
            map[item.key] = item.value;
          });
        }
        setSettings(map);
      }
    } catch (err) {
      console.warn("[useSystemSettings fetch error]:", err);
    } finally {
      setFetching(false);
    }
  }, []);

  React.useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const saveSetting = async (
    key: string,
    value: any,
    successMessage: string = "Pengaturan berhasil disimpan."
  ) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan pengaturan.");
      }
      setSettings((prev) => ({ ...prev, [key]: value }));
      toast({
        title: "Tersimpan",
        description: successMessage,
        variant: "success",
      });
      return { success: true };
    } catch (err) {
      toast({
        title: "Gagal Menyimpan",
        description: err instanceof Error ? err.message : "Terjadi kesalahan sistem.",
        variant: "destructive",
      });
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  return {
    settings,
    fetching,
    loading,
    reload: loadSettings,
    saveSetting,
  };
}
