import React, { useState } from "react";

import Menu from "./Menu";

const TopBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen((v) => !v);

  return (
    <div className="topbar-container" style={{ position: 'relative' }}>
      <button
        onClick={toggleMenu}
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        style={{
          background: 'transparent',
          border: 'none',
          fontSize: '24px',
          cursor: 'pointer',
          display: 'none',
        }}
      >
        {isMenuOpen ? '\u2715' : '\u2630'}
      </button>
      <div className="indices-container">
        <div className="nifty">
          <p className="index">NIFTY 50</p>
          <p className="index-points">{100.2} </p>
          <p className="percent"> </p>
        </div>
        <div className="sensex">
          <p className="index">SENSEX</p>
          <p className="index-points">{100.2}</p>
          <p className="percent"></p>
        </div>
      </div>
      {isMenuOpen && <div className="menu-overlay" onClick={() => setIsMenuOpen(false)} />}
      <div className={`menu-drawer ${isMenuOpen ? 'open' : ''}`}>
        <Menu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      </div>
    </div>
  );
};

export default TopBar;
