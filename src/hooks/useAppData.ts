"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";

export const APP_DATA_KEY = ["app-data"];

export function useAppData() {
  return useQuery({ queryKey: APP_DATA_KEY, queryFn: api.getAppData });
}

export function useInvalidateAppData() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: APP_DATA_KEY });
}
