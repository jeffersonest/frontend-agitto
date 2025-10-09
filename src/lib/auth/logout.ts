"use client";
import { setAccessToken } from "@/lib/api/http";

export function logout(to: string = "/login") {
  try {
    setAccessToken(null);
  } finally {
    if (typeof window !== "undefined") {
      window.location.href = to;
    }
  }
}

