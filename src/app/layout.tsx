import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { AnalyticsTracker } from "@/components/analytics-tracker";
import { CustomScrollbar } from "@/components/custom-scrollbar";
import { Header } from "@/components/header";
import { LenisProvider } from "@/components/lenis-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function getMetadataBase(): URL | undefined {
  const url =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);
  if (!url) return undefined;
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`);
  } catch {
    return undefined;
  }
}

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: "Realm Pastebin | Fast, Clean & Simple Snippet Sharing",
    template: "%s | Realm Pastebin",
  },
  description:
    "A clean, fast pastebin for code and text snippets with syntax highlighting and password protection.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Realm Pastebin",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  initialScale: 1,
  width: "device-width",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full antialiased",
        geistSans.variable,
        geistMono.variable,
        inter.variable,
        "font-sans",
      )}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TooltipProvider>
            <LenisProvider>
              <AnalyticsTracker />
              <Header />
              <main className="flex flex-1 flex-col w-full">{children}</main>
              <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground w-full">
                <div className="w-full flex flex-col items-center justify-between gap-2 px-4 sm:px-6 lg:px-8 sm:flex-row">
                  <p>
                    Realm Pastebin. Simple, fast, and secure snippet sharing.
                  </p>
                  <p className="flex items-center gap-1 font-mono text-[11px]">
                    Fast & lightweight
                  </p>
                </div>
              </footer>
              <CustomScrollbar />
              <Toaster position="bottom-right" richColors />
            </LenisProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
