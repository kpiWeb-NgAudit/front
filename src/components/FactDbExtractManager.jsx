// Créez ce nouveau fichier : src/components/FactDbExtractManager.jsx

import React, { useState, useEffect, useCallback } from 'react';
import factDbExtractV2Service from '../api/factDbExtractV2Service';
import FactDbExtractForm from './FactDbExtractForm';

function FactDbExtractManager({ factId, customerId }) {
    const [extracts, setExtracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [isAdding, setIsAdding] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await factDbExtractV2Service.getExtractsByFact(factId);
            setExtracts(response.data);
        } catch (err) {
            setError("Failed to load DB extracts for this fact.");
        } finally {
            setLoading(false);
        }
    }, [factId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleFormSubmit = async (formData) => {
        try {
            if (isAdding) {
                await factDbExtractV2Service.addExtract({ ...formData, factId: parseInt(factId) });
            } else {
                const key = { factId: editingItem.factId, prodDataSourceId: editingItem.prodDataSourceId, dateInsert: editingItem.dateInsert };
                const dataToUpdate = { ...formData, timestamp: editingItem.timestamp };
                await factDbExtractV2Service.updateExtract(key, dataToUpdate);
            }
            setIsAdding(false);
            setEditingItem(null);
            fetchData();
        } catch (err) {
            alert("Error saving extract: " + (err.response?.data || err.message));
        }
    };

    const handleDelete = async (item) => {
        if(window.confirm("Are you sure you want to delete this extract?")) {
            try {
                const key = { factId: item.factId, prodDataSourceId: item.prodDataSourceId, dateInsert: item.dateInsert };
                await factDbExtractV2Service.deleteExtract(key);
                fetchData();
            } catch (err) {
                alert("Error deleting extract: " + (err.response?.data || err.message));
            }
        }
    };

    if (loading) return <p>Loading DB Extracts...</p>;
    if (error) return <p className="alert alert-danger">{error}</p>;

    return (
        <div className="mt-4 p-3 border rounded">
            <h4>Fact DB Extracts</h4>
            <hr />
            {!(isAdding || editingItem) && (
                <button className="btn btn-primary" onClick={() => setIsAdding(true)}>+ Add Extract</button>
            )}
            {(isAdding || editingItem) && (
                <FactDbExtractForm
                    initialData={editingItem}
                    onSubmit={handleFormSubmit}
                    onCancel={() => { setIsAdding(false); setEditingItem(null); }}
                    customerId={customerId}
                />
            )}
            <div className="table-responsive mt-3">
                <table className="table table-sm">
                    <thead>
                    <tr>
                        <th>Prod Source ID</th>
                        <th>Date Inserted</th>
                        <th>Comments</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {extracts.map(item => (
                        <tr key={`${item.factId}-${item.prodDataSourceId}-${item.dateInsert}`}>
                            <td>{item.prodDataSourceId}</td>
                            <td>{new Date(item.dateInsert).toLocaleString()}</td>
                            <td>{item.comments}</td>
                            <td>
                                <button className="btn btn-sm btn-secondary me-2" onClick={() => setEditingItem(item)}>Edit</button>
                                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
export default FactDbExtractManager;