export const fetchWrapper = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
    const response = await fetch(url, options);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP error! Status: ${response.status}`);
    }
    return response.json() as Promise<T>;
  };