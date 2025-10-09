import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import GeneralContext from "./GeneralContext";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("TODAY");

  const fetchOrders = useCallback(async () => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    try {
      const statusQuery = statusFilter !== 'ALL' ? `?status=${encodeURIComponent(statusFilter)}` : '';
      const { data } = await axios.get(`http://localhost:3002/api/orders${statusQuery}`);
      if (!cancelled) {
        setOrders(Array.isArray(data?.data) ? data.data : []);
      }
    } catch (err) {
      if (!cancelled) setError("Failed to load orders");
    } finally {
      if (!cancelled) setIsLoading(false);
    }
    return () => { cancelled = true; };
  }, [statusFilter]);

  useEffect(() => {
    let cleanup = () => {};
    (async () => { cleanup = await fetchOrders(); })();
    return () => { if (typeof cleanup === 'function') cleanup(); };
  }, [fetchOrders]);

  const filteredOrders = useMemo(() => {
    if (dateFilter === 'ALL') return orders;
    const startOfToday = new Date();
    startOfToday.setHours(0,0,0,0);
    return orders.filter(o => {
      const created = o.createdAt ? new Date(o.createdAt) : null;
      return created && created >= startOfToday;
    });
  }, [orders, dateFilter]);

  if (isLoading) {
    return (
      <div className="orders">
        <p>Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders">
        <p style={{ color: 'red' }}>{error}</p>
      </div>
    );
  }

  if (!filteredOrders.length) {
    return (
      <div className="orders">
        <div className="no-orders">
          <p>You haven't placed any orders yet</p>
          <Link to={"/"} className="btn">Get started</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="orders" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0 }}>Orders</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} style={{ padding: '6px' }}>
            <option value="TODAY">Today</option>
            <option value="ALL">All</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '6px' }}>
            <option value="ALL">All statuses</option>
            <option value="PLACED">Placed</option>
            <option value="FILLED">Filled</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <button onClick={fetchOrders} className="btn">Refresh</button>
        </div>
      </div>
      <div style={{ border: '1px solid #eee', borderRadius: '6px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 120px', padding: '10px 12px', background: '#fafafa', fontWeight: 600 }}>
          <span>Symbol</span>
          <span>Qty</span>
          <span>Price</span>
          <span>Type</span>
          <span>Action</span>
        </div>
        {filteredOrders.map((o) => (
          <div key={o._id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 120px', padding: '10px 12px', borderTop: '1px solid #f2f2f2', alignItems: 'center' }}>
            <span>{o.name}</span>
            <span>{o.qty}</span>
            <span>₹{Number(o.price).toFixed(2)}</span>
            <span style={{ color: (o.mode === 'BUY' ? '#4CAF50' : '#f44336'), fontWeight: 600 }}>{o.mode}</span>
            <span>
              <button 
                className="btn" 
                onClick={() => window.dispatchEvent(new CustomEvent('openSellFromOrders', { detail: { symbol: o.name } }))}
                style={{ padding: '4px 10px' }}
              >
                Sell
              </button>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
