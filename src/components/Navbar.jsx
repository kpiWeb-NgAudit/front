// src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css'; // Make sure this file exists and styles the dropdown

function Navbar() {
    const [isEntityDropdownOpen, setIsEntityDropdownOpen] = useState(false);
    const [isLookupDropdownOpen, setIsLookupDropdownOpen] = useState(false); // <<< NEW STATE for Lookups dropdown

    const entityDropdownRef = useRef(null);
    const lookupDropdownRef = useRef(null); // <<< NEW REF for Lookups dropdown

    const toggleEntityDropdown = () => {
        setIsEntityDropdownOpen(!isEntityDropdownOpen);
        setIsLookupDropdownOpen(false); // Close other dropdown
    };

    const toggleLookupDropdown = () => { // <<< NEW TOGGLE function for Lookups
        setIsLookupDropdownOpen(!isLookupDropdownOpen);
        setIsEntityDropdownOpen(false); // Close other dropdown
    };

    const closeAllDropdowns = () => {
        setIsEntityDropdownOpen(false);
        setIsLookupDropdownOpen(false);
    };

    // Effect to handle clicks outside to close dropdowns
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (entityDropdownRef.current && !entityDropdownRef.current.contains(event.target) &&
                lookupDropdownRef.current && !lookupDropdownRef.current.contains(event.target)) {
                // More robust: check if click is outside BOTH dropdowns
                // Simplified: if click is outside the one that might be open
                if (!entityDropdownRef.current?.contains(event.target)) {
                    setIsEntityDropdownOpen(false);
                }
                if (!lookupDropdownRef.current?.contains(event.target)) {
                    setIsLookupDropdownOpen(false);
                }
            } else if (entityDropdownRef.current && !entityDropdownRef.current.contains(event.target)) {
                setIsEntityDropdownOpen(false);
            } else if (lookupDropdownRef.current && !lookupDropdownRef.current.contains(event.target)) {
                setIsLookupDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []); // Empty dependency array, runs once

    const getNavLinkClass = ({ isActive }) => isActive ? "dropdown-item active" : "dropdown-item";
    const getMainNavLinkClass = ({ isActive }) => isActive ? "nav-link active" : "nav-link";


    return (
        <nav className="app-navbar">
            <NavLink
                to="/"
                className={getMainNavLinkClass}
                onClick={closeAllDropdowns} // Close all dropdowns when Home is clicked
                end
            >
                Home
            </NavLink>

            {/* Manage Entities Dropdown */}
            <div className="nav-item-dropdown" ref={entityDropdownRef}>
                <button
                    type="button"
                    className="nav-link dropdown-toggle"
                    onClick={toggleEntityDropdown}
                    aria-expanded={isEntityDropdownOpen}
                    aria-haspopup="true"
                >
                    Manage Entities {isEntityDropdownOpen ? '▲' : '▼'}
                </button>
                {isEntityDropdownOpen && (
                    <div className="dropdown-menu">
                        <NavLink to="/customers" className={getNavLinkClass} onClick={closeAllDropdowns}>Customers</NavLink>
                        <NavLink to="/dimensions" className={getNavLinkClass} onClick={closeAllDropdowns}>Dimensions</NavLink>
                        <NavLink to="/facts" className={getNavLinkClass} onClick={closeAllDropdowns}>Facts</NavLink>
                        <NavLink to="/hierarchies" className={getNavLinkClass} onClick={closeAllDropdowns}>Hierarchies</NavLink>
                        <NavLink to="/roles" className={getNavLinkClass} onClick={closeAllDropdowns}>Roles</NavLink>
                        <NavLink to="/users" className={getNavLinkClass} onClick={closeAllDropdowns}>Users</NavLink>
                        <NavLink to="/cubesets" className={getNavLinkClass} onClick={closeAllDropdowns}>Cubesets</NavLink>
                        <NavLink to="/exploit-instructions" className={getNavLinkClass} onClick={closeAllDropdowns}>Exploit Instructions</NavLink>
                        <NavLink to="/sources" className={getNavLinkClass} onClick={closeAllDropdowns}>Sources</NavLink>
                        <NavLink to="/rdl-lists" className={getNavLinkClass} onClick={closeAllDropdowns}>RDL Lists</NavLink>
                        <NavLink to="/perspectives" className={getNavLinkClass} onClick={closeAllDropdowns}>Perspectives </NavLink>
                        <NavLink to="/fact-columns" className={getNavLinkClass} onClick={closeAllDropdowns}>Fact Columns</NavLink>
                        <NavLink to="/rdlgroup-factcol-assignments" className={getNavLinkClass} onClick={closeAllDropdowns}>RDLGroup-FactCol CalcTypes</NavLink>
                        <NavLink to="/perspective-outcalculations" className={getNavLinkClass} onClick={closeAllDropdowns}>Perspective Outcalculations</NavLink>
                        <NavLink to="/perspective-dimension-links" className={getNavLinkClass} onClick={closeAllDropdowns}>Perspective-Dimension Links</NavLink> {/* NOUVEAU */}
                        <NavLink to="/fact-db-extracts" className={getNavLinkClass} onClick={closeAllDropdowns}>Fact DB Extracts</NavLink>

                    </div>
                )}
            </div>

            {/* View Lookups Dropdown - CORRECTED */}
            <div className="nav-item-dropdown" ref={lookupDropdownRef}>
                <button
                    type="button"
                    className="nav-link dropdown-toggle"
                    onClick={toggleLookupDropdown} // Use the new toggle function
                    aria-expanded={isLookupDropdownOpen}
                    aria-haspopup="true"
                >
                    View Lookups {isLookupDropdownOpen ? '▲' : '▼'}
                </button>
                {isLookupDropdownOpen && ( // Use the new state variable for visibility
                    <div className="dropdown-menu">
                        <NavLink to="/themes" className={getNavLinkClass} onClick={closeAllDropdowns}>Themes</NavLink>
                        <NavLink to="/rdl-groups" className={getNavLinkClass} onClick={closeAllDropdowns}>RDL Groups</NavLink>
                        <NavLink to="/rdl-types" className={getNavLinkClass} onClick={closeAllDropdowns}>RDL Types</NavLink>
                        <NavLink to="/calculation-types" className={getNavLinkClass} onClick={closeAllDropdowns}>Calculation Types</NavLink>
                        <NavLink to="/data-extract-definitions" className={getNavLinkClass} onClick={closeAllDropdowns}>Data Extracts (All)</NavLink>
                        <NavLink to="/customer-user-assignments" className={getNavLinkClass} onClick={closeAllDropdowns}>Customer-User Links</NavLink>
                         <NavLink to="/hierdimcols" className={getNavLinkClass} onClick={closeAllDropdowns}>Hierarchy Levels</NavLink>
                        <NavLink to="/perspective-fact-links" className={getNavLinkClass} onClick={closeAllDropdowns}>Perspective-Fact Links</NavLink>
                        <NavLink to="/calctype-factcol-settings" className={getNavLinkClass} onClick={closeAllDropdowns}>FactCol CalcType Settings</NavLink>
                        <NavLink to="/source-fact-links" className={getNavLinkClass} onClick={closeAllDropdowns}>Source-Fact Links</NavLink>
                        <NavLink to="/olap-query-logs" className={getNavLinkClass} onClick={closeAllDropdowns}>OLAP Query Logs</NavLink>
                    </div>
                )}
            </div>
            {/* Other direct links if any */}
        </nav>
    );
}

export default Navbar;