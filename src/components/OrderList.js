import React, { useEffect, useState } from 'react';
import { fetchAllOrders, updateOrderStatus } from '../api';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    let result = orders;

    if (search) {
        const lowerSearch = search.toLowerCase();
        result = result.filter(o => 
            o.id.toString().includes(lowerSearch) ||
            o.customerName.toLowerCase().includes(lowerSearch) ||
            o.customerEmail.toLowerCase().includes(lowerSearch)
        );
    }

    if (statusFilter !== 'all') {
        result = result.filter(o => o.status === statusFilter);
    }

    setFilteredOrders(result);
  }, [search, statusFilter, orders]);

  const loadOrders = async () => {
    setLoading(true);
    try {
        const data = await fetchAllOrders();
        setOrders(data || []);
        setFilteredOrders(data || []);
    } catch (error) {
        console.error("Error fetching orders:", error);
    } finally {
        setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    if(!window.confirm(`Are you sure you want to mark Order #${orderId} as ${newStatus}?`)) return;
    
    try {
        await updateOrderStatus(orderId, newStatus);
        alert(`Order #${orderId} updated to ${newStatus}`);
        loadOrders(); // Refresh to show changes
    } catch (error) {
        alert("Failed to update status");
    }
  };

  const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);

  return (
    <div className="order-dashboard">
        <div className="stats-row">
            <div className="stat-card">
                <h3>Total Revenue</h3>
                <p>₦{totalRevenue.toLocaleString()}</p>
            </div>
            <div className="stat-card">
                <h3>Total Orders</h3>
                <p>{orders.length}</p>
            </div>
            <div className="stat-card">
                <h3>Pending Action</h3>
                <p>{orders.filter(o => o.status === 'paid').length}</p>
            </div>
        </div>

        <div className="table-controls">
            <h3 style={{margin:0}}>Recent Orders</h3>
            <div style={{display:'flex', gap:'10px'}}>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
                    <option value="all">All Status</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                </select>
                <input 
                    type="text" 
                    placeholder="Search Order ID, Name..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="search-input"
                />
                <button onClick={loadOrders} className="refresh-btn">↻</button>
            </div>
        </div>

        {loading ? <p style={{textAlign:'center', padding:'20px'}}>Loading Orders...</p> : (
            <div className="table-wrapper">
                <table className="order-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Date</th>
                            <th>Customer</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.length > 0 ? filteredOrders.map(order => (
                            <React.Fragment key={order.id}>
                                <tr className={selectedOrder === order.id ? 'active-row' : ''}>
                                    <td>#{order.id}</td>
                                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <div style={{fontWeight:'bold'}}>{order.customerName}</div>
                                        <div style={{fontSize:'0.8rem', color:'#666'}}>{order.customerEmail}</div>
                                    </td>
                                    <td style={{fontWeight:'bold'}}>₦{parseFloat(order.totalAmount).toLocaleString()}</td>
                                    <td>
                                        <span className={`status-badge ${order.status}`}>{order.status ? order.status.toUpperCase() : 'UNKNOWN'}</span>
                                    </td>
                                    <td>
                                        <button 
                                            className="action-btn"
                                            onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                                        >
                                            {selectedOrder === order.id ? 'Hide' : 'View'}
                                        </button>
                                    </td>
                                </tr>
                                {selectedOrder === order.id && (
                                    <tr className="details-row">
                                        <td colSpan="6">
                                            <div className="order-details-box">
                                                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'15px'}}>
                                                    <div>
                                                        <h4>Items Ordered</h4>
                                                        <ul>
                                                            {order.items && order.items.map((item, idx) => (
                                                                <li key={idx} style={{display:'flex', justifyContent:'space-between', width:'300px', borderBottom:'1px solid #eee', padding:'5px 0'}}>
                                                                    <span>{item.productName} (x{item.quantity})</span>
                                                                    <strong>₦{parseFloat(item.price).toLocaleString()}</strong>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                    
                                                    {/* --- UPDATE STATUS DROPDOWN --- */}
                                                    <div style={{background:'#eef2f7', padding:'15px', borderRadius:'8px', minWidth:'200px'}}>
                                                        <label style={{fontSize:'0.85rem', fontWeight:'bold', color:'#2c3e50', display:'block', marginBottom:'8px'}}>
                                                            Update Status:
                                                        </label>
                                                        <select 
                                                            defaultValue={order.status} 
                                                            onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                                            style={{width:'100%', padding:'8px', borderRadius:'4px', border:'1px solid #ccc'}}
                                                        >
                                                            <option value="pending">Pending</option>
                                                            <option value="paid">Paid (Processing)</option>
                                                            <option value="shipped">Shipped</option>
                                                            <option value="delivered">Delivered</option>
                                                            <option value="cancelled">Cancelled</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <div style={{marginTop:'10px', background:'#fff', padding:'10px', border:'1px solid #eee', borderRadius:'4px'}}>
                                                    <strong>Delivery Address:</strong>
                                                    <p style={{margin:'5px 0 0', color:'#555'}}>{order.deliveryAddress}</p>
                                                    <p style={{margin:'5px 0 0', color:'#555'}}>Phone: {order.customerPhone}</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        )) : (
                            <tr><td colSpan="6" style={{textAlign:'center', padding:'20px'}}>No orders found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        )}
    </div>
  );
};

export default OrderList;
