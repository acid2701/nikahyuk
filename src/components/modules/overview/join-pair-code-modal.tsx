"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Heart, Link as LinkIcon, ArrowRight, Sparkles } from "lucide-react";
import { connectViaPairCodeAction } from "@/actions/couple-actions";

export interface JoinPairCodeModalProps {
  trigger?: React.ReactNode;
}

export function JoinPairCodeModal({ trigger }: JoinPairCodeModalProps) {
  const [open, setOpen] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // Auto-open modal jika URL membawa query `pairCode=NIKAH-XXXX`
  React.useEffect(() => {
    const urlCode = searchParams.get("pairCode");
    if (urlCode) {
      setCode(urlCode.toUpperCase());
      setOpen(true);
    }
  }, [searchParams]);

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    try {
      const res = await connectViaPairCodeAction(code);
      if (res.success) {
        toast({
          title: "Berhasil Disandingkan! 🎉",
          description: `Selamat datang di workspace pernikahan ${res.groomName} & ${res.brideName}.`,
          variant: "success",
        });
        setOpen(false);
        router.push(`/dashboard/${res.weddingId}`);
        router.refresh();
      }
    } catch (err) {
      toast({
        title: "Gagal Menghubungkan",
        description: err instanceof Error ? err.message : "Kode tidak valid.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            size="sm"
            variant="outline"
            className="rounded-full h-9 px-4 text-xs font-semibold meld-bouncy border-rose-300 bg-rose-500/5 text-rose-600 hover:bg-rose-500/10 gap-1.5"
          >
            <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
            <span>Masukkan Kode Pasangan</span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-card border border-border/80 shadow-xl">
        <DialogHeader className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-rose-500/10 border border-rose-200 text-rose-500 flex items-center justify-center">
            <Heart className="h-6 w-6 fill-rose-500/20" />
          </div>
          <DialogTitle className="font-sans text-xl font-extrabold text-foreground">
            Gabung Ruang Kerja Pasangan
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground max-w-xs mx-auto">
            Masukkan kode 6 digit yang diberikan oleh pasangan Anda untuk mulai mengelola acara bersama.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleConnect} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Kode Penyanding (Contoh: NIKAH-XXXX)
            </label>
            <Input
              type="text"
              placeholder="e.g. NIKAH-7A9B"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="h-11 text-center font-mono font-bold text-base tracking-widest rounded-2xl border-border/80 focus-visible:ring-primary uppercase"
              disabled={loading}
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading || !code.trim()}
            className="w-full h-11 rounded-2xl bg-[#ff385c] hover:bg-[#e00b41] text-white text-xs sm:text-sm font-semibold shadow-xs gap-1.5 meld-bouncy"
          >
            {loading ? "Menyandingkan..." : "Sandingkan Workspace Sekarang"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
