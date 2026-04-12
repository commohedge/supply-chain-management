import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useI18n } from "@/contexts/I18nContext";
import { AppSidebar } from "./AppSidebar";

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center border-b border-border px-4 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <div className="ml-auto flex items-center gap-2">
              <LanguageToggle />
              <ThemeToggle />
              <div className="flex items-center gap-2 border-l border-border pl-3">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse-glow" />
                <span className="text-xs text-muted-foreground font-mono">{t("layout.live")}</span>
              </div>
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto glow-top">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
