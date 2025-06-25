const API_BASE_URL = 'http://localhost:3000';

export const API_ENDPOINTS = {
    LOGIN: `${API_BASE_URL}/auth/login`,
    SIGNUP: `${API_BASE_URL}/users`,
    FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
    CHANGE_PASSWORD: `${API_BASE_URL}/auth/change-password`,
    TRAVEL: `${API_BASE_URL}/travel`,
    GET_USER_TRAVELS: (userId) => `${API_BASE_URL}/travel/user/${userId}`,
    STEP: `${API_BASE_URL}/step`,
    GET_STEPS_BY_TRIP: (tripId) => `${API_BASE_URL}/step/travel/${tripId}`,
    USER_PREFERENCES: `${API_BASE_URL}/user-preferences`,
    GET_USER_PREFERENCES: (userId) => `${API_BASE_URL}/user-preferences/${userId}`,
};

export const handleApiResponse = async (response) => {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'An error occurred');
    }
    return response.json();
};