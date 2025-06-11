// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage'; // <<< NEW Home Page
import FactListPage from './pages/FactListPage'; // <<< RENAMED
import AddFactPage from './pages/AddFactPage';
import EditFactPage from './pages/EditFactPage';
// Import Customer pages when ready
import CustomerListPage from './pages/CustomerListPage';
import AddCustomerPage from './pages/AddCustomerPage';
import EditCustomerPage from './pages/EditCustomerPage';

import DimensionListPage from './pages/DimensionListPage';
import AddDimensionPage from './pages/AddDimensionPage';
import EditDimensionPage from './pages/EditDimensionPage';

import NotFoundPage from './pages/NotFoundPage';
import './index.css'; // Global styles
import './pages/HomePage.css'; // Import HomePage styles if not already global

function App() {
    return (
        <Router>
            <Navbar /> {/* Navbar remains */}
            <div className="container" style={{ padding: '0 20px 20px 20px' }}> {/* Adjusted padding slightly */}
                <Routes>
                    <Route path="/" element={<HomePage />} /> {/* Root path now goes to new HomePage */}

                    {/* Fact Routes */}
                    <Route path="/facts" element={<FactListPage />} /> {/* Facts list has its own path */}
                    <Route path="/facts/add" element={<AddFactPage />} />
                    <Route path="/facts/edit/:id" element={<EditFactPage />} />

                    {/* Customer Routes (you'll create these pages next) */}
                    <Route path="/customers" element={<CustomerListPage />} />
                    <Route path="/customers/add" element={<AddCustomerPage />} />
                    <Route path="/customers/edit/:id" element={<EditCustomerPage />} /> {/* :id will be cube_id_pk */}

                    {/* Dimension Routes - NEW */}
                    <Route path="/dimensions" element={<DimensionListPage />} />
                    <Route path="/dimensions/add" element={<AddDimensionPage />} />
                    <Route path="/dimensions/edit/:id" element={<EditDimensionPage />} />

                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;