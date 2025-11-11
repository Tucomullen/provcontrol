import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  if (!res.ok) {
    // Intentar parsear el error como JSON
    let errorMessage = res.statusText;
    const contentType = res.headers.get("content-type");
    
    try {
      if (contentType && contentType.includes("application/json")) {
        const errorData = await res.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
        // Crear un error con más información
        const error = new Error(errorMessage);
        (error as any).status = res.status;
        (error as any).data = errorData;
        throw error;
      } else {
        // Si no es JSON, usar el texto
        const text = await res.text();
        const error = new Error(text || errorMessage);
        (error as any).status = res.status;
        throw error;
      }
    } catch (e: any) {
      // Si ya es un Error que lanzamos, re-lanzarlo
      if (e instanceof Error && (e as any).status) {
        throw e;
      }
      // Si hay otro error, crear uno nuevo
      const error = new Error(errorMessage);
      (error as any).status = res.status;
      throw error;
    }
  }
  
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 0, // Temporarily changed from Infinity to force fresh data
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
