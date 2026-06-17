import axios from 'axios';
import { API_BASE_URL } from "./api";

export const addUser = async(formData) => {
    return await axios.post(`${API_BASE_URL}/admin/register`, formData, {headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}})
}

export const fetchUserProfile = async () => {
    return await axios.get(`${API_BASE_URL}/admin/profile`, {headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}})
}

export const fetchUsers = async () => { 
    return await axios.get(`${API_BASE_URL}/admin/users`, {headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}})
}

export const deleteUser = async(id) => {
    return await axios.delete(
        `${API_BASE_URL}/admin/user/${id}`,
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        }
    );
}

export const updateUser = async (id, formData) => {
    return await axios.put(
        `${API_BASE_URL}/admin/user/${id}`,
        formData,
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        }
    );
}

export const updateProfile = async (formData) => {
    return await axios.put(
        `${API_BASE_URL}/admin/profile`,
        formData,
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        }
    );
}