import React, { useContext, useState } from 'react'
import './CartSummary.css'
import { AppContext } from '../../context/AppContext'
import ReceiptPopup from '../ReceiptPopup/ReceiptPopup';
import toast from 'react-hot-toast';
import { createOrder, deleteItem } from '../../Service/OrderService';
import { LatestOrders, verifyPayment } from '../../Service/PaymentService';
import { APP_CONSTANTS } from '../../Util/constats';
import { sendWhatsAppBill } from '../../Service/WhatsAppService';

/**
 * Component to display the billing calculation details (subtotal, tax, grand total)
 * and provide interactive payment checkout mechanisms (Cash / UPI via Razorpay).
 */
const CartSummary = ({ customerName, mobileNumber, setCustomerName, setMobileNumber }) => {

  const { cartItem, clearCart, orderDetails, setOrderDetails, showPopup, setShowPopup, settings, subscriptionInfo } = useContext(AppContext);

  // States to keep track of payment lifecycle and receipt generation
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [sendingWa, setSendingWa] = useState(false);

  const handleSendWhatsApp = async (orderId) => {
    if (sendingWa) return;
    setSendingWa(true);
    const toastId = toast.loading("Sending invoice PDF on WhatsApp...");
    try {
      const response = await sendWhatsAppBill(orderId);
      toast.success(response.data?.message || "Invoice PDF sent on WhatsApp successfully!", { id: toastId });
    } catch (error) {
      console.error("Failed to send WhatsApp:", error);
      const errMsg = error.response?.data?.message || "Failed to send invoice PDF on WhatsApp.";
      toast.error(errMsg, { id: toastId });
    } finally {
      setSendingWa(false);
    }
  };

  // Discount & GST states
  const [discountValue, setDiscountValue] = useState("");
  const [discountType, setDiscountType] = useState("₹"); // "₹" or "%"
  const [gstActive, setGstActive] = useState(true);

  // Initialize gstActive based on settings
  React.useEffect(() => {
    if (settings) {
      setGstActive(settings.enableGst);
    }
  }, [settings]);

  // Compute total values
  const totalAmount = (cartItem || []).reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const totalItemDiscount = (cartItem || []).reduce(
    (total, item) => total + (item.discount || 0),
    0
  );

  const calculatedBillDiscount = discountType === "%"
    ? (totalAmount - totalItemDiscount) * (parseFloat(discountValue || 0) / 100)
    : parseFloat(discountValue || 0);

  const totalDiscount = totalItemDiscount + calculatedBillDiscount;

  const gstAmount = gstActive
    ? (cartItem || []).reduce((total, item) => {
        const itemSubtotal = item.price * item.quantity;
        const itemDiscount = item.discount || 0;
        const itemTaxable = Math.max(0, itemSubtotal - itemDiscount);
        return total + itemTaxable * ((item.gstPercentage || 0) / 100);
      }, 0)
    : 0;

  const grandTotal = Math.max(0, totalAmount - totalDiscount + gstAmount);

  /**
   * Helper: Clears customer inputs and resets the shopping cart.
   */
  const clearAll = () => {
    setCustomerName('');
    setMobileNumber('');
    setDiscountValue('');
    clearCart();
  }

  /**
   * Place Order: Saves CASH order in DB (if CASH selected) and displays Receipt Popup.
   */
  const placeOrder = async () => {
    if (selectedPaymentMethod === 'CASH') {
      const orderData = {
        customerName,
        phoneNumber: mobileNumber,
        cartItems: cartItem.map(item => ({
          itemId: item.itemId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          discount: item.discount || 0,
          gstAmount: gstActive ? Math.max(0, (item.price * item.quantity - (item.discount || 0)) * ((item.gstPercentage || 0) / 100)) : 0,
          gstPercentage: item.gstPercentage || 0
        })),
        subtotal: totalAmount,
        tax: gstAmount, // Using tax field for GST amount compatibility
        gstAmount: gstAmount,
        discount: totalDiscount,
        grandTotal: grandTotal,
        paymentMethod: 'CASH'
      };

      setIsProcessing(true);
      try {
        const response = await createOrder(orderData);
        if (response.status === 200 || response.status === 201) {
          toast.success('Order placed successfully!');
          setOrderDetails(response.data);
          setShowPopup(true);
          clearAll();
          setSelectedPaymentMethod(null);
        } else {
          toast.error('Failed to place order');
        }
      } catch (error) {
        console.error('Failed to place order:', error);
        toast.error('Failed to place order. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    } else {
      setShowPopup(true);
      clearAll();
      setSelectedPaymentMethod(null);
    }
  }

  /**
   * Helper: Dynamically loads the external Razorpay Checkout JavaScript library on demand.
   */
  const loadRazorpayScript = () => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => reject(new Error('Failed to load Razorpay script'));
      document.head.appendChild(script);
    });
  }

  /**
   * Helper: Deletes the order record from the backend if payment falls through or is cancelled.
   */
  const deleteOrderOnFailure = async (orderId) => {
    try {
      await deleteItem(orderId);
    } catch (error) {
      console.error('Failed to delete order:', error);
      toast.error('Something went wrong. Please try again.');
    }
  }

  /**
   * Verifies the Razorpay payment signature against the backend.
   * On success, updates checkout states and displays success feedback.
   */
  const verifyResponse = async (response, saveOrder) => {
    const paymentData = {
      razorpayOrderId: response.razorpay_order_id,
      razorpayPaymentId: response.razorpay_payment_id,
      razorpaySignature: response.razorpay_signature,
      orderId: saveOrder.orderId
    };
    try {
      const paymentResponse = await verifyPayment(paymentData);
      if (paymentResponse.status === 200) {
        toast.success('Payment successful');
        setOrderDetails({
          ...saveOrder,
          paymentDetails: {
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
            status: 'COMPLETED'
          }
        });
        setSelectedPaymentMethod('UPI');
      } else {
        toast.error('Payment verification failed. Please contact support.');
      }
    } catch (error) {
      console.error('Payment verification failed:', error);
      toast.error('Payment verification failed. Please contact support.');
    }
  }

  /**
   * Orchestrates checkout payment based on selection (CASH or UPI).
   */
  const completePayment = async (paymentMethod) => {
    if (!customerName || !mobileNumber) {
      toast.error('Please enter customer name and mobile number');
      return;
    }
    if (cartItem.length === 0) {
      toast.error('Cart is empty. Please add items to cart.');
      return;
    }

    if (paymentMethod === 'CASH') {
      setSelectedPaymentMethod('CASH');
      toast.success('Cash payment option selected');
      return;
    }

    // Build order payload matching backend's OrderRequest DTO structure
    const orderData = {
      customerName,
      phoneNumber: mobileNumber,
      cartItems: cartItem.map(item => ({
        itemId: item.itemId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        discount: item.discount || 0,
        gstAmount: gstActive ? Math.max(0, (item.price * item.quantity - (item.discount || 0)) * ((item.gstPercentage || 0) / 100)) : 0,
        gstPercentage: item.gstPercentage || 0
      })),
      subtotal: totalAmount,
      tax: gstAmount,
      gstAmount: gstAmount,
      discount: totalDiscount,
      grandTotal: grandTotal,
      paymentMethod: paymentMethod
    };

    setIsProcessing(true);
    try {
      // 1. Pre-create the order inside the backend database
      const response = await createOrder(orderData);
      const saveData = response.data;
      
      if (response.status === 201 && paymentMethod === 'UPI') {
        // UPI checkout requires external Razorpay library flow
        const razorpayLoaded = await loadRazorpayScript();
        if (!razorpayLoaded) {
          toast.error('Unable to load razorpay. Order has been saved as pending.');
          return;
        }

        // 2. Request backend to create Razorpay Order
        const razorpayResponse = await LatestOrders({
          amount: grandTotal,
          currency: 'INR',
          receipt: `receipt_${saveData.orderId}`
        });

        // Configure checkout overlay details
        const options = {
          key: APP_CONSTANTS.RAZORPAY_KEY_ID,
          amount: razorpayResponse.data.amount,
          currency: razorpayResponse.data.currency,
          name: 'Billing Software',
          description: 'Test Transaction',
          order_id: razorpayResponse.data.id,
          handler: async function (res) {
            // Trigger backend signature verification on successful payment capture
            await verifyResponse(res, saveData);
          },
          prefill: {
            name: customerName,
            contact: mobileNumber
          },
          theme: {
            color: '#3399cc'
          },
          modal: {
            ondismiss: async () => {
              toast.error('Payment cancelled. Order has been saved as pending.');
            }
          }
        };

        const rzp = new window.Razorpay(options);
        // Error handling if payment fails inside checkout overlay
        rzp.on("payment.failed", async function (res) {
          toast.error('Payment failed. Order has been saved as pending.');
          console.error('Payment failed:', res.error);
        });
        rzp.open();
      }
    } catch (error) {
      console.error('Payment failed:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className='mt-2' style={{ maxHeight: '100%', overflowY: 'auto' }}>
      
      {/* GST Switch */}
      {settings?.enableGst && (
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className="text-light" style={{ fontSize: '12px', fontWeight: 600 }}>GST TAX</span>
          <div className="form-check form-switch mb-0">
            <input
              className="form-check-input"
              type="checkbox"
              role="switch"
              id="gstSwitch"
              checked={gstActive}
              onChange={(e) => setGstActive(e.target.checked)}
              style={{ width: '38px', height: '18px', cursor: 'pointer' }}
            />
            <label className="form-check-label text-light ms-2" htmlFor="gstSwitch" style={{ fontSize: '11px', fontWeight: 600 }}>
              {gstActive ? "ON" : "OFF"}
            </label>
          </div>
        </div>
      )}

      {/* Bill Discount Input */}
      {settings?.enableDiscount && (
        <div className="mb-3">
          <label className="text-light d-block mb-1" style={{ fontSize: '11px', fontWeight: 600 }}>BILL DISCOUNT</label>
          <div className="input-group align-items-stretch">
            <input
              type="number"
              className="form-control text-white border-secondary finance-input"
              style={{ height: '36px', fontSize: '12.5px' }}
              placeholder="Enter discount"
              min="0"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
            />
            <div className="d-flex ms-2 gap-1" style={{ height: '36px' }}>
              <button
                type="button"
                className={`btn btn-sm px-3 fw-bold ${discountType === '₹' ? 'btn-primary' : 'btn-outline-secondary text-light'}`}
                style={{ fontSize: '11.5px', borderRadius: '8px', transition: 'all 0.15s ease' }}
                onClick={() => setDiscountType('₹')}
              >
                ₹ Fixed
              </button>
              <button
                type="button"
                className={`btn btn-sm px-3 fw-bold ${discountType === '%' ? 'btn-primary' : 'btn-outline-secondary text-light'}`}
                style={{ fontSize: '11.5px', borderRadius: '8px', transition: 'all 0.15s ease' }}
                onClick={() => setDiscountType('%')}
              >
                % Percent
              </button>
            </div>
          </div>
        </div>
      )}

      <div className='cart-summary-details mb-3'>

        <div className='d-flex justify-content-between mb-2'>
          <span className='text-light'>Sub Total:</span>
          <span className='text-light'>₹ {totalAmount.toFixed(2)}</span>
        </div>

        {totalItemDiscount > 0 && (
          <div className='d-flex justify-content-between mb-2 text-danger'>
            <span>Item Discount:</span>
            <span>-₹ {totalItemDiscount.toFixed(2)}</span>
          </div>
        )}

        {calculatedBillDiscount > 0 && (
          <div className='d-flex justify-content-between mb-2 text-danger'>
            <span>Bill Discount:</span>
            <span>-₹ {calculatedBillDiscount.toFixed(2)}</span>
          </div>
        )}

        {gstActive && gstAmount > 0 && (
          <div className='d-flex justify-content-between mb-2'>
            <span className='text-light'>GST Amount:</span>
            <span className='text-light'>₹ {gstAmount.toFixed(2)}</span>
          </div>
        )}

        <div className='d-flex justify-content-between mb-2' style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '6px', fontWeight: 'bold' }}>
          <span className='text-light'>Grand Total:</span>
          <span className='text-light'>₹ {grandTotal.toFixed(2)}</span>
        </div>

      </div>
      
      <div className='d-flex gap-3'>
        <button
          className='btn btn-success flex-grow-1 py-1.5'
          onClick={() => completePayment('CASH')}
          disabled={isProcessing || subscriptionInfo?.isExpired}
          style={{ fontSize: '13px', fontWeight: 'bold' }}
        >
          {isProcessing ? 'Processing...' : 'Cash'}
        </button>
        <button
          className='btn btn-primary flex-grow-1 py-1.5'
          onClick={() => completePayment('UPI')}
          disabled={isProcessing || subscriptionInfo?.isExpired}
          style={{ fontSize: '13px', fontWeight: 'bold' }}
        >
          {isProcessing ? 'Processing...' : 'UPI'}
        </button>
      </div>
      
      <div className='d-flex gap-3 mt-2 mb-2'>
        <button
          className='btn btn-warning flex-grow-1 py-2'
          onClick={placeOrder}
          disabled={isProcessing || subscriptionInfo?.isExpired || (!orderDetails && selectedPaymentMethod !== 'CASH')}
          style={{ fontSize: '13px', fontWeight: 'bold' }}
        >
          Place Order & Print
        </button>
      </div>

      {orderDetails && (
        <div className='d-flex gap-3 mt-2 mb-2'>
          <button
            className='btn btn-success flex-grow-1 py-2 fw-bold text-white'
            style={{ backgroundColor: '#25D366', borderColor: '#25D366', fontSize: '13px' }}
            onClick={() => handleSendWhatsApp(orderDetails.orderId)}
            disabled={sendingWa}
          >
            <i className="bi bi-whatsapp me-1"></i> Send on WhatsApp
          </button>
        </div>
      )}

    </div>
  )
}

export default CartSummary