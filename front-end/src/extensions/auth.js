import axios from 'axios';

export const setToken = (idToken, userGroup) => {
    localStorage.setItem('token', idToken);
    localStorage.setItem('role', JSON.stringify(userGroup));
    axios.defaults.headers.common['x-access-token'] = idToken;
};


export const getToken = () => {
    return localStorage.getItem('token');
};

export const getRole = () => {
    const roles = localStorage.getItem('role');
    return roles ? JSON.parse(roles) : [];
};
export const removeToken = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    delete axios.defaults.headers.common['x-access-token'];
};
