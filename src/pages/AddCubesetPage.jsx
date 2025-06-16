// src/pages/AddCubesetPage.jsx
import React, { useMemo } from 'react'; // Import useMemo
import { useNavigate, useSearchParams } from 'react-router-dom';
import CubesetForm from '../components/CubesetForm';
import { createCubeset } from '../api/cubesetService';

function AddCubesetPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const preselectedCubeIdPk = searchParams.get('cubeIdPk');

    const stableEmptyInitialData = useMemo(() => ({}), []);

    const handleAddCubeset = async (cubesetData) => {
        try {
            // CubesetForm's handleSubmit should prepare cubesetData with CubeIdPk
            const newCubeset = await createCubeset(cubesetData);
            alert(`Cubeset "${newCubeset.cubeset_name || newCubeset.cubeset_id_pk}" created successfully!`);
            navigate(cubesetData.CubeIdPk ? `/cubesets?cubeIdPk=${cubesetData.CubeIdPk}` : '/cubesets');
        } catch (error) {
            console.error('Failed to create cubeset:', error);
            // Error display is primarily handled by CubesetForm
            alert(`Error creating cubeset: ${error.response?.data?.message || error.response?.data?.title || error.message}`);
            throw error;
        }
    };

    return (
        <div>
            <h2>Add New Cubeset</h2>
            <CubesetForm
                onSubmit={handleAddCubeset}
                onCancel={() => navigate(preselectedCubeIdPk ? `/cubesets?cubeIdPk=${preselectedCubeIdPk}` : '/cubesets')}
                isEditMode={false}
                initialData={stableEmptyInitialData}
                parentCubeIdPk={preselectedCubeIdPk} // Pass to CubesetForm
            />
        </div>
    );
}

export default AddCubesetPage;