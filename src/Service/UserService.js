import axios from 'axios';

export const addUser = async(formData) => {
    return await axios.post(`http://localhost:8080/admin/register`, formData, {headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}})
}

export const fetchUserProfile = async () => {
    return await axios.get(`http://localhost:8080/admin/profile`, {headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}})
}

// export const deleteUser = async(id) =>{ 
//     return await axios.delete(`http://localhost:8080/admin/users/${id}`, {headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}})
// }

export const fetchUsers = async () => { 
    return await axios.get(`http://localhost:8080/admin/users`, {headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}})
}

export const deleteUser = async(id) => {

    return await axios.delete(
        `http://localhost:8080/admin/user/${id}`,
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        }
    );
}

export const updateUser = async (id, formData) => {
    return await axios.put(
        `http://localhost:8080/admin/user/${id}`,
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
        `http://localhost:8080/admin/profile`,
        formData,
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        }
    );
}