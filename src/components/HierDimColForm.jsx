// src/components/HierDimColForm.jsx
import React, { useState, useEffect } from 'react';
import {
    HIER_DIM_RDL_TYPE_PRESNAME_COL_OPTIONS,
    getDropdownOptions
} from '../constants/hierDimColEnums'; // Assuming this is where your enums are

const HierDimColForm = ({
                            onSubmit,
                            onCancel,
                            initialData = {}, // For editing: { HierIdPk, DimcolIdPk, HierDimLevel, HierDimRdlTypePresnameCol, HierDimColTimestamp }
                                              // For adding: { HierIdPk } (parent hierarchy ID)
                            availableDimCols, // Array of all dimension columns available for selection [{ dimcol_id_pk, dimcol_cname, ... }]
                            existingAssociations, // Array of current associations for this hierarchy, to prevent adding duplicates
                            isEditMode = false
                        }) => {

    const [formData, setFormData] = useState({
        HierIdPk: initialData.HierIdPk || '',
        DimcolIdPk: initialData.DimcolIdPk || '', // For edit, this is pre-filled; for add, user selects
        HierDimLevel: initialData.HierDimLevel === undefined ? 0 : initialData.HierDimLevel,
        HierDimRdlTypePresnameCol: initialData.HierDimRdlTypePresnameCol || HIER_DIM_RDL_TYPE_PRESNAME_COL_OPTIONS[0],
        HierDimColTimestamp: initialData.HierDimColTimestamp || null // Only for edit mode submission
    });
    const [errors, setErrors] = useState({});

    // Sync form with initialData when it changes (e.g., when opening edit form)
    useEffect(() => {
        setFormData({
            HierIdPk: initialData.HierIdPk || '',
            DimcolIdPk: initialData.DimcolIdPk || '',
            HierDimLevel: initialData.HierDimLevel === undefined ? 0 : initialData.HierDimLevel,
            HierDimRdlTypePresnameCol: initialData.HierDimRdlTypePresnameCol || HIER_DIM_RDL_TYPE_PRESNAME_COL_OPTIONS[0],
            HierDimColTimestamp: initialData.HierDimColTimestamp || null
        });
        setErrors({}); // Clear previous errors when form opens/re-initializes
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) { // Clear error for a field when user starts typing in it
            setErrors(prev => ({ ...prev, [name]: null}));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.HierIdPk) { // Should always be present from parent
            newErrors.form = 'Hierarchy ID is missing. Cannot proceed.';
        }
        if (!isEditMode && !formData.DimcolIdPk) {
            newErrors.DimcolIdPk = 'Dimension Column is required.';
        }
        if (formData.HierDimLevel === '' || isNaN(parseInt(formData.HierDimLevel)) || parseInt(formData.HierDimLevel) < 0) {
            newErrors.HierDimLevel = 'Level must be a non-negative integer.';
        }
        if (!formData.HierDimRdlTypePresnameCol) {
            newErrors.HierDimRdlTypePresnameCol = 'RDL Type is required.';
        }

        // Check if this DimcolIdPk is already associated with this HierIdPk (for create mode)
        if (!isEditMode && formData.DimcolIdPk && existingAssociations &&
            existingAssociations.some(assoc =>
                assoc.dimcolIdPk === parseInt(formData.DimcolIdPk) && // Compare with actual numeric value
                assoc.hierIdPk === formData.HierIdPk)
        ) {
            newErrors.DimcolIdPk = 'This dimension column is already associated with this hierarchy.';
        }
        if (isEditMode && !formData.HierDimColTimestamp) {
            newErrors.form = 'Timestamp is missing for update. Please refresh data.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) {
            setErrors(prev => ({...prev, form: "Please correct the errors below."}));
            return;
        }

        const submissionData = {
            HierIdPk: parseInt(formData.HierIdPk, 10), // Ensure it's an int
            DimcolIdPk: parseInt(formData.DimcolIdPk, 10), // Ensure it's an int
            HierDimLevel: parseInt(formData.HierDimLevel, 10),
            HierDimRdlTypePresnameCol: formData.HierDimRdlTypePresnameCol,
        };

        if (isEditMode) {
            submissionData.HierDimColTimestamp = formData.HierDimColTimestamp;
        }

        try {
            await onSubmit(submissionData); // Calls createHierDimCol or updateHierDimCol
            // onCancel(); // Parent component will typically handle closing the form
        } catch (error) {
            console.error("HierDimColForm submission error:", error);
            const errorMsg = error.response?.data?.message ||
                error.response?.data?.title ||
                (typeof error.response?.data === 'string' ? error.response.data : null) || // If API returns plain string error
                error.message ||
                'Submission failed. Please try again.';
            setErrors(prev => ({ ...prev, form: errorMsg }));
            if (error.response?.data?.errors) { // For ASP.NET Core ModelState errors
                const backendFieldErrors = {};
                for (const key in error.response.data.errors) {
                    // Assuming backend keys match DTO keys (PascalCase) or need conversion
                    backendFieldErrors[key] = error.response.data.errors[key].join(', ');
                }
                setErrors(prev => ({ ...prev, ...backendFieldErrors }));
            }
        }
    };

    // Filter out already associated dim columns for the "Add" dropdown
    const dimColsForDropdown = isEditMode || !availableDimCols || !existingAssociations
        ? availableDimCols // In edit mode, or if data isn't ready, show all (or what's available)
        : availableDimCols.filter(dc =>
            !existingAssociations.some(assoc =>
                assoc.dimcolIdPk === dc.dimcol_id_pk && assoc.hierIdPk === formData.HierIdPk
            )
        );

    return (
        <form onSubmit={handleSubmit} className="hier-dimcol-form" style={{ border: '1px solid #ccc', padding: '15px', marginTop: '10px', marginBottom: '20px' }}>
            <h4>{isEditMode ? 'Edit Association Attributes' : 'Add Dimension Column to Hierarchy'}</h4>
            {errors.form && <p className="error-message" style={{color: 'red', fontWeight: 'bold'}}>{errors.form}</p>}

            {!isEditMode && (
                <div className="form-group">
                    <label htmlFor="DimcolIdPkForm">Dimension Column (*)</label>
                    <select id="DimcolIdPkForm" name="DimcolIdPk" value={formData.DimcolIdPk} onChange={handleChange} required>
                        <option value="">--- Select Dimension Column ---</option>
                        {dimColsForDropdown && dimColsForDropdown.map(dc => (
                            <option key={dc.dimcol_id_pk} value={dc.dimcol_id_pk}>
                                {dc.dimcol_cname || `Column ID ${dc.dimcol_id_pk}`} (Dim: {dc.dim_tname || dc.dim_id_pk})
                            </option>
                        ))}
                        {(!dimColsForDropdown || dimColsForDropdown.length === 0) && !isEditMode && <option value="" disabled>No available columns to add or all are added.</option>}
                    </select>
                    {errors.DimcolIdPk && <p className="error-message">{errors.DimcolIdPk}</p>}
                </div>
            )}
            {isEditMode && formData.DimcolIdPk && (
                <div className="form-group">
                    <p><strong>Dimension Column:</strong> {
                        (availableDimCols && availableDimCols.find(dc => dc.dimcol_id_pk === parseInt(formData.DimcolIdPk))?.dimcol_cname) ||
                        `ID ${formData.DimcolIdPk}`
                    }</p>
                    {/* DimcolIdPk is not editable for an existing association */}
                </div>
            )}

            <div className="form-group">
                <label htmlFor="HierDimLevelForm">Level (*)</label>
                <input type="number" id="HierDimLevelForm" name="HierDimLevel" value={formData.HierDimLevel} onChange={handleChange} required min="0" />
                {errors.HierDimLevel && <p className="error-message">{errors.HierDimLevel}</p>}
            </div>

            <div className="form-group">
                <label htmlFor="HierDimRdlTypePresnameColForm">RDL Type Presname Col (*)</label>
                <select id="HierDimRdlTypePresnameColForm" name="HierDimRdlTypePresnameCol" value={formData.HierDimRdlTypePresnameCol} onChange={handleChange} required>
                    {getDropdownOptions(HIER_DIM_RDL_TYPE_PRESNAME_COL_OPTIONS).map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                {errors.HierDimRdlTypePresnameCol && <p className="error-message">{errors.HierDimRdlTypePresnameCol}</p>}
            </div>

            <div className="form-actions">
                <button type="submit" className="primary">{isEditMode ? 'Save Changes' : 'Add Association'}</button>
                <button type="button" className="secondary" onClick={onCancel} style={{ marginLeft: '10px' }}>Cancel</button>
            </div>
        </form>
    );
};

export default HierDimColForm;