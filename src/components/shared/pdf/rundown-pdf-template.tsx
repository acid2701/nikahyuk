"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export interface RundownPDFTemplateProps {
  eventName: string;
  weddingDetails?: {
    groomName?: string;
    brideName?: string;
    groomFatherName?: string | null;
    groomMotherName?: string | null;
    brideFatherName?: string | null;
    brideMotherName?: string | null;
  };
  rundowns: Array<{
    time_start: string;
    time_end: string;
    activity_title: string;
    pic_name?: string | null;
    location?: string | null;
    contingency_plan?: string | null;
    rundown_cues?: Array<{ cue_type: string; instruction: string }>;
  }>;
}

export function RundownPDFPrintButton({
  eventName,
  weddingDetails,
  rundowns,
}: RundownPDFTemplateProps) {
  function handlePrint() {
    const existingIframe = document.getElementById("rundown-print-iframe");
    if (existingIframe) {
      existingIframe.remove();
    }

    const iframe = document.createElement("iframe");
    iframe.id = "rundown-print-iframe";
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const groom = weddingDetails?.groomName || "Pengantin Pria";
    const bride = weddingDetails?.brideName || "Pengantin Wanita";
    const groomParents = [weddingDetails?.groomFatherName, weddingDetails?.groomMotherName]
      .filter(Boolean)
      .join(" & ");
    const brideParents = [weddingDetails?.brideFatherName, weddingDetails?.brideMotherName]
      .filter(Boolean)
      .join(" & ");

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Rundown Acara - ${eventName} (${groom} & ${bride})</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; color: #111; }
            .header-title { font-size: 22px; font-weight: bold; text-transform: uppercase; margin-bottom: 2px; color: #991b1b; }
            .couple-subtitle { font-size: 16px; font-weight: bold; color: #1e293b; margin-bottom: 4px; }
            .parents-info { font-size: 12px; color: #475569; margin-bottom: 12px; }
            .event-badge { display: inline-block; background: #f1f5f9; border: 1px solid #cbd5e1; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: bold; color: #0f172a; margin-bottom: 16px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px 12px; font-size: 12px; text-align: left; }
            th { background-color: #f8fafc; font-weight: 600; color: #334155; }
            .time { font-family: monospace; font-weight: bold; width: 110px; color: #0284c7; }
            .cue { font-size: 10px; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; padding: 2px 6px; border-radius: 4px; display: inline-block; margin-top: 4px; }
            .planb { font-size: 10px; background: #ffe4e6; color: #be123c; border: 1px solid #fecdd3; padding: 2px 6px; border-radius: 4px; display: inline-block; margin-top: 4px; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div className="header-title">NikahYuk — Official Rundown & Technical Sheet</div>
          <div className="couple-subtitle">${groom} & ${bride}</div>
          ${
            groomParents || brideParents
              ? `<div class="parents-info">
                  ${groomParents ? `Putra dari: <strong>${groomParents}</strong>` : ""}
                  ${groomParents && brideParents ? " &nbsp;|&nbsp; " : ""}
                  ${brideParents ? `Putri dari: <strong>${brideParents}</strong>` : ""}
                </div>`
              : ""
          }
          <div class="event-badge">Sub-Event: ${eventName} &nbsp;|&nbsp; Dicetak: ${new Date().toLocaleString("id-ID")}</div>

          <table>
            <thead>
              <tr>
                <th style="width: 5%;">No</th>
                <th style="width: 15%;">Waktu</th>
                <th style="width: 35%;">Agenda / Susunan Acara</th>
                <th style="width: 20%;">PIC & Lokasi</th>
                <th style="width: 25%;">Cue Teknis & Plan B</th>
              </tr>
            </thead>
            <tbody>
              ${rundowns
                .map(
                  (r, idx) => `
                <tr>
                  <td style="text-align: center; font-weight: bold;">${idx + 1}</td>
                  <td class="time">${r.time_start} - ${r.time_end}</td>
                  <td><strong>${r.activity_title}</strong></td>
                  <td>
                    ${r.pic_name ? `<div>PIC: <strong>${r.pic_name}</strong></div>` : ""}
                    ${r.location ? `<div style="color: #64748b;">${r.location}</div>` : ""}
                  </td>
                  <td>
                    ${
                      r.contingency_plan
                        ? `<div class="planb">Plan B: ${r.contingency_plan}</div>`
                        : ""
                    }
                    ${(r.rundown_cues || [])
                      .map(
                        (c) =>
                          `<div class="cue">[${c.cue_type.toUpperCase()}] ${c.instruction}</div>`
                      )
                      .join("")}
                  </td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(htmlContent);
      doc.close();
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      }, 250);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handlePrint}
      className="gap-2 text-xs"
    >
      <Printer className="h-4 w-4 text-primary" />
      Cetak / Export PDF Rundown
    </Button>
  );
}
