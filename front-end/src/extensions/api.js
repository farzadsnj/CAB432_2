import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;
console.log("API URL DETECTED: ", process.env.REACT_APP_API_URL)


// Login API
export const login = async (credentials) => {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    return response.data;
};


// Sign up API
export const signup = async (userData) => {
    const response = await axios.post(`${API_URL}/auth/signup`, userData);
    return response.data;
};

// SetupMFA API
export const setupMfa = async (mfaData) => {
    const response = await axios.post(`${API_URL}/auth/setup-mfa`, mfaData);
    return response.data;
};

// Verify MFA API
export const verifyMfa = async (mfaData) => {
    const response = await axios.post(`${API_URL}/auth/verify-mfa`, mfaData);
    return response.data;
};


export const verifyMfaSetup = async (mfaData) => {
    const response = await axios.post(`${API_URL}/auth/verify-mfa-setup`, mfaData);
    return response.data;
};

export const getUsers = async () => {
    const response = await axios.get(`${API_URL}/auth/admin/users`);
    return response.data;
};

// Verify Email (Admin API)
export const verifyEmail = async (username) => {
    const response = await axios.post(`${API_URL}/auth/admin/verify`, { username, verifyEmail: true });
    return response.data;
};

// Verify User Account (Admin API)
export const verifyUser = async (username) => {
    const response = await axios.post(`${API_URL}/auth/admin/verify`, { username, verifyUser: true });
    return response.data;
};

// Delete User (Admin API)
export const deleteUser = async (username) => {
    const response = await axios.post(`${API_URL}/auth/admin/delete`, { username });
    return response.data;
};

// Promote User to Admin (Admin API)
export const makeAdmin = async (username) => {
    const response = await axios.post(`${API_URL}/auth/admin/make-admin`, { username });
    return response.data;
};

// Demote Admin to User (Admin API)
export const demoteAdmin = async (username) => {
    const response = await axios.post(`${API_URL}/auth/admin/demote-admin`, { username });
    return response.data;
};

// Upload video API call
export const uploadVideo = async (formData, onUploadProgress) => {
    const response = await axios.post(`${API_URL}/video/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress
    });
    return response.data;
};


// Get videos API call
export const getVideos = async () => {
    const response = await axios.get(`${API_URL}/video`);
    return response.data;
};


// Get popular videos from Pexels API
export const getPexelsVideos = async () => {
    const token = localStorage.getItem('token'); // Retrieve token from localStorage
    if (!token) {
        throw new Error('No token found, please login first.');
    }

    const response = await axios.get(`${API_URL}/pexels/videos`, {
        headers: {
            'x-access-token': token  // Include the token in the request headers
        }
    });
    return response.data;
};

