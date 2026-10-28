"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, ShieldAlert, KeyRound } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export interface MobilePinGateProps {
  token: string;
  weddingTitle: string;
  children: React.ReactNode;
  requiresPin: boolean;
  initialAuthenticated: boolean;
}

export function MobilePinGate({
  token,
  weddingTitle,
  children,
  requiresPin,
  initialAuthenticated,
}: MobilePinGateProps) {
  const [authenticated, setAuthenticated] = React.useState(initialAuthenticated);
  const [pin, setPin] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const { toast } = useToast();

  if (!requiresPin || authenticated) {
    return <>{children}</>;
  }

  async function handleVerifyPin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/token/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, pin }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal verifikasi PIN.");
      }

      toast({
        title: "PIN Berhasil Diverifikasi",
        description: "Selamat datang di Portal Kru Lapangan.",
        variant: "success",
      });

      setAuthenticated(true);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Internal error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-sm border-border shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
            <Lock className="h-6 w-6" />
          </div>
          <CardTitle className="font-sans text-xl">{weddingTitle}</CardTitle>
          <CardDescription className="text-xs">
            Portal Kru Lapangan & Panitia Acara. Masukkan PIN Keamanan untuk melanjutkan.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-3">
          <form onSubmit={handleVerifyPin} className="space-y-4">
            <div className="space-y-1">
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  maxLength={6}
                  placeholder="Masukkan PIN 4-6 Digit..."
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="pl-9 h-11 text-center font-mono text-lg tracking-widest"
                  required
                  autoFocus
                />
              </div>
              {errorMsg && (
                <p className="text-xs text-rose-500 font-medium text-center pt-1 flex items-center justify-center gap-1">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  {errorMsg}
                </p>
              )}
            </div>

            <Button type="submit" disabled={loading} className="w-full h-11 text-sm font-semibold">
              {loading ? "Memverifikasi..." : "Buka Portal Kru"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
