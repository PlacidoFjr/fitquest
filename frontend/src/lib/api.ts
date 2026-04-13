const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export type ApiMethod = "GET" | "POST" | "PUT" | "DELETE";

export async function apiRequest<T>(
  endpoint: string,
  method: ApiMethod,
  body?: unknown,
  token?: string
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Erro na requisicao.");
  }
  return data as T;
}

export { API_URL };
