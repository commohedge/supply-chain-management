import {
  LayoutDashboard,
  LineChart,
  Package,
  ShoppingCart,
  TrendingUp,
  Clock,
  Ship,
  Globe2,
  Database,
  Anchor,
  FileSpreadsheet,
  Sparkles,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { useDashboardData } from "@/contexts/DashboardDataContext";
import { useI18n } from "@/contexts/I18nContext";
import { BrandingLogo } from "@/components/dashboard/BrandingLogo";

const navItems = [
  { titleKey: "nav.dashboard", url: "/", icon: LayoutDashboard },
  { titleKey: "nav.overview", url: "/overview", icon: LineChart },
  { titleKey: "nav.supply", url: "/supply", icon: Package },
  { titleKey: "nav.pipeline", url: "/pipeline", icon: ShoppingCart },
  { titleKey: "nav.market", url: "/market", icon: TrendingUp },
  { titleKey: "nav.optionality", url: "/optionality", icon: Clock },
  { titleKey: "nav.flows", url: "/flows", icon: Ship },
  { titleKey: "nav.map", url: "/map", icon: Globe2 },
  { titleKey: "nav.data", url: "/data", icon: FileSpreadsheet },
] as const;

export function AppSidebar() {
  const { t } = useI18n();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { config } = useDashboardData();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <BrandingLogo logoDataUrl={config.general.logoDataUrl} className="h-8 w-8 text-sm" imgClassName="h-8 w-8 max-h-8 max-w-8" />
          {!collapsed && (
            <div>
              <div className="font-bold text-sm text-sidebar-accent-foreground tracking-tight">{config.general.companyName}</div>
              <div className="text-[10px] text-sidebar-foreground uppercase tracking-widest">{t("layout.monitoringDashboard")}</div>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-sidebar-foreground/50">{t("nav.navigation")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-sidebar-accent/50 transition-colors"
                      activeClassName="bg-sidebar-accent text-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span className="text-sm">{t(item.titleKey)}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink
                to="/ai"
                className="hover:bg-sidebar-accent/50 transition-colors"
                activeClassName="bg-sidebar-accent text-primary font-medium"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {!collapsed && <span className="text-sm">{t("nav.ai")}</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink
                to="/freight"
                className="hover:bg-sidebar-accent/50 transition-colors"
                activeClassName="bg-sidebar-accent text-primary font-medium"
              >
                <Anchor className="mr-2 h-4 w-4" />
                {!collapsed && <span className="text-sm">{t("nav.freight")}</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink
                to="/settings"
                className="hover:bg-sidebar-accent/50 transition-colors"
                activeClassName="bg-sidebar-accent text-primary font-medium"
              >
                <Database className="mr-2 h-4 w-4" />
                {!collapsed && <span className="text-sm">{t("nav.settings")}</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {!collapsed && (
          <div className="px-4 pb-4 pt-2 text-[10px] text-sidebar-foreground/40 uppercase tracking-wider">
            {t("nav.statusAsOf")} {config.general.dashboardDate}
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
