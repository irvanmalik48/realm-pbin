import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
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

export const metadata: Metadata = {
  title: "Realm Pastebin — Fast, Clean & Simple Snippet Sharing",
  description:
    "A clean, fast pastebin for code and text snippets with syntax highlighting and password protection.",
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
            <Header />
            <main className="flex flex-1 flex-col w-full">{children}</main>
            <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground w-full">
              <div className="w-full flex flex-col items-center justify-between gap-2 px-4 sm:px-6 lg:px-8 sm:flex-row">
                <p>
                  Realm Pastebin — Simple, fast, and secure snippet sharing.
                </p>
                <p className="flex items-center gap-1 font-mono text-[11px]">
                  Fast & lightweight
                </p>
              </div>
            </footer>
            <Toaster position="bottom-right" richColors />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
