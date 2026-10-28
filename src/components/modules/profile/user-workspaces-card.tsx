"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, ArrowRight, ShieldCheck, Users } from "lucide-react";

export interface WorkspaceItem {
  id: string;
  groom_name: string;
  bride_name: string;
  wedding_slug: string;
  role: "owner" | "wo" | "family_committee" | "partner";
}

export interface UserWorkspacesCardProps {
  workspaces: WorkspaceItem[];
}

export function UserWorkspacesCard({ workspaces }: UserWorkspacesCardProps) {
  return (
    <Card className="border-border/80 shadow-xs">
      <CardHeader>
        <CardTitle className="text-lg font-sans flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary fill-primary/10" /> Workspace Pernikahan Terhubung ({workspaces.length})
        </CardTitle>
        <CardDescription className="text-xs">
          Daftar ruang kerja pernikahan yang Anda kelola sebagai Pemilik (Owner) atau Kolaborator.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {workspaces.length === 0 ? (
          <div className="p-6 text-center border border-dashed rounded-lg space-y-2">
            <p className="text-xs text-muted-foreground">
              Anda belum terhubung ke workspace pernikahan mana pun.
            </p>
            <Button asChild size="sm" className="h-8 text-xs">
              <Link href="/dashboard">Buat Workspace Baru</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {workspaces.map((w) => {
              const isOwner = w.role === "owner";
              return (
                <div
                  key={w.id}
                  className="p-3.5 rounded-lg border border-border bg-card/60 hover:bg-accent/20 transition-colors flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-sans font-semibold text-sm text-foreground">
                        {w.groom_name} & {w.bride_name}
                      </h4>
                      <Badge variant={isOwner ? "default" : "secondary"} className="text-[9px] uppercase px-1.5 py-0">
                        {isOwner ? (
                          <span className="flex items-center gap-1">
                            <ShieldCheck className="h-2.5 w-2.5" /> Owner
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Users className="h-2.5 w-2.5" /> {w.role}
                          </span>
                        )}
                      </Badge>
                    </div>
                    <p className="text-[11px] font-mono text-primary truncate">
                      /{w.wedding_slug}
                    </p>
                  </div>

                  <Button asChild variant="outline" size="sm" className="h-8 text-xs justify-between w-full">
                    <Link href={`/dashboard/${w.id}`}>
                      <span>Buka Workspace</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
