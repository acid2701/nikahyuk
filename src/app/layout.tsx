import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/shared/theme/theme-provider";
import { getAppBranding } from "@/lib/branding";
import { DynamicFaviconUpdater } from "@/components/shared/branding/dynamic-favicon-updater";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#0B1120" },
  ],
};

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getAppBranding();
  const siteUrl = "https://nikahyu.my.id";
  const ogImage = branding.logoUrl || `${siteUrl}/favicon.ico`;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${branding.appName} — ${branding.tagline}`,
      template: `%s | ${branding.appName}`,
    },
    description: branding.heroSubtitle || branding.tagline,
    icons: {
      icon: [
        {
          url: branding.faviconUrl || "/favicon.ico",
        },
      ],
      shortcut: branding.faviconUrl || "/favicon.ico",
      apple: branding.logoUrl || branding.faviconUrl || "/favicon.ico",
    },
    manifest: "/manifest.webmanifest",
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: branding.appName,
    },
    openGraph: {
      type: "website",
      locale: "id_ID",
      url: siteUrl,
      siteName: branding.appName,
      title: `${branding.appName} — ${branding.tagline}`,
      description: branding.heroSubtitle || branding.tagline,
      images: [
        {
          url: ogImage,
          width: 800,
          height: 600,
          alt: branding.appName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${branding.appName} — ${branding.tagline}`,
      description: branding.heroSubtitle || branding.tagline,
      images: [ogImage],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const branding = await getAppBranding();

  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        <DynamicFaviconUpdater initialFavicon={branding.faviconUrl} />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          themes={["light", "dark", "cute"]}
          disableTransitionOnChange={false}
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
