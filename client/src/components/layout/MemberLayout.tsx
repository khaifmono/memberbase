import { ReactNode } from "react";
import { useMemberAuth } from "@/hooks/use-auth";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MemberLayout({ children }: { children: ReactNode }) {
  const { logoutMutation } = useMemberAuth();

  return (
    <div className="min-h-screen bg-background">
      <nav className="h-16 border-b bg-card px-4 md:px-8 flex items-center justify-between sticky top-0 z-50 bg-white/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
            C
          </div>
          <span className="font-display font-bold text-lg hidden sm:block">CIS Member Portal</span>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2 text-muted-foreground hover:text-destructive"
          onClick={() => logoutMutation.mutate()}
        >
          <LogOut size={16} />
          Sign Out
        </Button>
      </nav>

      <main className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="animate-in fade-in zoom-in-95 duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
