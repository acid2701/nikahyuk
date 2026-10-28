import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export interface AccessDeniedCardProps {
  moduleTitle: string;
  weddingId: string;
}

export function AccessDeniedCard({ moduleTitle, weddingId }: AccessDeniedCardProps) {
  return (
    <Card className="border-amber-500/30 bg-amber-500/5 max-w-xl mx-auto my-12 text-center p-6 shadow-sm">
      <CardHeader className="space-y-3 pb-3">
        <div className="h-14 w-14 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto border border-amber-500/20">
          <Lock className="h-7 w-7" />
        </div>
        <CardTitle className="font-sans text-xl font-bold text-foreground">
          Akses Modul &apos;{moduleTitle}&apos; Dikunci
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground max-w-md mx-auto">
          Hak akses untuk modul ini tidak diizinkan oleh Pemilik Workspace (Pengantin). Silakan hubungi pengantin jika Anda membutuhkan akses ke modul ini.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <Button asChild variant="outline" size="sm" className="text-xs gap-2">
          <Link href={`/dashboard/${weddingId}`}>
            Kembali ke Ringkasan
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
