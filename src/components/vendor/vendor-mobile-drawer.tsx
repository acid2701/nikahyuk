"use client";

import * as React from "react";
import { VendorSidebar } from "./vendor-sidebar";
import { Button } from "@/components/ui/button";
import { Menu, Building2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function VendorMobileDrawer({ userEmail }: { userEmail: string }) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-card">
      <div className="flex items-center space-x-2">
        <div className="h-7 w-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 border border-amber-500/30">
          <Building2 className="h-4 w-4" />
        </div>
        <span className="font-serif text-base font-bold">Portal Vendor</span>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        aria-label="Buka Menu Vendor"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 max-w-xs h-full left-0 translate-x-0 rounded-none border-r border-border">
          <DialogHeader className="p-4 border-b border-border text-left">
            <DialogTitle className="font-serif text-lg font-bold">
              NikahYuk Partner Ecosystem
            </DialogTitle>
          </DialogHeader>
          <VendorSidebar userEmail={userEmail} onNavigate={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
