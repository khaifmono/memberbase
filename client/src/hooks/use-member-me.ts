import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertMember } from "@shared/routes";

export function useUpdateMe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertMember) => {
      const res = await fetch(api.memberMe.update.path, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to update profile");
      return api.memberMe.update.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.setQueryData([api.memberMe.get.path], data);
    },
  });
}
