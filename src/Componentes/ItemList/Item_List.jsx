import React, { useContext, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import { deleteItem } from '../../Service/ItemService';
import toast from 'react-hot-toast';
import './ItemList.css';
import ImportModal from '../ImportModal/ImportModal';
import ExportModal from '../ExportModal/ExportModal';


const Item_List = () => {

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

    const updatedItems = itemData.filter(
      item => item.itemId !== itemId
    );

    setItemData(updatedItems);

    toast.success("Item is deleted");

  } catch (err) {
    console.error(err);
    toast.error("Unable to delete item");
  }
};

  return (
    <div className='manage-items-list-container d-flex flex-column h-100'>
      {/* Search Input Row */}
      <div className='search-container mb-2 pe-2'>
        <div className='position-relative w-100'>
          <span className='position-absolute top-50 translate-middle-y ps-3 text-muted' style={{ zIndex: 5 }}>
            <i className="bi bi-search"></i>
          </span>
          <input
            type='text'
            placeholder='Search items by keyword...'
            className='form-control finance-input ps-5 w-100'
            onChange={(e) => setSearchTerm(e.target.value)}
            value={searchTerm}
          />
        </div>
      </div>

      {/* Import / Export Actions Row */}
      <div className='d-flex gap-2 mb-3 pe-2'>
        <button
          className='btn item-import-btn d-flex align-items-center justify-content-center gap-2 fw-semibold flex-grow-1'
          onClick={() => setShowImportModal(true)}
          style={{ whiteSpace: 'nowrap' }}
          title="Import Products from Excel/CSV/PDF/DOCX"
        >
          <i className="bi bi-file-earmark-arrow-up"></i>
          Import
        </button>
        <button
          className='btn item-export-btn d-flex align-items-center justify-content-center gap-2 fw-semibold flex-grow-1'
          onClick={() => setShowExportModal(true)}
          style={{ whiteSpace: 'nowrap' }}
          title="Export Products to Excel/CSV/PDF"
        >
          <i className="bi bi-box-arrow-up"></i>
          Export
        </button>
      </div>

      <div className='items-scroll-list flex-grow-1 pe-2' style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 160px)' }}>
        <div className='row g-3'>

          {filteredItems.map((item, index) => (
            <div className="col-12" key={index}>
              <div className="manage-item-row p-3">
                <div className="d-flex align-items-center">

                  <div style={{ marginRight: "15px" }}>
                    <img 
                      src={item.imgUrl || 'https://placehold.co/150x150/202c33/ffffff/png?text=No+Image'} 
                      alt={item.name} 
                      className="manage-item-img" 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/150x150/202c33/ffffff/png?text=No+Image';
                      }}
                    />
                  </div>

                  <div className="flex-grow-1">
                    <h6 className="mb-1 text-white fw-semibold">{item.name}</h6>
                    <div className="d-flex align-items-center gap-2 mt-1">
                      <span className="item-category-badge">
                        {item.categoryName}
                      </span>
                      <span className="item-price-badge">
                        ₹{item.price}
                      </span>
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-light btn-sm"
                      onClick={() => setEditingItem(item)}
                      title="Edit Item"
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button
                      className="btn item-delete-btn btn-sm"
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
            <div className="col-12 text-center py-5 text-muted">
              <i className="bi bi-inbox fs-2 d-block mb-2"></i>
              No items found.
            </div>
          )}

        </div>
      </div>

      {showImportModal && (
        <ImportModal onClose={() => setShowImportModal(false)} />
      )}
      {showExportModal && (
        <ExportModal onClose={() => setShowExportModal(false)} />
      )}
    </div>
  );
};

export default Item_List;