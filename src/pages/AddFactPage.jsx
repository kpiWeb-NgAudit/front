// src/pages/AddFactPage.jsx
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import FactForm from '../components/FactForm';
import { createFact } from '../api/factService';

function AddFactPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const preselectedCubeIdPk = searchParams.get('cubeIdPk');

    const handleAddFact = async (factData) => {
        try {
            const newFact = await createFact(factData);
            alert(`Fact "${newFact.fact_tname || newFact.fact_id_pk}" created successfully!`);
            navigate(preselectedCubeIdPk ? `/facts?cubeIdPk=${preselectedCubeIdPk}` : '/facts');
        } catch (error) {
            console.error('Failed to create fact:', error);
            alert(`Error creating fact: ${error.response?.data?.message || error.response?.data?.title || error.message || 'An error occurred.'}`);
            throw error;
        }
    };
    const initialFormData = preselectedCubeIdPk ? { CubeIdPk: preselectedCubeIdPk } : null;

    return (
        <div>
            <h2>Add New Fact</h2>
            <FactForm
                onSubmit={handleAddFact}
                isEditMode={false}
                initialData={initialFormData}
            />
        </div>
    );
}
export default AddFactPage;