import axios from "axios";
import { API_BASE_URL } from "./api";

export const LatestOrders = async() => {
    return await axios.get(`${API_BASE_URL}/orders/latest`, {headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}})
}

export const deleteItem = async(id) =>{
    return await axios.delete(`${API_BASE_URL}/orders/${id}`, {headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}})
}

export const createOrder = async (Order) => {
    return await axios.post(`${API_BASE_URL}/orders`, Order, {headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}})
}