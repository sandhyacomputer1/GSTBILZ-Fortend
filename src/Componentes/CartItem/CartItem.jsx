import React, { useContext } from 'react'
import './CartItem.css'
import { AppContext } from '../../context/AppContext'

const CartItem = () => {

  const { cartItem, removeFormCart, updateQuantity, updateItemDiscount, settings } = useContext(AppContext);
  console.log("Form cart items components", cartItem);

  return (
    <div className='p-2 h-100 overflow-y-auto'>
      {cartItem.length === 0 ? (
        <p className='text-light'>
          Your cart is empty.
        </p>
      ) : (
        <div className='cart-items-list'>
          {cartItem.map((item, index) => (
            <div key={index} className='cart-item'>
              <div className='d-flex justify-content-between align-items-center'>
                <div className='d-flex align-items-center gap-2'>
                  <h6 className='cart-item-title mb-0'>{item.name}</h6>
                  {settings?.enableGst && (
                    <span className="badge cart-item-badge">
                      GST: {item.gstPercentage || 0}%
                    </span>
                  )}
                </div>
                <div className="text-end d-flex align-items-center gap-2">
                  {item.discount > 0 && (
                    <small className="text-danger fw-semibold" style={{ fontSize: '11px' }}>
                      -₹{Number(item.discount).toFixed(2)}
                    </small>
                  )}
                  <p className='cart-item-price mb-0'>
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className='cart-item-controls'>
                <div className='cart-item-qty-wrap'>
                  <button className='cart-item-btn cart-item-btn-minus'
                    onClick={() => updateQuantity(item.itemId, item.quantity - 1)}
                    disabled={item.quantity === 1}>
                      <i className="bi bi-dash"></i>
                  </button>
                  <span className="cart-item-qty">{item.quantity}</span>
                  <button className='cart-item-btn cart-item-btn-plus'
                    onClick={() => updateQuantity(item.itemId, item.quantity + 1)}>
                      <i className="bi bi-plus"></i>
                  </button>
                </div>

                {settings?.enableDiscount && (
                  <div className="cart-item-discount-wrap">
                    <span className="cart-item-discount-label">Item Discount (₹):</span>
                    <input
                      type="number"
                      className="cart-item-discount-input"
                      placeholder="0"
                      min="0"
                      value={item.discount || ''}
                      onChange={(e) => updateItemDiscount(item.itemId, e.target.value)}
                    />
                  </div>
                )}

                <button className='cart-item-delete'
                  onClick={() => removeFormCart(item.itemId)}
                  title="Remove Item"
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CartItem