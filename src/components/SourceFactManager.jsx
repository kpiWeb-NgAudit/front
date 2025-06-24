// src/components/SourceFactManager.jsx
import React, { useState, useEffect, useCallback } from 'react';
import sourceFactService from '../api/sourceFactService';
import SourceFactList from './SourceFactList';
import SourceFactForm from './SourceFactForm';
import * as factService from "../api/factService.js";

function SourceFactManager({ sourceId }) {
    const [sourceFacts, setSourceFacts] = useState([]);
    const [allFacts, setAllFacts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [isAdding, setIsAdding] = useState(false);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [sfResponse, allFactsResponse] = await Promise.all([
                sourceFactService.getSourceFactsBySource(sourceId),
                factService.getAllFacts()
            ]);
            setSourceFacts(sfResponse.data);
            setAllFacts(allFactsResponse.data);
        } catch (err) {
            setError('Failed to load associated facts. ' + (err.response?.data || err.message));
        } finally {
            setIsLoading(false);
        }
    }, [sourceId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleFormSubmit = async (formData) => {
        try {
            if (isAdding) {
                // Création
                await sourceFactService.addSourceFact({ ...formData, sourceId: parseInt(sourceId) });
            } else {
                // Mise à jour
                const dataToUpdate = {
                    nbDaysLoad: formData.nbDaysLoad,
                    autodoc: formData.autodoc,
                    timestamp: editingItem.timestamp // Important pour la concurrence !
                };
                await sourceFactService.updateSourceFact(editingItem.sourceId, editingItem.factId, dataToUpdate);
            }
            setIsAdding(false);
            setEditingItem(null);
            fetchData(); // Recharger les données
        } catch (err) {
            alert('Error saving association: ' + (err.response?.data || err.message));
        }
    };

    const handleDelete = async (factId) => {
        if (window.confirm('Are you sure you want to delete this association?')) {
            try {
                await sourceFactService.deleteSourceFact(sourceId, factId);
                fetchData(); // Recharger les données
            } catch (err) {
                alert('Error deleting association: ' + (err.response?.data || err.message));
            }
        }
    };

    const handleCancel = () => {
        setIsAdding(false);
        setEditingItem(null);
    };

    if (isLoading) return <p>Loading associated facts...</p>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    const associatedFactIds = sourceFacts.map(sf => sf.factId);

    return (
        <div className="mt-4 p-3 border rounded">
            <h4>Associated Facts</h4>
            <hr />

            {!(isAdding || editingItem) && (
                <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
                    + Add Fact Association
                </button>
            )}

            {(isAdding || editingItem) && (
                <SourceFactForm
                    initialData={editingItem}
                    allFacts={allFacts}
                    associatedFactIds={associatedFactIds}
                    onSubmit={handleFormSubmit}
                    onCancel={handleCancel}
                />
            )}

            <SourceFactList
                sourceFacts={sourceFacts}
                onEdit={(item) => setEditingItem(item)}
                onDelete={handleDelete}
            />
        </div>
    );
}

export default SourceFactManager;