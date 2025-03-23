// fetchWrapper.ts
export async function fetchWrapper<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const API_KEY = import.meta.env.VITE_API_KEY || "your-default-api-key"; // Fallback for dev

  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json", // Default for POST/PUT requests
    "X-API-Key": API_KEY, // Add API key header
    "X-From-Vercel": "true",
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers, // Allow overriding headers if provided
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(JSON.stringify({ status: response.status, ...errorData }));
  }

  return response.json() as Promise<T>;
}