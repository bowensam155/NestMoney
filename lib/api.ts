// ============================================================
// NestMoney — API Gateway Client
// Axios instance that injects Cognito JWT on every request.
// All third-party API keys live in Lambda — never here.
// ============================================================

import axios, { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, refreshAccessToken, signOut } from './auth';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error('EXPO_PUBLIC_API_URL is not set');
}

// ============================================================
// Axios instance
// ============================================================

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// ============================================================
// Request interceptor — inject Cognito JWT
// ============================================================

apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============================================================
// Response interceptor — handle 401 (token expired)
// ============================================================

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const newToken = await refreshAccessToken();
      if (newToken) {
        if (originalRequest.headers) {
          (originalRequest.headers as Record<string, string>).Authorization = `Bearer ${newToken}`;
        }
        return apiClient(originalRequest);
      }

      // Refresh failed — sign out and let _layout.tsx redirect to login
      await signOut();
    }

    return Promise.reject(error);
  }
);

// ============================================================
// Typed helpers — thin wrappers over apiClient
// ============================================================

export async function get<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.get<{ data: T }>(path, config);
  return response.data.data;
}

export async function post<TBody, TResponse>(
  path: string,
  body: TBody,
  config?: AxiosRequestConfig
): Promise<TResponse> {
  const response = await apiClient.post<{ data: TResponse }>(path, body, config);
  return response.data.data;
}

export async function patch<TBody, TResponse>(
  path: string,
  body: TBody,
  config?: AxiosRequestConfig
): Promise<TResponse> {
  const response = await apiClient.patch<{ data: TResponse }>(path, body, config);
  return response.data.data;
}

export async function del<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.delete<{ data: T }>(path, config);
  return response.data.data;
}
