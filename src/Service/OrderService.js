import axios from "axios";

export const LatestOrders = async() => {
    return await axios.get(`http://localhost:8080/orders/latest`, {headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}})
}

export const deleteItem = async(id) =>{
    return await axios.delete(`http://localhost:8080/orders/${id}`, {headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}})
}

export const createOrder = async (Order) => {
    return await axios.post(`http://localhost:8080/orders`, Order, {headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}})
}