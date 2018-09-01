import React from 'react';

function Header() {
  return (
    <nav className="navbar is-fixed-top" role="navigation" aria-label="main navigation">
      <div className="navbar-brand">
        <span>React Micro</span>
      </div>
      <div className="navbar-menu">
        <a className="navbar-item" href="/home">
          Home
        </a>
        <a className="navbar-item" href="/about">
          About Us
        </a>
        <a className="navbar-item" href="/products">
          Products
        </a>
      </div>
    </nav>
  );
}

export default Header;
