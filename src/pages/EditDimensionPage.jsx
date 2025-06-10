// src/pages/EditDimensionPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DimensionForm from '../components/DimensionForm';
import { getDimensionById, updateDimension } from '../api/dimensionService';

function EditDimensionPage() {
    const navigate = useNavigate();
    const { id } = useParams(); // Get dimension ID from URL
    const [dimension, setDimension] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDimension = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        setError(null);
        try {
            const numericId = parseInt(id);
            if (isNaN(numericId)) {
                throw new Error("Invalid dimension ID.");
            }
            const data = await getDimensionById(numericId);
            setDimension(data);
        } catch (err) {
            console.error(`Error fetching dimension ${id}:`, err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchDimension();
    }, [fetchDimension]);

    const handleUpdateDimension = async (dimensionData) => {
        try {
            const numericId = parseInt(id);
            // The DimensionForm's handleSubmit already prepares the data, including the timestamp
            const updatedDimension = await updateDimension(numericId, dimensionData);
            alert(`Dimension "${updatedDimension.dim_tname || updatedDimension.dim_id_pk}" updated successfully!`);
            navigate('/dimensions'); // Or navigate back to the list with filters if applicable
        } catch (error) {
            console.error('Failed to update dimension:', error);
            alert(`Error updating dimension: ${error.response?.data?.message || error.response?.data?.title || error.message || 'An unexpected error occurred.'}`);
            throw error; // Allow DimensionForm to show specific field errors
        }
    };

    if (loading) return <p>Loading dimension data...</p>;
    if (error) return <p className="error-message">Error loading dimension: {error.message || 'Could not fetch dimension details.'}</p>;
    if (!dimension) return <p>Dimension not found.</p>; // Should be caught by error typically

    return (
        <div>
            <h2>Edit Dimension (ID: {dimension.dim_id_pk})</h2>
            <DimensionForm
                onSubmit={handleUpdateDimension}
                initialData={dimension} // Pass the fetched dimension data
                isEditMode={true}
            />
        </div>
    );
}

export default EditDimensionPage;