// src/pages/HomePage.jsx
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
                <Link to="/customers" className="nav-card">
                    <div className="nav-card-icon">📦</div>
                    <h2>Customers (Cubes) Management</h2>
                    <p>Manage customer profiles and configurations.</p>
                </Link>

                <Link to="/dimensions" className="nav-card">
                    <div className="nav-card-icon">📏</div>
                    <h2>Dimensions Management</h2>
                    <p>Manage dimension attributes and configurations.</p>
                </Link>

                <Link to="/dimcolumns" className="nav-card">
                    <div className="nav-card-icon">၊၊||၊</div>
                    <h2>Dimension Columns</h2>
                    <p>View and manage all dimension columns across all dimensions.</p>
                </Link>

                <Link to="/facts" className="nav-card">
                    <div className="nav-card-icon">📈</div>
                    <h2>Facts Management</h2>
                    <p>Define and manage fact tables and their properties.</p>
                </Link>

                <Link to="/hierarchies" className="nav-card">
                    <div className="nav-card-icon">🔗</div>
                    <h2>Hierarchies Management</h2>
                    <p>Define and manage dimension hierarchies and their levels.</p>
                </Link>

                <Link to="/roles" className="nav-card">
                    <div className="nav-card-icon">🛡️</div>
                    <h2>Roles Management</h2>
                    <p>Manage user roles and permissions for customers.</p>
                </Link>

                <Link to="/users" className="nav-card">
                    <div className="nav-card-icon">👥</div>
                    <h2>Users Management</h2>
                    <p>Administer user accounts and access.</p>
                </Link>

                <Link to="/customer-user-assignments" className="nav-card">
                    <div className="nav-card-icon">🤝</div>
                    <h2>Customer-User Links</h2>
                    <p>View all customer and user associations and roles.</p>
                </Link>

                <Link to="/cubesets" className="nav-card">
                    <div className="nav-card-icon">🧊</div>
                    <h2>Cubesets Management</h2>
                    <p>Define and manage sets within OLAP cubes.</p>
                </Link>

                <Link to="/data-extract-definitions" className="nav-card">
                    <div className="nav-card-icon">📜</div>
                    <h2>Data Extract Definitions</h2>
                    <p>View all defined data extraction configurations.</p>
                </Link>

                <Link to="/exploit-instructions" className="nav-card">
                    <div className="nav-card-icon">⚙️</div>
                    <h2>Exploit Instructions</h2>
                    <p>Manage automated tasks and alerts for customers.</p>
                </Link>

                <Link to="/sources" className="nav-card">
                    <div className="nav-card-icon">💾</div>
                    <h2>Sources Management</h2>
                    <p>Define and manage data sources for customers.</p>
                </Link>

                <Link to="/rdl-lists" className="nav-card">
                    <div className="nav-card-icon">📋</div>
                    <h2>RDL Lists</h2>
                </Link>

                <Link to="/themes" className="nav-card">
                    <div className="nav-card-icon">🎨</div>
                    <h2>View System Themes</h2>
                    <p>Browse the predefined themes used in the application.</p>
                </Link>

                <Link to="/rdl-groups" className="nav-card">
                    <div className="nav-card-icon">📁</div>
                    <h2>View RDL Groups</h2>
                    <p>Browse groups that categorize RDL report types.</p>
                </Link>
                <Link to="/rdl-types" className="nav-card">
                    <div className="nav-card-icon">📄</div>
                    <h2>View RDL Types</h2>
                    <p>Browse predefined types for RDL reports.</p>
                </Link>

                <Link to="/perspectives" className="nav-card">
                    <div className="nav-card-icon">👓</div>
                    <h2>Perspectives</h2>
                </Link>

                <Link to="/perspective-fact-links" className="nav-card">
                    <div className="nav-card-icon">🔗➕📊</div>
                    <h2>View Perspective-Fact Links</h2>
                    <p>Audit all associations between perspectives and facts.</p>
                </Link>

                <Link to="/fact-columns" className="nav-card">
                    <div className="nav-card-icon">🏛️</div>
                    <h2>Fact Columns</h2>
                </Link>

                <Link to="/rdlgroup-factcol-assignments" className="nav-card">
                    <div className="nav-card-icon">⚙️➕🏛️</div>
                    <h2>View RDLGroup CalcTypes</h2>
                </Link>

                <Link to="/calculation-types" className="nav-card">
                    <div className="nav-card-icon">🧮</div>
                    <h2>View Calculation Types</h2>
                    <p>Browse predefined calculation type definitions.</p>
                </Link>

                <Link to="/calctype-factcol-settings" className="nav-card">
                    <div className="nav-card-icon">🏛️⚙️</div>
                    <h2>View FactCol CalcType Settings</h2>
                    <p>Audit specific calculation settings applied to fact columns.</p>
                </Link>

                <Link to="/perspective-outcalculations" className="nav-card">
                    <div className="nav-card-icon">👓🖩</div>
                    <h2>Perspective Outcalculations</h2>
                    <p>View links between perspectives and outcalculation strings.</p>
                </Link>

                <Link to="/source-fact-links" className="nav-card">
                    <div className="nav-card-icon">💾↔️📈</div>
                    <h2>View Source-Fact Links</h2>
                    <p>Audit all associations between data sources and facts.</p>
                </Link>

                <Link to="/olap-query-logs" className="nav-card">
                    <div className="nav-card-icon">🔎📜</div>
                    <h2>OLAP Query Logs</h2>
                    <p>Consult and filter query logs from the OLAP server.</p>
                </Link>

                <Link to="/perspective-dimension-links" className="nav-card">
                    <div className="nav-card-icon">👓🔗📏</div>
                    <h2>Perspective-Dimension Links</h2>
                </Link>

                <Link to="/fact-db-extracts" className="nav-card">
                    <div className="nav-card-icon">📜⚙️</div>
                    <h2>Fact DB Extracts</h2>
                    <p>View all defined database extraction configurations for facts.</p>
                </Link>

                <Link to="/role-dimcol-permissions" className="nav-card">
                    <div className="nav-card-icon">🛡️🏛️</div>
                    <h2>Role Column Permissions</h2>
                    <p>View all permission settings for roles on dimension columns.</p>
                </Link>



            </nav>
        </div>
    );
}

export default HomePage;