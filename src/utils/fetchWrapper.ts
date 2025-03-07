export async function fetchWrapper<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json() as Promise<T>;
}