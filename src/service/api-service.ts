import axios from "axios";
import {ApiEndpoints} from "./api-endpoints.ts";

const apiClient = axios.create({
    baseURL: ApiEndpoints.baseUrl,
    headers: { "Content-Type": "application/json" },
});

export const ApiService = {
    get: <T>(url: string) => apiClient.get<T>(url).then(res => res.data),
    post: <T>(url: string, data: T) => apiClient.post<T>(url, data).then(res => res.data),
    put: <T>(url: string, data: T) => apiClient.put<T>(url, data).then(res => res.data),
    delete: <T>(url: string) => apiClient.delete<T>(url).then(res => res.data),
}
