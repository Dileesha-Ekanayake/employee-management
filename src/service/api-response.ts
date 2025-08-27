export type ApiResponse<T> = {
    message: string;
    statusCode: number;
    timestamp: string;
    data: T;
};
