// src/components/Navbar.jsx
import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom'; // Added Link for non-NavLink items
import './Navbar.css'; // Ensure you have styles for .dropdown-menu, .dropdown-item

function Navbar() {
    const [isEntityDropdownOpen, setIsEntityDropdownOpen] = useState(false);

    const toggleEntityDropdown = () => {
        setIsEntityDropdownOpen(!isEntityDropdownOpen);
    };

    const closeDropdown = () => {
        setIsEntityDropdownOpen(false);
    };

    return (
        <nav className="app-navbar">
            <NavLink
                to="/"
                className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
                onClick={closeDropdown} // Close dropdown when Home is clicked
                end
            >
                Home
            </NavLink>

            <div className="nav-item-dropdown"> {/* Wrapper for the dropdown button and menu */}
                <button
                    type="button"
                    className="nav-link dropdown-toggle" // Style as a nav-link
                    onClick={toggleEntityDropdown}
                    aria-expanded={isEntityDropdownOpen}
                    aria-haspopup="true"
                >
                    Manage Entities ▼ {/* Or use an icon */}
                </button>
                {isEntityDropdownOpen && (
                    <div className="dropdown-menu">
                        <NavLink
                            to="/customers"
                            className={({ isActive }) => (isActive ? "dropdown-item active" : "dropdown-item")}
                            onClick={closeDropdown}
                        >
                            Customers
                        </NavLink>
                        <NavLink
                            to="/dimensions"
                            className={({ isActive }) => (isActive ? "dropdown-item active" : "dropdown-item")}
                            onClick={closeDropdown}
                        >
                            Dimensions
                        </NavLink>
                        <NavLink
                            to="/facts"
                            className={({ isActive }) => (isActive ? "dropdown-item active" : "dropdown-item")}
                            onClick={closeDropdown}
                        >
                            Facts
                        </NavLink>
                        {/* Add more entities here as needed */}
                        {/* Example:
                        <NavLink
                            to="/users"
                            className={({ isActive }) => (isActive ? "dropdown-item active" : "dropdown-item")}
                            onClick={closeDropdown}
                        >
                            Users
                        </NavLink>
                        */}
                    </div>
                )}
            </div>

            {/* You can keep other direct links here if they are few and very important */}
            {/* For example, a global "Settings" or "Profile" link */}
            {/*
            <NavLink to="/settings" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                Settings
            </NavLink>
            */}
        </nav>
    );
}

export default Navbar;