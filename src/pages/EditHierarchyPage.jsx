// src/pages/EditHierarchyPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import HierarchyForm from '../components/HierarchyForm'; // <<< CORRECT FORM FOR HIERARCHY
import HierarchyDimensionColumnManager from '../components/HierarchyDimensionColumnManager'; // For managing hier_dimcol
import { getHierarchyById, updateHierarchy } from '../api/hierarchyService'; // Correct service

function EditHierarchyPage() {
    const navigate = useNavigate();
    const { id } = useParams(); // This is hier_id_pk (string from URL)
    const [hierarchy, setHierarchy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const numericId = parseInt(id);

    const fetchHierarchyDetails = useCallback(async () => {
        if (isNaN(numericId)) {
            setError(new Error("Invalid hierarchy ID provided in URL."));
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const data = await getHierarchyById(numericId);
            setHierarchy(data);
        } catch (err) {
            console.error(`Error fetching hierarchy ${numericId}:`, err);
            setError(err.message || "Failed to fetch hierarchy details.");
        } finally {
            setLoading(false);
        }
    }, [numericId]);

    useEffect(() => {
        fetchHierarchyDetails();
    }, [fetchHierarchyDetails]);

    const handleUpdateHierarchyCoreDetails = async (hierarchyFormData) => {
        if (isNaN(numericId)) {
            alert("Cannot update: Invalid Hierarchy ID.");
            return Promise.reject(new Error("Invalid Hierarchy ID"));
        }
        try {
            const updatedHierarchy = await updateHierarchy(numericId, hierarchyFormData);
            alert(`Hierarchy "${updatedHierarchy.hier_cubename || updatedHierarchy.hier_id_pk}" core details updated successfully!`);
            setHierarchy(prev => ({...prev, ...updatedHierarchy, hier_timestamp: updatedHierarchy.hier_timestamp}));
        } catch (error) {
            console.error('Failed to update hierarchy core details:', error);
            alert(`Error updating hierarchy core details: ${error.response?.data?.message || error.response?.data?.title || error.message || 'An unexpected error occurred.'}`);
            throw error;
        }
    };

    if (loading) return <p>Loading hierarchy data...</p>;
    if (error) return <p className="error-message">Error loading hierarchy: {error}</p>;
    if (!hierarchy && !loading) return <p>Hierarchy not found (ID: {id}).</p>;
    if (!hierarchy) return null;

    return (
        <div>
            <h2>Edit Hierarchy (ID: {hierarchy.hier_id_pk})</h2>
            <p style={{ fontStyle: 'italic', marginBottom: '15px' }}>
                Edit the main properties of the hierarchy below.
                Associated dimension columns are managed in the section further down.
            </p>

            {/* Form for the main Hierarchy entity's properties */}
            <HierarchyForm // <<< SHOULD BE HierarchyForm
                onSubmit={handleUpdateHierarchyCoreDetails}
                initialData={hierarchy}
                isEditMode={true}
            />

            <hr style={{ margin: '30px 0', border: 0, borderTop: '1px solid #ccc' }} />

            {/* Manager for the HierDimCol associations */}
            {!isNaN(numericId) ? (
                <HierarchyDimensionColumnManager hierarchyId={numericId} />
            ) : (
                <p className="error-message">Cannot manage dimension columns: Hierarchy ID is invalid.</p>
            )}
        </div>
    );
}
export default EditHierarchyPage;