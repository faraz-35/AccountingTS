import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";

/**
 * Custom hook for form handling with React Hook Form and Zod validation
 * @param schema - Zod schema for validation
 * @param defaultValues - Default form values
 * @returns Form controller object
 */
export function useZodForm<T extends z.ZodType>(
  schema: T,
  defaultValues?: Partial<z.infer<T>>,
) {
  return useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    defaultValues,
  });
}
