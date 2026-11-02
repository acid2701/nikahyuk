"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Heart, Copy, Check, QrCode, Share2, Sparkles, UserCheck } from "lucide-react";
import { getOrGeneratePairCodeAction } from "@/actions/couple-actions";

export interface CouplePairModalProps {
  weddingId: string;
  groomName: string;
  brideName: string;
  trigger?: React.ReactNode;
}

export function CouplePairModal({
  weddingId,
  groomName,
  brideName,
  trigger,
}: CouplePairModalProps) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [pairCode, setPairCode] = React.useState<string | null>(null);
  const [isPaired, setIsPaired] = React.useState(false);
  const [partnerInfo, setPartnerInfo] = React.useState<{ email?: string; fullName?: string | null } | null>(null);
  const [copiedCode, setCopiedCode] = React.useState(false);
  const [copiedLink, setCopiedLink] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    if (open) {
      setLoading(true);
      getOrGeneratePairCodeAction(weddingId)
        .then((res) => {
          if (res.success) {
            setPairCode(res.pairCode);
            setIsPaired(res.isPaired);
            setPartnerInfo(res.partner);
          }
        })
        .catch((err) => {
          console.error("Pair code error:", err);
        })
        .finally(() => setLoading(false));
    }
  }, [open, weddingId]);

  function copyCode() {
    if (!pairCode) return;
    navigator.clipboard.writeText(pairCode);
    setCopiedCode(true);
    toast({
      title: "Kode Disalin!",
      description: `Kode ${pairCode} siap dibagikan ke pasangan Anda.`,
      variant: "success",
    });
    setTimeout(() => setCopiedCode(false), 2000);
  }

  function copyShareLink() {
    if (!pairCode) return;
    const url = `${window.location.origin}/dashboard?pairCode=${pairCode}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    toast({
      title: "Tautan Pasangan Disalin!",
      description: "Kirim tautan ini via WhatsApp ke pasangan Anda.",
      variant: "success",
    });
    setTimeout(() => setCopiedLink(false), 2000);
  }

  function shareWhatsApp() {
    if (!pairCode) return;
    const url = `${window.location.origin}/dashboard?pairCode=${pairCode}`;
    const text = encodeURIComponent(
      `Hai sayang ❤️, ayo gabung ke ruang kerja persiapan pernikahan kita di NikahYuk!\n\nKlik link langsung: ${url}\nAtau masukkan Kode Pasangan: *${pairCode}* di menu dashboard.\n\nKita atur rundown, anggaran, & tamu bareng ya! 💍`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            size="sm"
            variant="outline"
            className="rounded-full h-8 px-3 text-xs font-semibold meld-bouncy border-rose-200 bg-rose-500/5 text-rose-600 hover:bg-rose-500/10 gap-1.5"
          >
            <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
            <span>Kode Pasangan</span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-card border border-border/80 shadow-xl">
        <DialogHeader className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-rose-500/10 border border-rose-200 text-rose-500 flex items-center justify-center">
            <Heart className="h-6 w-6 fill-rose-500/20" />
          </div>
          <DialogTitle className="font-sans text-xl font-extrabold text-foreground">
            Hubungkan Pasangan Bahagia
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground max-w-xs mx-auto">
            Sandingkan akun {groomName} & {brideName} untuk menyunting rundown, anggaran, dan daftar tamu secara real-time.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-xs text-muted-foreground animate-pulse">
            Memuat kode penyanding...
          </div>
        ) : isPaired && partnerInfo ? (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-200 space-y-2 text-center">
            <div className="flex items-center justify-center gap-2 text-emerald-700 font-bold text-sm">
              <UserCheck className="h-4 w-4" /> Pasangan Telah Terhubung!
            </div>
            <p className="text-xs text-muted-foreground">
              Akun <strong className="text-foreground">{partnerInfo.fullName || partnerInfo.email}</strong> telah terhubung sebagai co-owner workspace ini.
            </p>
          </div>
        ) : (
          <div className="space-y-5 pt-2">
            {/* Box Kode Utama */}
            <div className="p-4 rounded-2xl bg-muted/40 border border-border/70 text-center space-y-2">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Kode Penyanding Anda:
              </span>
              <div className="font-mono text-3xl sm:text-4xl font-black tracking-widest text-primary selection:bg-primary/20">
                {pairCode || "------"}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Bagikan kode ini kepada pasangan untuk dimasukkan di halaman dashboard miliknya.
              </p>
            </div>

            {/* Tombol Aksi Copy & Share */}
            <div className="grid grid-cols-2 gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={copyCode}
                className="h-10 rounded-2xl text-xs font-semibold gap-1.5 border-border/80 hover:bg-muted"
              >
                {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedCode ? "Tersalin!" : "Salin Kode"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={copyShareLink}
                className="h-10 rounded-2xl text-xs font-semibold gap-1.5 border-border/80 hover:bg-muted"
              >
                {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Share2 className="h-3.5 w-3.5" />}
                {copiedLink ? "Link Tersalin!" : "Salin Link"}
              </Button>
            </div>

            <Button
              type="button"
              onClick={shareWhatsApp}
              className="w-full h-11 rounded-2xl bg-[#ff385c] hover:bg-[#e00b41] text-white text-xs sm:text-sm font-semibold shadow-xs gap-2 meld-bouncy"
            >
              <Share2 className="h-4 w-4" />
              Bagikan ke WhatsApp Pasangan
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
