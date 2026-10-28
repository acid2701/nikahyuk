import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/shared/theme/theme-provider";
import { getAppBranding } from "@/lib/branding";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

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
      icon: branding.faviconUrl || "/favicon.ico",
      shortcut: branding.faviconUrl || "/favicon.ico",
      apple: branding.logoUrl || branding.faviconUrl || "/favicon.ico",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${plusJakartaSans.variable} h-full antialiased`}
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
