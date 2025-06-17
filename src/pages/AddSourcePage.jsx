// src/pages/AddSourcePage.jsx
import React, {useMemo} from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SourceForm from '../components/SourceForm';
import { createSource } from '../api/sourceService';

function AddSourcePage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const preselectedCubeIdPk = searchParams.get('cubeIdPk');

    const stableEmptyInitialData = useMemo(() => ({}), []);

    const handleAddSource = async (sourceData) => {
        try {
            const newSource = await createSource(sourceData);
            alert(`Source (ID: ${newSource.source_id_pk || sourceData.SourceIdPk}) created.`);
            navigate(sourceData.CubeIdPk ? `/sources?cubeIdPk=${sourceData.CubeIdPk}` : '/sources');
        } catch (error) {
            alert(`Error: ${error.response?.data?.message || error.message}`);
            throw error;
        }
    };

    return (
        <div>
            <h2>Add New Source</h2>
            <SourceForm
                onSubmit={handleAddSource}
                onCancel={() => navigate(preselectedCubeIdPk ? `/sources?cubeIdPk=${preselectedCubeIdPk}` : '/sources')}
                isEditMode={false}
                initialData={stableEmptyInitialData} // Pass stable empty object for create
                parentCubeIdPk={preselectedCubeIdPk}
            />
        </div>
    );
}
export default AddSourcePage;