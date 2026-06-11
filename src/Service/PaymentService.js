import axios from "axios";

export const LatestOrders = async(data) => {
    return await axios.post(`https://billingsoftwer.up.railway.app/payments/create-order`, data, {headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}})
}

export const verifyPayment = async(paymentData) => {
    return await axios.post(`https://billingsoftwer.up.railway.app/payments/verify`, paymentData, {headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}})
}