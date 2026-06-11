import axios from "axios";

export const addCategory = async (category) => {
    return await axios.post('https://billingsoftwer.up.railway.app/admin/categories', category, {headers: {'Authorization': `Bearer ${localStorage.getItem("token")}`}});
}

export const updateCategory = async (categoryId, category) => {
    return await axios.put(`https://billingsoftwer.up.railway.app/admin/categories/${categoryId}`, category, {headers: {'Authorization': `Bearer ${localStorage.getItem("token")}`}});
}

export const deleteCategory = async (categoryId) =>{
    return await axios.delete(`https://billingsoftwer.up.railway.app/admin/categories/${categoryId}`, {headers: {'Authorization': `Bearer ${localStorage.getItem("token")}`}});
}

export const fetchCategories = async () => {
    return await axios.get(
        'https://billingsoftwer.up.railway.app/categories',
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        }
    );
};