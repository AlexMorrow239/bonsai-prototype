import { ReactElement, useState } from "react";

import { Link, NavLink } from "react-router-dom";

import Logo from "@/assets/logo.png";

import "./NavBar.scss";

const navigationItems = [
  { path: "/", label: "Prospective Clients" },
  { path: "/auth/login", label: "Partners" },
];

export const NavBar = (): ReactElement => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = (): void => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavLinkClick = (): void => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="nav">
      <div className="nav__container">
        <div className="nav__brand">
          <Link to="/" className="nav__logo" onClick={handleNavLinkClick}>
            <img src={Logo} alt="Company Logo" className="nav__logo-image" />
            <span className="nav__logo-text nav__logo-text--mobile">
              Financial Guidance
            </span>
            <span className="nav__logo-text nav__logo-text--desktop">
              Guiding you through with advice that suits your financial needs
            </span>
          </Link>
        </div>

        <div
          className={`nav__menu ${isMobileMenuOpen ? "nav__menu--open" : ""}`}
        >
          {navigationItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav__link ${isActive ? "nav__link--active" : ""}`
              }
              onClick={handleNavLinkClick}
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Mobile menu toggle button */}
        <button
          className={`nav__menu-toggle ${
            isMobileMenuOpen ? "nav__menu-toggle--open" : ""
          }`}
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
};

export default NavBar;
