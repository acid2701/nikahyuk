"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CollaboratorPermissionForm, SubEventItem } from "./collaborator-permission-form";
import { ConfirmDeleteDialog } from "@/components/shared/modal/confirm-delete-dialog";
import { removeCollaboratorAction } from "@/actions/wedding-actions";
import { CustomPermissions } from "@/types/database.types";
import { useToast } from "@/components/ui/use-toast";
import { Users, Trash2, MessageSquare, CheckCircle, Clock, Copy, Check } from "lucide-react";

export interface CollaboratorCardItemProps {
  collaborator: {
    id: string;
    wedding_id: string;
    user_id: string;
    role: string;
    custom_permissions: any;
  };
  weddingId: string;
  weddingTitle?: string;
  events?: SubEventItem[];
}

export function CollaboratorCardItem({
  collaborator,
  weddingId,
  weddingTitle = "Pernikahan",
  events = [],
}: CollaboratorCardItemProps) {
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const { toast } = useToast();

  const perms = (collaborator.custom_permissions || {}) as CustomPermissions & {
    role_name?: string;
    invited_email?: string;
    is_active?: boolean;
  };

  const defaultRoleLabel =
    collaborator.role === "wo"
      ? "Wedding Organizer"
      : collaborator.role === "partner"
      ? "Partner (Pasangan)"
      : "Panitia Keluarga";

  const displayRoleLabel = perms.role_name || defaultRoleLabel;
  const userEmail = perms.invited_email || `Kolaborator ID: ${collaborator.user_id.substring(0, 8)}...`;
  const isActive = perms.is_active !== false;

  const inviteMessage = `Halo! Anda diundang menjadi Kolaborator (${displayRoleLabel}) untuk Acara ${weddingTitle} di NikahYuk. Buka link berikut untuk mengakses workspace: ${
    typeof window !== "undefined" ? window.location.origin : ""
  }/dashboard/${weddingId}`;

  const waShareUrl = `https://wa.me/?text=${encodeURIComponent(inviteMessage)}`;

  function handleCopyInviteLink() {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(inviteMessage);
      setCopied(true);
      toast({
        title: "Tautan Undangan Disalin!",
        description: "Pesan undangan kolaborator telah disalin ke clipboard.",
        variant: "success",
      });
      setTimeout(() => setCopied(false), 2500);
    }
  }

  async function handleConfirmDelete() {
    setLoading(true);
    try {
      await removeCollaboratorAction(collaborator.id, weddingId);
      toast({
        title: "Akses Kolaborator Dicabut",
        description: `Hak akses untuk '${userEmail}' telah berhasil dihapus.`,
        variant: "success",
      });
      setDeleteModalOpen(false);
    } catch (err) {
      toast({
        title: "Gagal Mencabut Akses",
        description: err instanceof Error ? err.message : "Internal error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <ConfirmDeleteDialog
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Revoke / Pencabutan Akses Kolaborator?"
        description={`Apakah Anda yakin ingin mencabut dan menghapus hak akses untuk '${userEmail}'? Pengguna ini tidak akan dapat mengakses workspace ini lagi.`}
        onConfirm={handleConfirmDelete}
        loading={loading}
      />

      <Card className="border-border/80 shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                {userEmail.charAt(0).toUpperCase()}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <CardTitle className="text-base font-semibold">
                    {userEmail}
                  </CardTitle>
                  {isActive ? (
                    <Badge variant="outline" className="text-[10px] text-emerald-600 bg-emerald-500/10 border-emerald-500/20 px-2 py-0 gap-1 font-medium">
                      <CheckCircle className="h-3 w-3" /> Terhubung & Aktif
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] text-amber-600 bg-amber-500/10 border-amber-500/20 px-2 py-0 gap-1 font-medium">
                      <Clock className="h-3 w-3" /> Menunggu Registrasi
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-xs">
                  Peran:{" "}
                  <span className="font-semibold uppercase text-foreground">
                    {displayRoleLabel}
                  </span>
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5"
                onClick={handleCopyInviteLink}
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Tersalin" : "Salin Link"}
              </Button>

              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
              >
                <a href={waShareUrl} target="_blank" rel="noopener noreferrer">
                  <MessageSquare className="h-3.5 w-3.5" /> Undangan WA
                </a>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:bg-destructive/10 cursor-pointer"
                onClick={() => setDeleteModalOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CollaboratorPermissionForm
            collaboratorId={collaborator.id}
            weddingId={weddingId}
            initialPermissions={perms}
            events={events}
          />
        </CardContent>
      </Card>
    </>
  );
}
