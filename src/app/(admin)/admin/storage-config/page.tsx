"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { HardDrive, ShieldCheck, HeartHandshake, ArrowRight, Eye, EyeOff, Activity, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function AdminStorageConfigPage() {
  const [accountId, setAccountId] = React.useState("");
  const [accessKeyId, setAccessKeyId] = React.useState("");
  const [secretAccessKey, setSecretAccessKey] = React.useState("");
  const [showSecretKey, setShowSecretKey] = React.useState(false);
  const [bucketName, setBucketName] = React.useState("");
  const [publicCdnDomain, setPublicCdnDomain] = React.useState("");

  // Allow empty string or number so backspace completely clears the field
  const [maxImageSizeMb, setMaxImageSizeMb] = React.useState<number | "">(10);
  const [maxPdfSizeMb, setMaxPdfSizeMb] = React.useState<number | "">(20);
  const [imageQualityRatio, setImageQualityRatio] = React.useState<number | "">(0.8);

  const [loading, setLoading] = React.useState(false);
  const [testingConnection, setTestingConnection] = React.useState(false);
  const [testResult, setTestResult] = React.useState<{
    success: boolean;
    message: string;
    latencyMs?: number;
  } | null>(null);
  const { toast } = useToast();

  const loadConfig = React.useCallback(async () => {
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const result = await res.json();
        const rows: Array<{ key: string; value: Record<string, unknown> }> =
          result.data || [];

        const r2Row = rows.find((r) => r.key === "r2_credentials");
        if (r2Row && r2Row.value) {
          setAccountId((r2Row.value.accountId as string) || "");
          setAccessKeyId((r2Row.value.accessKeyId as string) || "");
          setSecretAccessKey((r2Row.value.secretAccessKey as string) || "");
          setBucketName((r2Row.value.bucketName as string) || "");
          setPublicCdnDomain((r2Row.value.publicCdnDomain as string) || "");
        }

        const rulesRow = rows.find((r) => r.key === "storage_rules");
        if (rulesRow && rulesRow.value) {
          setMaxImageSizeMb((rulesRow.value.maxImageSizeMb as number) || 10);
          setMaxPdfSizeMb((rulesRow.value.maxPdfSizeMb as number) || 20);
          setImageQualityRatio((rulesRow.value.imageQualityRatio as number) || 0.8);
        }
      }
    } catch {
      // Ignore error
    }
  }, []);

  React.useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  async function handleSaveR2Credentials(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const r2Value = {
      accountId,
      accessKeyId,
      secretAccessKey,
      bucketName,
      publicCdnDomain,
    };

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "r2_credentials", value: r2Value }),
      });

      if (res.ok) {
        toast({
          title: "Kredensial R2 Disimpan",
          description: "Kredensial S3 Cloudflare R2 berhasil diperbarui.",
          variant: "success",
        });
      } else {
        const err = await res.json();
        toast({
          title: "Gagal Menyimpan",
          description: err.error,
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Kesalahan Jaringan",
        description: "Gagal memperbarui kredensial.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveStorageRules(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const numericMaxImage = maxImageSizeMb === "" ? 10 : Number(maxImageSizeMb);
    const numericMaxPdf = maxPdfSizeMb === "" ? 20 : Number(maxPdfSizeMb);
    const numericQuality = imageQualityRatio === "" ? 0.8 : Number(imageQualityRatio);

    const rulesValue = {
      maxImageSizeMb: numericMaxImage,
      maxPdfSizeMb: numericMaxPdf,
      targetImageFormat: "webp",
      imageQualityRatio: numericQuality,
      allowedMimeTypes: [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/svg+xml",
        "image/x-icon",
        "image/vnd.microsoft.icon",
        "application/pdf",
      ],
    };

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "storage_rules", value: rulesValue }),
      });

      if (res.ok) {
        toast({
          title: "Aturan Storage Disimpan",
          description: "Aturan ukuran file dan kompresi berhasil diperbarui.",
          variant: "success",
        });
      } else {
        const err = await res.json();
        toast({
          title: "Gagal Menyimpan",
          description: err.error,
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Kesalahan Jaringan",
        description: "Gagal memperbarui aturan storage.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleTestR2Connection() {
    setTestingConnection(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/admin/storage/test-connection", {
        method: "POST",
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: data.message,
          latencyMs: data.details?.latencyMs,
        });
        toast({
          title: "Koneksi R2 Berhasil",
          description: data.message,
          variant: "success",
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || "Gagal menghubungkan ke Cloudflare R2.",
        });
        toast({
          title: "Koneksi R2 Gagal",
          description: data.error || "Periksa kredensial dan simpan terlebih dahulu.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.message || "Kesalahan jaringan saat melakukan ping ke R2.",
      });
      toast({
        title: "Kesalahan Jaringan",
        description: "Tidak dapat menghubungi server API.",
        variant: "destructive",
      });
    } finally {
      setTestingConnection(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-sans font-bold tracking-tight flex items-center gap-2">
          <HardDrive className="h-6 w-6 text-primary" />
          Pengaturan Storage & Infrastruktur System
        </h2>
        <p className="text-sm text-muted-foreground">
          Kelola kredensial S3 Cloudflare R2 dan aturan kompresi media secara dinamis.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-lg font-medium">
              Kredensial S3 Cloudflare R2
            </CardTitle>
            <CardDescription>
              Tersimpan aman di tabel `system_settings` PostgreSQL.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSaveR2Credentials}>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Account ID
                </label>
                <Input
                  type="text"
                  placeholder="e.g. 5a1b2c3d4e5f6g7h8i9j"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Access Key ID
                </label>
                <Input
                  type="text"
                  placeholder="Kredensial S3 Access Key"
                  value={accessKeyId}
                  onChange={(e) => setAccessKeyId(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Secret Access Key
                </label>
                <div className="relative">
                  <Input
                    type={showSecretKey ? "text" : "password"}
                    placeholder="••••••••••••••••••••••••"
                    value={secretAccessKey}
                    onChange={(e) => setSecretAccessKey(e.target.value)}
                    disabled={loading}
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecretKey(!showSecretKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors rounded"
                    title={showSecretKey ? "Sembunyikan Secret Key" : "Tampilkan Secret Key"}
                  >
                    {showSecretKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Bucket Name
                </label>
                <Input
                  type="text"
                  placeholder="nikahyuk-storage"
                  value={bucketName}
                  onChange={(e) => setBucketName(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Public CDN Domain (Opsional)
                </label>
                <Input
                  type="text"
                  placeholder="e.g. https://pub-cdn.nikahyu.my.id"
                  value={publicCdnDomain}
                  onChange={(e) => setPublicCdnDomain(e.target.value)}
                  disabled={loading}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button type="submit" className="w-full" disabled={loading || testingConnection}>
                {loading ? "Menyimpan..." : "Simpan Kredensial R2"}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full border-border/80 text-xs gap-2"
                onClick={handleTestR2Connection}
                disabled={testingConnection || loading}
              >
                {testingConnection ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                    Sedang Menguji Koneksi S3...
                  </>
                ) : (
                  <>
                    <Activity className="w-3.5 h-3.5 text-primary" />
                    Uji / Test Koneksi Cloudflare R2
                  </>
                )}
              </Button>

              {/* Live Test Feedback Banner */}
              {testResult && (
                <div
                  className={`w-full p-2.5 rounded-lg border text-xs flex items-start gap-2 mt-1 ${
                    testResult.success
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                      : "bg-destructive/10 border-destructive/30 text-destructive dark:text-red-400"
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 space-y-0.5 leading-snug">
                    <p className="font-semibold">{testResult.success ? "Status Terhubung" : "Koneksi Gagal"}</p>
                    <p className="opacity-90">{testResult.message}</p>
                  </div>
                </div>
              )}
            </CardFooter>
          </form>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-lg font-medium">
              Aturan Ukuran File & Kompresi Media
            </CardTitle>
            <CardDescription>
              Atur batas maksimal berkas gambar WebP dan PDF yang diizinkan.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSaveStorageRules}>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Batas Maksimal Gambar (MB)
                </label>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  placeholder="Contoh: 2"
                  value={maxImageSizeMb}
                  onChange={(e) => {
                    const val = e.target.value;
                    setMaxImageSizeMb(val === "" ? "" : Number(val));
                  }}
                  disabled={loading}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Batas Maksimal Dokumen PDF (MB)
                </label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  placeholder="Contoh: 10"
                  value={maxPdfSizeMb}
                  onChange={(e) => {
                    const val = e.target.value;
                    setMaxPdfSizeMb(val === "" ? "" : Number(val));
                  }}
                  disabled={loading}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Target Format Kompresi
                </label>
                <Input type="text" value="WebP (.webp)" disabled readOnly />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Rasio Kualitas Kompresi (0.1 s.d 1.0)
                </label>
                <Input
                  type="number"
                  step="0.05"
                  min="0.1"
                  max="1.0"
                  placeholder="Contoh: 0.8"
                  value={imageQualityRatio}
                  onChange={(e) => {
                    const val = e.target.value;
                    setImageQualityRatio(val === "" ? "" : Number(val));
                  }}
                  disabled={loading}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" variant="secondary" className="w-full" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan Aturan Storage"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Link Banner to Dedicated Payments & Donasi Page */}
        <Card className="border-border/70 md:col-span-2 bg-card/60 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <HeartHandshake className="h-6 w-6 text-primary shrink-0" />
              <div>
                <p className="font-semibold text-sm text-foreground">Pengaturan KlikQRIS Tip Jar (Donasi Sukarela)</p>
                <p className="text-xs text-muted-foreground">
                  Pengaturan KlikQRIS donasi, merchant name, dan rekening pencairan kini terpusat di modul Keuangan & Donasi.
                </p>
              </div>
            </div>
            <Button asChild variant="outline" size="sm" className="gap-1.5 shrink-0">
              <Link href="/admin/payments">
                Buka Setting Donasi <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
