import axios from "axios";
export const login = async (data) => {
    return await axios.post('http://localhost:8080/login', data);
}

export const registerShop = async (data) => {
    return await axios.post('http://localhost:8080/register-shop', data);
}

export const loginGoogle = async (idToken) => {
    return await axios.post('http://localhost:8080/login/google', { idToken });
}

export const forgotPassword = async (email) => {
    return await axios.post('http://localhost:8080/forgot-password', { email });
}

export const resetPassword = async (email, otp, newPassword) => {
    return await axios.post('http://localhost:8080/reset-password', { email, otp, newPassword });
}