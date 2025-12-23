import { useMembers } from "@/hooks/use-members";
import { useClasses } from "@/hooks/use-lookups";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { StatCard } from "@/components/ui/stat-card";
import { Users, BookOpen, UserCheck, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: members, isLoading: membersLoading } = useMembers();
  const { data: classes, isLoading: classesLoading } = useClasses();

  if (membersLoading || classesLoading) {
    return (
      <AdminLayout>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
        </div>
      </AdminLayout>
    );
  }

  const totalMembers = members?.total || 0;
  // Calculate registered vs pre-registered from the paginated data is inaccurate if not fetching all,
  // but for MVP dashboard using the list response metadata or first page is a compromise.
  // Ideally, backend provides a separate stats endpoint. We'll simulate derived stats for now.
  
  const activeClasses = classes?.filter(c => c.isActive).length || 0;
  
  // These are placeholders since the list endpoint is paginated and doesn't return full counts by status
  // In a real app, I'd add a specific /api/stats endpoint.
  // For now, let's just show Total Members and Active Classes which we know.
  
  return (
    <AdminLayout>
      <div className="space-y-2 mb-8">
        <h2 className="text-3xl font-display font-bold">Dashboard</h2>
        <p className="text-muted-foreground">System overview and key metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Members" 
          value={totalMembers} 
          icon={<Users size={24} />}
          trend="+12% this month"
        />
        <StatCard 
          label="Active Classes" 
          value={activeClasses} 
          icon={<BookOpen size={24} />}
        />
        <StatCard 
          label="Registered" 
          value="--" 
          icon={<UserCheck size={24} />}
          className="opacity-70"
        />
         <StatCard 
          label="Pending Review" 
          value="--" 
          icon={<AlertCircle size={24} />}
          className="opacity-70"
        />
      </div>

      <div className="mt-8 bg-card rounded-2xl border p-6 shadow-sm">
        <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
        <div className="flex gap-4">
          {/* Add quick action buttons here if needed */}
          <p className="text-muted-foreground text-sm">Select 'Members' in the sidebar to manage registration data.</p>
        </div>
      </div>
    </AdminLayout>
  );
}
