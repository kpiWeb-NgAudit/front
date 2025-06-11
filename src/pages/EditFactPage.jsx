// src/pages/EditFactPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FactForm from '../components/FactForm';
import { getFactById, updateFact } from '../api/factService';

function EditFactPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [fact, setFact] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchFact = useCallback(async () => {
        if (!id) return;
        setLoading(true); setError(null);
        try {
            const numericId = parseInt(id);
            if (isNaN(numericId)) throw new Error("Invalid fact ID.");
            const data = await getFactById(numericId);
            setFact(data);
        } catch (err) {
            console.error(`Error fetching fact ${id}:`, err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchFact();
    }, [fetchFact]);

    const handleUpdateFact = async (factData) => {
        try {
            const numericId = parseInt(id);
            const updatedFact = await updateFact(numericId, factData);
            alert(`Fact "${updatedFact.fact_tname || updatedFact.fact_id_pk}" updated.`);
            // Navigate back to the list, possibly maintaining filter if it was set
            const cubeIdOfEditedFact = updatedFact.cube_id_pk || factData.CubeIdPk; // Get CubeIdPk
            navigate(cubeIdOfEditedFact ? `/facts?cubeIdPk=${cubeIdOfEditedFact}` : '/facts');
        } catch (error) {
            console.error('Failed to update fact:', error);
            alert(`Error updating fact: ${error.response?.data?.message || error.response?.data?.title || error.message || 'An error occurred.'}`);
            throw error;
        }
    };

    if (loading) return <p>Loading fact data...</p>;
    if (error) return <p className="error-message">Error: {error.message || 'Could not load fact.'}</p>;
    if (!fact) return <p>Fact not found.</p>;

    return (
        <div>
            <h2>Edit Fact (ID: {fact.fact_id_pk})</h2>
            <FactForm
                onSubmit={handleUpdateFact}
                initialData={fact}
                isEditMode={true}
            />
        </div>
    );
}
export default EditFactPage;