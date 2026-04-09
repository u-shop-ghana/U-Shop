export interface ApiOptions extends RequestInit {
  returnRaw?: boolean;
}

export async function apiFetch(endpoint: string, options: ApiOptions = {}) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  
  // Build the headers. We start with Content-Type, then merge in any
  // headers from the caller. options.headers can be a Headers object
  // (from api-client.ts), a plain object, or an array — we handle all
  // cases by converting to a Headers instance first, then iterating.
  const finalHeaders = new Headers({
    "Content-Type": "application/json",
  });

  // Merge incoming headers — supports Headers objects, plain objects,
  // and [string, string][] arrays. This is critical because api-client.ts
  // passes a Headers object with the Authorization token.
  if (options.headers) {
    const incoming = new Headers(options.headers as HeadersInit);
    incoming.forEach((value, key) => {
      finalHeaders.set(key, value);
    });
  }

  const response = await fetch(`${apiUrl}${endpoint}`, {
    ...options,
    headers: finalHeaders,
  });

  if (options.returnRaw) {
    return response;
  }

  const json = await response.json();
  return json;
}
