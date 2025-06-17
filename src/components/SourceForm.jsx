// src/components/SourceForm.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getAllCustomers } from '../api/customerService'; // For customer dropdown

// Helper for consistent key transformation (if your initialData from API uses snake_case)
const snakeToPascal = (str) => {
    if (!str) return str;
    if (str.toLowerCase().endsWith("_pk")) {
        const prefix = str.substring(0, str.length - 3);
        return prefix.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join('') + 'Pk';
    }
    return str.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join('');
};


const SourceForm = ({ onSubmit, onCancel, initialData = {}, parentCubeIdPk, isEditMode = false }) => {
    const [customers, setCustomers] = useState([]);
    const [loadingCustomers, setLoadingCustomers] = useState(false);

    const getInitialFormState = useCallback(() => ({
        SourceIdPk: '', // Client provides for new
        SourceNumber: 0,
        SourceComments: '',
        CubeIdPk: parentCubeIdPk || '', // Pre-fill if provided for context
        SourceTimestamp: null, // For edit mode submission
    }), [parentCubeIdPk]);

    const [formData, setFormData] = useState(getInitialFormState);
    const [errors, setErrors] = useState({});

    // Fetch customers for dropdown if adding globally and no parentCubeIdPk
    useEffect(() => {
        if (!isEditMode && !parentCubeIdPk) {
            setLoadingCustomers(true);
            getAllCustomers({ pageSize: 1000 })
                .then(response => setCustomers(Array.isArray(response) ? response : [])) // Assuming direct array return
                .catch(err => {
                    setErrors(prev => ({ ...prev, customersDropdown: "Failed to load customers." }));
                    setCustomers([]);
                })
                .finally(() => setLoadingCustomers(false));
        } else {
            setLoadingCustomers(false);
            setCustomers([]);
        }
    }, [isEditMode, parentCubeIdPk]);

    // Populate/Reset form based on props
    useEffect(() => {
        let newFormState = getInitialFormState(); // Uses current parentCubeIdPk
        if (isEditMode && initialData && Object.keys(initialData).length > 0) {
            newFormState = { ...newFormState }; // Create a copy
            for (const backendKey in initialData) {
                if (initialData.hasOwnProperty(backendKey)) {
                    const formKey = snakeToPascal(backendKey); // source_id_pk -> SourceIdPk
                    if (newFormState.hasOwnProperty(formKey)) {
                        const value = initialData[backendKey];
                        if (value === null || typeof value === 'undefined') newFormState[formKey] = '';
                        else if (typeof value === 'number') newFormState[formKey] = String(value);
                        else if (formKey === 'SourceTimestamp' && value) newFormState[formKey] = value;
                        else newFormState[formKey] = value;
                    }
                }
            }
            // Ensure PKs are correctly set from snake_cased initialData
            if (initialData.source_id_pk !== undefined) newFormState.SourceIdPk = String(initialData.source_id_pk);
            if (initialData.cube_id_pk !== undefined) newFormState.CubeIdPk = String(initialData.cube_id_pk);
        } else if (!isEditMode && initialData && Object.keys(initialData).length > 0) {
            // Merge other potential pre-fills for create mode
            newFormState = { ...newFormState, ...initialData };
            if (parentCubeIdPk) newFormState.CubeIdPk = parentCubeIdPk; // Prioritize prop
        }
        setFormData(newFormState);
        setErrors({});
    }, [initialData, isEditMode, parentCubeIdPk, getInitialFormState]);


    const validate = () => {
        const newErrors = {};
        if (!isEditMode && (formData.SourceIdPk === '' || isNaN(parseInt(formData.SourceIdPk)) || parseInt(formData.SourceIdPk) <= 0)) {
            newErrors.SourceIdPk = 'Source ID is required and must be a positive number.';
        }
        if (formData.SourceNumber === '' || isNaN(parseInt(formData.SourceNumber))) {
            newErrors.SourceNumber = 'Source Number is required and must be a number.';
        } else if (parseInt(formData.SourceNumber) < 0) { // Example: Allow 0 but not negative
            newErrors.SourceNumber = 'Source Number cannot be negative.';
        }
        if (!formData.CubeIdPk) newErrors.CubeIdPk = 'Parent Customer is required.';
        if (isEditMode && !formData.SourceTimestamp) newErrors.form = "Timestamp missing for update.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if(errors[name]) setErrors(prev => ({...prev, [name]: null}));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) {
            setErrors(prev => ({...prev, form: "Please correct errors."}));
            return;
        }
        const submissionData = {
            SourceNumber: parseInt(formData.SourceNumber, 10),
            SourceComments: formData.SourceComments.trim() === '' ? null : formData.SourceComments.trim(),
            CubeIdPk: formData.CubeIdPk,
        };

        if (!isEditMode) {
            submissionData.SourceIdPk = parseInt(formData.SourceIdPk, 10);
        } else {
            if (!formData.SourceTimestamp) { /* Error handled in validate */ return; }
            submissionData.SourceTimestamp = formData.SourceTimestamp;
        }

        try {
            await onSubmit(submissionData);
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.response?.data?.title || error.message || 'Submission failed.';
            setErrors(prev => ({ ...prev, form: errorMsg }));
            if (error.response?.data?.errors) {
                const backendFieldErrors = {};
                for (const key in error.response.data.errors) {
                    backendFieldErrors[snakeToPascal(key)] = error.response.data.errors[key].join(', ');
                }
                setErrors(prev => ({ ...prev, ...backendFieldErrors }));
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="source-form" style={{ border: '1px solid #ccc', padding: '15px', marginTop: '10px', marginBottom: '20px' }}>
            <h4>{isEditMode ? `Edit Source (ID: ${formData.SourceIdPk})` : 'Add New Source'}</h4>
            {errors.form && <p className="error-message" style={{color: 'red', fontWeight: 'bold'}}>{errors.form}</p>}

            <fieldset>
                <legend>Source Details</legend>
                <div className="form-group">
                    <label htmlFor="SourceIdPkForm">Source ID (*)</label>
                    <input type="number" id="SourceIdPkForm" name="SourceIdPk" value={formData.SourceIdPk} onChange={handleChange} required readOnly={isEditMode} />
                    {errors.SourceIdPk && <p className="error-message">{errors.SourceIdPk}</p>}
                </div>

                {!isEditMode && !parentCubeIdPk && (
                    <div className="form-group">
                        <label htmlFor="CubeIdPkSourceForm">Parent Customer (*)</label>
                        {loadingCustomers ? <p>Loading customers...</p> : (
                            <select id="CubeIdPkSourceForm" name="CubeIdPk" value={formData.CubeIdPk} onChange={handleChange} required>
                                <option value="">--- Select Customer ---</option>
                                {customers.map(c => <option key={c.cube_id_pk} value={c.cube_id_pk}>{c.cube_name} ({c.cube_id_pk})</option>)}
                            </select>
                        )}
                        {errors.CubeIdPk && <p className="error-message">{errors.CubeIdPk}</p>}
                        {errors.customersDropdown && <p className="error-message">{errors.customersDropdown}</p>}
                    </div>
                )}
                {(isEditMode || parentCubeIdPk) && (
                    <div className="form-group">
                        <label>Parent Customer</label>
                        <input type="text" value={formData.CubeIdPk} readOnly disabled placeholder={parentCubeIdPk || (initialData && initialData.cube_id_pk) || "N/A"} />
                    </div>
                )}

                <div className="form-group">
                    <label htmlFor="SourceNumberForm">Source Number (*)</label>
                    <input type="number" id="SourceNumberForm" name="SourceNumber" value={formData.SourceNumber} onChange={handleChange} required />
                    {errors.SourceNumber && <p className="error-message">{errors.SourceNumber}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="SourceCommentsForm">Comments (Optional)</label>
                    <textarea id="SourceCommentsForm" name="SourceComments" value={formData.SourceComments} onChange={handleChange} rows="4" />
                    {errors.SourceComments && <p className="error-message">{errors.SourceComments}</p>}
                </div>
            </fieldset>

            <div className="form-actions" style={{ marginTop: '20px' }}>
                <button type="submit" className="primary">{isEditMode ? 'Update Source' : 'Add Source'}</button>
                <button type="button" className="secondary" onClick={onCancel} style={{ marginLeft: '10px' }}>Cancel</button>
            </div>
        </form>
    );
};

export default SourceForm;