import { useState } from 'react';

export default function TopBar() {
  const [search, setSearch] = useState('');

  return (
    <header className="topbar">
      <div className="topbar-left">
        <span className="topbar-logo">Epic</span>
      </div>
      <div className="topbar-center">
        <div className="topbar-search">
          <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Search patients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="topbar-search-input"
          />
        </div>
      </div>
      <div className="topbar-right">
        <span className="topbar-context">NICU &mdash; Bay 1-3</span>
        <button className="topbar-bell" title="Notifications">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="bell-badge">3</span>
        </button>
        <div className="topbar-user">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>Dr. Martinez, MD</span>
        </div>
      </div>
    </header>
  );
}
