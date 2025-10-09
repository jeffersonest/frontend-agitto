export function getApiBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_BASE_URL;
  const base = fromEnv && fromEnv.length > 0 ? fromEnv : "https://agitto-api.fly.dev";
  return base.replace(/\/$/, "");
}
