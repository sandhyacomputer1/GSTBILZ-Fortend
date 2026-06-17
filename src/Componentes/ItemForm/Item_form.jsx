import React, { useState, useContext } from 'react'
import { assets } from '../../assets/assets';
import { AppContext } from '../../context/AppContext';
import toast from "react-hot-toast";
import { addItem, updateItem } from '../../Service/ItemService';
import './Item_form.css';

const Item_form = ({ onClose }) => {

  const { categories, setItemData, setCategories, editingItem, setEditingItem, settings } = useContext(AppContext);

  const [image, setImage] = useState(false);
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState({
    name: '',
    categoryId: '',
    price: '',
    description: '',
    gstPercentage: '',
    stockQuantity: ''
  });

  React.useEffect(() => {
    if (editingItem) {
      setData({
        name: editingItem.name || '',
        categoryId: editingItem.categoryId || '',
        price: editingItem.price || '',
        description: editingItem.description || '',
        gstPercentage: editingItem.gstPercentage != null ? String(editingItem.gstPercentage) : '0',
        stockQuantity: editingItem.stockQuantity != null ? String(editingItem.stockQuantity) : ''
      });
    } else {
      setData({
        name: '',
        categoryId: '',
        price: '',
        description: '',
        gstPercentage: settings?.defaultGst != null ? String(settings.defaultGst) : '18',
        stockQuantity: ''
      });
    }
    setImage(false);
  }, [editingItem, settings]);

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!editingItem && !image) {
      toast.error("Please upload an image");
      return;
    }
    if (!data.name.trim()) {
      toast.error("Please enter item name");
      return;
    }
    if (!data.categoryId) {
      toast.error("Please select a category");
      return;
    }
    if (!data.price || Number(data.price) <= 0) {
      toast.error("Please enter a valid price greater than 0");
      return;
    }
    if (!data.description.trim()) {
      toast.error("Please enter a description");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("items", JSON.stringify(data));
      if (image) formData.append("file", image);

      let response;
      if (editingItem) {
        response = await updateItem(editingItem.itemId, formData);
        if (response.status === 200 || response.status === 204) {
          setItemData((prev) => prev.map(item =>
            item.itemId === editingItem.itemId ? response.data : item
          ));
          toast.success("Item updated successfully");
          setEditingItem(null);
          onClose?.();
        }
      } else {
        response = await addItem(formData);
        if (response.status === 200 || response.status === 201) {
          setItemData((prev) => [...prev, response.data]);
          setCategories((prev) => prev.map((cat) =>
            cat.categoryId === data.categoryId
              ? { ...cat, items: cat.items + 1 }
              : cat
          ));
          toast.success("Item added successfully");
          onClose?.();
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Unable to save item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className='item-form-container'>

      {/* Product Image */}
      <div className='mb-3 text-center'>
        <label
          htmlFor='image'
          className='item-image-upload-label'
        >
          <img
            src={image ? URL.createObjectURL(image) : (editingItem?.imgUrl ? editingItem.imgUrl : assets.upload)}
            alt=""
            className='item-image-preview'
            style={editingItem?.imgUrl && !image ? { borderRadius: '8px', objectFit: 'cover' } : {}}
          />
          <div className="fs-8 mt-2 text-muted">
            {editingItem && !image ? 'Change Image' : 'Upload Image'}
          </div>
        </label>
        <input
          type='file'
          name='image'
          id='image'
          hidden
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        />
      </div>

      {/* Product Name */}
      <div className='mb-3'>
        <label htmlFor='name' className='form-label text-muted fs-8 fw-semibold text-uppercase'>
          Product Name
        </label>
        <input
          type="text"
          name='name'
          id='name'
          className='form-control finance-input'
          placeholder='Enter product name'
          onChange={onChangeHandler}
          value={data.name}
          required
        />
      </div>

      {/* Category */}
      <div className='mb-3'>
        <label htmlFor='category' className='form-label text-muted fs-8 fw-semibold text-uppercase'>
          Category
        </label>
        <select
          className='form-control finance-input'
          name='categoryId'
          id='category'
          onChange={onChangeHandler}
          value={data.categoryId}
          required
        >
          <option value="">Select a category</option>
          {categories.map((category, index) => (
            <option key={index} value={category.categoryId}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Price + GST on same row */}
      <div className='row g-3 mb-3'>
        <div className='col-7'>
          <label htmlFor='price' className='form-label text-muted fs-8 fw-semibold text-uppercase'>
            Price (₹)
          </label>
          <input
            type="number"
            name='price'
            id='price'
            className='form-control finance-input'
            placeholder='0.00'
            min="0"
            step="0.01"
            onChange={onChangeHandler}
            value={data.price}
            required
          />
        </div>
        <div className='col-5'>
          <label htmlFor='gstPercentage' className='form-label text-muted fs-8 fw-semibold text-uppercase'>
            GST (%)
          </label>
          <select
            className='form-control finance-input'
            name='gstPercentage'
            id='gstPercentage'
            onChange={onChangeHandler}
            value={data.gstPercentage}
            required
          >
            <option value="0">0% – Free</option>
            <option value="5">5%</option>
            <option value="12">12%</option>
            <option value="18">18%</option>
            <option value="28">28%</option>
          </select>
        </div>
      </div>

      {/* Stock Quantity */}
      <div className='mb-3'>
        <label htmlFor='stockQuantity' className='form-label text-muted fs-8 fw-semibold text-uppercase'>
          Stock Quantity
        </label>
        <input
          type="number"
          name='stockQuantity'
          id='stockQuantity'
          className='form-control finance-input'
          placeholder='Enter available stock'
          min="0"
          onChange={onChangeHandler}
          value={data.stockQuantity}
        />
      </div>

      {/* Description */}
      <div className='mb-4'>
        <label htmlFor='description' className='form-label text-muted fs-8 fw-semibold text-uppercase'>
          Description
        </label>
        <textarea
          rows="3"
          name='description'
          id='description'
          className='form-control finance-input'
          placeholder='Write a short product description...'
          onChange={onChangeHandler}
          value={data.description}
        />
      </div>

      {/* Save + Cancel */}
      <div className='d-flex gap-2'>
        <button
          type='button'
          className='btn item-form-cancel-btn flex-grow-1 fw-semibold py-2'
          onClick={() => onClose?.()}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type='submit'
          className='btn settings-save-btn flex-grow-1 fw-bold py-2'
          disabled={loading}
        >
          {loading ? (
            <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Saving…</>
          ) : (
            editingItem ? 'Update Product' : 'Save Product'
          )}
        </button>
      </div>

    </form>
  );
};

export default Item_form;
