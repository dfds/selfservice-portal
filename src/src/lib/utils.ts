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
