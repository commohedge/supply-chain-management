import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  TrendingUp,
  Clock,
  Ship,
  Globe2,
  Database,
  Anchor,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
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

const navItems = [
  { title: "Supply Chain Overview", url: "/", icon: LayoutDashboard },
  { title: "Supply & Execution", url: "/supply", icon: Package },
  { title: "Sales Pipeline", url: "/pipeline", icon: ShoppingCart },
  { title: "Market & Value", url: "/market", icon: TrendingUp },
  { title: "Optionality & Timing", url: "/optionality", icon: Clock },
  { title: "Global Flows", url: "/flows", icon: Ship },
  { title: "Carte BI", url: "/map", icon: Globe2 },
  { title: "Freight Simulator", url: "/freight", icon: Anchor },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { config } = useDashboardData();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
            OCP
          </div>
          {!collapsed && (
            <div>
              <div className="font-bold text-sm text-sidebar-accent-foreground tracking-tight">{config.general.companyName}</div>
              <div className="text-[10px] text-sidebar-foreground uppercase tracking-widest">Monitoring Dashboard</div>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-sidebar-foreground/50">Navigation</SidebarGroupLabel>
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
                      {!collapsed && <span className="text-sm">{item.title}</span>}
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
                to="/settings"
                className="hover:bg-sidebar-accent/50 transition-colors"
                activeClassName="bg-sidebar-accent text-primary font-medium"
              >
                <Database className="mr-2 h-4 w-4" />
                {!collapsed && <span className="text-sm">Référentiel</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {!collapsed && (
          <div className="px-4 pb-4 pt-2 text-[10px] text-sidebar-foreground/40 uppercase tracking-wider">
            Status as of {config.general.dashboardDate}
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
