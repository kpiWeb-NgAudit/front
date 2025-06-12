// src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react'; // Added useEffect, useRef
import { NavLink } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
    const [isEntityDropdownOpen, setIsEntityDropdownOpen] = useState(false);
    const dropdownRef = useRef(null); // For detecting clicks outside

    const toggleEntityDropdown = () => {
        setIsEntityDropdownOpen(!isEntityDropdownOpen);
    };

    const closeDropdown = () => {
        setIsEntityDropdownOpen(false);
    };

    // Effect to handle clicks outside the dropdown to close it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                closeDropdown();
            }
        };

        // Bind the event listener
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]); // Only re-run if dropdownRef changes (it won't)

    return (
        <nav className="app-navbar">
            <NavLink
                to="/"
                className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
                onClick={closeDropdown}
                end
            >
                Home
            </NavLink>

            <div className="nav-item-dropdown" ref={dropdownRef}> {/* Wrapper with ref */}
                <button
                    type="button"
                    className="nav-link dropdown-toggle"
                    onClick={toggleEntityDropdown}
                    aria-expanded={isEntityDropdownOpen}
                    aria-haspopup="true"
                >
                    Manage Entities {isEntityDropdownOpen ? '▲' : '▼'} {/* Better toggle indicator */}
                </button>
                {isEntityDropdownOpen && (
                    <div className="dropdown-menu">
                        <NavLink
                            to="/customers"
                            className="dropdown-item" // Use a consistent class for NavLink styling
                            activeclassname="active" // For react-router v6, activeClassName is deprecated, use style or className callback
                            onClick={closeDropdown}
                        >
                            Customers
                        </NavLink>
                        <NavLink
                            to="/dimensions"
                            className="dropdown-item"
                            activeclassname="active"
                            onClick={closeDropdown}
                        >
                            Dimensions
                        </NavLink>
                        <NavLink
                            to="/facts"
                            className="dropdown-item"
                            activeclassname="active"
                            onClick={closeDropdown}
                        >
                            Facts
                        </NavLink>
                        <NavLink
                            to="/hierarchies"
                            className="dropdown-item" // CONSISTENT CLASS
                            activeclassname="active"  // For active state
                            onClick={closeDropdown}
                        >
                            Hierarchies
                        </NavLink>
                        {/* Add other entities like HierDimCols if they have their own top-level list page */}
                        <NavLink
                            to="/hierdimcols" // Assuming you will create a page for this
                            className="dropdown-item"
                            activeclassname="active"
                            onClick={closeDropdown}
                        >
                            Hierarchy Levels
                        </NavLink>
                    </div>
                )}
            </div>
            {/* Other direct links if any */}
        </nav>
    );
}

export default Navbar;