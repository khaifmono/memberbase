import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type Admin, type Member } from "@shared/routes";
import { useLocation } from "wouter";
import { z } from "zod";

// Admin Auth Types
type LoginInput = z.infer<typeof api.admin.login.input>;

// Member Auth Types
type RequestOtpInput = z.infer<typeof api.auth.requestOtp.input>;
type VerifyOtpInput = z.infer<typeof api.auth.verifyOtp.input>;

export function useAdminAuth() {
  const [_, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Check current admin session
  const { data: admin, isLoading, error } = useQuery({
    queryKey: [api.admin.me.path],
    queryFn: async () => {
      const res = await fetch(api.admin.me.path, { credentials: "include" });
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch admin");
      return api.admin.me.responses[200].parse(await res.json());
    },
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginInput) => {
      const res = await fetch(api.admin.login.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 401) throw new Error("Invalid credentials");
        throw new Error("Login failed");
      }
      return api.admin.login.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.setQueryData([api.admin.me.path], data.admin);
      setLocation("/admin/dashboard");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await fetch(api.admin.logout.path, { method: "POST", credentials: "include" });
    },
    onSuccess: () => {
      queryClient.setQueryData([api.admin.me.path], null);
      setLocation("/admin/login");
    },
  });

  return { admin, isLoading, loginMutation, logoutMutation };
}

export function useMemberAuth() {
  const [_, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: member, isLoading } = useQuery({
    queryKey: [api.memberMe.get.path],
    queryFn: async () => {
      const res = await fetch(api.memberMe.get.path, { credentials: "include" });
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch member profile");
      return api.memberMe.get.responses[200].parse(await res.json());
    },
    retry: false,
  });

  const requestOtpMutation = useMutation({
    mutationFn: async (data: RequestOtpInput) => {
      const res = await fetch(api.auth.requestOtp.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to request OTP");
      }
      return api.auth.requestOtp.responses[200].parse(await res.json());
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async (data: VerifyOtpInput) => {
      const res = await fetch(api.auth.verifyOtp.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Invalid OTP");
      }
      return api.auth.verifyOtp.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.setQueryData([api.memberMe.get.path], data.member);
      setLocation("/member/profile");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Member logout shares admin endpoint or we can clear cookie manually
      await fetch(api.admin.logout.path, { method: "POST", credentials: "include" });
    },
    onSuccess: () => {
      queryClient.setQueryData([api.memberMe.get.path], null);
      setLocation("/");
    },
  });

  return { member, isLoading, requestOtpMutation, verifyOtpMutation, logoutMutation };
}
