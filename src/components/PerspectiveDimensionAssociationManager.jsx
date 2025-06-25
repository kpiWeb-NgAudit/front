// src/components/PerspectiveDimensionAssociationManager.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    getDimensionAssociationsByPerspectiveId,
    createPerspDimnatAssociation,
    deletePerspDimnatAssociation
} from '../api/perspDimnatService'; // Utilisez le service correct
import AssociatedDimensionList from './AssociatedDimensionList';
import AddDimensionToPerspectiveForm from './AddDimensionToPerspectiveForm';


const PerspectiveDimensionAssociationManager = ({ perspectiveId }) => {
    const [associatedDimensions, setAssociatedDimensions] = useState([]); // Stocke PerspDimnatDto[]
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);

    const fetchAssociatedDimensions = useCallback(async () => {
        if (!perspectiveId && perspectiveId !== 0) {
            setAssociatedDimensions([]); setLoading(false); return;
        }
        setLoading(true); setError(null);
        try {
            const data = await getDimensionAssociationsByPerspectiveId(perspectiveId);
            setAssociatedDimensions(data || []);
        } catch (err) {
            setError(err.message || "Failed to load associated dimensions.");
            setAssociatedDimensions([]);
        } finally {
            setLoading(false);
        }
    }, [perspectiveId]);

    useEffect(() => {
        fetchAssociatedDimensions();
    }, [fetchAssociatedDimensions]);

    const handleAssociateDimensions = async (selectedDimensionIdsArray) => {
        if (!perspectiveId && perspectiveId !== 0) return;
        try {
            const creationPromises = selectedDimensionIdsArray.map(dimId =>
                createPerspDimnatAssociation({ PerspId: perspectiveId, DimId: dimId })
            );
            await Promise.all(creationPromises);
            alert(`${selectedDimensionIdsArray.length} dimension(s) associated successfully!`);
            setShowAddForm(false);
            fetchAssociatedDimensions(); // Rafraîchir la liste
        } catch (error) {
            console.error("Error associating dimensions:", error);
            alert(`Error associating dimensions: ${error.response?.data || error.message}`);
        }
    };

    const handleDisassociateDimension = async (perspId, dimId) => {
        // La confirmation est bonne ici, ou peut être gérée dans le composant de liste
        // if (!window.confirm(`Disassociate Dimension ID ${dimId} from Perspective ID ${perspId}?`)) return;
        try {
            await deletePerspDimnatAssociation(perspId, dimId);
            alert('Dimension disassociated successfully.');
            fetchAssociatedDimensions(); // Rafraîchir la liste
        } catch (err) {
            alert(`Error disassociating dimension: ${err.response?.data?.message || err.message}`);
        }
    };

    if (!perspectiveId && perspectiveId !== 0) {
        return <p>Perspective ID not provided to manage dimension associations.</p>;
    }

    const currentAssociatedDimensionIds = associatedDimensions.map(assoc => assoc.dimId);

    return (
        <div className="perspective-dimension-manager" style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
            <h3>Associated Dimensions for Perspective ID: {perspectiveId}</h3>
            {!showAddForm && (
                <button className="primary" onClick={() => setShowAddForm(true)} style={{ marginBottom: '10px' }} disabled={loading}>
                    Associate New Dimension(s)
                </button>
            )}

            {showAddForm && (
                <AddDimensionToPerspectiveForm
                    perspectiveId={perspectiveId}
                    currentAssociatedDimensionIds={currentAssociatedDimensionIds}
                    onSubmit={handleAssociateDimensions}
                    onCancel={() => setShowAddForm(false)}
                />
            )}

            <AssociatedDimensionList
                associatedDimensions={associatedDimensions} // C'est PerspDimnatDto[]
                onDisassociate={handleDisassociateDimension}
                loading={loading}
                error={error}
            />
        </div>
    );
};

export default PerspectiveDimensionAssociationManager;