// fetchWrapper.ts
export async function fetchWrapper<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(url, options);
  if (!response.ok) {
    const errorData = await response.json(); // Parse the response body
    throw new Error(JSON.stringify({ status: response.status, ...errorData }));
  }
  return response.json() as Promise<T>;
}