import axios from "axios";

export const addCategory = async (category) => {
    return await axios.post('http://localhost:8080/admin/categories', category, {headers: {'Authorization': `Bearer ${localStorage.getItem("token")}`}});
}

export const updateCategory = async (categoryId, category) => {
    return await axios.put(`http://localhost:8080/admin/categories/${categoryId}`, category, {headers: {'Authorization': `Bearer ${localStorage.getItem("token")}`}});
}

export const deleteCategory = async (categoryId) =>{
    return await axios.delete(`http://localhost:8080/admin/categories/${categoryId}`, {headers: {'Authorization': `Bearer ${localStorage.getItem("token")}`}});
}

export const fetchCategories = async () => {
    return await axios.get(
        'http://localhost:8080/categories',
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        }
    );
};