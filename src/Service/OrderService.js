import axios from "axios";

export const LatestOrders = async() => {
    return await axios.get(`https://billingsoftwer.up.railway.app/orders/latest`, {headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}})
}

export const deleteItem = async(id) =>{
    return await axios.delete(`https://billingsoftwer.up.railway.app/orders/${id}`, {headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}})
}

export const createOrder = async (Order) => {
    return await axios.post(`https://billingsoftwer.up.railway.app/orders`, Order, {headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}})
}