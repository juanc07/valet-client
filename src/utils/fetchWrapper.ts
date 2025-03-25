// fetchWrapper.ts
export async function fetchWrapper<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const API_KEY = import.meta.env.VITE_API_KEY || "your-default-api-key"; // Fallback for dev

  const defaultHeaders: HeadersInit = {
    "X-API-Key": API_KEY, // Add API key header
    "X-From-Vercel": "true",
  };

  // Only set Content-Type to application/json if body is not FormData
  const headers = options.body instanceof FormData
    ? { ...defaultHeaders, ...options.headers } // Let browser set multipart/form-data
    : {
        ...defaultHeaders,
        "Content-Type": "application/json", // Default for JSON requests
        ...options.headers,
      };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.text(); // Use text() for broader error compatibility
    throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`);
  }

  return response.json() as Promise<T>;
}