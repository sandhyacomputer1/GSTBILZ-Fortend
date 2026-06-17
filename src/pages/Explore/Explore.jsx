import React, { useContext, useState } from 'react'
import './Explore.css'
import { AppContext } from '../../context/AppContext'
import DisplayCategory from '../../Componentes/DisplayCategory/DisplayCategory';
import DisplayItems from '../../Componentes/DisplayItems/DisplayItems';
import CustomerForm from '../../Componentes/CustomerForm/CustomerForm';
import CartItem from '../../Componentes/CartItem/CartItem';
import CartSummary from '../../Componentes/CartSummary/CartSummary';
import SearchBox from '../../Componentes/Item/SearchBox/SearchBox';

/**
 * Explore page rendering the main billing POS (Point of Sale) dashboard.
 * Divided into:
 * - Left column: category filter and item lists.
 * - Right column: customer details form, current cart, and checkout payment actions.
 */
const Explore = () => {
  const { categories, cartItem, subscriptionInfo } = useContext(AppContext);
  console.log(categories);

  // States to keep track of UI interactions, filtering, and customer metadata
  const [selectedCategory, setSelectedCategory] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  // Automatically close drawer if the cart becomes empty (e.g. after order placement or manual removal)
  React.useEffect(() => {
    if (!cartItem || cartItem.length === 0) {
      setIsDrawerOpen(false);
    }
  }, [cartItem]);

  const totalItems = (cartItem || []).reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = (cartItem || []).reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className='explore-container'>
      {/* Backdrop overlay */}
      <div 
        className={`drawer-backdrop ${isDrawerOpen ? 'show' : ''}`} 
        onClick={() => setIsDrawerOpen(false)}
      ></div>

      <div className='left-column glass-panel'>
        {/* Search input above categories */}
        <div className="mt-3 mb-2" style={{ width: '90%', margin: '0 auto' }}>
          <SearchBox onSearch={setSearchText} />
        </div>

        <div className='first-row' style={{overflowY: 'auto'}}>
            <DisplayCategory 
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            categories={categories}/>
        </div>
        <hr className='horizontal-line'/>
        <div className='second-row' style={{ overflowY: 'auto', overflowX: 'hidden' }}>
          <DisplayItems selectedCategory={selectedCategory} searchText={searchText}/>
        </div>

        {/* Bottom Proceed Bar */}
        {cartItem && cartItem.length > 0 && (
          <div className='proceed-bar'>
            <div>
              <span className='text-muted d-block' style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.5px' }}>CART TOTAL</span>
              <div className='d-flex align-items-baseline gap-2'>
                <span className='proceed-total-price'>₹{totalAmount.toFixed(2)}</span>
                <span className='text-light-emphasis' style={{ fontSize: '12px' }}>({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
              </div>
            </div>
            <button 
              className='btn btn-warning px-4 py-2 fw-bold d-flex align-items-center gap-2'
              style={{ borderRadius: '8px', fontSize: '14px', boxShadow: '0 4px 12px rgba(255, 193, 7, 0.2)' }}
              onClick={() => setIsDrawerOpen(true)}
              disabled={subscriptionInfo?.isExpired}
            >
              Proceed to Receipt <i className="bi bi-arrow-right-short fs-5"></i>
            </button>
          </div>
        )}
      </div>

      <div className={`right-column glass-panel ${isDrawerOpen ? 'drawer-open' : ''}`}>
        <div className="drawer-content-container">
          <div className='d-flex justify-content-between align-items-center mb-2 pb-2' style={{ borderBottom: '1px solid var(--border-glass)' }}>
            <h5 className='mb-0 fw-bold d-flex align-items-center gap-2'>
              <i className="bi bi-receipt text-warning"></i>
              Checkout Details
            </h5>
            <button 
              className='btn-close btn-close-white' 
              onClick={() => setIsDrawerOpen(false)} 
              aria-label="Close"
              style={{ fontSize: '12px' }}
            ></button>
          </div>

          <div className="drawer-body-layout">
            {/* Left Pane: Items list */}
            <div className="drawer-left-col">
              <h6 className="text-light-emphasis mb-2 fw-semibold d-flex align-items-center gap-2" style={{ fontSize: '13px' }}>
                <i className="bi bi-list-ul text-warning"></i>
                Selected Items
              </h6>
              <div className='cart-items-container flex-grow-1 overflow-y-auto' style={{ minHeight: '120px' }}>
                <CartItem />
              </div>
            </div>

            {/* Vertical Divider */}
            <div className="vr text-secondary opacity-25" style={{ width: '1px' }}></div>

            {/* Right Pane: Customer Details & Summary */}
            <div className="drawer-right-col">
              <div className='customer-form-container flex-shrink-0'>
                <h6 className="text-light-emphasis mb-2 fw-semibold d-flex align-items-center gap-2" style={{ fontSize: '13px' }}>
                  <i className="bi bi-person text-warning"></i>
                  Customer Details
                </h6>
                <CustomerForm 
                  customerName={customerName}
                  mobileNumber={mobileNumber}
                  setCustomerName={setCustomerName}
                  setMobileNumber={setMobileNumber}
                />
              </div>
              
              <hr className='my-1 text-light opacity-10'/>
              
              <div className='cart-summary-container flex-shrink-0'>
                <h6 className="text-light-emphasis mb-2 fw-semibold d-flex align-items-center gap-2" style={{ fontSize: '13px' }}>
                  <i className="bi bi-wallet2 text-warning"></i>
                  Summary & Payment
                </h6>
                <CartSummary 
                  customerName={customerName}
                  mobileNumber={mobileNumber}
                  setCustomerName={setCustomerName}
                  setMobileNumber={setMobileNumber}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Explore