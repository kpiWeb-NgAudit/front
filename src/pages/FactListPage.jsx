import React, { useState, useEffect, useCallback } from 'react';
import FactList from '../components/FactList';
import { getAllFacts, deleteFact as apiDeleteFact } from '../api/factService';

function FactListPage() { // Renamed component
    const [facts, setFacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchFacts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getAllFacts();
            setFacts(data || []);
        } catch (err) {
            setError(err);
            console.error("Impossible de récupérer les facts:", err);
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
        } catch (err) {
            console.error("Impossible de supprimer le fact:", err);
            alert(`Erreur lors de la suppression du fact: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleFactsAdded = useCallback(() => {
        fetchFacts();
    }, [fetchFacts]);

    return (
        <div>
            <h1>Facts Management</h1>
            <FactList
                facts={facts}
                onDelete={handleDeleteFact}
                loading={loading}
                error={error}
                onFactsAdded={handleFactsAdded}
            />
        </div>
    );
}

export default FactListPage; // Renamed export