import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAdminAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  History,
  LogOut,
  Menu,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export function AdminLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { logoutMutation } = useAdminAuth();

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/members", label: "Members", icon: Users },
    { href: "/admin/lookups", label: "Manage Data", icon: BookOpen },
    { href: "/admin/audit", label: "Audit Logs", icon: History },
  ];

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h1 className="font-display font-bold text-xl leading-none">CIS Admin</h1>
          <p className="text-xs text-muted-foreground mt-1">Seni Silat Cekak</p>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <div 
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer
                  ${isActive 
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }
                `}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <Button 
          variant="outline" 
          className="w-full justify-start gap-3"
          onClick={() => logoutMutation.mutate()}
        >
          <LogOut size={18} />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 border-r bg-card fixed inset-y-0 z-50">
        <NavContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" className="lg:hidden fixed top-4 left-4 z-50 p-2">
            <Menu size={24} />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <NavContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-6 lg:p-10">
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
