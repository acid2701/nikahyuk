"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ConfirmDeleteDialog } from "@/components/shared/modal/confirm-delete-dialog";
import {
  createShareTokenAction,
  toggleShareTokenActiveAction,
  resetShareTokenPINAction,
  deleteShareTokenAction,
} from "@/actions/token-actions";
import { useToast } from "@/components/ui/use-toast";
import { Share2, Copy, Check, Lock, Plus, QrCode, KeyRound, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export interface ShareTokenItem {
  id: string;
  token_hash: string;
  pin_hash: string | null;
  expires_at: string;
  is_active: boolean;
  module_access: any;
  created_at: string;
}

export interface ShareTokenManagerProps {
  weddingId: string;
  initialTokens: ShareTokenItem[];
}

export function ShareTokenManager({ weddingId, initialTokens }: ShareTokenManagerProps) {
  const [tokens, setTokens] = React.useState<ShareTokenItem[]>(initialTokens);
  const [openModal, setOpenModal] = React.useState(false);

  // Form states
  const [pin, setPin] = React.useState("");
  const [expiresDays, setExpiresDays] = React.useState("30");
  const [canCheckin, setCanCheckin] = React.useState(true);
  const [canViewRundown, setCanViewRundown] = React.useState(true);
  const [canViewGuests, setCanViewGuests] = React.useState(true);

  // QR Modal state
  const [qrToken, setQrToken] = React.useState<{ hash: string; title: string } | null>(null);

  // Reset PIN Modal state
  const [resetPinToken, setResetPinToken] = React.useState<ShareTokenItem | null>(null);
  const [newPin, setNewPin] = React.useState("");

  // Delete Modal state
  const [deleteTarget, setDeleteTarget] = React.useState<{ id: string; name: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    setTokens(initialTokens);
  }, [initialTokens]);

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  async function handleCreateToken(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await createShareTokenAction({
        weddingId,
        pin: pin ? pin : null,
        expiresDays: Number(expiresDays) || 30,
        moduleAccess: {
          canCheckin,
          canViewRundown,
          canViewGuests,
        },
      });

      toast({
        title: "Tautan Akses Berhasil Dibuat",
        description: "Tautan publik baru telah aktif.",
        variant: "success",
      });

      setOpenModal(false);
      setPin("");
      setExpiresDays("30");
    } catch (err) {
      toast({
        title: "Gagal Membuat Tautan",
        description: err instanceof Error ? err.message : "Internal error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleActive(tId: string, currentActive: boolean) {
    try {
      await toggleShareTokenActiveAction(tId, weddingId, !currentActive);
      toast({
        title: "Status Tautan Diperbarui",
        description: `Tautan ${!currentActive ? "DIAKTIFKAN" : "DINONAKTIFKAN"}.`,
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Gagal Memperbarui Status",
        description: err instanceof Error ? err.message : "Internal error",
        variant: "destructive",
      });
    }
  }

  async function handleResetPin(e: React.FormEvent) {
    e.preventDefault();
    if (!resetPinToken) return;

    setLoading(true);

    try {
      await resetShareTokenPINAction(resetPinToken.id, weddingId, newPin.trim() || null);
      toast({
        title: "PIN Berhasil Diperbarui",
        description: newPin.trim() ? "PIN keamanan baru telah disimpan." : "PIN keamanan telah dihapus.",
        variant: "success",
      });
      setResetPinToken(null);
      setNewPin("");
    } catch (err) {
      toast({
        title: "Gagal Memperbarui PIN",
        description: err instanceof Error ? err.message : "Internal error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);

    try {
      await deleteShareTokenAction(deleteTarget.id, weddingId);
      toast({
        title: "Tautan Akses Dihapus",
        description: "Tautan publik telah dihapus secara permanen.",
        variant: "success",
      });
      setDeleteTarget(null);
    } catch (err) {
      toast({
        title: "Gagal Menghapus Tautan",
        description: err instanceof Error ? err.message : "Internal error",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
    }
  }

  function handleCopyUrl(tokenHash: string, id: string) {
    const fullUrl = `${origin}/view/${tokenHash}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    toast({
      title: "Tautan Disalin!",
      description: "URL tautan kru lapangan disalin ke clipboard.",
      variant: "success",
    });
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Confirm Delete Dialog */}
      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus Tautan Akses Publik?"
        description="Tindakan ini akan menghapus tautan akses PWA. Panitia yang menggunakan tautan ini tidak akan dapat mengakses portal lagi."
        itemName={deleteTarget?.name}
        loading={deleteLoading}
        onConfirm={handleConfirmDelete}
      />

      {/* QR Code Dialog */}
      {qrToken && (
        <Dialog open={Boolean(qrToken)} onOpenChange={(open) => !open && setQrToken(null)}>
          <DialogContent className="max-w-xs text-center">
            <DialogHeader>
              <DialogTitle className="font-sans text-lg">Pindai QR Code Akses PWA</DialogTitle>
              <DialogDescription className="text-xs">
                Kru lapangan dapat memindai QR code ini menggunakan kamera HP untuk langsung membuka portal.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 flex flex-col items-center space-y-3">
              <div className="p-3 bg-white rounded-xl shadow-md border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                    `${origin}/view/${qrToken.hash}`
                  )}`}
                  alt="QR Code Akses PWA"
                  className="w-48 h-48"
                />
              </div>
              <p className="font-mono text-xs text-muted-foreground break-all">
                /view/{qrToken.hash}
              </p>
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setQrToken(null)} className="w-full">
                Tutup
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Reset PIN Dialog */}
      {resetPinToken && (
        <Dialog open={Boolean(resetPinToken)} onOpenChange={(open) => !open && setResetPinToken(null)}>
          <DialogContent className="max-w-xs">
            <form onSubmit={handleResetPin}>
              <DialogHeader>
                <DialogTitle className="font-sans text-lg flex items-center gap-1.5">
                  <KeyRound className="h-4 w-4 text-primary" /> Reset PIN Keamanan
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Masukkan PIN 4-6 digit baru, atau kosongkan untuk menghapus PIN pengaman.
                </DialogDescription>
              </DialogHeader>

              <div className="py-3 space-y-2">
                <Input
                  type="password"
                  maxLength={6}
                  placeholder="PIN Baru 4-6 Digit..."
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  className="text-center font-mono text-sm tracking-widest"
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setResetPinToken(null)}>
                  Batal
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Menyimpan..." : "Simpan PIN"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-lg border border-border bg-card">
        <div>
          <h2 className="font-sans text-lg font-bold">Token Akses Kru Lapangan (Public PWA)</h2>
          <p className="text-xs text-muted-foreground">
            Buat tautan instan tanpa registrasi untuk WO, panitia meja registrasi & door greeter.
          </p>
        </div>

        <Dialog open={openModal} onOpenChange={setOpenModal}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2 h-9 text-xs">
              <Plus className="h-4 w-4" />
              Buat Tautan Akses Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <form onSubmit={handleCreateToken}>
              <DialogHeader>
                <DialogTitle className="font-sans text-xl">Buat Tautan Akses Publik</DialogTitle>
                <DialogDescription>
                  Atur PIN pengaman dan batasan akses modul untuk kru acara.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium">PIN Keamanan 4-6 Digit (Opsional)</label>
                  <Input
                    type="password"
                    maxLength={6}
                    placeholder="e.g. 1234"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Kosongkan jika ingin tautan langsung terbuka tanpa PIN.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium">Masa Berlaku Tautan (Hari)</label>
                  <Input
                    type="number"
                    value={expiresDays}
                    onChange={(e) => setExpiresDays(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2 border-t border-border pt-3">
                  <label className="text-xs font-semibold text-foreground">Hak Akses Modul:</label>

                  <div className="flex items-center justify-between">
                    <span className="text-xs">Meja Registrasi & Check-in</span>
                    <Switch checked={canCheckin} onCheckedChange={setCanCheckin} />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs">Live Rundown Agenda</span>
                    <Switch checked={canViewRundown} onCheckedChange={setCanViewRundown} />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs">Pencarian Tamu & Meja Duduk</span>
                    <Switch checked={canViewGuests} onCheckedChange={setCanViewGuests} />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenModal(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Memproses..." : "Buat Tautan"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {tokens.length === 0 ? (
        <Card className="border-dashed p-8 text-center space-y-3">
          <Share2 className="h-10 w-10 text-muted-foreground mx-auto" />
          <div>
            <p className="text-sm font-medium text-foreground">Belum Ada Tautan Akses Aktif</p>
            <p className="text-xs text-muted-foreground mt-1">
              Klik &apos;Buat Tautan Akses Baru&apos; di atas untuk membagikan akses PWA ke panitia.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {tokens.map((t) => {
            const isExpired = new Date(t.expires_at) < new Date();
            const fullUrl = `${origin}/view/${t.token_hash}`;

            return (
              <Card key={t.id} className="border-border/80 flex flex-col justify-between">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Badge variant={t.is_active && !isExpired ? "success" : "secondary"}>
                          {isExpired ? "Expired" : t.is_active ? "Aktif" : "Non-Aktif"}
                        </Badge>
                        {t.pin_hash && (
                          <Badge variant="outline" className="gap-1 text-[10px]">
                            <Lock className="h-3 w-3 text-amber-500" /> Protected PIN
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-sm font-mono break-all pt-1">
                        /view/{t.token_hash}
                      </CardTitle>
                    </div>

                    <div className="flex items-center space-x-1">
                      <Switch
                        checked={t.is_active}
                        onCheckedChange={() => handleToggleActive(t.id, t.is_active)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTarget({ id: t.id, name: `/view/${t.token_hash}` })}
                        className="h-7 w-7 text-destructive hover:bg-destructive/10"
                        title="Hapus Tautan Akses"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="border-t border-border/50 pt-3 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Masa Berlaku:</span>
                    <span className="font-mono font-medium">
                      {new Date(t.expires_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Input
                      readOnly
                      value={fullUrl}
                      className="h-8 text-xs font-mono select-all bg-muted/40"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleCopyUrl(t.token_hash, t.id)}
                      className="h-8 text-xs gap-1 shrink-0"
                    >
                      {copiedId === t.id ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" /> Salin URL
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="flex items-center justify-end space-x-2 pt-1 border-t border-border/40">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setResetPinToken(t)}
                      className="h-7 text-xs gap-1"
                    >
                      <KeyRound className="h-3 w-3 text-amber-500" />
                      {t.pin_hash ? "Edit PIN" : "+ Pasang PIN"}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQrToken({ hash: t.token_hash, title: `/view/${t.token_hash}` })}
                      className="h-7 text-xs gap-1"
                    >
                      <QrCode className="h-3 w-3 text-primary" />
                      QR Code
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
