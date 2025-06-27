// src/pages/EditDimensionPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DimensionForm from '../components/DimensionForm'; // For main dimension properties
import { getDimensionById, updateDimension } from '../api/dimensionService';
import DimensionExtractManager from '../components/DimensionExtractManager';
import DimensionColumnManager from "../components/DimensionColumnManager.jsx"; // <<< NEW IMPORT
import CustomerExploitInstructionManager from '../components/CustomerExploitInstructionManager';
import CustomerCubesetManager from "../components/CustomerCubesetManager.jsx"; // <<< NEW IMPORT



function EditDimensionPage() {
    const navigate = useNavigate();
    const { id } = useParams(); // This is dim_id_pk (string from URL)
    const [dimension, setDimension] = useState(null); // Holds the main dimension data
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Memoize numericId as it's used in useCallback dependency
    const numericId = parseInt(id, 10);

    const fetchDimensionDetails = useCallback(async () => {
        if (isNaN(numericId)) { // Check if parsing id was successful
            setError(new Error("Invalid dimension ID provided in URL."));
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const data = await getDimensionById(numericId);
            if (data) { // Check if data was actually returned
                setDimension(data);
            } else {
                setError(new Error(`Dimension with ID ${numericId} not found.`)); // More specific error
            }
        } catch (err) {
            console.error(`Error fetching dimension ${numericId}:`, err);
            setError(err.message || "Failed to fetch dimension details.");
        } finally {
            setLoading(false);
        }
    }, [numericId]); // Depend on numericId

    useEffect(() => {
        fetchDimensionDetails();
    }, [fetchDimensionDetails]); // Correct usage of useCallback dependency

    const handleUpdateDimension = async (dimensionFormDataFromForm) => {
        if (isNaN(numericId)) {
            alert("Cannot update: Invalid Dimension ID.");
            // Potentially navigate away or disable form if ID is bad from the start
            return Promise.reject(new Error("Invalid Dimension ID for update.")); // Return a rejected promise
        }
        try {
            const updatedDimension = await updateDimension(numericId, dimensionFormDataFromForm);
            alert(`Dimension "${updatedDimension?.dim_tname || updatedDimension?.dim_id_pk || 'ID: '+numericId}" updated successfully!`);

            // Update local state to reflect changes, especially the new timestamp
            // This ensures the form has the latest data if the user edits again without leaving
            setDimension(prevDimension => ({
                ...prevDimension,
                ...updatedDimension, // Overlay with updated fields from API
                // Ensure crucial fields like timestamp are explicitly updated if API returns them flat
                dim_timestamp: updatedDimension.dim_timestamp || dimensionFormDataFromForm.DimTimestamp
            }));

            // Optional: Navigate back to the list page
            // Consider if there are filters to maintain for navigation
            // navigate('/dimensions');
            // For now, we stay on the edit page, updated.
        } catch (error) {
            console.error('Failed to update dimension:', error);
            // Let DimensionForm handle displaying specific field errors by re-throwing
            // The alert here is a fallback for general errors.
            alert(`Error updating dimension: ${error.response?.data?.message || error.response?.data?.title || error.message || 'An unexpected error occurred.'}`);
            throw error; // This allows DimensionForm to catch it and set its own errors state
        }
    };

    // --- Loading and Error States ---
    if (loading) return <p>Loading dimension data...</p>;

    // If there was an error fetching, show it
    if (error) return <p className="error-message">Error: {error.message || 'Could not load dimension details.'}</p>;

    // If dimension is null after loading (and no error state was set for fetching), it means API returned nothing for a valid ID (e.g., 404 from API)
    if (!dimension && !loading) return <p>Dimension not found (ID: {id}). Please check the ID or go back to the list.</p>;

    // This check ensures dimension object is available before rendering DimensionForm
    // It should ideally be caught by the above conditions, but as a final safeguard:
    if (!dimension) return null;

    const parentCustomerId = dimension.cube_id_pk;

    return (
        <div>
            <h2>Edit Dimension (ID: {dimension.dim_id_pk}) - Customer: {parentCustomerId}</h2>
            <DimensionForm
                onSubmit={handleUpdateDimension}
                initialData={dimension}
                isEditMode={true}
                // parentCubeIdPk is not a direct prop for DimensionForm, it uses dimension.cube_id_pk from initialData
            />

            <hr style={{ margin: '30px 0' }} />
            {/*<h3>Dimension Columns</h3>*/}
            {!isNaN(numericId) && <DimensionColumnManager dimensionId={numericId} />}

            <hr style={{ margin: '30px 0' }} />
            {/*<h3>Data Extract Definitions for this Dimension</h3>*/}
            {!isNaN(numericId) && parentCustomerId && (
                <DimensionExtractManager
                    dimensionId={numericId}
                    parentCubeIdPk={parentCustomerId}
                />
            )}

            {/* Sections for managing Cubesets and Exploit Instructions OF THE PARENT CUSTOMER */}
            {parentCustomerId && ( // Only render if we have a customer ID
                <>
                    <hr style={{ margin: '30px 0', border: 0, borderTop: '2px dashed #bbb' }} />
                    {/*<h3>Cubesets for Customer: {parentCustomerId}</h3>*/}
                    <CustomerCubesetManager customerId={parentCustomerId} />

                    <hr style={{ margin: '30px 0', border: 0, borderTop: '2px dashed #bbb' }} />
                    {/*<h3>Exploit Instructions for Customer: {parentCustomerId}</h3>*/}
                    <CustomerExploitInstructionManager customerId={parentCustomerId} />
                </>
            )}
        </div>
    );
}

export default EditDimensionPage;