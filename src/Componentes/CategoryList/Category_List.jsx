import React, { useContext, useState } from 'react'
import { AppContext } from '../../context/AppContext';
import './CategoryList.css';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { deleteCategory } from '../../Service/CategoryService';




const Category_List = () => {
  const {categories, setCategories, setEditingCategory} = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');

  
  const filteredCategories = categories.filter(category =>
  category.name?.toLowerCase().includes(searchTerm.toLowerCase())
);
  
const deleteByCategoryId = async (categoryId) => {
  const confirmDelete = window.confirm('Are you sure you want to delete this category?');

  if (!confirmDelete) return;

  try {
    const response = await deleteCategory(categoryId);

    if (response.status === 200 || response.status === 204) {
      setCategories(
        categories.filter(
          category => category.categoryId !== categoryId
        )
      );
      toast.success('Category deleted');
    }
  } catch (error) {
    console.error(error);
    const status = error.response?.status;
    const backendMsg = error.response?.data?.message || error.response?.data?.error || '';
    
    if (status === 409 || status === 500) {
      toast.error("Cannot delete: This category contains products. Please delete or reassign all products in this category first.");
    } else if (status === 403) {
      toast.error("Access Denied: You do not have permission to delete categories.");
    } else if (backendMsg) {
      toast.error(backendMsg);
    } else {
      toast.error("Error deleting category. Please check if it contains products.");
    }
  }
};

  return (
    <div className='manage-categories-list-container d-flex flex-column h-100'>
      
      <div className='search-container mb-3 pe-2 d-flex gap-2 align-items-center'>
        <div className='position-relative flex-grow-1'>
          <span className='position-absolute top-50 translate-middle-y ps-3 text-muted' style={{ zIndex: 5 }}>
            <i className='bi bi-search'></i>
          </span>
          <input 
            type='text' 
            name='keyword' 
            id='keyword' 
            placeholder='Search categories...' 
            className='form-control finance-input ps-5' 
            onChange={(e) => setSearchTerm(e.target.value)}
            value={searchTerm} 
          />
        </div>
      </div>

      <div className='categories-scroll-list flex-grow-1 pe-2' style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 160px)' }}>
        <div className='row g-3'>
          {filteredCategories.map((category, index) => (
            <div key={index} className='col-12'>
              <div className='manage-category-row p-3 d-flex align-items-center justify-content-between' style={{ borderLeft: `4px solid ${category.bgColor || 'var(--neon-indigo)'}` }}> 
                <div className="d-flex align-items-center">
                  <div style={{marginRight: '15px'}}>
                    <img 
                      src={category.imgUrl || 'https://placehold.co/150x150/202c33/ffffff/png?text=No+Image'} 
                      alt={category.name} 
                      className='category-image' 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/150x150/202c33/ffffff/png?text=No+Image';
                      }}
                    />
                  </div>
                  <div className='flex-grow-1'>
                    <h5 className='mb-1 text-white'>{category.name}</h5>
                    <span className='item-category-badge'>{category.items || 0} Products</span>
                  </div>
                </div>
                <div className='d-flex gap-2'>
                  <button 
                    className='btn btn-light btn-sm'
                    onClick={() => setEditingCategory(category)}
                    title="Edit Category"
                  >
                    <i className='bi bi-pencil'></i>
                  </button>
                  <button 
                    className='btn item-delete-btn btn-sm'
                    onClick={() => deleteByCategoryId(category.categoryId)}
                    title="Delete Category"
                  >
                    <i className='bi bi-trash'></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Category_List