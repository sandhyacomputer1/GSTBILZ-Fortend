import axios from "axios";
import { API_BASE_URL } from "./api";

export const login = async (data) => {
    return await axios.post(`${API_BASE_URL}/login`, data);
}

export const registerShop = async (data) => {
    return await axios.post(`${API_BASE_URL}/register-shop`, data);
}

export const loginGoogle = async (idToken) => {
    return await axios.post(`${API_BASE_URL}/login/google`, { idToken });
}

export const forgotPassword = async (email) => {
    return await axios.post(`${API_BASE_URL}/forgot-password`, { email });
}

export const resetPassword = async (email, otp, newPassword) => {
    return await axios.post(`${API_BASE_URL}/reset-password`, { email, otp, newPassword });
}