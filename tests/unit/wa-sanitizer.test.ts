import { describe, it, expect } from "vitest";
import {
  sanitizePhoneNumber,
  buildWhatsAppDirectLink,
} from "@/lib/utils/wa-sanitizer";

describe("WhatsApp Sanitizer Unit Tests", () => {
  it("should sanitize phone numbers starting with 08 to 628", () => {
    expect(sanitizePhoneNumber("08123456789")).toBe("628123456789");
    expect(sanitizePhoneNumber("0812-3456-7890")).toBe("6281234567890");
  });

  it("should sanitize phone numbers starting with +62 or 62", () => {
    expect(sanitizePhoneNumber("+628123456789")).toBe("628123456789");
    expect(sanitizePhoneNumber("628123456789")).toBe("628123456789");
  });

  it("should add 62 prefix if starting with plain number without 0", () => {
    expect(sanitizePhoneNumber("8123456789")).toBe("628123456789");
  });

  it("should build direct WhatsApp URL with variable tag replacements", () => {
    const rawPhone = "08123456789";
    const template = "Halo {nama_vendor}, untuk acara {nama_event} tanggal {tanggal}.";
    const variables = {
      nama_vendor: "Katering Berkah",
      nama_event: "Akad Nikah",
      tanggal: "2026-10-10",
    };

    const link = buildWhatsAppDirectLink(rawPhone, template, variables);
    expect(link).toBe(
      "https://wa.me/628123456789?text=Halo%20Katering%20Berkah%2C%20untuk%20acara%20Akad%20Nikah%20tanggal%202026-10-10."
    );
  });
});
