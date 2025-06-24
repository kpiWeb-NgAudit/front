// src/components/SourceFactForm.jsx
import React, { useState, useEffect, useMemo } from 'react';

function SourceFactForm({ initialData, allFacts, associatedFactIds, onSubmit, onCancel }) {
    const isEditMode = !!initialData;
    const [formData, setFormData] = useState({
        factId: '',
        nbDaysLoad: 0,
        autodoc: ''
    });

    useEffect(() => {
        if (isEditMode) {
            setFormData({
                factId: initialData.factId,
                nbDaysLoad: initialData.nbDaysLoad,
                autodoc: initialData.autodoc || ''
            });
        } else {
            setFormData({ factId: '', nbDaysLoad: 0, autodoc: '' });
        }
    }, [initialData, isEditMode]);

    const availableFacts = useMemo(() => {
        if (isEditMode) return allFacts; // En mode édition, la liste n'a pas besoin d'être filtrée
        // En mode ajout, on n'affiche que les faits non déjà associés
        return allFacts.filter(f => !associatedFactIds.includes(f.fact_id_pk));
    }, [allFacts, associatedFactIds, isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'nbDaysLoad' ? parseInt(value, 10) : value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="card card-body mt-3">
            <h5>{isEditMode ? 'Edit Association' : 'Add New Fact Association'}</h5>
            <div className="mb-3">
                <label htmlFor="factId" className="form-label">Fact</label>
                <select
                    id="factId"
                    name="factId"
                    className="form-select"
                    value={formData.factId}
                    onChange={handleChange}
                    disabled={isEditMode}
                    required
                >
                    <option value="">-- Select a Fact --</option>
                    {isEditMode && initialData && (
                        <option value={initialData.factId}>{initialData.factShortPresName}</option>
                    )}
                    {availableFacts.map(fact => (
                        <option key={fact.fact_id_pk} value={fact.fact_id_pk}>
                            {fact.fact_shortpresname} (ID: {fact.fact_id_pk})
                        </option>
                    ))}
                </select>
            </div>
            <div className="mb-3">
                <label htmlFor="nbDaysLoad" className="form-label">Number of Days to Load</label>
                <input
                    type="number"
                    id="nbDaysLoad"
                    name="nbDaysLoad"
                    className="form-control"
                    value={formData.nbDaysLoad}
                    onChange={handleChange}
                    min="0"
                    required
                />
            </div>
            <div className="mb-3">
                <label htmlFor="autodoc" className="form-label">Autodoc</label>
                <textarea
                    id="autodoc"
                    name="autodoc"
                    className="form-control"
                    rows="3"
                    value={formData.autodoc}
                    onChange={handleChange}
                ></textarea>
            </div>
            <div className="d-flex justify-content-end">
                <button type="button" className="btn btn-secondary me-2" onClick={onCancel}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
            </div>
        </form>
    );
}

export default SourceFactForm;