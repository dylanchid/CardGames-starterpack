import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names with Tailwind's class resolution rules
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
