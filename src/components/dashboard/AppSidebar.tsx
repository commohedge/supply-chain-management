import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  TrendingUp,
  Clock,
  Ship,
  Menu,
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

const navItems = [
  { title: "Supply Chain Overview", url: "/", icon: LayoutDashboard },
  { title: "Supply & Execution", url: "/supply", icon: Package },
  { title: "Sales Pipeline", url: "/pipeline", icon: ShoppingCart },
  { title: "Market & Value", url: "/market", icon: TrendingUp },
  { title: "Optionality & Timing", url: "/optionality", icon: Clock },
  { title: "Global Flows", url: "/flows", icon: Ship },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
            CH
          </div>
          {!collapsed && (
            <div>
              <div className="font-bold text-sm text-sidebar-accent-foreground tracking-tight">COMMO<span className="text-primary">HEDGE</span></div>
              <div className="text-[10px] text-sidebar-foreground uppercase tracking-widest">Dashboard</div>
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
      <SidebarFooter className="p-4 border-t border-sidebar-border">
        {!collapsed && (
          <div className="text-[10px] text-sidebar-foreground/40 uppercase tracking-wider">
            Status as of 02/04/2026
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
