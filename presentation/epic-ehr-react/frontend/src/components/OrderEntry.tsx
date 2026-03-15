import { useState, useEffect, useRef } from 'react';
import type { OrderCatalogItem } from '../types';
import { searchCatalog, createOrder } from '../api';

interface Props {
  patientId: number;
  onClose: () => void;
  onOrderCreated: () => void;
}

export default function OrderEntry({ patientId, onClose, onOrderCreated }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<OrderCatalogItem[]>([]);
  const [selected, setSelected] = useState<OrderCatalogItem | null>(null);
  const [dose, setDose] = useState('');
  const [route, setRoute] = useState('');
  const [frequency, setFrequency] = useState('');
  const [priority, setPriority] = useState('routine');
  const [submitting, setSubmitting] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 2) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(() => {
      searchCatalog(query).then(setResults);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const selectItem = (item: OrderCatalogItem) => {
    setSelected(item);
    setDose(item.default_dose ?? '');
    setRoute(item.default_route ?? '');
    setFrequency(item.default_frequency ?? '');
    setQuery('');
    setResults([]);
  };

  const handleSubmit = async () => {
    if (!selected) return;
    setSubmitting(true);
    const orderText = `${selected.name} ${dose} ${route} ${frequency}`.trim();
    await createOrder(patientId, {
      order_text: orderText,
      category: selected.category,
      priority,
    });
    setSubmitting(false);
    onOrderCreated();
    onClose();
  };

  return (
    <div className="order-entry-panel">
      <div className="order-entry-header">
        <h3>New Order</h3>
        <button className="btn btn-text" onClick={onClose}>&times;</button>
      </div>

      {!selected ? (
        <div className="order-entry-search">
          <input
            type="text"
            placeholder="Search order catalog..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="order-search-input"
            autoFocus
          />
          {results.length > 0 && (
            <ul className="order-search-results">
              {results.map((item) => (
                <li key={item.id} onClick={() => selectItem(item)}>
                  <span className="order-result-name">{item.name}</span>
                  <span className="order-result-cat">{item.category}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="order-entry-form">
          <div className="order-entry-selected">
            <strong>{selected.name}</strong>
            <span className="order-result-cat">{selected.category}</span>
            <button
              className="btn btn-text"
              onClick={() => setSelected(null)}
              style={{ marginLeft: 'auto' }}
            >
              Change
            </button>
          </div>

          <div className="order-field">
            <label>Dose</label>
            <input value={dose} onChange={(e) => setDose(e.target.value)} />
          </div>
          <div className="order-field">
            <label>Route</label>
            <input value={route} onChange={(e) => setRoute(e.target.value)} />
          </div>
          <div className="order-field">
            <label>Frequency</label>
            <input value={frequency} onChange={(e) => setFrequency(e.target.value)} />
          </div>
          <div className="order-field">
            <label>Priority</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="routine">Routine</option>
              <option value="urgent">Urgent</option>
              <option value="stat">STAT</option>
            </select>
          </div>

          <div className="order-entry-actions">
            <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Signing...' : 'Sign Order'}
            </button>
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
