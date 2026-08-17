export function sanitizePhoneNumber(raw: string): string {
  if (!raw) return "";
  const digitsOnly = raw.replace(/\D/g, "");

  if (digitsOnly.startsWith("0")) {
    return "62" + digitsOnly.slice(1);
  }
  if (digitsOnly.startsWith("62")) {
    return digitsOnly;
  }
  return "62" + digitsOnly;
}

export function buildWhatsAppDirectLink(
  rawPhone: string,
  templateString: string,
  variables: Record<string, string> = {}
): string {
  const sanitized = sanitizePhoneNumber(rawPhone);
  if (!sanitized) return "";

  let resolvedText = templateString;

  for (const [key, value] of Object.entries(variables)) {
    resolvedText = resolvedText.replaceAll(`{${key}}`, value || "");
  }

  return `https://wa.me/${sanitized}?text=${encodeURIComponent(resolvedText)}`;
}
