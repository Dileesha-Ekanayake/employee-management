const baseUrl = 'http://localhost:8080';

/**
 * An object containing the base URL and predefined API endpoint paths.
 *
 * @constant {Object} ApiEndpoints
 * @property {string} baseUrl - The base URL of the API.
 * @property {Object} paths - An object containing specific API endpoint paths.
 * @property {string} paths.employee - Endpoint path for employee-related API calls.
 * @property {string} paths.gender - Endpoint path for gender-related API calls.
 */
export const ApiEndpoints = {
    baseUrl,
    paths: {
        employee: `/api/employees`,
        gender: `/api/genders`,
    }
} as const;
