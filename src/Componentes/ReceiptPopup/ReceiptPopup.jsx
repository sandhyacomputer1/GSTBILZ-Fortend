import React, { useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import { AppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';
import './ReceiptPopup.css';
import { sendWhatsAppBill } from '../../Service/WhatsAppService';
import defaultLogo from '../../assets/logo.webp';

const ReceiptPopup = ({ orderDetails, onClose }) => {
  const { shopProfile } = useContext(AppContext);
  const [sendingWa, setSendingWa] = useState(false);

  const handleSendWhatsApp = async () => {
    if (!orderDetails?.orderId) return;
    setSendingWa(true);
    const toastId = toast.loading("Sending receipt PDF on WhatsApp...");
    try {
      const response = await sendWhatsAppBill(orderDetails.orderId);
      toast.success(response.data?.message || "Receipt PDF sent on WhatsApp successfully!", { id: toastId });
    } catch (error) {
      console.error("Failed to send WhatsApp:", error);
      const errMsg = error.response?.data?.message || "Failed to send receipt PDF on WhatsApp.";
      toast.error(errMsg, { id: toastId });
    } finally {
      setSendingWa(false);
    }
  };

  const [printWithGst, setPrintWithGst] = useState(() => {
    const gstAmt = Number(orderDetails?.gstAmount || orderDetails?.tax || 0);
    return gstAmt > 0;
  });

  const safeToFixed = (val) => {
    if (val === null || val === undefined) return '0.00';
    const num = Number(val);
    if (isNaN(num)) return '0.00';
    return num.toFixed(2);
  };

  const formatDate = (dateTimeString) => {
    try {
      if (!dateTimeString) return new Date().toLocaleDateString();
      return new Date(dateTimeString).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return String(dateTimeString || '');
    }
  };

  const formatDateTime = (dateTimeString) => {
    try {
      if (!dateTimeString) {
        return new Date().toLocaleString('en-IN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      }
      return new Date(dateTimeString).toLocaleString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return String(dateTimeString || '');
    }
  };

  const numberToWords = (num) => {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const cleanNum = Math.floor(num);
    if (cleanNum === 0) return 'Zero';

    const translate = (n) => {
      let str = '';
      if (n > 99) {
        str += a[Math.floor(n / 100)] + 'Hundred ';
        n %= 100;
      }
      if (n > 19) {
        str += b[Math.floor(n / 10)] + ' ';
        n %= 10;
      }
      if (n > 0) {
        str += a[n];
      }
      return str;
    };

    let result = '';
    let temp = cleanNum;

    if (temp >= 10000000) {
      result += translate(Math.floor(temp / 10000000)) + 'Crore ';
      temp %= 10000000;
    }
    if (temp >= 100000) {
      result += translate(Math.floor(temp / 100000)) + 'Lakh ';
      temp %= 100000;
    }
    if (temp >= 1000) {
      result += translate(Math.floor(temp / 1000)) + 'Thousand ';
      temp %= 1000;
    }
    if (temp > 0) {
      result += translate(temp);
    }

    return result.trim() + ' Rupees Only';
  };

  const handlePrintWithGst = () => {
    setPrintWithGst(true);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handlePrintWithoutGst = () => {
    setPrintWithGst(false);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  if (!orderDetails || typeof orderDetails !== 'object') {
    return null;
  }

  const rawItems = orderDetails.item || orderDetails.items || orderDetails.cartItems;
  const items = Array.isArray(rawItems) ? rawItems.filter(Boolean) : [];

  const advance = 0;

  // Calculate totals based on printWithGst
  const subtotal = items.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 0)), 0);
  const totalItemDiscount = items.reduce((sum, item) => sum + Number(item.discount || 0), 0);
  const orderDiscount = Number(orderDetails.discount || 0);

  const totalGst = printWithGst
    ? items.reduce((sum, item) => {
      const taxable = Math.max(0, (Number(item.price || 0) * Number(item.quantity || 0)) - Number(item.discount || 0));
      return sum + (taxable * (Number(item.gstPercentage || 0) / 100));
    }, 0)
    : 0;

  const grandTotal = Math.max(0, subtotal - orderDiscount + totalGst);
  const due = grandTotal - advance;

  // Calculate dynamic column widths that sum to exactly 100%
  const colWidths = printWithGst
    ? { sl: '6%', desc: '30%', qty: '8%', rate: '12%', disc: '12%', gstPct: '10%', gstAmt: '10%', total: '12%' }
    : { sl: '6%', desc: '46%', qty: '10%', rate: '12%', disc: '12%', total: '14%' };

  return createPortal(
    <div className="receipt-overlay">
      <div className="receipt-modal-container">
        <div id="receipt-card" className="receipt-card">

          {/* TOP GRAPHICS */}
          <div className="invoice-shape-top-orange"></div>
          <div className="invoice-shape-top-blue"></div>

          {/* HEADER ROW (Logo & Company Info - Centered) */}
          <div className="invoice-header">
            <div className="invoice-logo">
              <img src={shopProfile?.shopLogoUrl || defaultLogo} alt="Shop Logo" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
            </div>

            <div className="invoice-company-details">
              <h1>{shopProfile?.shopName || 'COMPANY NAME HERE'}</h1>
              <p>{shopProfile?.shopAddress || 'Your Business Address 0000, Main Street, Unit 000C FEL, 0000'}</p>
              <p>
                Mob: {shopProfile?.shopMobile || '0123-5678900'} | Email: {shopProfile?.shopEmail || 'Your Mail Here'}
                {shopProfile?.shopWebsite ? ` | Web: ${shopProfile.shopWebsite}` : ''}
              </p>
              {shopProfile?.gstNumber && (
                <p style={{ fontWeight: 'bold', marginTop: '2px' }}>GSTIN: {shopProfile.gstNumber}</p>
              )}
            </div>
          </div>

          {/* INVOICE BADGE */}
          <div className="invoice-badge-container">
            <div className="invoice-badge">Invoice / Bill</div>
          </div>

          {/* METADATA ROW 1 */}
          <div className="invoice-meta-row mb-1">
            <div className="meta-item">
              <span className="fw-bold">SL No :</span> <span>{String(orderDetails.orderId || 'N/A')}</span>
            </div>
            <div className="meta-item text-right">
              <span className="fw-bold">Date :</span> <span className="dotted-line">{formatDate(orderDetails.createdAt)}</span>
            </div>
          </div>

          {/* METADATA ROW 2 */}
          <div className="invoice-meta-row mb-1">
            <div className="meta-item flex-grow-1 w-100">
              <span className="fw-bold">Customer Name :</span> <span className="dotted-line flex-grow-1">{String(orderDetails.customerName || 'N/A')}</span>
            </div>
          </div>

          {/* METADATA ROW 3 */}
          <div className="invoice-meta-row mb-3 pb-2 border-bottom-dotted">
            <div className="meta-item flex-grow-1 w-100">
              <span className="fw-bold">Mobile :</span> <span className="dotted-line flex-grow-1">{String(orderDetails.phoneNumber || 'N/A')}</span>
            </div>
          </div>

          {/* TABLE */}
          <div className="invoice-table-wrapper">
            <table className="invoice-table">
              <thead>
                <tr>
                  <th style={{ width: colWidths.sl }} className="text-center">Sl</th>
                  <th style={{ width: colWidths.desc }}>Description</th>
                  <th style={{ width: colWidths.qty }} className="text-center">Qty</th>
                  <th style={{ width: colWidths.rate }} className="text-center">Rate</th>
                  <th style={{ width: colWidths.disc }} className="text-center">Discount</th>
                  {printWithGst && (
                    <>
                      <th style={{ width: colWidths.gstPct }} className="text-center">GST %</th>
                      <th style={{ width: colWidths.gstAmt }} className="text-center">GST Amt</th>
                    </>
                  )}
                  <th style={{ width: colWidths.total }} className="text-center">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.length > 0 ? (
                  items.map((lineItem, idx) => {
                    if (!lineItem || typeof lineItem !== 'object') return null;
                    const qty = Number(lineItem.quantity || 0);
                    const price = Number(lineItem.price || 0);
                    const itemDiscount = Number(lineItem.discount || 0);
                    const itemTaxable = Math.max(0, qty * price - itemDiscount);
                    const gstRate = Number(lineItem.gstPercentage || 0);
                    const itemGst = printWithGst ? Number(lineItem.gstAmount || (itemTaxable * (gstRate / 100))) : 0;
                    const itemTotal = itemTaxable + itemGst;

                    return (
                      <tr key={idx}>
                        <td className="text-center">{idx + 1}</td>
                        <td>{String(lineItem.name || 'Item')}</td>
                        <td className="text-center">{qty}</td>
                        <td className="text-center">{safeToFixed(price)}</td>
                        <td className="text-center">{safeToFixed(itemDiscount)}</td>
                        {printWithGst && (
                          <>
                            <td className="text-center">{gstRate}%</td>
                            <td className="text-center">{safeToFixed(itemGst)}</td>
                          </>
                        )}
                        <td className="text-center">{safeToFixed(itemTotal)}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={printWithGst ? 8 : 6} className="text-center">No items listed</td>
                  </tr>
                )}
                {/* Pad empty rows */}
                {Array.from({ length: Math.max(0, 8 - items.length) }).map((_, i) => (
                  <tr key={`empty-${i}`} className="empty-row">
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    {printWithGst && (
                      <>
                        <td></td>
                        <td></td>
                      </>
                    )}
                    <td></td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* TOTALS OVERLAY INSIDE TABLE GRID */}
            <div className="invoice-totals-box" style={{ width: printWithGst ? '42%' : '35%' }}>
              <div className="total-row">
                <div className="total-label border-bottom border-right">Sub Total</div>
                <div className="total-value border-bottom">{safeToFixed(subtotal)}</div>
              </div>
              {totalItemDiscount > 0 && (
                <div className="total-row text-danger">
                  <div className="total-label border-bottom border-right">Item Disc.</div>
                  <div className="total-value border-bottom">- {safeToFixed(totalItemDiscount)}</div>
                </div>
              )}
              {orderDiscount > totalItemDiscount && (
                <div className="total-row text-danger">
                  <div className="total-label border-bottom border-right">Bill Disc.</div>
                  <div className="total-value border-bottom">- {safeToFixed(orderDiscount - totalItemDiscount)}</div>
                </div>
              )}
              {printWithGst && totalGst > 0 && (
                <div className="total-row">
                  <div className="total-label border-bottom border-right">GST Total</div>
                  <div className="total-value border-bottom">{safeToFixed(totalGst)}</div>
                </div>
              )}
              <div className="total-row fw-bold" style={{ backgroundColor: 'rgba(0, 59, 92, 0.05)' }}>
                <div className="total-label border-right">Grand Total</div>
                <div className="total-value">{safeToFixed(grandTotal)}</div>
              </div>
            </div>
          </div>

          {/* IN WORDS */}
          <div className="invoice-words mt-2">
            <span className="fw-bold">In Words: </span>
            <span className="text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
              {numberToWords(grandTotal)}
            </span>
          </div>

          {/* SIGNATURES */}
          <div className="invoice-signatures">
            <div className="signature-box">
              <div className="signature-line"></div>
              <span>Received by</span>
            </div>
            <div className="signature-box">
              <div className="signature-line"></div>
              <span>Authorized by</span>
            </div>
          </div>

          {/* BILL CREATION DATE & TIME */}
          <div className="invoice-datetime">
            Bill Generated On: {formatDateTime(orderDetails.createdAt)}
          </div>

          {/* BOTTOM GRAPHICS */}
          <div className="invoice-shape-bottom-blue"></div>
          <div className="invoice-shape-bottom-orange"></div>

        </div>

        <div className="receipt-actions d-flex gap-2 w-100">
          <button className="btn btn-success flex-grow-1 py-2 fw-bold" onClick={handlePrintWithGst}>
            <i className="bi bi-printer-fill me-1"></i> Print with GST
          </button>
          <button className="btn btn-warning flex-grow-1 py-2 fw-bold" onClick={handlePrintWithoutGst}>
            <i className="bi bi-printer-fill me-1"></i> Print without GST
          </button>
          <button 
            className="btn btn-success flex-grow-1 py-2 fw-bold text-white" 
            style={{ backgroundColor: '#25D366', borderColor: '#25D366' }} 
            onClick={handleSendWhatsApp}
            disabled={sendingWa}
          >
            <i className="bi bi-whatsapp me-1"></i> WhatsApp
          </button>
          <button className="btn btn-secondary flex-grow-1 py-2 fw-bold" onClick={onClose}>
            Close
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};

export default ReceiptPopup;