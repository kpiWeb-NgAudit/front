// src/pages/AddDimensionPage.jsx
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DimensionForm from '../components/DimensionForm';
import { createDimension } from '../api/dimensionService';

function AddDimensionPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const preselectedCubeIdPk = searchParams.get('cubeIdPk'); // Get from query param if present

    const handleAddDimension = async (dimensionData) => {
        try {
            const newDimension = await createDimension(dimensionData);
            alert(`Dimension "${newDimension.dim_tname || newDimension.dim_id_pk}" created successfully!`);
            navigate('/dimensions'); // Or navigate based on filter: navigate(`/dimensions?cubeIdPk=${newDimension.cube_id_pk}`)
        } catch (error) {
            console.error('Failed to create dimension:', error);
            // Error is already handled with an alert in DimensionForm,
            // but we can show a more generic one here if needed or re-throw
            alert(`Error creating dimension: ${error.response?.data?.message || error.response?.data?.title || error.message || 'An unexpected error occurred.'}`);
            throw error; // Allow DimensionForm to show specific field errors
        }
    };

    // Prepare initial data for the form if cubeIdPk is preselected
    const initialFormData = preselectedCubeIdPk ? { CubeIdPk: preselectedCubeIdPk } : null;


    return (
        <div>
            <h2>Add New Dimension</h2>
            <DimensionForm
                onSubmit={handleAddDimension}
                isEditMode={false}
                initialData={initialFormData} // Pass preselected customer if available
            />
        </div>
    );
}

export default AddDimensionPage;