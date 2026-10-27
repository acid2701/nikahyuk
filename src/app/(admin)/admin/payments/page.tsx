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
import { Switch } from "@/components/ui/switch";
import { useSystemSettings } from "@/hooks/use-system-settings";
import { HeartHandshake, Sparkles, Building, CheckCircle2 } from "lucide-react";

export default function AdminPaymentsPage() {
  const { settings, loading, fetching, saveSetting } = useSystemSettings();

  const [qrisMerchantName, setQrisMerchantName] = React.useState("NikahYuk Platform - Donasi Sukarela");
  const [qrisImageUrl, setQrisImageUrl] = React.useState(
    "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=Donasi%20NikahYuk%20QRIS%20Tip%20Jar"
  );
  const [qrisNotes, setQrisNotes] = React.useState(
    "Menerima GoPay, OVO, ShopeePay, DANA, BCA, Mandiri, BRI, BNI (QRIS Standard)"
  );
  const [payoutBankDetails, setPayoutBankDetails] = React.useState(
    "BCA 1234567890 a.n NikahYuk Indonesia"
  );
  const [qrisIsActive, setQrisIsActive] = React.useState(true);

  React.useEffect(() => {
    const qrisRow = settings["qris_donasi_config"];
    if (qrisRow) {
      setQrisMerchantName(qrisRow.merchantName || "NikahYuk Platform - Donasi Sukarela");
      setQrisImageUrl(
        qrisRow.qrisImageUrl ||
          "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=Donasi%20NikahYuk%20QRIS%20Tip%20Jar"
      );
      setQrisNotes(
        qrisRow.notes ||
          "Menerima GoPay, OVO, ShopeePay, DANA, BCA, Mandiri, BRI, BNI (QRIS Standard)"
      );
      setPayoutBankDetails(
        qrisRow.payoutBankDetails || "BCA 1234567890 a.n NikahYuk Indonesia"
      );
      setQrisIsActive(qrisRow.isActive ?? true);
    }
  }, [settings]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    await saveSetting(
      "qris_donasi_config",
      {
        merchantName: qrisMerchantName,
        qrisImageUrl,
        notes: qrisNotes,
        payoutBankDetails,
        isActive: qrisIsActive,
      },
      "Konfigurasi QRIS Donasi platform berhasil diperbarui!"
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight flex items-center gap-2">
          <HeartHandshake className="h-6 w-6 text-primary" />
          Keuangan & Donasi KlikQRIS
        </h1>
        <p className="text-sm text-muted-foreground">
          Kelola parameter KlikQRIS Tip Jar, status aktif modul donasi sukarela, dan catatan rekening pencairan.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="border-border/70">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-500" /> Pengaturan Barcode KlikQRIS
                </CardTitle>
                <CardDescription>
                  Tersimpan di `system_settings` PostgreSQL dan diakses oleh modal donasi pengguna.
                </CardDescription>
              </div>

              <div className="flex items-center space-x-2 bg-muted/50 p-2 rounded-lg border border-border">
                <span className="text-xs font-semibold text-foreground">Status Donasi Modal:</span>
                <Switch checked={qrisIsActive} onCheckedChange={setQrisIsActive} />
                <span className="text-xs font-mono font-bold text-primary">
                  {qrisIsActive ? "Aktif" : "Non-Aktif"}
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Nama Merchant / Akun QRIS</label>
                <Input
                  type="text"
                  placeholder="NikahYuk Platform - Donasi Sukarela"
                  value={qrisMerchantName}
                  onChange={(e) => setQrisMerchantName(e.target.value)}
                  required
                />
                <p className="text-[11px] text-muted-foreground">
                  Nama resmi merchant yang tampil di aplikasi e-Wallet pen-transfer.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  URL Gambar Statis Barcode QRIS (.png / .jpg / API)
                </label>
                <Input
                  type="text"
                  placeholder="https://pub-cdn.nikahyuk.com/qris-donasi.png"
                  value={qrisImageUrl}
                  onChange={(e) => setQrisImageUrl(e.target.value)}
                  required
                />
                <p className="text-[11px] text-muted-foreground">
                  Link gambar barcode QRIS yang akan dipindai oleh pengguna dari HP mereka.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Keterangan Metode Pembayaran</label>
                <Input
                  type="text"
                  value={qrisNotes}
                  onChange={(e) => setQrisNotes(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1 pt-2 border-t border-border">
                <label className="text-xs font-medium text-foreground flex items-center gap-1">
                  <Building className="h-3.5 w-3.5 text-primary" /> Rekening Bank Pencairan (Internal Admin Note)
                </label>
                <Input
                  type="text"
                  placeholder="BCA 1234567890 a.n NikahYuk Indonesia"
                  value={payoutBankDetails}
                  onChange={(e) => setPayoutBankDetails(e.target.value)}
                />
                <p className="text-[11px] text-muted-foreground">
                  Catatan rekening pencairan dana donasi dari KlikQRIS ke rekening bank Anda.
                </p>
              </div>
            </div>

            {/* Live Preview Box */}
            <div className="p-4 rounded-xl bg-muted/40 border border-border flex flex-col items-center justify-center text-center space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Live Preview Modal Barcode User
              </span>

              <div className="p-3 bg-white rounded-lg shadow-sm border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrisImageUrl} alt="Live QRIS Preview" className="w-40 h-40 object-contain" />
              </div>

              <div className="space-y-0.5">
                <p className="text-xs font-bold text-foreground">{qrisMerchantName}</p>
                <p className="text-[10px] text-muted-foreground max-w-xs">{qrisNotes}</p>
              </div>
            </div>
          </CardContent>

          <CardFooter className="justify-end">
            <Button type="submit" disabled={loading} className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              {loading ? "Menyimpan..." : "Simpan Konfigurasi QRIS"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
