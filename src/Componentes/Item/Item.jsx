import React, { useContext } from 'react'
import './Item.css'
import { AppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const Item = ({ itemName, itemPrice, itemImage, itemId }) => {

  const { addToCart, subscriptionInfo } = useContext(AppContext);
  const handleAddToCart = () => {
    if (subscriptionInfo?.isExpired) {
      toast.error("Your subscription has expired. Billing operations are disabled.");
      return;
    }
    addToCart({
      name: itemName,
      price: itemPrice,
      quantity: 1,
      itemId: itemId
    })
  }

  return (

    <div className='item-card p-3 rounded-4 d-flex align-items-center justify-content-between gap-3 h-100 shadow-sm'>
      <div className="d-flex align-items-center gap-3 min-width-0">
        <div className="item-image-wrapper">
          <img 
            src={itemImage || 'https://placehold.co/150x150/1e293b/ffffff/png?text=No+Image'} 
            alt={itemName} 
            className='item-image' 
          />
        </div>
        <div className='min-width-0'>
          <h6 className='item-title mb-1 text-truncate'>{itemName}</h6>
          <p className='item-price mb-0 fw-bold'>
            ₹{itemPrice?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <button className="item-add-btn" onClick={handleAddToCart} title="Add to Cart">
        <i className="bi bi-cart-plus fs-5"></i>
      </button>
    </div>
  )
}

export default Item