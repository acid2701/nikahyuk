"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowLeft, Users, MapPin } from "lucide-react";
import Link from "next/link";

export interface MobileGuestLookupItem {
  id: string;
  fullName: string;
  pax: number;
  tableName?: string | null;
  attendanceStatus: string;
}

export interface MobileGuestLookupProps {
  token: string;
  guests: MobileGuestLookupItem[];
}

export function MobileGuestLookup({ token, guests }: MobileGuestLookupProps) {
  const [search, setSearch] = React.useState("");

  const filtered = guests.filter((g) =>
    g.fullName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link href={`/view/${token}`}>
          <Button variant="ghost" size="sm" className="gap-1 h-8 px-3 rounded-full text-xs hover:bg-muted">
            <ArrowLeft className="h-4 w-4" /> Kembali
          </Button>
        </Link>
        <span className="font-mono text-xs font-semibold text-[#ff385c] bg-[#ff385c]/10 px-3 py-1 rounded-full flex items-center gap-1.5 border border-[#ff385c]/20">
          <Users className="h-3.5 w-3.5" /> Door Greeter Lookup
        </span>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          placeholder="Cari nama tamu untuk lihat nomor meja..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-10 text-xs"
        />
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <p className="text-center text-xs text-muted-foreground py-8">
            Tidak ada tamu cocok dengan pencarian.
          </p>
        ) : (
          filtered.map((g) => (
            <Card key={g.id} className="border-border/70 bg-card/90 rounded-xl hover:border-foreground/30 transition-all">
              <CardContent className="p-3.5 flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="font-semibold text-xs text-foreground">{g.fullName}</h3>
                  <p className="text-[11px] text-muted-foreground">Alokasi: {g.pax} Pax</p>
                </div>

                <div className="text-right">
                  {g.tableName ? (
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 font-semibold text-xs gap-1">
                      <MapPin className="h-3 w-3" /> {g.tableName}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px]">
                      Belum Ada Meja
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
