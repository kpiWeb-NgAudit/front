// src/pages/HomePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import FactList from '../components/FactList';
import { getAllFacts, deleteFact as apiDeleteFact } from '../api/factService';

function HomePage() {
    const [facts, setFacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchFacts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getAllFacts();
            setFacts(data || []); // Ensure facts is an array even if API returns null/undefined
        } catch (err) {
            setError(err);
            console.error("Failed to fetch facts:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFacts();
    }, [fetchFacts]);

    const handleDeleteFact = async (id) => {
        try {
            await apiDeleteFact(id);
            setFacts(prevFacts => prevFacts.filter(fact => fact.factIdPk !== id));
            // Could add a success notification here
        } catch (err) {
            console.error("Failed to delete fact:", err);
            // Could add an error notification here
            alert(`Error deleting fact: ${err.response?.data?.message || err.message}`);
        }
    };

    return (
        <div>
            <h1>Facts Management</h1>
            <FactList facts={facts} onDelete={handleDeleteFact} loading={loading} error={error} />
        </div>
    );
}

export default HomePage;