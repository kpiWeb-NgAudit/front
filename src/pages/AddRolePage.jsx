// src/pages/AddRolePage.jsx
import React, {useMemo} from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import RoleForm from '../components/RoleForm';
import { createRole } from '../api/roleService';

function AddRolePage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    // parentCubeIdPk will be used by RoleForm to pre-select the customer
    const preselectedCubeIdPk = searchParams.get('cubeIdPk');

    const stableEmptyInitialData = useMemo(() => ({}), []); // Or just pass null if no prefill
    const initialFormData = preselectedCubeIdPk ? { CubeIdPk: preselectedCubeIdPk } : stableEmptyInitialData;

    const handleAddRole = async (roleData) => {
        try {
            // RoleForm's handleSubmit should prepare roleData with CubeIdPk
            const newRole = await createRole(roleData);
            alert(`Role "${newRole.role_name || newRole.role_id_pk}" created successfully!`);
            // Navigate back to the list, potentially with the filter of the customer it was added to
            navigate(roleData.CubeIdPk ? `/roles?cubeIdPk=${roleData.CubeIdPk}` : '/roles');
        } catch (error) {
            console.error('Failed to create role:', error);
            alert(`Error creating role: ${error.response?.data?.message || error.response?.data?.title || error.message}`);
            throw error; // Allow RoleForm to display specific errors
        }
    };

    return (
        <div>
            <h2>Add New Role</h2>
            <RoleForm initialData={initialFormData}
                onSubmit={handleAddRole}
                isEditMode={false}
                // Pass the preselected customer ID to RoleForm so it can pre-fill its own customer dropdown/field
                // RoleForm's getInitialFormState uses parentCubeIdPk
                parentCubeIdPk={preselectedCubeIdPk}
                // initialData can be used if RoleForm expects more pre-filled fields
                // initialData={preselectedCubeIdPk ? { CubeIdPk: preselectedCubeIdPk } : {}}
            />
        </div>
    );
}

export default AddRolePage;