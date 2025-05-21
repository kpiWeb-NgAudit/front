import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FactForm from '../components/FactForm';
import { getFactById, updateFact } from '../api/factService';

function EditFactPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [fact, setFact] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFact = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await getFactById(Number(id));
                setFact(data);
            } catch (err) {
                setError(err);
                console.error("Failed to fetch fact for editing:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchFact();
    }, [id]);

    const handleUpdateFact = async (factData) => {
        try {
            await updateFact(Number(id), factData);
            navigate('/');
        } catch (error) {
            console.error('Failed to update fact:', error);
            alert(`Error updating fact: ${error.response?.data?.message || error.message}`);
            throw error;
        }
    };

    if (loading) return <p>Loading fact data...</p>;
    if (error) return <p className="error-message">Error loading fact: {error.message || JSON.stringify(error)}</p>;
    if (!fact) return <p>Fact not found.</p>;

    return (
        <div>
            <h2>Edit Fact (ID: {fact.factIdPk})</h2>
            <FactForm onSubmit={handleUpdateFact} initialData={fact} isEditMode={true} />
        </div>
    );
}

export default EditFactPage;