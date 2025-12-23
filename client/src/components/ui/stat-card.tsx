import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  className?: string;
}

export function StatCard({ label, value, icon, trend, className }: StatCardProps) {
  return (
    <div className={cn(
      "bg-card rounded-2xl p-6 border shadow-sm hover:shadow-md transition-all duration-300",
      className
    )}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
          <h3 className="text-3xl font-display font-bold text-foreground">{value}</h3>
          {trend && (
            <p className="text-xs text-green-600 mt-2 font-medium bg-green-50 px-2 py-1 rounded-full inline-block">
              {trend}
            </p>
          )}
        </div>
        <div className="p-3 bg-primary/10 text-primary rounded-xl">
          {icon}
        </div>
      </div>
    </div>
  );
}
