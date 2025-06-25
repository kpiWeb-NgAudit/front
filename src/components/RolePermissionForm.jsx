// Créez ce nouveau fichier : src/components/RolePermissionForm.jsx
import React, { useState, useEffect, useMemo } from 'react';

function RolePermissionForm({ initialData, allDimColumns, existingPermissionIds, onSubmit, onCancel }) {
    const isEditMode = !!initialData;
    const [formData, setFormData] = useState({
        dimcolId: '',
        allowSet: true,
        mdxInstruction: '',
        visualTotals: false
    });

    useEffect(() => {
        if (isEditMode) {
            setFormData({
                dimcolId: initialData.dimcolId,
                allowSet: initialData.allowSet,
                mdxInstruction: initialData.mdxInstruction || '',
                visualTotals: initialData.visualTotals === null ? false : initialData.visualTotals
            });
        }
    }, [initialData, isEditMode]);

    // Filtrer pour n'afficher que les colonnes qui n'ont pas encore de permission
    const availableDimCols = useMemo(() => {
        if (isEditMode) return []; // Pas besoin en mode édition
        return allDimColumns.filter(dc => !existingPermissionIds.includes(dc.dimcol_id_pk));
    }, [allDimColumns, existingPermissionIds, isEditMode]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="card card-body mt-3">
            <h5>{isEditMode ? `Editing Permission for: ${initialData.dimcolName}` : 'Add New Permission'}</h5>
            {!isEditMode && (
                <div className="mb-3">
                    <label className="form-label">Dimension Column</label>
                    <select name="dimcolId" value={formData.dimcolId} onChange={handleChange} className="form-select" required>
                        <option value="">-- Select a Column --</option>
                        {availableDimCols.map(dc => (
                            <option key={dc.dimcol_id_pk} value={dc.dimcol_id_pk}>
                                {dc.dimension_name} - {dc.dimcol_name}
                            </option>
                        ))}
                    </select>
                </div>
            )}
            <div className="form-check form-switch mb-3">
                <input className="form-check-input" type="checkbox" id="allowSet" name="allowSet" checked={formData.allowSet} onChange={handleChange} />
                <label className="form-check-label" htmlFor="allowSet">Allow Set</label>
            </div>
            <div className="form-check form-switch mb-3">
                <input className="form-check-input" type="checkbox" id="visualTotals" name="visualTotals" checked={formData.visualTotals} onChange={handleChange} />
                <label className="form-check-label" htmlFor="visualTotals">Visual Totals</label>
            </div>
            <div className="mb-3">
                <label className="form-label">MDX Instruction (Optional)</label>
                <textarea name="mdxInstruction" className="form-control" rows="4" value={formData.mdxInstruction} onChange={handleChange}></textarea>
            </div>
            <div className="d-flex justify-content-end">
                <button type="button" className="btn btn-secondary me-2" onClick={onCancel}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Permission</button>
            </div>
        </form>
    );
}

export default RolePermissionForm;