// AlignUI tv utility — wraps tailwind-variants with custom twMerge config
import { createTV } from "tailwind-variants";
import { twMergeConfig } from "@/utils/cn";

export const tv = createTV({ twMergeConfig });
export type { VariantProps, ClassValue } from "tailwind-variants";
