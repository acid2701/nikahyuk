"use client";

import * as React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
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
import { KeyRound, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  async function handleResetRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Perhatian",
        description: "Mohon masukkan alamat email Anda.",
        variant: "warning",
      });
      return;
    }

    setLoading(true);

    try {
      // Get base URL dynamically or fallback to origin
      let redirectOrigin = typeof window !== "undefined" ? window.location.origin : "";
      try {
        const configRes = await fetch("/api/public/auth-config");
        if (configRes.ok) {
          const configJson = await configRes.json();
          if (configJson.config?.appBaseUrl) {
            redirectOrigin = configJson.config.appBaseUrl;
          }
        }
      } catch {
        // Fallback to current window origin
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${redirectOrigin}/reset-password`,
      });

      if (error) {
        toast({
          title: "Gagal Mengirim Link",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setSent(true);
        toast({
          title: "Email Pemulihan Terkirim!",
          description: `Tautan atur ulang kata sandi telah dikirimkan ke ${email}.`,
          variant: "success",
        });
      }
    } catch {
      toast({
        title: "Kesalahan Jaringan",
        description: "Gagal menghubungkan ke server auth.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="shadow-sm border-border/70">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-1">
          <KeyRound className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-xl font-semibold">
          Lupa Kata Sandi?
        </CardTitle>
        <CardDescription>
          Masukkan alamat email terdaftar Anda untuk menerima tautan atur ulang kata sandi.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sent ? (
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
            <p className="text-sm font-semibold text-foreground">
              Cek Kotak Masuk Email Anda
            </p>
            <p className="text-xs text-muted-foreground">
              Kami telah mengirimkan instruksi dan tautan pemulihan kata sandi ke{" "}
              <strong className="text-foreground">{email}</strong>. Silakan klik tautan di email tersebut untuk membuat kata sandi baru.
            </p>
          </div>
        ) : (
          <form onSubmit={handleResetRequest} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">
                Alamat Email Terdaftar
              </label>
              <Input
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Mengirim Email..." : "Kirim Tautan Atur Ulang Password"}
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="justify-center">
        <Link
          href="/login"
          className="text-xs text-muted-foreground hover:text-foreground font-medium flex items-center gap-1.5"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Halaman Masuk
        </Link>
      </CardFooter>
    </Card>
  );
}
