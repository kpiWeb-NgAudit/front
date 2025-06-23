// src/pages/AddPerspectivePage.jsx
import React, { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PerspectiveForm from '../components/PerspectiveForm';
import { createPerspective } from '../api/perspectiveService';

function AddPerspectivePage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const preselectedCubeIdPk = searchParams.get('cubeIdPk');

    const handleAddPerspective = async (perspectiveData) => {
        try {
            const newPsp = await createPerspective(perspectiveData);
            alert(`Perspective "${newPsp.perspName || newPsp.perspIdPk}" created.`);
            navigate(perspectiveData.CubeIdPk ? `/perspectives?cubeIdPk=${perspectiveData.CubeIdPk}` : '/perspectives');
        } catch (error) {
            alert(`Error: ${error.response?.data?.message || error.message}`);
            throw error;
        }
    };

    const stableEmptyInitialData = useMemo(() => ({}), []);

    return (
        <div>
            <h2>Add New Perspective</h2>
            <PerspectiveForm
                onSubmit={handleAddPerspective}
                onCancel={() => navigate(preselectedCubeIdPk ? `/perspectives?cubeIdPk=${preselectedCubeIdPk}` : '/perspectives')}
                isEditMode={false}
                parentCubeIdPk={preselectedCubeIdPk} // For PerspectiveForm to pre-select customer
                initialData={stableEmptyInitialData} // For other potential pre-fills
            />
        </div>
    );
}
export default AddPerspectivePage;