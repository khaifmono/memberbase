import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemberAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { ArrowRight, Mail, Shield, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const requestSchema = z.object({
  icNumber: z.string().min(12, "Invalid IC format").max(14, "Invalid IC format"),
  email: z.string().email("Invalid email address"),
});

const verifySchema = z.object({
  code: z.string().length(6, "Must be 6 digits"),
});

export default function Landing() {
  const [step, setStep] = useState<"request" | "verify">("request");
  const [requestData, setRequestData] = useState<{ icNumber: string; email: string } | null>(null);
  
  const { requestOtpMutation, verifyOtpMutation } = useMemberAuth();
  const { toast } = useToast();

  const requestForm = useForm<z.infer<typeof requestSchema>>({
    resolver: zodResolver(requestSchema),
    defaultValues: { icNumber: "", email: "" },
  });

  const verifyForm = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
    defaultValues: { code: "" },
  });

  const onRequestSubmit = (data: z.infer<typeof requestSchema>) => {
    requestOtpMutation.mutate(data, {
      onSuccess: () => {
        setRequestData(data);
        setStep("verify");
        toast({ title: "OTP Sent", description: "Check your email for the verification code." });
      },
      onError: (err) => {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    });
  };

  const onVerifySubmit = (data: z.infer<typeof verifySchema>) => {
    if (!requestData) return;
    // TODO: Re-enable OTP verification
    verifyOtpMutation.mutate({ ...data, ...requestData }, {
      onError: (err) => {
        toast({ title: "Verification Failed", description: err.message, variant: "destructive" });
      }
    });
  };

  // Temporary: Skip OTP and go directly to profile
  const skipOtpAndLogin = () => {
    if (!requestData) return;
    verifyOtpMutation.mutate({ code: "123654", ...requestData }, {
      onError: (err) => {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Hero Section */}
      <div className="md:w-1/2 p-8 md:p-12 lg:p-20 flex flex-col justify-between bg-slate-900 text-white relative overflow-hidden">
        {/* Abstract background blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight">CIS Portal</span>
          </div>
          
          <h1 className="font-display font-bold text-4xl md:text-6xl mb-6 leading-tight">
            Seni Silat Cekak <br />
            <span className="text-blue-400">Information System</span>
          </h1>
          <p className="text-lg text-slate-300 max-w-md leading-relaxed">
            Welcome to the official member management portal. Register, update your profile, and manage your membership securely.
          </p>
        </div>

        <div className="relative z-10 mt-12 space-y-4">
          <div className="flex items-center gap-3 text-slate-300">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <span>Secure Data Protection</span>
          </div>
          <div className="flex items-center gap-3 text-slate-300">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <span>Easy Profile Management</span>
          </div>
          <div className="flex items-center gap-3 text-slate-300">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <span>Real-time Class Updates</span>
          </div>
        </div>

        <div className="relative z-10 mt-8">
           <Link href="/admin/login" className="text-sm text-slate-400 hover:text-white transition-colors">
             Administrator Access →
           </Link>
        </div>
      </div>

      {/* Auth Form Section */}
      <div className="md:w-1/2 flex items-center justify-center p-6 md:p-12 bg-slate-50">
        <Card className="w-full max-w-md shadow-2xl border-none">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold font-display">
              {step === "request" ? "Member Access" : "Verify OTP"}
            </CardTitle>
            <CardDescription>
              {step === "request" 
                ? "Enter your details to access your profile." 
                : `Enter the code sent to ${requestData?.email}`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === "request" ? (
              <Form {...requestForm}>
                <form onSubmit={requestForm.handleSubmit(onRequestSubmit)} className="space-y-4">
                  <FormField
                    control={requestForm.control}
                    name="icNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>IC Number (No dashes)</FormLabel>
                        <FormControl>
                          <Input placeholder="900101145678" {...field} className="h-11" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={requestForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="name@example.com" {...field} className="h-11" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base mt-2"
                    disabled={requestOtpMutation.isPending}
                  >
                    {requestOtpMutation.isPending ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending Code...</>
                    ) : (
                      <>Get Verification Code <ArrowRight className="ml-2 h-4 w-4" /></>
                    )}
                  </Button>
                </form>
              </Form>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  Verification code sent to {requestData?.email}
                </p>
                <Button 
                  type="button" 
                  className="w-full h-12 text-base"
                  onClick={skipOtpAndLogin}
                  disabled={verifyOtpMutation.isPending}
                >
                  {verifyOtpMutation.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</>
                  ) : (
                    "Continue to Profile"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="link"
                  className="w-full"
                  onClick={() => setStep("request")}
                >
                  Back to Request
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
