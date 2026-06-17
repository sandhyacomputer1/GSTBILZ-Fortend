import axios from "axios";
import { API_BASE_URL } from "./api";

export const LatestOrders = async(data) => {
    return await axios.post(`${API_BASE_URL}/payments/create-order`, data, {headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}})
}

export const verifyPayment = async(paymentData) => {
    return await axios.post(`${API_BASE_URL}/payments/verify`, paymentData, {headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}})
}