import { http, setAccessToken } from "@/lib/api/http";
export async function requestEmailCode(email: string) {
  await http("/auth/request-email", { method: "POST", body: { email } });
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
  } catch (_) {
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

export async function register(payload: {
  name: string;
  email: string;
  password: string;
}) {
  const data = await http<any>("/auth/register", { method: "POST", body: payload });
  if (data && typeof data === "object" && "accessToken" in data) {
    setAccessToken((data as any).accessToken);
  }
  return { ok: true } as const;
}

export async function loginWithPassword({
  phone,
  email,
  password,
}: { phone?: string; email?: string; password: string }) {
  const data = await http<{ accessToken: string; refreshToken: string }>(
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
