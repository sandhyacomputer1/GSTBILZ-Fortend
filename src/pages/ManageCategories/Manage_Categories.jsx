import React, { useState, useEffect, useContext } from 'react'
import './Manage_Categories.css'
import Category_Form from '../../Componentes/CategoryForm/Category_Form'
import Category_List from '../../Componentes/CategoryList/Category_List'
import { AppContext } from '../../context/AppContext'

const Manage_Categories = () => {
  const [showModal, setShowModal] = useState(false);
  const { editingCategory, setEditingCategory } = useContext(AppContext);

  // Auto-open modal when edit is triggered from the list
  useEffect(() => {
    if (editingCategory) setShowModal(true);
  }, [editingCategory]);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
  };

  return (
    <div className='category-container text-light'>

      {/* Main category list */}
      <div id='main-content-panel' className='main-content-panel glass-panel flex-grow-1'>
        <Category_List onAddClick={handleOpenAdd} />
      </div>

      {/* Centered modal – shared for Add and Edit */}
      {showModal && (
        <div className='category-modal-overlay' onClick={handleCloseModal}>
          <div
            className='category-modal-content glass-panel'
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={editingCategory ? 'Edit Category' : 'Add New Category'}
          >
            {/* Modal header */}
            <div className='category-modal-header'>
              <h5 className='mb-0 fw-bold'>
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h5>
              <button
                type='button'
                className='btn-close btn-close-white'
                onClick={handleCloseModal}
                aria-label='Close'
              ></button>
            </div>

            {/* Modal body – scrollable form */}
            <div className='category-modal-body'>
              <Category_Form onClose={handleCloseModal} />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Manage_Categories;