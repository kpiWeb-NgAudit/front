// src/components/PerspectiveFactAssociationManager.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    getFactAssociationsByPerspectiveId,
    createPerspectiveFactAssociation,
    deletePerspectiveFactAssociation
} from '../api/perspectiveFactAssociationService';
import AssociatedFactList from './AssociatedFactList';
import AddFactToPerspectiveForm from './AddFactToPerspectiveForm';

const PerspectiveFactAssociationManager = ({ perspectiveId }) => {
    const [associatedFacts, setAssociatedFacts] = useState([]); // Stores PerspectiveFactAssociationDto[]
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);

    const fetchAssociatedFacts = useCallback(async () => {
        if (!perspectiveId && perspectiveId !== 0) { // Allow 0 if it's a valid ID
            setAssociatedFacts([]); setLoading(false); return;
        }
        setLoading(true); setError(null);
        try {
            const data = await getFactAssociationsByPerspectiveId(perspectiveId);
            setAssociatedFacts(data || []);
        } catch (err) {
            setError(err.message || "Failed to load associated facts.");
            setAssociatedFacts([]);
        } finally {
            setLoading(false);
        }
    }, [perspectiveId]);

    useEffect(() => {
        fetchAssociatedFacts();
    }, [fetchAssociatedFacts]);

    const handleAssociateFacts = async (selectedFactIdsArray) => {
        if (!perspectiveId && perspectiveId !== 0) return;
        try {
            // Create associations for each selected fact
            const creationPromises = selectedFactIdsArray.map(factIdPk =>
                createPerspectiveFactAssociation({ PerspIdPk: perspectiveId, FactIdPk: factIdPk })
            );
            await Promise.all(creationPromises);
            alert(`${selectedFactIdsArray.length} fact(s) associated successfully!`);
            setShowAddForm(false);
            fetchAssociatedFacts(); // Refresh the list
        } catch (error) {
            console.error("Error associating facts:", error);
            // Error could be displayed more gracefully, e.g., which ones failed if some succeeded
            alert(`Error associating facts: ${error.response?.data?.message || error.message}`);
            // Don't automatically re-throw if form handles its own errors.
            // If form needs to know about this error, then throw.
        }
    };

    const handleDisassociateFact = async (perspId, factId) => {
        // Confirmation is usually good here
        // if (!window.confirm(`Disassociate Fact ID ${factId} from Perspective ID ${perspId}?`)) return;
        try {
            await deletePerspectiveFactAssociation(perspId, factId);
            alert('Fact disassociated successfully.');
            fetchAssociatedFacts(); // Refresh the list
        } catch (err) {
            alert(`Error disassociating fact: ${err.response?.data?.message || err.message}`);
        }
    };

    if (!perspectiveId && perspectiveId !== 0) {
        return <p>Perspective ID not provided to manage fact associations.</p>;
    }

    const currentAssociatedFactIds = associatedFacts.map(assoc => assoc.factIdPk);

    return (
        <div className="perspective-fact-manager" style={{ marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '10px' }}>
            <h3>Associated Facts for Perspective ID: {perspectiveId}</h3>
            {!showAddForm && (
                <button className="primary" onClick={() => setShowAddForm(true)} style={{ marginBottom: '10px' }}>
                    Associate New Fact(s)
                </button>
            )}

            {showAddForm && (
                <AddFactToPerspectiveForm
                    perspectiveId={perspectiveId}
                    currentAssociatedFactIds={currentAssociatedFactIds}
                    onSubmit={handleAssociateFacts}
                    onCancel={() => setShowAddForm(false)}
                />
            )}

            <AssociatedFactList
                associatedFacts={associatedFacts} // This is PerspectiveFactAssociationDto[]
                onDisassociate={handleDisassociateFact}
                loading={loading}
                error={error}
            />
        </div>
    );
};

export default PerspectiveFactAssociationManager;