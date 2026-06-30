"use client";

import { useMutation } from "@tanstack/react-query";
import { useInvalidateAppData } from "./useAppData";
import { useToast } from "@/components/ui/Toast";

/** Every write in the app funnels through here so the single app-data query always refreshes and errors always surface as a toast. */
export function useAppMutation<TVariables, TResult>(
  mutationFn: (vars: TVariables) => Promise<TResult>,
  options?: { successMessage?: string | ((result: TResult, vars: TVariables) => string) }
) {
  const invalidate = useInvalidateAppData();
  const { showToast } = useToast();

  return useMutation({
    mutationFn,
    onSuccess: async (result, vars) => {
      await invalidate();
      if (options?.successMessage) {
        const message =
          typeof options.successMessage === "function"
            ? options.successMessage(result, vars)
            : options.successMessage;
        showToast(message, { variant: "success" });
      }
    },
    onError: (err: Error) => {
      showToast(err.message || "Something went wrong", { variant: "error" });
    },
  });
}
