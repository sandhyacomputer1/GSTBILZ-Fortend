import React, { useEffect, useState, useContext } from 'react';
import { LatestOrders, deleteItem } from '../../Service/OrderService';
import { AppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';
import './OrderHistory.css';
import { sendWhatsAppBill } from '../../Service/WhatsAppService';

const OrderHistory = () => {

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { setOrderDetails, setShowPopup } = useContext(AppContext);

  const role = localStorage.getItem("role");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await LatestOrders();
        setOrders(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  const handleOpenReceipt = (order) => {
    setOrderDetails(order);
    setShowPopup(true);
  };

  const handleDeleteOrder = async (orderId) => {
    const inputId = window.prompt(`To delete this bill, please type the Order ID (#${orderId}) to confirm:`);
    if (inputId === null) return; 

    if (inputId.trim() === orderId) {
      try {
        await deleteItem(orderId);
        setOrders((prevOrders) => prevOrders.filter((o) => o.orderId !== orderId));
        toast.success("Order deleted successfully!");
      } catch (error) {
        console.error("Error deleting order:", error);
        toast.error("Failed to delete order.");
      }
    } else {
      toast.error("Order ID did not match. Deletion cancelled.");
    }
  };

  const [sendingWaId, setSendingWaId] = useState(null);

  const handleSendWhatsApp = async (orderId) => {
    if (sendingWaId) return;
    setSendingWaId(orderId);
    const toastId = toast.loading("Sending invoice PDF on WhatsApp...");
    try {
      const response = await sendWhatsAppBill(orderId);
      toast.success(response.data?.message || "Invoice PDF sent on WhatsApp successfully!", { id: toastId });
    } catch (error) {
      console.error("Failed to send WhatsApp:", error);
      const errMsg = error.response?.data?.message || "Failed to send invoice PDF on WhatsApp.";
      toast.error(errMsg, { id: toastId });
    } finally {
      setSendingWaId(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    
    const orderIdMatch = order.orderId?.toLowerCase().includes(query);
    const phoneMatch = order.phoneNumber?.toLowerCase().includes(query);
    const nameMatch = order.customerName?.toLowerCase().includes(query);
    
    return orderIdMatch || phoneMatch || nameMatch;
  });

  const formatItems = (items) => {
    return items?.map(
      (item) => `${item.name} (x${item.quantity})`
    ).join(", ");
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleString("en-IN", options);
  };

  if (loading) {
    return (
      <div className="text-center py-5 text-secondary">
        <div className="spinner-border spinner-border-sm me-2" role="status"></div>
        Loading orders...
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="orders-history-container d-flex flex-column align-items-center justify-content-center text-center py-5">
        <i className="bi bi-receipt fs-1 text-muted mb-3"></i>
        <h4 className="text-light">No orders found</h4>
        <p className="text-muted">Once checkouts are completed, they will appear here.</p>
      </div>
    );
  }

  return (
    <div className="orders-history-wrapper">
      <div className="orders-history-container">
        
        {/* Header Bar */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div>
            <h2 className="mb-1 text-light fw-bold">Recent Invoices</h2>
            <p className="text-muted mb-0 fs-7">Real-time ledger of billing and checkout logs</p>
          </div>
          <div className="search-bar-container">
            <i className="bi bi-search search-icon"></i>
            <input
              type="text"
              className="form-control search-input"
              placeholder="Search Order ID, mobile..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Table Panel */}
        <div className="glass-panel history-table-card p-4">
          <div className="table-responsive">
            <table className="orders-history-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer Name</th>
                  <th>Customer Number</th>
                  <th>Items</th>
                  <th>Total Amount</th>
                  <th>Payment Method</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-4 text-muted fs-7">
                      No matching orders found.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.orderId}>
                      <td>#{order.orderId}</td>
                      <td>
                        <span className="text-white fw-medium">{order.customerName}</span>
                      </td>
                      <td className="customer-number-column">
                        {order.phoneNumber}
                      </td>
                      <td style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={formatItems(order.item || order.items)}>
                        {formatItems(order.item || order.items)}
                      </td>
                      <td className="fw-semibold">
                        <span className="text-gradient-emerald">₹{order.grandTotal}</span>
                      </td>
                      <td>
                        <span className="payment-method-badge">
                          {order.paymentMethod}
                        </span>
                      </td>
                      <td>
                        <span
                          className={
                            order.paymentDetails?.status === "COMPLETED"
                              ? "badge-success-glow"
                              : "badge-warning-glow"
                          }
                        >
                          {order.paymentDetails?.status === "COMPLETED"
                            ? "Completed"
                            : "Pending"}
                        </span>
                      </td>
                      <td className="date-column">{formatDate(order.createdAt)}</td>
                      <td>
                        <div className="d-flex gap-2 justify-content-center align-items-center">
                          <button
                            className="action-btn btn-open-bill"
                            onClick={() => handleOpenReceipt(order)}
                            title="Open Receipt"
                          >
                            <i className="bi bi-eye"></i> Open
                          </button>
                          <button
                            className="action-btn btn-send-whatsapp"
                            onClick={() => handleSendWhatsApp(order.orderId)}
                            disabled={sendingWaId === order.orderId}
                            title="Send on WhatsApp"
                          >
                            <i className="bi bi-whatsapp"></i> WhatsApp
                          </button>
                          {(role === "ROLE_SHOPOWNER" || role === "ROLE_SUPERADMIN") && (
                            <button
                              className="action-btn btn-delete-bill"
                              onClick={() => handleDeleteOrder(order.orderId)}
                              title="Delete Order"
                            >
                              <i className="bi bi-trash"></i> Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;