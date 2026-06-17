import React, { useContext, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import { deleteItem } from '../../Service/ItemService';
import toast from 'react-hot-toast';
import './ItemList.css';
import ImportModal from '../ImportModal/ImportModal';
import ExportModal from '../ExportModal/ExportModal';

const Item_List = ({ onAddClick }) => {

  const { itemData, setItemData, setEditingItem } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const filteredItems = itemData.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const removeItem = async (itemId) => {
    try {
      await deleteItem(itemId);
      setItemData(itemData.filter(item => item.itemId !== itemId));
      toast.success("Item deleted");
    } catch (err) {
      console.error(err);
      toast.error("Unable to delete item");
    }
  };

  return (
    <div className='manage-items-list-container d-flex flex-column h-100'>

      {/* Toolbar */}
      <div className='items-toolbar mb-4'>
        {/* Row 1 – Search bar */}
        <div className='position-relative mb-2'>
          <span className='position-absolute top-50 translate-middle-y ps-3 text-muted' style={{ zIndex: 5 }}>
            <i className="bi bi-search"></i>
          </span>
          <input
            type='text'
            placeholder='Search products...'
            className='form-control finance-input ps-5 w-100'
            onChange={(e) => setSearchTerm(e.target.value)}
            value={searchTerm}
          />
        </div>

        {/* Row 2 – Buttons aligned right */}
        <div className='d-flex justify-content-end align-items-center gap-2'>
          <button
            className='btn item-import-btn d-flex align-items-center gap-1 fw-semibold'
            onClick={() => setShowImportModal(true)}
            title="Import Products from Excel/CSV"
          >
            <i className="bi bi-file-earmark-arrow-up"></i>
            Import
          </button>
          <button
            className='btn item-export-btn d-flex align-items-center gap-1 fw-semibold'
            onClick={() => setShowExportModal(true)}
            title="Export Products to Excel/CSV"
          >
            <i className="bi bi-box-arrow-up"></i>
            Export
          </button>
          <button
            className='btn toolbar-add-product-btn d-flex align-items-center gap-1 fw-semibold'
            onClick={onAddClick}
          >
            <i className="bi bi-plus-circle"></i>
            Add Product
          </button>
        </div>
      </div>

      {/* Items Grid */}
      <div className='items-scroll-list flex-grow-1' style={{ overflowY: 'auto', minHeight: 0 }}>
        <div className='items-grid-container'>
          {filteredItems.map((item, index) => (
            <div className="manage-item-card p-3 d-flex flex-column justify-content-between" key={index}>
              <div className="text-center mb-2 position-relative card-image-container">
                <img
                  src={item.imgUrl || 'https://placehold.co/150x150/202c33/ffffff/png?text=No+Image'}
                  alt={item.name}
                  className="manage-item-img-card"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://placehold.co/150x150/202c33/ffffff/png?text=No+Image';
                  }}
                />
                <span className="item-category-badge position-absolute top-0 start-0 m-2">
                  {item.categoryName}
                </span>
              </div>

              <div className="flex-grow-1 d-flex flex-column justify-content-between mt-2">
                <div>
                  <h6 className="mb-1 fw-semibold text-truncate" title={item.name}>{item.name}</h6>
                  {item.description && (
                    <p className="text-muted fs-8 mb-2 item-desc-trunc" title={item.description}>
                      {item.description}
                    </p>
                  )}
                </div>
                <div className="d-flex justify-content-between align-items-center mt-2 pt-2 border-top border-secondary-subtle">
                  <span className="item-price-badge">₹{item.price}</span>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-light btn-sm btn-icon"
                      onClick={() => setEditingItem(item)}
                      title="Edit Item"
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button
                      className="btn item-delete-btn btn-sm btn-icon"
                      onClick={() => removeItem(item.itemId)}
                      title="Delete Item"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="w-100 text-center py-5 text-muted grid-span-all">
              <i className="bi bi-inbox fs-2 d-block mb-2"></i>
              <p className="mb-3">No items found.</p>
              <button
                type="button"
                className="btn toolbar-add-product-btn fw-bold d-inline-flex align-items-center gap-2 px-3 py-2"
                onClick={onAddClick}
              >
                <i className="bi bi-plus-circle"></i> Add First Product
              </button>
            </div>
          )}
        </div>
      </div>

      {showImportModal && <ImportModal onClose={() => setShowImportModal(false)} />}
      {showExportModal && <ExportModal onClose={() => setShowExportModal(false)} />}
    </div>
  );
};

export default Item_List;
