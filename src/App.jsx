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
import './pages/HomePage.css';
import EditHierarchyPage from "./pages/EditHierarchyPage.jsx";
import AddHierarchyPage from "./pages/AddHierarchyPage.jsx";
import HierarchyListPage from "./pages/HierarchyListPage.jsx";
import EditRolePage from "./pages/EditRolePage.jsx";
import AddRolePage from "./pages/AddRolePage.jsx";
import RoleListPage from "./pages/RoleListPage.jsx";
import HierDimColListPage from "./pages/HierDimColListPage.jsx";
import UserListPage from "./pages/UserListPage.jsx";
import AddUserPage from "./pages/AddUserPage.jsx";
import EditUserPage from "./pages/EditUserPage.jsx"; // Import HomePage styles if not already global

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

                    {/* Hierarchy Routes - NEW */}
                    <Route path="/hierarchies" element={<HierarchyListPage />} />
                    <Route path="/hierarchies/add" element={<AddHierarchyPage />} />
                    <Route path="/hierarchies/edit/:id" element={<EditHierarchyPage />} />

                    <Route path="/hierdimcols" element={<HierDimColListPage />} />

                    {/* Role Routes - NEW for top-level management */}
                    <Route path="/roles" element={<RoleListPage />} />
                    <Route path="/roles/add" element={<AddRolePage />} />
                    <Route path="/roles/edit/:id" element={<EditRolePage />} />

                    {/* User Routes - NEW */}
                    <Route path="/users" element={<UserListPage />} />
                    <Route path="/users/add" element={<AddUserPage />} />
                    <Route path="/users/edit/:id" element={<EditUserPage />} />

                    <Route path="*" element={<NotFoundPage />} />

                </Routes>
            </div>
        </Router>
    );
}

export default App;