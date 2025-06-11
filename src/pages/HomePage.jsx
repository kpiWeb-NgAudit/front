
import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

function HomePage() {
    return (
        <div className="home-container">
            <header className="home-header">
                <h1>Welcome to KPI Web Management</h1>
                <p>Your central hub for managing Facts and Customers.</p>
            </header>

            <nav className="home-navigation">
                <Link to="/facts" className="nav-card">
                    <div className="nav-card-icon">📈</div> {/* Example Icon */}
                    <h2>Facts Management</h2>
                    <p>Define and manage fact tables and their properties.</p>
                </Link>

                <Link to="/customers" className="nav-card">
                    <div className="nav-card-icon">👥</div> {/* Example Icon */}
                    <h2>Customers Management</h2>
                    <p>Manage customer profiles and configurations.</p>
                </Link>

                <Link to="/dimensions" className="nav-card"> {/* NEW CARD */}
                    <div className="nav-card-icon">📏</div> {/* Example Icon */}
                    <h2>Dimensions Management</h2>
                    <p>Manage dimension attributes and configurations.</p>
                </Link>

                {/* Add more cards here for other sections if needed in the future */}
            </nav>
        </div>
    );
}

export default HomePage;