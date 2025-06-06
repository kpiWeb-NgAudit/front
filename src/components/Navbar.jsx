// src/components/Navbar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom'; // Use NavLink for active styling
import './Navbar.css'; // Create this for styling

function Navbar() {
    return (
        <nav className="app-navbar">
            <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} end>
                Home
            </NavLink>
            <NavLink to="/facts" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                Facts
            </NavLink>
            <NavLink to="/customers" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                Customers
            </NavLink>
            {/* You can add more global links here if needed */}
        </nav>
    );
}

export default Navbar;