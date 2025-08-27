const baseUrl = 'http://localhost:8080';

export const ApiEndpoints = {
    baseUrl,
    paths: {
        employee: `/api/employees`,
        gender: `/api/genders`,
    }
} as const;
