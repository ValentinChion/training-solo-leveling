import type { Metadata } from "next";
import { Cinzel, Rajdhani, Geist_Mono } from "next/font/google";

import { TooltipProvider } from "@/components/ui/shadcn/tooltip";
import { SidebarInset, SidebarProvider } from "@/components/ui/shadcn/sidebar";
import { AppSidebar } from "@/components/features/app-layout/Sidebar";
import { AppHeader } from "@/components/features/app-layout/Header";
import { Providers } from "@/components/providers";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const rajdhani = Rajdhani({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Star Stream — ORV Fitness Tracker",
  description: "Omniscient Reader's Viewpoint progression system applied to fitness tracking.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${cinzel.variable} ${rajdhani.variable} ${geistMono.variable} antialiased`}>
        <TooltipProvider>
          <Providers>
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset>
                <AppHeader />
                <main className="flex-1 p-6">{children}</main>
              </SidebarInset>
            </SidebarProvider>
          </Providers>
        </TooltipProvider>
      </body>
    </html>
  );
}
