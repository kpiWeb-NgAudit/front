// src/pages/EditRolePage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import RoleForm from '../components/RoleForm';
import { getRoleById, updateRole } from '../api/roleService';
import RolePermissionManager from '../components/RolePermissionManager'; // <<< AJOUTER


function EditRolePage() {
    const navigate = useNavigate();
    const { id } = useParams(); // Role ID
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const numericId = parseInt(id);

    const fetchRole = useCallback(async () => {
        if (isNaN(numericId)) {
            setError(new Error("Invalid Role ID.")); setLoading(false); return;
        }
        setLoading(true); setError(null);
        try {
            const data = await getRoleById(numericId);
            setRole(data);
        } catch (err) {
            setError(err.message || "Failed to load role.");
        } finally {
            setLoading(false);
        }
    }, [numericId]);

    useEffect(() => {
        fetchRole();
    }, [fetchRole]);

    const handleUpdateRole = async (roleData) => {
        if (isNaN(numericId)) return Promise.reject(new Error("Invalid Role ID"));
        try {
            const updatedRole = await updateRole(numericId, roleData);
            alert(`Role "${updatedRole.role_name || updatedRole.role_id_pk}" updated.`);
            // Navigate back to the list, potentially with customer filter
            navigate(roleData.CubeIdPk ? `/roles?cubeIdPk=${roleData.CubeIdPk}` : '/roles');
        } catch (error) {
            alert(`Error updating role: ${error.response?.data?.message || error.message}`);
            throw error;
        }
    };

    if (loading) return <p>Loading role data...</p>;
    if (error) return <p className="error-message">Error: {error}</p>;
    if (!role && !loading) return <p>Role not found (ID: {id}).</p>;
    if (!role) return null;

    return (
        <div>
            <h2>Edit Role (ID: {role.role_id_pk})</h2>
            <RoleForm
                onSubmit={handleUpdateRole}
                initialData={role} // Pass fetched role data
                isEditMode={true}
                // parentCubeIdPk is not strictly needed here if initialData contains cube_id_pk
                // but RoleForm expects it for its getInitialFormState logic, so pass it from fetched role
                parentCubeIdPk={role.cube_id_pk}
            />
            {/* If roles have sub-entities to manage (like role_users), a manager component would go here */}
            {/* <<< AJOUTER LE MANAGER ICI >>> */}
            <RolePermissionManager roleId={id} />
        </div>
    );
}
export default EditRolePage;