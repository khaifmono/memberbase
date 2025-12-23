import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type Class, type Supervisor, type Rank } from "@shared/routes";
import { buildUrl } from "@shared/routes";

// CLASSES
export function useClasses() {
  return useQuery({
    queryKey: [api.lookups.classes.list.path],
    queryFn: async () => {
      const res = await fetch(api.lookups.classes.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch classes");
      return api.lookups.classes.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Class, "id">) => {
      const res = await fetch(api.lookups.classes.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create class");
      return api.lookups.classes.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.lookups.classes.list.path] }),
  });
}

export function useDeleteClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.lookups.classes.delete.path, { id });
      const res = await fetch(url, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete class");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.lookups.classes.list.path] }),
  });
}

// SUPERVISORS
export function useSupervisors() {
  return useQuery({
    queryKey: [api.lookups.supervisors.list.path],
    queryFn: async () => {
      const res = await fetch(api.lookups.supervisors.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch supervisors");
      return api.lookups.supervisors.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateSupervisor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Supervisor, "id">) => {
      const res = await fetch(api.lookups.supervisors.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create supervisor");
      return api.lookups.supervisors.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.lookups.supervisors.list.path] }),
  });
}

export function useDeleteSupervisor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.lookups.supervisors.delete.path, { id });
      const res = await fetch(url, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete supervisor");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.lookups.supervisors.list.path] }),
  });
}

// RANKS
export function useRanks() {
  return useQuery({
    queryKey: [api.lookups.ranks.list.path],
    queryFn: async () => {
      const res = await fetch(api.lookups.ranks.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch ranks");
      return api.lookups.ranks.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateRank() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Rank, "id">) => {
      const res = await fetch(api.lookups.ranks.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create rank");
      return api.lookups.ranks.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.lookups.ranks.list.path] }),
  });
}

export function useDeleteRank() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.lookups.ranks.delete.path, { id });
      const res = await fetch(url, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete rank");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.lookups.ranks.list.path] }),
  });
}
