import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateVisitorId(): string {
  // Simple hex string generator for pseudo-anonymous user identification
  const array = new Uint32Array(4);
  crypto.getRandomValues(array);
  return Array.from(array, dec => dec.toString(16).padStart(8, "0")).join("");
}

export function getVisitorId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("examcore_visitor_id");
  if (!id) {
    id = generateVisitorId();
    localStorage.setItem("examcore_visitor_id", id);
  }
  return id;
}

export function getAuthHeaders() {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("examcore_admin_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function getVisitorHeaders() {
  return { "x-viewer-id": getVisitorId() };
}
