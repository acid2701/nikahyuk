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

export default function StorageConfigPage() {
  const [accountId, setAccountId] = React.useState("");
  const [accessKeyId, setAccessKeyId] = React.useState("");
  const [secretAccessKey, setSecretAccessKey] = React.useState("");
  const [bucketName, setBucketName] = React.useState("");
  const [publicCdnDomain, setPublicCdnDomain] = React.useState("");

  const [maxImageSizeMb, setMaxImageSizeMb] = React.useState(10);
  const [maxPdfSizeMb, setMaxPdfSizeMb] = React.useState(20);
  const [imageQualityRatio, setImageQualityRatio] = React.useState(0.8);

  const [qrisMerchantName, setQrisMerchantName] = React.useState("NikahYuk Platform - Donasi Sukarela");
  const [qrisImageUrl, setQrisImageUrl] = React.useState(
    "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=Donasi%20NikahYuk%20QRIS%20Tip%20Jar"
  );
  const [qrisNotes, setQrisNotes] = React.useState(
    "Menerima GoPay, OVO, ShopeePay, DANA, BCA, Mandiri, BRI, BNI (QRIS Standard)"
  );
  const [qrisIsActive, setQrisIsActive] = React.useState(true);

  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();

  const loadSettings = React.useCallback(async () => {
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const result = await res.json();
        const rows: Array<{ key: string; value: Record<string, unknown> }> = result.data || [];
        const r2Row = rows.find((r) => r.key === "r2_credentials");
        if (r2Row && r2Row.value) {
          setAccountId((r2Row.value.accountId as string) || "");
          setAccessKeyId((r2Row.value.accessKeyId as string) || "");
          setSecretAccessKey((r2Row.value.secretAccessKey as string) || "");
          setBucketName((r2Row.value.bucketName as string) || "");
          setPublicCdnDomain((r2Row.value.publicCdnDomain as string) || "");
        }
        const storageRow = rows.find((r) => r.key === "storage_rules");
        if (storageRow && storageRow.value) {
          setMaxImageSizeMb((storageRow.value.maxImageSizeMb as number) || 10);
          setMaxPdfSizeMb((storageRow.value.maxPdfSizeMb as number) || 20);
          setImageQualityRatio((storageRow.value.imageQualityRatio as number) || 0.8);
        }
        const qrisRow = rows.find((r) => r.key === "qris_donasi_config");
        if (qrisRow && qrisRow.value) {
          setQrisMerchantName((qrisRow.value.merchantName as string) || "NikahYuk Platform - Donasi Sukarela");
          setQrisImageUrl(
            (qrisRow.value.qrisImageUrl as string) ||
              "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=Donasi%20NikahYuk%20QRIS%20Tip%20Jar"
          );
          setQrisNotes(
            (qrisRow.value.notes as string) ||
              "Menerima GoPay, OVO, ShopeePay, DANA, BCA, Mandiri, BRI, BNI (QRIS Standard)"
          );
          setQrisIsActive(qrisRow.value.isActive !== false);
        }
      }
    } catch {
      // Failed to load initial settings
    }
  }, []);

  React.useEffect(() => {
    loadSettings();
  }, [loadSettings]);

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
          title: "Kredensial R2 Berhasil Disimpan",
          description: "Kredensial Cloudflare R2 diperbarui di PostgreSQL system_settings.",
          variant: "success",
        });
      } else {
        const err = await res.json();
        toast({
          title: "Gagal Menyimpan",
          description: err.error || "Gagal memperbarui data.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Kesalahan Jaringan",
        description: "Gagal menghubungkan ke server.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveStorageRules(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const storageValue = {
      maxImageSizeMb,
      maxPdfSizeMb,
      targetImageFormat: "webp",
      imageQualityRatio,
      allowedMimeTypes: [
        "image/jpeg",
        "image/png",
        "image/webp",
        "application/pdf",
      ],
    };

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "storage_rules", value: storageValue }),
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

  async function handleSaveQrisConfig(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const qrisValue = {
      isActive: qrisIsActive,
      merchantName: qrisMerchantName,
      qrisImageUrl,
      notes: qrisNotes,
    };

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "qris_donasi_config", value: qrisValue }),
      });

      if (res.ok) {
        toast({
          title: "Konfigurasi QRIS Donasi Disimpan",
          description: "Pengaturan Tip Jar QRIS diperbarui dan langsung aktif di seluruh platform.",
          variant: "success",
        });
      } else {
        const err = await res.json();
        toast({
          title: "Gagal Menyimpan",
          description: err.error || "Gagal menyimpan konfigurasi QRIS.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Kesalahan Jaringan",
        description: "Gagal menghubungkan ke server.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Pengaturan Storage & Infrastruktur System
        </h2>
        <p className="text-sm text-muted-foreground">
          Kelola kredensial S3 Cloudflare R2 dan Konfigurasi KlikQRIS Tip Jar Donasi secara dinamis.
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
                  placeholder="e.g. R2AccessKeyString123"
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
                <Input
                  type="password"
                  placeholder="••••••••••••••••••••••••"
                  value={secretAccessKey}
                  onChange={(e) => setSecretAccessKey(e.target.value)}
                  disabled={loading}
                  required
                />
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
                  Public CDN Domain URL
                </label>
                <Input
                  type="text"
                  placeholder="https://pub-cdn.nikahyuk.com"
                  value={publicCdnDomain}
                  onChange={(e) => setPublicCdnDomain(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan Kredensial R2"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-lg font-medium">
              Aturan Storage & Kompresi Client
            </CardTitle>
            <CardDescription>
              Batas ukuran berkas dan parameter kompresi WebP otomatis.
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
                  value={maxImageSizeMb}
                  onChange={(e) => setMaxImageSizeMb(Number(e.target.value))}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Batas Maksimal PDF (MB)
                </label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={maxPdfSizeMb}
                  onChange={(e) => setMaxPdfSizeMb(Number(e.target.value))}
                  disabled={loading}
                  required
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
                  value={imageQualityRatio}
                  onChange={(e) => setImageQualityRatio(Number(e.target.value))}
                  disabled={loading}
                  required
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

        {/* QRIS DONASI CONFIG CARD */}
        <Card className="border-border/70 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              Konfigurasi KlikQRIS Tip Jar (Donasi Sukarela)
            </CardTitle>
            <CardDescription>
              Atur Nama Merchant, URL Gambar QRIS Statis, dan Catatan Pendukung Donasi Sukarela.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSaveQrisConfig}>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">
                    Nama Merchant / Akun QRIS
                  </label>
                  <Input
                    type="text"
                    placeholder="NikahYuk SaaS - Donasi Sukarela"
                    value={qrisMerchantName}
                    onChange={(e) => setQrisMerchantName(e.target.value)}
                    required
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Nama merchant resmi penerima donasi yang tampil di popup modal.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">
                    URL Gambar Statis QRIS (.png / .jpg / QR API)
                  </label>
                  <Input
                    type="text"
                    placeholder="https://pub-cdn.nikahyuk.com/qris-donasi.png"
                    value={qrisImageUrl}
                    onChange={(e) => setQrisImageUrl(e.target.value)}
                    required
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Link gambar barcode QRIS yang akan dipindai oleh donatur dari HP mereka.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">
                    Keterangan Metode Pembayaran / Catatan
                  </label>
                  <Input
                    type="text"
                    value={qrisNotes}
                    onChange={(e) => setQrisNotes(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="p-4 rounded-xl bg-muted/40 border border-border flex flex-col items-center justify-center text-center space-y-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Live Preview Barcode Tip Jar
                </span>

                <div className="p-3 bg-white rounded-lg shadow-sm border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrisImageUrl}
                    alt="Preview QRIS"
                    className="w-36 h-36 object-contain"
                  />
                </div>

                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-foreground">{qrisMerchantName}</p>
                  <p className="text-[10px] text-muted-foreground max-w-xs">{qrisNotes}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan Konfigurasi QRIS Donasi"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
