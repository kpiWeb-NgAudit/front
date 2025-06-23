// src/components/AddFactToPerspectiveForm.jsx
import React, { useState, useEffect } from 'react';
import { getAllFacts } from '../api/factService'; // To get all available facts

const AddFactToPerspectiveForm = ({
                                      perspectiveId,
                                      currentAssociatedFactIds, // Array of factIdPks already associated
                                      onSubmit, // (selectedFactIdsArray) => void
                                      onCancel
                                  }) => {
    const [availableFacts, setAvailableFacts] = useState([]);
    const [loadingFacts, setLoadingFacts] = useState(true);
    const [selectedFactIds, setSelectedFactIds] = useState([]); // For multi-select or single select
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAllSystemFacts = async () => {
            setLoadingFacts(true);
            setError(null);
            try {
                const response = await getAllFacts({ pageSize: 1000 }); // Fetch a large number
                // Filter out facts already associated with this perspective
                const unassociatedFacts = (response.data || []).filter(
                    fact => !currentAssociatedFactIds.includes(fact.fact_id_pk) // Assuming fact object has fact_id_pk
                );
                setAvailableFacts(unassociatedFacts);
            } catch (err) {
                console.error("AddFactToPerspectiveForm: Failed to fetch facts", err);
                setError("Failed to load available facts.");
                setAvailableFacts([]);
            } finally {
                setLoadingFacts(false);
            }
        };
        fetchAllSystemFacts();
    }, [currentAssociatedFactIds]); // Re-fetch if current associations change

    const handleFactSelectionChange = (e) => {
        // For a multi-select dropdown:
        const options = e.target.options;
        const selected = [];
        for (let i = 0, l = options.length; i < l; i++) {
            if (options[i].selected) {
                selected.push(parseInt(options[i].value,10)); // Ensure values are numbers
            }
        }
        setSelectedFactIds(selected);

        // For a single select dropdown:
        // setSelectedFactIds(e.target.value ? [parseInt(e.target.value, 10)] : []);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedFactIds.length === 0) {
            setError("Please select at least one fact to associate.");
            return;
        }
        onSubmit(selectedFactIds); // Pass array of selected fact IDs
    };

    if (loadingFacts) return <p>Loading available facts...</p>;

    return (
        <form onSubmit={handleSubmit} className="add-fact-to-perspective-form" style={{ border: '1px solid #ccc', padding: '15px', margin: '10px 0' }}>
            <h4>Associate Facts with Perspective ID: {perspectiveId}</h4>
            {error && <p className="error-message" style={{color: 'red'}}>{error}</p>}

            <div className="form-group">
                <label htmlFor="factSelection">Available Facts (*)</label>
                {availableFacts.length === 0 ? (
                    <p>No new facts available to associate (or all are already associated).</p>
                ) : (
                    <select
                        id="factSelection"
                        name="factSelection"
                        multiple // For selecting multiple facts
                        value={selectedFactIds.map(String)} // Value needs to be array of strings for multi-select
                        onChange={handleFactSelectionChange}
                        required
                        size={Math.min(10, availableFacts.length + 1)} // Show a decent number of options
                        style={{ minWidth: '300px' }}
                    >
                        {/* Assuming fact objects have fact_id_pk and fact_tname */}
                        {availableFacts.map(fact => (
                            <option key={fact.fact_id_pk} value={fact.fact_id_pk}>
                                {fact.fact_tname || `Fact ID ${fact.fact_id_pk}`} (ID: {fact.fact_id_pk})
                            </option>
                        ))}
                    </select>
                )}
                <small>Hold Ctrl/Cmd to select multiple facts.</small>
            </div>

            <div className="form-actions" style={{ marginTop: '15px' }}>
                <button type="submit" className="primary" disabled={availableFacts.length === 0 || selectedFactIds.length === 0}>
                    Associate Selected Fact(s)
                </button>
                <button type="button" className="secondary" onClick={onCancel} style={{ marginLeft: '10px' }}>
                    Cancel
                </button>
            </div>
        </form>
    );
};

export default AddFactToPerspectiveForm;