// src/pages/AddHierarchyPage.jsx
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import HierarchyForm from '../components/HierarchyForm';
import { createHierarchy } from '../api/hierarchyService';

function AddHierarchyPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const preselectedDimIdPk = searchParams.get('dimIdPk');

    const handleAddHierarchy = async (hierarchyData) => {
        try {
            const newHierarchy = await createHierarchy(hierarchyData);
            alert(`Hierarchy "${newHierarchy.hier_cubename || newHierarchy.hier_id_pk}" created.`);
            navigate(preselectedDimIdPk ? `/hierarchies?dimIdPk=${preselectedDimIdPk}` : '/hierarchies');
        } catch (error) {
            alert(`Error creating hierarchy: ${error.response?.data?.message || error.response?.data?.title || error.message}`);
            throw error;
        }
    };
    const initialFormData = preselectedDimIdPk ? { DimIdPk: preselectedDimIdPk } : null;


    return (
        <div>
            <h2>Add New Hierarchy</h2>
            <HierarchyForm
                onSubmit={handleAddHierarchy}
                isEditMode={false}
                initialData={initialFormData} // Pass preselected dimension if available
            />
        </div>
    );
}
export default AddHierarchyPage;