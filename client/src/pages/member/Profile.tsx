import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemberAuth } from "@/hooks/use-auth";
import { useUpdateMe } from "@/hooks/use-member-me";
import { useClasses } from "@/hooks/use-lookups";
import { MemberLayout } from "@/components/layout/MemberLayout";
import { insertMemberSchema } from "@shared/schema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";

export default function MemberProfile() {
  const { member } = useMemberAuth();
  const { data: classes } = useClasses();
  const updateMutation = useUpdateMe();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof insertMemberSchema>>({
    resolver: zodResolver(insertMemberSchema),
    defaultValues: {
      fullName: "",
      nickname: "",
      phone: "",
      address: "",
      postcode: "",
      city: "",
      state: "",
      occupation: "",
      employerName: "",
      kinName: "",
      kinRelation: "",
      kinPhone: "",
      hasSilatExperience: false,
      silatExperienceDetails: "",
      classIds: [],
    },
  });

  // Pre-fill form when member data loads
  useEffect(() => {
    if (member) {
      // @ts-ignore - complex type matching for form reset
      form.reset({
        ...member,
        classIds: member.classes || [], // Assuming member object has classes array from API
      });
    }
  }, [member, form]);

  const onSubmit = (data: z.infer<typeof insertMemberSchema>) => {
    updateMutation.mutate(data, {
      onSuccess: () => {
        toast({ title: "Profile Updated", description: "Your details have been saved successfully." });
      },
      onError: (err) => {
        toast({ title: "Update Failed", description: err.message, variant: "destructive" });
      }
    });
  };

  return (
    <MemberLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold">My Profile</h1>
        <p className="text-muted-foreground">Complete your registration details below.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          {/* PERSONAL INFO */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your basic contact details.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Full Name</FormLabel>
                    <FormControl><Input {...field} value={field.value || ""} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nickname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nickname</FormLabel>
                    <FormControl><Input {...field} value={field.value || ""} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl><Input {...field} value={field.value || ""} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Address</FormLabel>
                    <FormControl><Textarea {...field} value={field.value || ""} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl><Input {...field} value={field.value || ""} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="postcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postcode</FormLabel>
                    <FormControl><Input {...field} value={field.value || ""} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* CLASSES */}
          <Card>
            <CardHeader>
              <CardTitle>Class Selection</CardTitle>
              <CardDescription>Select the classes you attend.</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="classIds"
                render={() => (
                  <FormItem>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {classes?.map((cls) => (
                        <FormField
                          key={cls.id}
                          control={form.control}
                          name="classIds"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={cls.id}
                                className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 hover:bg-muted/50 cursor-pointer"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(cls.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...(field.value || []), cls.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== cls.id
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="font-normal cursor-pointer">
                                    {cls.name}
                                  </FormLabel>
                                </div>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* JOB INFO */}
          <Card>
            <CardHeader>
              <CardTitle>Employment Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="occupation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Occupation</FormLabel>
                    <FormControl><Input {...field} value={field.value || ""} /></FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="employerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employer Name</FormLabel>
                    <FormControl><Input {...field} value={field.value || ""} /></FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* NEXT OF KIN */}
          <Card>
            <CardHeader>
              <CardTitle>Next of Kin (Waris)</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="kinName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl><Input {...field} value={field.value || ""} /></FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="kinRelation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relation</FormLabel>
                    <FormControl><Input {...field} value={field.value || ""} /></FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="kinPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl><Input {...field} value={field.value || ""} /></FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <div className="flex justify-end pt-4">
             <Button 
               type="submit" 
               size="lg" 
               className="w-full md:w-auto text-lg px-8"
               disabled={updateMutation.isPending}
             >
               {updateMutation.isPending ? (
                 <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving...</>
               ) : (
                 <><Save className="mr-2 h-5 w-5" /> Save Changes</>
               )}
             </Button>
          </div>
        </form>
      </Form>
    </MemberLayout>
  );
}
