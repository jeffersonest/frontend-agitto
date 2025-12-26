/**
 * Fix image URLs that still use localhost to use production API
 * Temporary fix until backend is deployed with correct BASE_URL
 */
export function fixImageUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  
  // Replace localhost with production API
  if (url.includes('localhost:3000') || url.includes('127.0.0.1:3000')) {
    return url
      .replace('http://localhost:3000', 'https://agitto-api.fly.dev')
      .replace('http://127.0.0.1:3000', 'https://agitto-api.fly.dev');
  }
  
  return url;
}

