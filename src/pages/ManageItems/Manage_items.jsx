import React, { useState, useEffect, useContext } from 'react'
import './Manage_items.css'
import Item_form from '../../Componentes/ItemForm/Item_form'
import Item_List from '../../Componentes/ItemList/Item_List'
import { AppContext } from '../../context/AppContext'

const Manage_Items = () => {
  const [showModal, setShowModal] = useState(false);
  const { editingItem, setEditingItem } = useContext(AppContext);

  // Auto-open modal when edit is triggered from the card
  useEffect(() => {
    if (editingItem) setShowModal(true);
  }, [editingItem]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  return (
    <div className='items-container text-light'>

      {/* Main product list */}
      <div id='main-content-panel' className='main-content-panel glass-panel flex-grow-1'>
        <Item_List onAddClick={handleOpenAdd} />
      </div>

      {/* Centered modal – shared for Add and Edit */}
      {showModal && (
        <div className='product-modal-overlay' onClick={handleCloseModal}>
          <div
            className='product-modal-content glass-panel'
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={editingItem ? 'Edit Product' : 'Add New Product'}
          >
            {/* Modal header */}
            <div className='product-modal-header'>
              <h5 className='mb-0 fw-bold'>
                {editingItem ? 'Edit Product' : 'Add New Product'}
              </h5>
              <button
                type='button'
                className='btn-close btn-close-white'
                onClick={handleCloseModal}
                aria-label='Close'
              ></button>
            </div>

            {/* Modal body – scrollable form */}
            <div className='product-modal-body'>
              <Item_form onClose={handleCloseModal} />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Manage_Items;
