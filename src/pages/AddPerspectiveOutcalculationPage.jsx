// src/pages/AddPerspectiveOutcalculationPage.jsx
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PerspectiveOutcalculationForm from '../components/PerspectiveOutcalculationForm';
import { createPerspectiveOutcalculation } from '../api/perspectiveOutcalculationService';

function AddPerspectiveOutcalculationPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const preselectedPerspId = searchParams.get('perspIdPk');

    const handleAddAssociation = async (associationData) => {
        try {
            const newAssoc = await createPerspectiveOutcalculation(associationData);
            alert(`Association for Perspective ${newAssoc.perspIdPk} and Outcalculation "${newAssoc.outcalculation}" created!`);
            navigate(preselectedPerspId ? `/perspective-outcalculations?perspIdPk=${preselectedPerspId}` : '/perspective-outcalculations');
        } catch (error) {
            alert(`Error: ${error.response?.data?.message || error.message}`);
            // Form will display specific errors if its onSubmit re-throws
        }
    };

    return (
        <div>
            <h2>Add Perspective-Outcalculation Association</h2>
            <PerspectiveOutcalculationForm
                onSubmit={handleAddAssociation}
                onCancel={() => navigate(preselectedPerspId ? `/perspective-outcalculations?perspIdPk=${preselectedPerspId}` : '/perspective-outcalculations')}
                initialPerspIdPk={preselectedPerspId} // Pass for pre-selection in form
            />
        </div>
    );
}
export default AddPerspectiveOutcalculationPage;