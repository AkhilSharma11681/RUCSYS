import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isLearnerEmail(email?: string | null): boolean {
  if (!email) return false;
  const lower = email.trim().toLowerCase();
  return (
    lower.endsWith('@rishihood.edu.in') ||
    lower.endsWith('@nst.rishihood.edu.in')
  );
}
