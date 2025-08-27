/**
 * Represents the structure of a standardized API response.
 *
 * @template T - The type of the data being returned in the response.
 *
 * @property {string} message - A descriptive message providing context about the response.
 * @property {number} statusCode - The HTTP status code associated with the response.
 * @property {string} timestamp - The timestamp indicating when the response was generated.
 * @property {T} data - The data payload returned by the API, where the structure is determined by the generic type T.
 */
export type ApiResponse<T> = {
    message: string;
    statusCode: number;
    timestamp: string;
    data: T;
};
