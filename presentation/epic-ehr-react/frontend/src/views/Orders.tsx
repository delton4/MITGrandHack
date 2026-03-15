import { useState, useEffect } from 'react';
import type { Order } from '../types';
import { fetchOrders } from '../api';
import OrderEntry from '../components/OrderEntry';

interface Props {
  patientId: number;
}

function formatTime(ts: string): string {
  return new Date(ts).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const categoryFilters = ['All', 'medication', 'lab', 'imaging', 'nursing', 'diet', 'consult'];
const statusFilters = ['All', 'active', 'completed', 'discontinued'];
const priorityFilters = ['All', 'routine', 'urgent', 'stat'];

export default function Orders({ patientId }: Props) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEntry, setShowEntry] = useState(false);
  const [catFilter, setCatFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [prioFilter, setPrioFilter] = useState('All');

  const loadOrders = () => {
    setLoading(true);
    fetchOrders(patientId).then((data) => {
      setOrders(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadOrders();
  }, [patientId]);

  if (loading) {
    return (
      <div className="view-loading">
        <div className="spinner" />
      </div>
    );
  }

  const filtered = orders.filter((o) => {
    if (catFilter !== 'All' && o.category !== catFilter) return false;
    if (statusFilter !== 'All' && o.status !== statusFilter) return false;
    if (prioFilter !== 'All' && o.priority !== prioFilter) return false;
    return true;
  });

  return (
    <div className="orders-view">
      <div className="orders-header">
        <h2>Orders</h2>
        <button className="btn btn-primary" onClick={() => setShowEntry(true)}>
          + New Order
        </button>
      </div>

      <div className="orders-filters">
        <div className="filter-group">
          <label>Category:</label>
          <div className="filter-tabs">
            {categoryFilters.map((f) => (
              <button
                key={f}
                className={`filter-tab ${catFilter === f ? 'filter-tab--active' : ''}`}
                onClick={() => setCatFilter(f)}
              >
                {f === 'All' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="filter-group">
          <label>Status:</label>
          <div className="filter-tabs">
            {statusFilters.map((f) => (
              <button
                key={f}
                className={`filter-tab ${statusFilter === f ? 'filter-tab--active' : ''}`}
                onClick={() => setStatusFilter(f)}
              >
                {f === 'All' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="filter-group">
          <label>Priority:</label>
          <div className="filter-tabs">
            {priorityFilters.map((f) => (
              <button
                key={f}
                className={`filter-tab ${prioFilter === f ? 'filter-tab--active' : ''}`}
                onClick={() => setPrioFilter(f)}
              >
                {f === 'All' ? 'All' : f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <table className="orders-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Category</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Ordered By</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={6} className="orders-empty">No orders match filters</td>
            </tr>
          ) : (
            filtered.map((o) => (
              <tr key={o.id} className="orders-row">
                <td className="orders-text">{o.order_text}</td>
                <td>
                  <span className={`orders-cat orders-cat--${o.category}`}>
                    {o.category}
                  </span>
                </td>
                <td>
                  <span className={`orders-status orders-status--${o.status}`}>
                    {o.status}
                  </span>
                </td>
                <td>
                  <span className={`orders-prio orders-prio--${o.priority}`}>
                    {o.priority.toUpperCase()}
                  </span>
                </td>
                <td>{o.ordered_by}</td>
                <td className="orders-date">{formatTime(o.ordered_at)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {showEntry && (
        <div className="order-entry-overlay">
          <OrderEntry
            patientId={patientId}
            onClose={() => setShowEntry(false)}
            onOrderCreated={loadOrders}
          />
        </div>
      )}
    </div>
  );
}
