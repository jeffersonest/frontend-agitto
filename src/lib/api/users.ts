import { http } from "@/lib/api/http";

export async function getMyProfile() {
  return http("/users/me", { method: "GET", auth: true });
}

export async function updateMyProfile(payload: { name?: string; bio?: string }) {
  return http("/users/me/profile", { method: "PATCH", body: payload, auth: true });
}

export async function updateMyPassword(payload: { currentPassword: string; newPassword: string }) {
  return http("/users/me/password", { method: "PATCH", body: payload, auth: true });
}

export async function updateMyContact(payload: { email?: string; phone?: string }) {
  return http("/users/me/contact", { method: "PATCH", body: payload, auth: true });
}

