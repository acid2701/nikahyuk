import type { Metadata } from "next";
import { Inter, Titillium_Web } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/shared/theme/theme-provider";
import { getAppBranding } from "@/lib/branding";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const titilliumWeb = Titillium_Web({
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  variable: "--font-display",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getAppBranding();

  return {
    title: {
      default: `${branding.appName} — ${branding.tagline}`,
      template: `%s | ${branding.appName}`,
    },
    description: branding.heroSubtitle || branding.tagline,
    icons: {
      icon: branding.faviconUrl || "/favicon.ico",
      shortcut: branding.faviconUrl || "/favicon.ico",
      apple: branding.logoUrl || branding.faviconUrl || "/favicon.ico",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${inter.variable} ${titilliumWeb.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
