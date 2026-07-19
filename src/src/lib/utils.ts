import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sortByField<T>(field: keyof T): (list: T[]) => void {
  return (list: T[]) => {
    list.sort((a, b) => String(a[field]).localeCompare(String(b[field])));
  };
}

export function safeParseObject<
  T extends Record<string, unknown> = Record<string, unknown>,
>(value: string | null | undefined, fallback: T = {} as T): T {
  if (!value) return fallback;

  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as T;
    }
  } catch {
    // Ignore malformed JSON and return the provided fallback.
  }

  return fallback;
}
