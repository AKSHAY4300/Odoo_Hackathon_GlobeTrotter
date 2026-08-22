const TOKEN_KEY = 'globetrotter_token';

export const API_BASE_URL: string =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL) ||
  'http://localhost:5000/api';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (err) {
    console.error('Failed to save token to localStorage', err);
  }
}

export function clearStoredToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (err) {
    console.error('Failed to clear token from localStorage', err);
  }
}

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
  skipAuth?: boolean;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, skipAuth = false, headers = {}, ...restOptions } = options;

  let url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const token = getStoredToken();
  const authHeaders: Record<string, string> = {};

  if (!skipAuth && token) {
    authHeaders['Authorization'] = `Bearer ${token}`;
  }

  const mergedHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...authHeaders,
    ...headers,
  };

  try {
    const response = await fetch(url, {
      headers: mergedHeaders,
      ...restOptions,
    });

    // Handle 401 Unauthorized
    if (response.status === 401 && !skipAuth) {
      clearStoredToken();
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/signup') && !currentPath.includes('/share')) {
        window.location.href = '/login';
      }
    }

    let responseData: any = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      const text = await response.text();
      responseData = { message: text };
    }

    if (!response.ok) {
      const errorMessage =
        responseData?.error ||
        responseData?.message ||
        `Request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    return responseData as T;
  } catch (error: any) {
    console.error(`API Error [${options.method || 'GET'} ${endpoint}]:`, error);
    throw error;
  }
}

export const apiClient = {
  get<T = any>(endpoint: string, options?: RequestOptions): Promise<T> {
    return apiRequest<T>(endpoint, { method: 'GET', ...options });
  },

  post<T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return apiRequest<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
  },

  put<T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return apiRequest<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
  },

  delete<T = any>(endpoint: string, options?: RequestOptions): Promise<T> {
    return apiRequest<T>(endpoint, { method: 'DELETE', ...options });
  },
};
