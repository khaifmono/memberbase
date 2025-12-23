import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertMember } from "@shared/routes";

export function useMembers(params?: { page?: number; limit?: number; search?: string; classId?: number }) {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set("page", String(params.page));
  if (params?.limit) queryParams.set("limit", String(params.limit));
  if (params?.search) queryParams.set("search", params.search);
  if (params?.classId) queryParams.set("classId", String(params.classId));

  const url = `${api.members.list.path}?${queryParams.toString()}`;

  return useQuery({
    queryKey: [api.members.list.path, params],
    queryFn: async () => {
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch members");
      return api.members.list.responses[200].parse(await res.json());
    },
  });
}

export function useMember(id: number) {
  return useQuery({
    queryKey: [api.members.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.members.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) throw new Error("Member not found");
      if (!res.ok) throw new Error("Failed to fetch member");
      return api.members.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function usePreRegisterMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { icNumber: string; email: string; name?: string }) => {
      const res = await fetch(api.members.preRegister.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to pre-register");
      }
      return api.members.preRegister.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.members.list.path] });
    },
  });
}

export function useUpdateMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertMember> }) => {
      const url = buildUrl(api.members.update.path, { id });
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to update member");
      return api.members.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.members.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.members.get.path] });
    },
  });
}

export function useDeleteMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.members.delete.path, { id });
      const res = await fetch(url, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete member");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.members.list.path] });
    },
  });
}
