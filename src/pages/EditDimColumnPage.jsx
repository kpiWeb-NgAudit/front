// src/pages/EditDimColumnPage.jsx

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DimColumnForm from '../components/DimColumnForm'; // The form component
import { getDimColumnById, updateDimColumn } from '../api/dimColumnService'; // The API services

function EditDimColumnPage() {
    const navigate = useNavigate();
    const { id } = useParams(); // Gets the column ID from the URL (e.g., /dimcolumns/edit/123)
    const [dimColumn, setDimColumn] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const numericId = parseInt(id, 10);

    // Function to fetch the specific dimension column's data from the API
    const fetchDimColumn = useCallback(async () => {
        if (isNaN(numericId)) {
            setError(new Error("Invalid Dimension Column ID."));
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const data = await getDimColumnById(numericId);
            setDimColumn(data);
        } catch (err) {
            setError(err.message || "Failed to load dimension column data.");
        } finally {
            setLoading(false);
        }
    }, [numericId]);

    // This effect runs once when the component mounts to fetch the data
    useEffect(() => {
        fetchDimColumn();
    }, [fetchDimColumn]);

    // This function is passed to the form and handles the final submission
    const handleUpdateDimColumn = async (dimColumnData) => {
        if (isNaN(numericId)) {
            return Promise.reject(new Error("Invalid Dimension Column ID"));
        }
        try {
            // The DimColumnForm prepares the data in the correct DTO format
            await updateDimColumn(numericId, dimColumnData);
            alert(`Dimension Column "${dimColumnData.DimcolCname}" (ID: ${numericId}) updated successfully!`);

            // Navigate back to the main list of dimension columns after a successful update
            // We can even preserve the filter if it exists in the URL
            if (dimColumnData.DimIdPk) {
                navigate(`/dimcolumns?dimensionId=${dimColumnData.DimIdPk}`);
            } else {
                navigate('/dimcolumns');
            }
        } catch (error) {
            // The form itself will display detailed field errors.
            // This is just a fallback for the page level.
            console.error('Failed to update dimension column:', error);
            // Re-throw the error so the form's handleSubmit knows it failed
            throw error;
        }
    };

    // Render loading/error/not-found states
    if (loading) return <p className="text-center mt-5">Loading dimension column data...</p>;
    if (error) return <p className="alert alert-danger">Error: {error}</p>;
    if (!dimColumn) return <p>Dimension Column with ID: {id} not found.</p>;

    // Once data is loaded, render the form
    return (
        <div className="container mt-4">
            <h2>Edit Dimension Column</h2>

            {/*
              Render the DimColumnForm and pass the necessary props.
              The form will handle the entire UI for editing.
            */}
            <DimColumnForm
                onSubmit={handleUpdateDimColumn}
                onCancel={() => navigate(-1)} // A simple "go back" for the cancel button
                initialData={dimColumn} // Pass the fetched data to pre-fill the form
                isEditMode={true} // Tell the form to be in "edit" mode
                parentDimensionId={dimColumn.dim_id_pk} // Pass the parent ID for context
            />
        </div>
    );
}

export default EditDimColumnPage;