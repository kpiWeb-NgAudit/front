import React from 'react';
import { useNavigate } from 'react-router-dom';
import FactForm from '../components/FactForm';
import { createFact } from '../api/factService';

function AddFactPage() {
    const navigate = useNavigate();

    const handleAddFact = async (factData) => {
        try {
            await createFact(factData);
            navigate('/');
        } catch (error) {
            console.error('Failed to create fact:', error);
            alert(`Error creating fact: ${error.response?.data?.message || error.message}`);
            throw error;
        }
    };

    return (
        <div>
            <h2>Add New Fact</h2>
            <FactForm onSubmit={handleAddFact} isEditMode={false} />
        </div>
    );
}

export default AddFactPage;