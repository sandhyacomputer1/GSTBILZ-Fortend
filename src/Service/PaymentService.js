import axios from "axios";

export const LatestOrders = async(data) => {
    return await axios.post(`http://localhost:8080/payments/create-order`, data, {headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}})
}

export const verifyPayment = async(paymentData) => {
    return await axios.post(`http://localhost:8080/payments/verify`, paymentData, {headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}})
}