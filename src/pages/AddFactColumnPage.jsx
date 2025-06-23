// src/pages/AddFactColumnPage.jsx
import React, { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import FactColumnForm from '../components/FactColumnForm';
import { createFactColumn } from '../api/factColumnService';

function AddFactColumnPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const preselectedFactIdPk = searchParams.get('factIdPk');

    const handleAddFactColumn = async (factColumnData) => {
        try {
            const newCol = await createFactColumn(factColumnData);
            alert(`Fact Column "${newCol.factcolCname || newCol.factcolIdPk}" created.`);
            navigate(factColumnData.FactIdPk ? `/fact-columns?factIdPk=${factColumnData.FactIdPk}` : '/fact-columns');
        } catch (error) {
            // Error display is handled by FactColumnForm
            throw error;
        }
    };
    const stableEmptyInitialData = useMemo(() => ({}), []);

    return (
        <div>
            <h2>Add New Fact Column</h2>
            <FactColumnForm
                onSubmit={handleAddFactColumn}
                onCancel={() => navigate(preselectedFactIdPk ? `/fact-columns?factIdPk=${preselectedFactIdPk}` : '/fact-columns')}
                isEditMode={false}
                parentFactIdPk={preselectedFactIdPk}
                initialData={stableEmptyInitialData} // If other pre-fills were needed for create
            />
        </div>
    );
}
export default AddFactColumnPage;