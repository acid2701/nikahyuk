"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QrCode, HeartHandshake, Check, Copy } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export interface DonationQrisModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  qrisImageUrl?: string;
  merchantName?: string;
  notes?: string;
}

export function DonationQrisModal({
  open,
  onOpenChange,
  qrisImageUrl: propImageUrl,
  merchantName: propMerchantName,
  notes: propNotes,
}: DonationQrisModalProps) {
  const [copied, setCopied] = React.useState(false);
  const [config, setConfig] = React.useState({
    merchantName: propMerchantName || "NikahYuk Platform - Donasi Sukarela",
    qrisImageUrl:
      propImageUrl ||
      "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=Donasi%20NikahYuk%20QRIS%20Tip%20Jar",
    notes: propNotes || "Menerima GoPay, OVO, ShopeePay, DANA, BCA, Mandiri, BRI, BNI (QRIS Standard)",
  });

  const { toast } = useToast();

  React.useEffect(() => {
    if (open && !propImageUrl) {
      fetch("/api/public/qris-config")
        .then((res) => res.json())
        .then((data) => {
          if (data?.config) {
            setConfig({
              merchantName: data.config.merchantName || "NikahYuk Platform - Donasi Sukarela",
              qrisImageUrl:
                data.config.qrisImageUrl ||
                "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=Donasi%20NikahYuk%20QRIS%20Tip%20Jar",
              notes: data.config.notes || "Menerima GoPay, OVO, ShopeePay, DANA, BCA, Mandiri, BRI, BNI (QRIS Standard)",
            });
          }
        })
        .catch(() => {});
    }
  }, [open, propImageUrl]);

  function handleCopyMerchant() {
    navigator.clipboard.writeText(config.merchantName);
    setCopied(true);
    toast({
      title: "Nama Merchant Disalin!",
      description: "Nama merchant QRIS disalin ke clipboard.",
      variant: "success",
    });
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs text-center">
        <DialogHeader className="text-center pb-1">
          <div className="mx-auto h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-1">
            <HeartHandshake className="h-5 w-5" />
          </div>
          <DialogTitle className="font-serif text-lg">KlikQRIS Tip Jar</DialogTitle>
          <DialogDescription className="text-xs">
            Dukungan & Donasi Sukarela untuk Operational Server & Pengembangan NikahYuk.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 flex flex-col items-center space-y-3">
          <div className="p-3 bg-white rounded-xl shadow-md border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={config.qrisImageUrl}
              alt="QRIS Donasi Sukarela"
              className="w-48 h-48 object-contain"
            />
          </div>

          <div className="space-y-0.5 text-center">
            <p className="text-xs font-semibold text-foreground flex items-center justify-center gap-1">
              <QrCode className="h-3.5 w-3.5 text-primary" /> {config.merchantName}
            </p>
            <p className="text-[10px] text-muted-foreground">{config.notes}</p>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2">
          <Button variant="outline" size="sm" onClick={handleCopyMerchant} className="w-full text-xs gap-1">
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Berhasil Disalin" : "Salin Merchant Name"}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="w-full text-xs">
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
