import axios from "axios";
export const login = async (data) => {
    return await axios.post('https://gstblizbackend.up.railway.app/login', data);
}

export const registerShop = async (data) => {
    return await axios.post('https://gstblizbackend.up.railway.app/register-shop', data);
}

export const loginGoogle = async (idToken) => {
    return await axios.post('https://gstblizbackend.up.railway.app/login/google', { idToken });
}

export const forgotPassword = async (email) => {
    return await axios.post('https://gstblizbackend.up.railway.app/forgot-password', { email });
}

export const resetPassword = async (email, otp, newPassword) => {
    return await axios.post('https://gstblizbackend.up.railway.app/reset-password', { email, otp, newPassword });
}