// src/components/CustomerRoleManager.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    getAllRoles,
    createRole,
    updateRole,
    deleteRole
} from '../api/roleService';
import RoleList from './RoleList';
import RoleForm from './RoleForm';

const CustomerRoleManager = ({ customerId }) => { // Receives parent customerId
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingRole, setEditingRole] = useState(null);

    const fetchRoles = useCallback(async () => {
        if (!customerId) {
            setRoles([]); setLoading(false); return;
        }
        setLoading(true); setError(null);
        try {
            const response = await getAllRoles({ cubeIdPk: customerId, pageSize: 200 }); // Fetch roles for this customer
            setRoles(response.data || []);
        } catch (err) {
            setError(err.message || "Failed to load roles.");
        } finally {
            setLoading(false);
        }
    }, [customerId]);

    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);

    const handleAddOrUpdateRole = async (formData) => {
        try {
            if (editingRole) {
                await updateRole(editingRole.RoleIdPk, formData); // Use DTO key
                alert('Role updated successfully!');
            } else {
                const dataToCreate = { ...formData, CubeIdPk: customerId };
                await createRole(dataToCreate);
                alert('Role added successfully!');
            }
            setShowForm(false);
            setEditingRole(null);
            fetchRoles();
        } catch (error) {
            console.error("Error saving role:", error);
            throw error;
        }
    };

    const handleDeleteRole = async (roleIdPk) => {
        if (!window.confirm(`Delete Role ID ${roleIdPk}?`)) return;
        try {
            await deleteRole(roleIdPk);
            alert('Role deleted successfully.');
            fetchRoles();
        } catch (err) {
            alert(`Error deleting role: ${err.response?.data?.message || err.message}`);
        }
    };

    const openEditForm = (role) => {
        // Map role entity (backend names) to form's initialData (PascalCase)
        setEditingRole({
            RoleIdPk: role.role_id_pk,
            RoleName: role.role_name,
            RoleDescription: role.role_description,
            RoleCubeWriteAllow: role.role_cubewriteallow,
            RoleMeasuresAllowSet: role.role_measures_allowset,
            RoleCustomRoleName: role.role_custom_role_name,
            RoleMeasuresMdxInstruction: role.role_measures_mdxinstruction,
            CubeIdPk: role.cube_id_pk, // Should match customerId prop
            RoleComments: role.role_comments,
            RoleTimestamp: role.role_timestamp
        });
        setShowForm(true);
    };

    const openAddForm = () => {
        setEditingRole(null);
        setShowForm(true);
    };

    if (!customerId) return <p>Customer ID not provided to Role Manager.</p>;

    return (
        <div className="customer-role-manager" style={{ marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '10px' }}>
            <h3>Roles for Customer: {customerId}</h3>
            {!showForm && (
                <button className="primary" onClick={openAddForm} style={{ marginBottom: '10px' }}>
                    Add New Role
                </button>
            )}

            {showForm && (
                <RoleForm
                    onSubmit={handleAddOrUpdateRole}
                    onCancel={() => { setShowForm(false); setEditingRole(null); }}
                    initialData={editingRole || {}}
                    parentCubeIdPk={customerId} // Pass customerId for new roles
                    isEditMode={!!editingRole}
                />
            )}

            <RoleList
                roles={roles}
                onEdit={openEditForm}
                onDelete={handleDeleteRole}
                loading={loading}
                error={error}
            />
        </div>
    );
};

export default CustomerRoleManager;