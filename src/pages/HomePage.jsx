// src/pages/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css'; // Make sure you have styles for .nav-card etc.

function HomePage() {
    return (
        <div className="home-container">
            <header className="home-header">
                <h1>Welcome to KPI Web Management</h1>
                <p>Your central hub for managing Facts and Customers.</p> {/* You might want to update this p-tag too */}
            </header>

            <nav className="home-navigation">
                <Link to="/customers" className="nav-card"> {/* Ensure this route matches your App.jsx */}
                    <div className="nav-card-icon">🏢</div>
                    <h2>Customers Management</h2>
                    <p>Manage customer profiles and configurations.</p>
                </Link>

                <Link to="/dimensions" className="nav-card">
                    <div className="nav-card-icon">📏</div>
                    <h2>Dimensions Management</h2>
                    <p>Manage dimension attributes and configurations.</p>
                </Link>

                <Link to="/facts" className="nav-card">
                    <div className="nav-card-icon">📈</div>
                    <h2>Facts Management</h2>
                    <p>Define and manage fact tables and their properties.</p>
                </Link>

                <Link to="/hierarchies" className="nav-card"> {/* THIS IS THE NEW CARD - GOOD! */}
                    <div className="nav-card-icon">🔗</div> {/* Example Icon for hierarchies */}
                    <h2>Hierarchies Management</h2>
                    <p>Define and manage dimension hierarchies and their levels.</p>
                </Link>

                <Link to="/roles" className="nav-card"> {/* NEW CARD */}
                    <div className="nav-card-icon">🛡️</div> {/* Example Icon for roles */}
                    <h2>Roles Management</h2>
                    <p>Manage user roles and permissions for customers.</p>
                </Link>

                <Link to="/users" className="nav-card"> {/* NEW CARD */}
                    <div className="nav-card-icon">👥</div> {/* Example Icon for users */}
                    <h2>Users Management</h2>
                    <p>Administer user accounts and access.</p>
                </Link>

                <Link to="/customer-user-assignments" className="nav-card"> {/* NEW CARD */}
                    <div className="nav-card-icon">🤝</div> {/* Example Icon */}
                    <h2>Customer-User Links</h2>
                    <p>View all customer and user associations and roles.</p>
                </Link>

                <Link to="/cubesets" className="nav-card"> {/* NEW CARD */}
                    <div className="nav-card-icon">🧊</div> {/* Example Icon for cubesets */}
                    <h2>Cubesets Management</h2>
                    <p>Define and manage sets within OLAP cubes.</p>
                </Link>

                <Link to="/data-extract-definitions" className="nav-card"> {/* NEW CARD */}
                    <div className="nav-card-icon">📜</div> {/* Example Icon: Scroll/Document */}
                    <h2>Data Extract Definitions</h2>
                    <p>View all defined data extraction configurations.</p>
                </Link>

                <Link to="/exploit-instructions" className="nav-card"> {/* NEW CARD */}
                    <div className="nav-card-icon">⚙️</div> {/* Example Icon: Gear/Settings */}
                    <h2>Exploit Instructions</h2>
                    <p>Manage automated tasks and alerts for customers.</p>
                </Link>

                {/* Add more cards here for other sections if needed in the future */}
            </nav>
        </div>
    );
}

export default HomePage;