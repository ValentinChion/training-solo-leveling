"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Dumbbell, Grid3x3, Scroll, Sparkles, PenLine } from "lucide-react";
import { motion } from "motion/react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/shadcn/sidebar";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/workouts", label: "Workouts", icon: Dumbbell },
  { href: "/grid", label: "Dokkaebi's Bag", icon: Grid3x3 },
  { href: "/scenarios", label: "Scenarios", icon: Scroll },
  { href: "/plan", label: "Plan", icon: Sparkles },
] as const;

const ADMIN_ITEMS = [
  { href: "/designer", label: "Grid Designer", icon: PenLine },
] as const;

const ease = [0.23, 1, 0.32, 1] as const;

export function AppSidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <Sidebar style={{ "--sidebar": "transparent" } as React.CSSProperties}>
      <SidebarHeader className="px-5 py-6">
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
        >
          <p className="ffx-title text-xl font-bold tracking-[0.07em] uppercase leading-none">
            Star Stream
          </p>
          <p className="section-header mt-1.5 text-[0.6rem]">
            ORV Fitness Tracker
          </p>
        </motion.div>
      </SidebarHeader>

      <SidebarContent className="px-2 pt-1">
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {NAV_ITEMS.map(({ href, label, icon: Icon }, i) => (
                <SidebarMenuItem key={href}>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.45, delay: 0.1 + i * 0.07, ease }}
                  >
                    <SidebarMenuButton asChild isActive={isActive(href)} size="lg">
                      <Link href={href}>
                        <Icon className="size-[1.05rem]" />
                        <span>{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </motion.div>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="p-0 mt-4">
          <SidebarGroupLabel className="px-2 text-[0.6rem] uppercase tracking-widest"
            style={{ color: "rgba(100,170,255,0.35)" }}
          >
            Admin
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {ADMIN_ITEMS.map(({ href, label, icon: Icon }, i) => (
                <SidebarMenuItem key={href}>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.45, delay: 0.1 + (NAV_ITEMS.length + i) * 0.07, ease }}
                  >
                    <SidebarMenuButton asChild isActive={isActive(href)} size="lg">
                      <Link href={href}>
                        <Icon className="size-[1.05rem]" />
                        <span>{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </motion.div>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
