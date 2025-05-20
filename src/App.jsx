// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import AddFactPage from './pages/AddFactPage';
import EditFactPage from './pages/EditFactPage';
import NotFoundPage from './pages/NotFoundPage'; // Import NotFoundPage
import './index.css'; // Global styles

function App() {
    return (
        <Router>
            <Navbar />
            <div className="container" style={{ padding: '20px' }}> {/* Optional container */}
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/add" element={<AddFactPage />} />
                    <Route path="/edit/:id" element={<EditFactPage />} />
                    <Route path="*" element={<NotFoundPage />} /> {/* Catch-all for 404 */}
                </Routes>
            </div>
        </Router>
    );
}

export default App;