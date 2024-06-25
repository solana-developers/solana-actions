import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

import { marketingConfig } from "@/config/marketing";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { MainNav } from "@/components/main-nav";
import { SiteFooter } from "@/components/site-footer";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeModeToggle } from "@/components/theme-mode-toggle";
import { siteConfig } from "@/config/site";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Solana Actions and Blinks - Sample Code Snippets",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="flex min-h-screen flex-col">
            <header className="container z-40 bg-background">
              <div className="flex h-20 items-center justify-between py-6">
                <MainNav items={marketingConfig.mainNav} />
                <nav className="flex items-center gap-2">
                  <Button asChild>
                    <Link
                      target="_blank"
                      href={siteConfig.links.docs}
                      className={cn(
                        buttonVariants({ variant: "secondary", size: "sm" }),
                        "px-4",
                      )}
                    >
                      Read the Docs
                    </Link>
                  </Button>

                  <ThemeModeToggle />
                </nav>
              </div>
            </header>

            <div
              className={cn(
                "before:absolute z-[-1] before:h-[300px] before:w-full before:translate-x-1/4 before:translate-y-52 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full after:translate-x-5 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 sm:before:w-[480px] sm:after:w-[240px] before:lg:h-[360px]",
              )}
            ></div>

            <main className={"flex-1 space-y-10 max-w-screen-xl mx-auto"}>
              {children}
            </main>

            <SiteFooter />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
