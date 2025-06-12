// src/pages/EditHierarchyPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import HierarchyForm from '../components/HierarchyForm';
import { getHierarchyById, updateHierarchy } from '../api/hierarchyService';

function EditHierarchyPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [hierarchy, setHierarchy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchHierarchy = useCallback(async () => {
        if (!id) return;
        setLoading(true); setError(null);
        try {
            const numericId = parseInt(id);
            if (isNaN(numericId)) throw new Error("Invalid hierarchy ID.");
            const data = await getHierarchyById(numericId);
            setHierarchy(data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchHierarchy();
    }, [fetchHierarchy]);

    const handleUpdateHierarchy = async (hierarchyData) => {
        try {
            const numericId = parseInt(id);
            const updatedHierarchy = await updateHierarchy(numericId, hierarchyData);
            alert(`Hierarchy "${updatedHierarchy.hier_cubename || updatedHierarchy.hier_id_pk}" updated.`);
            const dimIdOfEdited = updatedHierarchy.dim_id_pk || hierarchyData.DimIdPk;
            navigate(dimIdOfEdited ? `/hierarchies?dimIdPk=${dimIdOfEdited}` : '/hierarchies');
        } catch (error) {
            alert(`Error: ${error.response?.data?.message || error.response?.data?.title || error.message}`);
            throw error;
        }
    };

    if (loading) return <p>Loading hierarchy data...</p>;
    if (error) return <p className="error-message">Error: {error.message || 'Could not load hierarchy.'}</p>;
    if (!hierarchy) return <p>Hierarchy not found.</p>;

    return (
        <div>
            <h2>Edit Hierarchy (ID: {hierarchy.hier_id_pk})</h2>
            <HierarchyForm
                onSubmit={handleUpdateHierarchy}
                initialData={hierarchy}
                isEditMode={true}
            />
        </div>
    );
}
export default EditHierarchyPage;