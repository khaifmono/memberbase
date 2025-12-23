import { useState } from "react";
import { useMembers, useDeleteMember, usePreRegisterMember } from "@/hooks/use-members";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { MaskedIC } from "@/components/MaskedIC";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, MoreVertical, Plus, Search, FileDown, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { api } from "@shared/routes";

const preRegSchema = z.object({
  icNumber: z.string().min(12).max(14),
  email: z.string().email(),
  name: z.string().optional(),
});

export default function Members() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isLoading } = useMembers({ page, limit: 10, search });
  const deleteMutation = useDeleteMember();
  const preRegMutation = usePreRegisterMember();
  const { toast } = useToast();
  const [isPreRegOpen, setIsPreRegOpen] = useState(false);

  const preRegForm = useForm<z.infer<typeof preRegSchema>>({
    resolver: zodResolver(preRegSchema),
    defaultValues: { icNumber: "", email: "", name: "" },
  });

  const onPreRegSubmit = (values: z.infer<typeof preRegSchema>) => {
    preRegMutation.mutate(values, {
      onSuccess: () => {
        setIsPreRegOpen(false);
        preRegForm.reset();
        toast({ title: "Success", description: "Member pre-registered successfully" });
      },
      onError: (err) => {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    });
  };

  const handleExport = () => {
    window.open(api.members.export.path, '_blank');
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold">Members</h2>
          <p className="text-muted-foreground">Manage registration and member details.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <FileDown className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          
          <Dialog open={isPreRegOpen} onOpenChange={setIsPreRegOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Pre-Register
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Pre-Register Member</DialogTitle>
              </DialogHeader>
              <Form {...preRegForm}>
                <form onSubmit={preRegForm.handleSubmit(onPreRegSubmit)} className="space-y-4">
                  <FormField
                    control={preRegForm.control}
                    name="icNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>IC Number (No dashes)</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={preRegForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={preRegForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name (Optional)</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={preRegMutation.isPending}>
                    {preRegMutation.isPending ? "Saving..." : "Create Record"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-card rounded-xl border shadow-sm">
        <div className="p-4 border-b flex gap-4">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or IC..." 
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Full Name</TableHead>
                <TableHead>IC Number</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : data?.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No members found.
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.fullName || member.email}</TableCell>
                    <TableCell><MaskedIC ic={member.icNumber} /></TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        member.isRegistered 
                          ? "bg-green-100 text-green-800"
                          : "bg-amber-100 text-amber-800"
                      }`}>
                        {member.isRegistered ? "Registered" : "Pre-Reg"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            className="text-red-600 focus:text-red-600"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this member?")) {
                                deleteMutation.mutate(member.id);
                              }
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t flex justify-between items-center text-sm text-muted-foreground">
          <div>Page {data?.page} of {data?.totalPages}</div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              disabled={!data || page >= data.totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
