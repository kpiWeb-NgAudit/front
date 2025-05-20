// src/components/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
    return (
        <nav>
            <Link to="/">Fact List</Link>
            <Link to="/add">Add New Fact</Link>
        </nav>
    );
}

export default Navbar;