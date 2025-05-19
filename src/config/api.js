const API_BASE_URL = 'http://localhost:3000';

export const API_ENDPOINTS = {
    LOGIN: `${API_BASE_URL}/auth/login`,
    SIGNUP: `${API_BASE_URL}/users`,
    FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
};

export const handleApiResponse = async (response) => {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'An error occurred');
    }
    return response.json();
};