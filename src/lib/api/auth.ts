import { http, setAccessToken } from "@/lib/api/http";

// Email OTP endpoints are not implemented in the backend yet.
export async function requestEmailCode(_email: string) {
  return { ok: false, error: "Email verification not available" } as const;
}

export async function verifyEmailCode(_email: string, _code: string) {
  return { ok: false, error: "Email verification not available" } as const;
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
