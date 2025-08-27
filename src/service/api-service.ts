import axios from "axios";
import {ApiEndpoints} from "./api-endpoints.ts";
import type {ApiResponse} from "./api-response.ts";

const apiClient = axios.create({
    baseURL: ApiEndpoints.baseUrl,
    headers: { "Content-Type": "application/json" },
});

export const ApiService = {
    get: <T>(url: string): Promise<ApiResponse<T>> =>
        apiClient.get<ApiResponse<T>>(url).then(res => res.data),

    post: <T>(url: string, data: T | null): Promise<ApiResponse<T>> =>
        apiClient.post<ApiResponse<T>>(url, data).then(res => res.data),

    put: <T>(url: string, data: T): Promise<ApiResponse<T>> =>
        apiClient.put<ApiResponse<T>>(url, data).then(res => res.data),

    delete: <T>(url: string): Promise<ApiResponse<T>> =>
        apiClient.delete<ApiResponse<T>>(url).then(res => res.data),
};
