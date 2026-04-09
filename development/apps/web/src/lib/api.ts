export interface ApiOptions extends RequestInit {
  returnRaw?: boolean;
}

export async function apiFetch(endpoint: string, options: ApiOptions = {}) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  
  const headers = new Headers({
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  });

  const response = await fetch(`${apiUrl}${endpoint}`, {
    ...options,
    headers,
  });

  if (options.returnRaw) {
    return response;
  }

  const json = await response.json();
  return json;
}
