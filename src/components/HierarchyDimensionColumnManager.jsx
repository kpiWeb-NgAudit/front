// src/components/HierarchyDimensionColumnManager.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    getHierDimColsByHierarchyId, // Use the new service function
    createHierDimCol,
    updateHierDimCol,
    deleteHierDimCol
} from '../api/hierDimColService';
import { getAllDimColumns } // Assuming this service exists and works
    from '../api/dimColumnService';
import HierDimColList from './HierDimColList'; // Import the list component
import HierDimColForm from './HierDimColForm'; // Import the form component

const HierarchyDimensionColumnManager = ({ hierarchyId }) => {
    const [associations, setAssociations] = useState([]);
    const [availableDimCols, setAvailableDimCols] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingAssociationData, setEditingAssociationData] = useState(null); // For pre-filling edit form

    const fetchAllData = useCallback(async () => {
        if (!hierarchyId) {
            setAssociations([]);
            setAvailableDimCols([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            // Fetch associations for the current hierarchy
            const assocData = await getHierDimColsByHierarchyId(hierarchyId);
            setAssociations(assocData || []);

            // Fetch all (or relevant) dimension columns for the "Add" dropdown
            // You might want to filter these dim columns based on the parent dimension of the hierarchy
            const dimColsResponse = await getAllDimColumns({ pageSize: 1000 }); // Adjust pageSize as needed
            setAvailableDimCols(dimColsResponse.data || []);

        } catch (err) {
            console.error("Error fetching data for manager:", err);
            setError(err.message || "Failed to load data.");
        } finally {
            setLoading(false);
        }
    }, [hierarchyId]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    const handleAddOrUpdateAssociation = async (formData) => {
        try {
            if (editingAssociationData) { // Update
                // Ensure composite keys are from editingAssociationData, attributes from formData
                await updateHierDimCol(editingAssociationData.HierIdPk, editingAssociationData.DimcolIdPk, formData);
                alert('Association updated successfully!');
            } else { // Create
                const dataToCreate = { ...formData, HierIdPk: hierarchyId }; // Ensure HierIdPk is set
                await createHierDimCol(dataToCreate);
                alert('Association added successfully!');
            }
            setShowForm(false);
            setEditingAssociationData(null);
            fetchAllData(); // Refresh the list
        } catch (error) {
            console.error("Error saving association:", error);
            // Error will be displayed by HierDimColForm's internal error handling
            throw error; // Re-throw to let HierDimColForm handle it
        }
    };

    const handleDeleteAssociation = async (hierId, dimcolId) => {
        if (!window.confirm(`Remove association (Hierarchy ${hierId} - DimCol ${dimcolId})?`)) return;
        try {
            await deleteHierDimCol(hierId, dimcolId);
            alert('Association removed successfully.');
            fetchAllData(); // Refresh the list
        } catch (err) {
            alert(`Error deleting association: ${err.response?.data?.message || err.message}`);
        }
    };

    const openEditForm = (association) => {
        // Map the association (likely from DTO with backend names) to what HierDimColForm expects
        setEditingAssociationData({
            HierIdPk: association.hierIdPk,
            DimcolIdPk: association.dimcolIdPk,
            HierDimLevel: association.hierDimLevel,
            HierDimRdlTypePresnameCol: association.hierDimRdlTypePresnameCol,
            HierDimColTimestamp: association.hierDimColTimestamp // from DTO
        });
        setShowForm(true);
    };

    const openAddForm = () => {
        setEditingAssociationData(null); // Clear any edit data
        setShowForm(true);
    };

    if (!hierarchyId) {
        return <p>Please save the hierarchy before managing dimension columns.</p>;
    }
    if (loading) return <p>Loading associated dimension columns...</p>;
    if (error) return <p className="error-message">Error loading associations: {error}</p>;

    return (
        <div className="hier-dimcol-manager" style={{ marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '10px' }}>
            <h3>Associated Dimension Columns</h3>
            {!showForm && (
                <button className="primary" onClick={openAddForm} style={{ marginBottom: '10px' }}>
                    Add/Associate Dimension Column
                </button>
            )}

            {showForm && (
                <HierDimColForm
                    onSubmit={handleAddOrUpdateAssociation}
                    onCancel={() => { setShowForm(false); setEditingAssociationData(null); }}
                    initialData={editingAssociationData || { HierIdPk: hierarchyId }} // Pass current hierarchyId for new items
                    availableDimCols={availableDimCols}
                    existingAssociations={associations}
                    isEditMode={!!editingAssociationData}
                />
            )}

            <HierDimColList
                hierDimCols={associations}
                onEdit={openEditForm}
                onDelete={handleDeleteAssociation}
                // Pass dimColumnsMap if you fetch and create one
                loading={false} // Loading for the list itself is handled by the manager
                error={null}    // Errors for the list are handled by the manager
            />
        </div>
    );
};

export default HierarchyDimensionColumnManager;