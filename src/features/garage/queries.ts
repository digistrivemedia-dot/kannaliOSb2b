import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getGarageProfile, saveGarageProfile } from "@/features/garage/api";

export function useGarageProfile() {
  return useQuery({ queryKey: ["garage", "profile"], queryFn: getGarageProfile });
}

export function useSaveGarageProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveGarageProfile,
    onSuccess: (profile) => {
      queryClient.setQueryData(["garage", "profile"], profile);
      void queryClient.invalidateQueries({ queryKey: ["garage", "services"] });
    },
  });
}
