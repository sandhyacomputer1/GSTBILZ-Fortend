import React, { useContext, useState } from 'react'
import { AppContext } from '../../context/AppContext';
import './CategoryList.css';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { deleteCategory } from '../../Service/CategoryService';




const Category_List = ({ onAddClick }) => {
  const { categories, setCategories, setEditingCategory } = useContext(AppContext);
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

      {/* Toolbar */}
      <div className='categories-toolbar mb-4'>
        {/* Row 1 – Search bar */}
        <div className='position-relative mb-2'>
          <span className='position-absolute top-50 translate-middle-y ps-3 text-muted' style={{ zIndex: 5 }}>
            <i className='bi bi-search'></i>
          </span>
          <input
            type='text'
            name='keyword'
            id='keyword'
            placeholder='Search categories...'
            className='form-control finance-input ps-5 w-100'
            onChange={(e) => setSearchTerm(e.target.value)}
            value={searchTerm}
          />
        </div>

        {/* Row 2 – Button aligned right */}
        <div className='d-flex justify-content-end align-items-center gap-2'>
          <button
            className='btn toolbar-add-category-btn d-flex align-items-center gap-1 fw-semibold'
            onClick={onAddClick}
          >
            <i className="bi bi-plus-circle"></i>
            Add Category
          </button>
        </div>
      </div>

      <div className='categories-scroll-list flex-grow-1 pe-2' style={{ overflowY: 'auto', minHeight: 0 }}>
        <div className='categories-grid-container'>
          {filteredCategories.map((category, index) => (
            <div
              className="manage-category-card p-3 d-flex flex-column justify-content-between"
              key={index}
              style={{ borderTop: `4px solid ${category.bgColor || '#6366f1'}` }}
            >
              <div className="text-center mb-2 position-relative category-card-image-container">
                <img
                  src={category.imgUrl || 'https://placehold.co/150x150/202c33/ffffff/png?text=No+Image'}
                  alt={category.name}
                  className="manage-category-img-card"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://placehold.co/150x150/202c33/ffffff/png?text=No+Image';
                  }}
                />
                <span className="item-category-badge position-absolute top-0 start-0 m-2">
                  {category.items || 0} Products
                </span>
              </div>

              <div className="flex-grow-1 d-flex flex-column justify-content-between mt-2">
                <div>
                  <h6 className="mb-1 fw-semibold text-truncate" title={category.name}>
                    {category.name}
                  </h6>
                  {category.description && (
                    <p className="text-muted fs-8 mb-2 category-desc-trunc" title={category.description}>
                      {category.description}
                    </p>
                  )}
                </div>
                <div className="d-flex justify-content-between align-items-center mt-2 pt-2 border-top border-secondary-subtle">
                  <span className="item-price-badge" style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', color: '#6366f1' }}>
                    Active
                  </span>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-light btn-sm btn-icon"
                      onClick={() => setEditingCategory(category)}
                      title="Edit Category"
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button
                      className="btn item-delete-btn btn-sm btn-icon"
                      onClick={() => deleteByCategoryId(category.categoryId)}
                      title="Delete Category"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
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