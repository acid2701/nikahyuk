import { redirect } from "next/navigation";

/**
 * Universal Login Consolidation:
 * Redirect legacy /vendor/login traffic directly to /login
 */
export default function VendorLoginPage() {
  redirect("/login");
}
