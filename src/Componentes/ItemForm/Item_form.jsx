import React, { useState, useContext } from 'react'
import { assets } from '../../assets/assets';
import { AppContext } from '../../context/AppContext';
import toast from "react-hot-toast";
import { addItem, updateItem } from '../../Service/ItemService';

/**
 * Item creation form component.
 * Allows managers/admin to upload an item image, name, category, price, and description.
 */
const Item_form = () => {

  const { categories, setItemData, setCategories, editingItem, setEditingItem, settings } = useContext(AppContext);

  // States to keep track of file uploads, server requests, and inputs
  const [image, setImage] = useState(false);
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState({
    name: '',
    categoryId: '',
    price: '',
    description: '',
    gstPercentage: ''
  });

  React.useEffect(() => {
    if (editingItem) {
      setData({
        name: editingItem.name || '',
        categoryId: editingItem.categoryId || '',
        price: editingItem.price || '',
        description: editingItem.description || '',
        gstPercentage: editingItem.gstPercentage !== undefined && editingItem.gstPercentage !== null ? String(editingItem.gstPercentage) : '0'
      });
    } else {
      setData({
        name: '',
        categoryId: '',
        price: '',
        description: '',
        gstPercentage: settings?.defaultGst !== undefined ? String(settings.defaultGst) : '18'
      });
    }
    setImage(false);
  }, [editingItem, settings]);

  const onChangeHandler = (e) => {
    const { name, value } = e.target;

    setData((prev) => ({
      ...prev,
      [name]: value
    }));
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
      if (image) {
        formData.append("file", image);
      }

      let response;
      if (editingItem) {
        response = await updateItem(editingItem.itemId, formData);
        if (response.status === 200 || response.status === 204) {
          setItemData((prev) => prev.map(item => item.itemId === editingItem.itemId ? response.data : item));
          toast.success("Item updated successfully");
          setEditingItem(null);
        }
      } else {
        response = await addItem(formData);
        if (response.status === 200 || response.status === 201) {
          setItemData((prev) => [...prev, response.data]);
          setCategories((prevCategory) =>
            prevCategory.map((category) =>
              category.categoryId === data.categoryId
                ? { ...category, items: category.items + 1 }
                : category
            )
          );
          toast.success("Item added successfully");
        }
      }

      if (!editingItem) {
        setData({
          name: "",
          description: "",
          price: "",
          categoryId: "",
          gstPercentage: settings?.defaultGst !== undefined ? String(settings.defaultGst) : '18'
        });
        setImage(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Unable to add item");

    } finally {
      setLoading(false);
    }
  };

  return (

    <div
      className='item-form-container'
      style={{ height: '100%', overflowY: 'auto', overflowX: 'hidden' }}
    >

      <div className='mx-1'>
        <div className='row'>
          <div className='col-md-12'>
            <div className='p-1'>

              <form onSubmit={onSubmitHandler}>

                <div className='mb-3'>
                  <div className='d-flex justify-content-between align-items-center mb-2'>
                    <h6 className='mb-0 text-white'>{editingItem ? 'Edit Product' : 'Add Product'}</h6>
                    {editingItem && (
                      <button type="button" className='btn btn-sm btn-outline-secondary' onClick={() => setEditingItem(null)}>
                        Cancel Edit
                      </button>
                    )}
                  </div>
                </div>

                <div className='mb-3 text-center'>
                  <label htmlFor='image' className='form-label cursor-pointer p-3 rounded d-inline-block border border-dashed border-secondary' style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                    <img
                      src={image ? URL.createObjectURL(image) : (editingItem?.imgUrl ? editingItem.imgUrl : assets.upload)}
                      alt=""
                      width={48}
                      style={editingItem?.imgUrl && !image ? { borderRadius: '8px', objectFit: 'cover', width: '48px', height: '48px' } : {}}
                    />
                    <div className="fs-8 text-white mt-2">{editingItem && !image ? 'Change Image' : 'Upload Image'}</div>
                  </label>

                  <input
                    type='file'
                    name='image'
                    id='image'
                    className='form-control'
                    hidden
                    onChange={(e) => setImage(e.target.files[0])}
                  />
                </div>

                <div className='mb-3'>
                  <label htmlFor='name' className='form-label text-muted fs-8 fw-semibold text-uppercase'>Name</label>

                  <input
                    type="text"
                    name='name'
                    id='name'
                    className='form-control finance-input'
                    placeholder='Item Name'
                    onChange={onChangeHandler}
                    value={data.name}
                    required
                  />
                </div>

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
                  >

                    <option value="" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>Select a category</option>

                    {categories.map((category, index) => (
                      <option key={index} value={category.categoryId} style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
                        {category.name}
                      </option>
                    ))}

                  </select>
                </div>

                <div className='mb-3'>
                  <label htmlFor='price' className='form-label text-muted fs-8 fw-semibold text-uppercase'>Price</label>

                  <input
                    type="number"
                    name='price'
                    id='price'
                    className='form-control finance-input'
                    placeholder='₹200.00'
                    onChange={onChangeHandler}
                    value={data.price}
                    required
                  />
                </div>

                <div className='mb-3'>
                  <label htmlFor='gstPercentage' className='form-label text-muted fs-8 fw-semibold text-uppercase'>GST Rate (%)</label>
                  <select
                    className='form-control finance-input'
                    name='gstPercentage'
                    id='gstPercentage'
                    onChange={onChangeHandler}
                    value={data.gstPercentage}
                    required
                  >
                    <option value="0" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>0% (GST Free)</option>
                    <option value="5" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>5%</option>
                    <option value="12" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>12%</option>
                    <option value="18" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>18%</option>
                    <option value="28" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>28%</option>
                  </select>
                </div>

                <div className='mb-4'>
                  <label htmlFor='description' className='form-label text-muted fs-8 fw-semibold text-uppercase'>
                    Description
                  </label>

                  <textarea
                    rows="3"
                    name='description'
                    id='description'
                    className='form-control finance-input'
                    placeholder='Write description here...'
                    onChange={onChangeHandler}
                    value={data.description}
                  />
                </div>

                <button
                  type='submit'
                  className='btn settings-save-btn w-100 py-2.5 fw-bold'
                  disabled={loading}
                >
                  {loading ? 'Saving...' : (editingItem ? 'Update Product' : 'Save Product')}
                </button>

              </form>

            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

export default Item_form;