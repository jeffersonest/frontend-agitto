import { http, setAccessToken } from "@/lib/api/http";
import { getApiBaseUrl } from "@/lib/config";

export async function requestEmailCode(email: string) {
  await http("/auth/request-email-verification", { method: "POST", body: { email } });
  return { ok: true } as const;
}

export async function verifyEmailCode(email: string, code: string) {
  await http("/auth/verify-email", { method: "POST", body: { email, code } });
  return { ok: true } as const;
}

export async function verifyEmailToken(token: string) {
  try {
    await http("/auth/verify-email", { method: "POST", body: { token } });
    return { ok: true } as const;
  } catch {
    await http(`/auth/verify-email?token=${encodeURIComponent(token)}`, { method: "GET" });
    return { ok: true } as const;
  }
}

export async function requestPhoneCode(phone: string) {
  await http("/auth/request-otp", { method: "POST", body: { phone } });
  return { ok: true } as const;
}

export async function verifyPhoneCode(phone: string, code: string) {
  await http("/auth/verify-otp", { method: "POST", body: { phone, code } });
  return { ok: true } as const;
}

type AuthTokens = { accessToken: string; refreshToken?: string };

export async function register(payload: {
  name: string;
  username: string;
  email: string;
  password: string;
}) {
  const data = await http<AuthTokens>("/auth/register", { method: "POST", body: payload });
  if (data && data.accessToken) setAccessToken(data.accessToken);
  return { ok: true } as const;
}

export async function loginWithPassword({
  phone,
  email,
  password,
}: { phone?: string; email?: string; password: string }) {
  const data = await http<AuthTokens>(
    "/auth/login",
    { method: "POST", body: { phone, email, password } }
  );
  setAccessToken(data.accessToken);
  return { ok: true } as const;
}

export async function getMe() {
  return http("/users/me", { method: "GET", auth: true });
}

export async function addPhoneAndSendOtp(phone: string) {
  await http("/auth/phone", { method: "PATCH", body: { phone }, auth: true });
  return { ok: true } as const;
}

export async function updateProfile(payload: { name?: string; username?: string; bio?: string }) {
  return http("/users/me/profile", { method: "PATCH", body: payload, auth: true });
}

export async function uploadProfileImage(file: File) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${getApiBaseUrl()}/users/me/upload-profile-image`, {
    method: "POST",
    body: form,
    credentials: "include",
  });
  const data = await res.json().catch(() => undefined);
  if (!res.ok) throw new Error(String((data && (data.message || data.error)) || res.statusText));
  return data as { message: string; imageUrl: string };
}
