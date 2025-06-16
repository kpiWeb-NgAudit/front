// src/components/CustomerUserAssignmentManager.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    getCubeUserAssociations,
    createCubeUserAssociation,
    updateCubeUserAssociation,
    deleteCubeUserAssociation
} from '../api/cubeUserService';
import CubeUserAssociationList from './CubeUserAssociationList';
import CubeUserAssociationForm from './CubeUserAssociationForm';
// We might not pre-fetch all users/roles here, let the form do it if needed for "Add"

const CustomerUserAssignmentManager = ({ customerId }) => {
    const [associations, setAssociations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingAssociation, setEditingAssociation] = useState(null); // For pre-filling edit form

    const fetchAssociations = useCallback(async () => {
        if (!customerId) {
            setAssociations([]); setLoading(false); return;
        }
        setLoading(true); setError(null);
        try {
            const assocData = await getCubeUserAssociations({ cubeIdPk: customerId });
            setAssociations(assocData || []);
        } catch (err) {
            setError(err.message || "Failed to load user associations.");
        } finally {
            setLoading(false);
        }
    }, [customerId]);

    useEffect(() => {
        fetchAssociations();
    }, [fetchAssociations]);

    const handleAddOrUpdateAssociation = async (formDataFromSubForm) => {
        try {
            if (editingAssociation) { // Update
                // For update, PKs (CubeIdPk, UserIdPk) come from editingAssociation
                // formDataFromSubForm has RoleIdPk, CubeUserWhenSendStatsIfAdmin, CubeUserTimestamp
                await updateCubeUserAssociation(editingAssociation.cubeIdPk, editingAssociation.userIdPk, formDataFromSubForm);
                alert('User association updated successfully!');
            } else { // Create
                // formDataFromSubForm has UserIdPk, RoleIdPk, CubeUserWhenSendStatsIfAdmin
                // CubeIdPk is the current customerId
                const dataToCreate = { ...formDataFromSubForm, CubeIdPk: customerId };
                await createCubeUserAssociation(dataToCreate);
                alert('User associated with customer successfully!');
            }
            setShowForm(false);
            setEditingAssociation(null);
            fetchAssociations(); // Refresh list
        } catch (error) {
            // Error is handled by CubeUserAssociationForm's internal error display
            console.error("Error saving cube-user association:", error);
            throw error; // Re-throw to ensure form's catch block runs
        }
    };

    const handleDeleteAssociation = async (cubeId, userId) => {
        if (!window.confirm(`Remove user ${userId} association from customer ${cubeId}?`)) return;
        try {
            await deleteCubeUserAssociation(cubeId, userId);
            alert('User association removed successfully.');
            fetchAssociations();
        } catch (err) {
            alert(`Error removing association: ${err.response?.data?.message || err.message}`);
        }
    };

    const openEditForm = (associationDto) => { // associationDto is CubeUserDto
        setEditingAssociation({ // Prepare initialData for CubeUserAssociationForm
            CubeIdPk: associationDto.cubeIdPk,
            UserIdPk: associationDto.userIdPk,
            RoleIdPk: associationDto.roleIdPk,
            CubeUserWhenSendStatsIfAdmin: associationDto.cubeUserWhenSendStatsIfAdmin,
            CubeUserTimestamp: associationDto.cubeUserTimestamp
        });
        setShowForm(true);
    };

    const openAddForm = () => {
        setEditingAssociation(null);
        setShowForm(true);
    };

    if (!customerId) return <p>Customer ID is required to manage user assignments.</p>;

    return (
        <div className="customer-user-manager" style={{ marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '10px' }}>
            <h3>Manage User Assignments for Customer: {customerId}</h3>
            {!showForm && (
                <button className="primary" onClick={openAddForm} style={{ marginBottom: '10px' }}>
                    Add User to this Customer
                </button>
            )}

            {showForm && (
                <CubeUserAssociationForm
                    onSubmit={handleAddOrUpdateAssociation}
                    onCancel={() => { setShowForm(false); setEditingAssociation(null); }}
                    // For ADD: initialData only needs CubeIdPk. Form fetches users/roles.
                    // For EDIT: initialData is the full editingAssociation object.
                    initialData={editingAssociation || { CubeIdPk: customerId }}
                    isEditMode={!!editingAssociation}
                    // Not passing customerAllUsers/customerAllRoles, form will fetch if needed
                />
            )}

            <CubeUserAssociationList
                associations={associations}
                onEdit={openEditForm}
                onDelete={handleDeleteAssociation}
                loading={loading}
                error={error}
            />
        </div>
    );
};

export default CustomerUserAssignmentManager;