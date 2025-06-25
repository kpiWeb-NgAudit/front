// src/components/AddDimensionToPerspectiveForm.jsx
import React, { useState, useEffect } from 'react';
import { getAllDimensions } from '../api/dimensionService'; // Pour obtenir toutes les dimensions disponibles

const AddDimensionToPerspectiveForm = ({
                                           perspectiveId,
                                           currentAssociatedDimensionIds, // Array des dimId déjà associés
                                           onSubmit, // (selectedDimensionIdsArray) => void
                                           onCancel
                                       }) => {
    const [availableDimensions, setAvailableDimensions] = useState([]);
    const [loadingDimensions, setLoadingDimensions] = useState(true);
    const [selectedDimensionIds, setSelectedDimensionIds] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAllSystemDimensions = async () => {
            setLoadingDimensions(true);
            setError(null);
            try {
                const response = await getAllDimensions({ pageSize: 1000 }); // Récupérer toutes les dimensions
                const allDims = response.data || [];
                // Filtrer les dimensions déjà associées à cette perspective
                const unassociatedDims = allDims.filter(
                    dim => !currentAssociatedDimensionIds.includes(dim.dim_id_pk) // Assumant que l'objet dim a dim_id_pk
                );
                setAvailableDimensions(unassociatedDims);
            } catch (err) {
                console.error("AddDimensionToPerspectiveForm: Failed to fetch dimensions", err);
                setError("Failed to load available dimensions.");
                setAvailableDimensions([]);
            } finally {
                setLoadingDimensions(false);
            }
        };
        fetchAllSystemDimensions();
    }, [currentAssociatedDimensionIds]); // Ré-exécuter si les associations actuelles changent

    const handleDimensionSelectionChange = (e) => {
        const options = e.target.options;
        const selected = [];
        for (let i = 0, l = options.length; i < l; i++) {
            if (options[i].selected) {
                selected.push(parseInt(options[i].value, 10));
            }
        }
        setSelectedDimensionIds(selected);
        if(error) setError(null); // Clear error on selection change
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedDimensionIds.length === 0) {
            setError("Please select at least one dimension to associate.");
            return;
        }
        onSubmit(selectedDimensionIds);
    };

    if (loadingDimensions) return <p>Loading available dimensions...</p>;

    return (
        <form onSubmit={handleSubmit} className="add-dimension-to-perspective-form" style={{ border: '1px solid #ccc', padding: '15px', margin: '10px 0' }}>
            <h4>Associate Dimensions with Perspective ID: {perspectiveId}</h4>
            {error && <p className="error-message" style={{color: 'red'}}>{error}</p>}

            <div className="form-group">
                <label htmlFor="dimensionSelectionPersp">Available Dimensions (*)</label>
                {availableDimensions.length === 0 ? (
                    <p>No new dimensions available to associate (or all are already associated).</p>
                ) : (
                    <select
                        id="dimensionSelectionPersp"
                        name="dimensionSelectionPersp"
                        multiple
                        value={selectedDimensionIds.map(String)} // value pour multi-select est un array de strings
                        onChange={handleDimensionSelectionChange}
                        required
                        size={Math.min(10, availableDimensions.length + 1)}
                        style={{ minWidth: '300px', height: '150px' }}
                    >
                        {/* Assumant que les objets dimension ont dim_id_pk et dim_tname (ou dim_shortpresname) */}
                        {availableDimensions.map(dim => (
                            <option key={dim.dim_id_pk} value={dim.dim_id_pk}>
                                {dim.dim_shortpresname || dim.dim_tname || `Dim ID ${dim.dim_id_pk}`} (ID: {dim.dim_id_pk})
                            </option>
                        ))}
                    </select>
                )}
                <small>Maintenez Ctrl/Cmd pour sélectionner plusieurs dimensions.</small>
            </div>

            <div className="form-actions" style={{ marginTop: '15px' }}>
                <button type="submit" className="primary" disabled={availableDimensions.length === 0 || selectedDimensionIds.length === 0}>
                    Associate Selected Dimension(s)
                </button>
                <button type="button" className="secondary" onClick={onCancel} style={{ marginLeft: '10px' }}>
                    Cancel
                </button>
            </div>
        </form>
    );
};

export default AddDimensionToPerspectiveForm;