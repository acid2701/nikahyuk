"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { ConfirmDeleteDialog } from "@/components/shared/modal/confirm-delete-dialog";
import { DataTablePagination } from "@/components/shared/pagination/data-table-pagination";
import {
  getRegisteredUsersAction,
  updateUserRoleAction,
  toggleUserSuspensionAction,
  UserRowItem,
} from "@/actions/admin-user-actions";
import { useToast } from "@/components/ui/use-toast";
import { Users, Search, ShieldCheck, ShieldAlert, UserX, UserCheck, Loader2, ExternalLink } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = React.useState<UserRowItem[]>([]);
  const [search, setSearch] = React.useState("");
  const [fetching, setFetching] = React.useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  // Confirmation Dialog State
  const [confirmTarget, setConfirmTarget] = React.useState<{
    type: "role" | "suspend";
    userId: string;
    email: string;
    newRole?: "admin" | "user";
    suspend?: boolean;
  } | null>(null);
  const [actionLoading, setActionLoading] = React.useState(false);

  const { toast } = useToast();

  const loadUsers = React.useCallback(async () => {
    try {
      const data = await getRegisteredUsersAction();
      setUsers(data);
    } catch (err) {
      toast({
        title: "Gagal Memuat User",
        description: err instanceof Error ? err.message : "Internal error",
        variant: "destructive",
      });
    } finally {
      setFetching(false);
    }
  }, [toast]);

  React.useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.id.toLowerCase().includes(search.toLowerCase())
  );

  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  async function handleConfirmAction() {
    if (!confirmTarget) return;
    setActionLoading(true);

    try {
      if (confirmTarget.type === "role" && confirmTarget.newRole) {
        await updateUserRoleAction(confirmTarget.userId, confirmTarget.newRole);
        toast({
          title: "Role Platform Diperbarui",
          description: `Role pengguna '${confirmTarget.email}' diubah menjadi '${confirmTarget.newRole}'.`,
          variant: "success",
        });
      } else if (confirmTarget.type === "suspend" && confirmTarget.suspend !== undefined) {
        await toggleUserSuspensionAction(confirmTarget.userId, confirmTarget.suspend);
        toast({
          title: confirmTarget.suspend ? "Akun Ditangguhkan" : "Akun Diaktifkan Kembali",
          description: `Status akun '${confirmTarget.email}' berhasil diperbarui.`,
          variant: "success",
        });
      }

      setConfirmTarget(null);
      await loadUsers();
    } catch (err) {
      toast({
        title: "Gagal Memproses Tindakan",
        description: err instanceof Error ? err.message : "Internal error",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  }

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-3 border border-dashed rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">
          Memuat daftar pengguna pendaftar platform...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ConfirmDeleteDialog
        open={Boolean(confirmTarget)}
        onOpenChange={(open) => !open && setConfirmTarget(null)}
        title={
          confirmTarget?.type === "role"
            ? `Ubah Role Platform Pengguna?`
            : confirmTarget?.suspend
            ? "Tangguhkan Akun Pengguna?"
            : "Aktifkan Kembali Akun Pengguna?"
        }
        description={
          confirmTarget?.type === "role"
            ? `Tindakan ini akan mengubah hak akses role pengguna ini menjadi '${confirmTarget.newRole}'.`
            : confirmTarget?.suspend
            ? "Pengguna yang ditangguhkan tidak akan dapat login atau mengedit workspace pernikahan."
            : "Pengguna akan dapat kembali mengakses platform dan ruang kerja miliknya."
        }
        itemName={confirmTarget?.email}
        loading={actionLoading}
        onConfirm={handleConfirmAction}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Manajemen User Pendaftar Platform
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola daftar akun terdaftar, ubah role admin/pengguna, dan kendalikan status penangguhan akun.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Cari email atau User ID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9 h-9 text-xs"
          />
        </div>
      </div>

      <Card className="border-border/80 shadow-xs overflow-hidden">
        <CardHeader className="bg-muted/30 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Daftar Pengguna ({totalItems})</CardTitle>
              <CardDescription className="text-xs">
                Akun yang terdaftar di platform NikahYuk SaaS.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              Tidak ada pengguna ditemukan.
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/60">
                <TableRow>
                  <TableHead className="w-12 text-center text-xs font-semibold">No.</TableHead>
                  <TableHead className="text-xs font-semibold">Email Pengguna & User ID</TableHead>
                  <TableHead className="text-xs font-semibold">Role Platform</TableHead>
                  <TableHead className="text-xs font-semibold">Status Akun</TableHead>
                  <TableHead className="text-xs font-semibold text-center">Workspace Owned</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Aksi Manajemen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.map((u, index) => {
                  const globalIndex = (currentPage - 1) * pageSize + index + 1;
                  const isSuperadmin = u.role === "superadmin";

                  return (
                    <TableRow key={u.id} className="hover:bg-muted/30">
                      <TableCell className="text-center font-mono font-semibold text-xs text-muted-foreground">
                        {globalIndex}
                      </TableCell>

                      <TableCell className="text-xs">
                        <p className="font-semibold text-foreground">{u.email}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">ID: {u.id}</p>
                      </TableCell>

                      <TableCell className="text-xs">
                        {isSuperadmin ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            SUPERADMIN
                          </span>
                        ) : u.role === "admin" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium border border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                            ADMIN STAFF
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium border border-border/70 bg-muted/40 text-muted-foreground">
                            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60" />
                            USER
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="text-xs">
                        {u.isSuspended ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                            DITANGGUHKAN
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            AKTIF
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="text-center font-mono font-bold text-xs">
                        {u.weddingsCount} Workspace
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
                            title="Inspeksi Workspace Pengantin"
                          >
                            <a href={`/dashboard`} target="_blank" rel="noreferrer">
                              <ExternalLink className="h-3.5 w-3.5" />
                              Inspect
                            </a>
                          </Button>

                          {!isSuperadmin && (
                            <>
                              {u.role === "user" ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setConfirmTarget({
                                      type: "role",
                                      userId: u.id,
                                      email: u.email,
                                      newRole: "admin",
                                    })
                                  }
                                  className="h-7 text-xs gap-1 text-primary border-primary/30"
                                >
                                  <ShieldCheck className="h-3.5 w-3.5" />
                                  Jadikan Admin
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setConfirmTarget({
                                      type: "role",
                                      userId: u.id,
                                      email: u.email,
                                      newRole: "user",
                                    })
                                  }
                                  className="h-7 text-xs gap-1"
                                >
                                  Turunkan ke User
                                </Button>
                              )}

                              <Button
                                variant={u.isSuspended ? "outline" : "ghost"}
                                size="sm"
                                onClick={() =>
                                  setConfirmTarget({
                                    type: "suspend",
                                    userId: u.id,
                                    email: u.email,
                                    suspend: !u.isSuspended,
                                  })
                                }
                                className={`h-7 text-xs gap-1 ${
                                  u.isSuspended
                                    ? "text-emerald-600 border-emerald-500/30"
                                    : "text-destructive hover:bg-destructive/10"
                                }`}
                              >
                                {u.isSuspended ? (
                                  <>
                                    <UserCheck className="h-3.5 w-3.5" />
                                    Aktifkan
                                  </>
                                ) : (
                                  <>
                                    <UserX className="h-3.5 w-3.5" />
                                    Tangguhkan
                                  </>
                                )}
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}

          <DataTablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
