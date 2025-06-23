// src/components/PerspectiveForm.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getAllCustomers } from '../api/customerService';

const snakeToPascal = (str) => { /* ... your helper ... */ };

const PerspectiveForm = ({ onSubmit, onCancel, initialData: initialDataProp = {}, parentCubeIdPk, isEditMode = false }) => {
    console.log("PerspectiveForm MOUNT/RENDER: isEditMode:", isEditMode, "parentCubeIdPk:", parentCubeIdPk);
    const [customers, setCustomers] = useState([]);
    const [loadingCustomers, setLoadingCustomers] = useState(false);

    // Memoize initialDataProp to make initialData stable if parent passes {}
    const initialData = useMemo(() => initialDataProp, [initialDataProp]);

    const getInitialFormState = useCallback(() => {
        // console.log("PerspectiveForm: getInitialFormState. parentCubeIdPk:", parentCubeIdPk);
        return {
            PerspIdPk: '', PerspName: '', PerspComments: '',
            CubeIdPk: parentCubeIdPk || '',
            PerspTimestamp: null,
        };
    }, [parentCubeIdPk]);

    const [formData, setFormData] = useState(() => {
        // This initializer runs ONCE (unless key changes)
        console.log("PerspectiveForm: useState initializer. isEditMode:", isEditMode, "parentCubeIdPk:", parentCubeIdPk, "initialData (memoized):", initialData);
        let stateToInitialize = getInitialFormState();
        if (isEditMode && initialData && Object.keys(initialData).length > 0) {
            // ... (population logic from initialData for EDIT mode) ...
            // This part is for the very first render if isEditMode is true
            for (const backendKey in initialData) { /* ... map ... */ }
            if (initialData.perspIdPk !== undefined) stateToInitialize.PerspIdPk = String(initialData.perspIdPk);
            // ... etc. for other PKs/FKs from initialData
        } else if (!isEditMode && initialData && Object.keys(initialData).length > 0 && Object.keys(initialData).some(k => initialData[k])) {
            // Create mode with actual pre-fill data in initialData (not just an empty object)
            stateToInitialize = { ...stateToInitialize, ...initialData };
            if (parentCubeIdPk) stateToInitialize.CubeIdPk = parentCubeIdPk;
        }
        return stateToInitialize;
    });
    const [errors, setErrors] = useState({});

    // Fetch customers for dropdown
    // PerspectiveForm.jsx -> useEffect for fetching customers
    useEffect(() => {
        console.log("PerspectiveForm CUSTOMER FETCH EFFECT: isEditMode:", isEditMode, "parentCubeIdPk:", parentCubeIdPk);
        if (!isEditMode && !parentCubeIdPk) {
            setLoadingCustomers(true);
            console.log("PerspectiveForm CUSTOMER FETCH EFFECT: Condition met, fetching...");
            getAllCustomers({ pageSize: 1000 })
                .then(response => {
                    console.log("PerspectiveForm CUSTOMER FETCH EFFECT: API Response:", response);
                    setCustomers(Array.isArray(response) ? response : []);
                })
                .catch(err => { /* ... */ })
                .finally(() => {
                    console.log("PerspectiveForm CUSTOMER FETCH EFFECT: Setting loadingCustomers to false.");
                    setLoadingCustomers(false);
                });
        } else {
            console.log("PerspectiveForm CUSTOMER FETCH EFFECT: Condition NOT met or already handled.");
            setLoadingCustomers(false);
            setCustomers([]);
        }
    }, [isEditMode, parentCubeIdPk]);


    // RE-SYNC Effect: Runs when initialData, isEditMode, or parentCubeIdPk props change from the parent.
    useEffect(() => {
        console.log("PerspectiveForm RE-SYNC EFFECT: Triggered by prop change. isEditMode:", isEditMode, "parentCubeIdPk:", parentCubeIdPk, "initialData:", initialData);

        // Recalculate the state the form SHOULD have based on the CURRENT props
        let newTargetState = getInitialFormState(); // Uses the current parentCubeIdPk

        if (isEditMode && initialData && Object.keys(initialData).length > 0) {
            // If editing, populate newTargetState from initialData
            newTargetState = { ...newTargetState }; // Start with base, then override
            for (const backendKey in initialData) {
                if (initialData.hasOwnProperty(backendKey)) {
                    const formKey = initialData.hasOwnProperty(snakeToPascal(backendKey)) ? snakeToPascal(backendKey) : backendKey;
                    if (newTargetState.hasOwnProperty(formKey)) {
                        const value = initialData[backendKey];
                        if (value === null || typeof value === 'undefined') { newTargetState[formKey] = ''; }
                        else if (typeof value === 'number') { newTargetState[formKey] = String(value); }
                        else if (formKey === 'PerspTimestamp' && value) { newTargetState[formKey] = value; }
                        else { newTargetState[formKey] = value; }
                    }
                }
            }
            if (initialData.perspIdPk !== undefined) newTargetState.PerspIdPk = String(initialData.perspIdPk);
            else if (initialData.persp_id_pk !== undefined) newTargetState.PerspIdPk = String(initialData.persp_id_pk);
            if (initialData.cubeIdPk !== undefined) newTargetState.CubeIdPk = String(initialData.cubeIdPk);
            else if (initialData.cube_id_pk !== undefined) newTargetState.CubeIdPk = String(initialData.cube_id_pk);
        } else if (!isEditMode) {
            // For create mode, if initialData was passed for other pre-fills (beyond parentCubeIdPk handled by getInitialFormState)
            if (initialData && Object.keys(initialData).length > 0 && Object.keys(initialData).some(k=>initialData[k])) { // if initialData has actual values
                const prefillData = {};
                for (const keyInInitial in initialData) { /* ... map initialData for create prefill, careful not to override CubeIdPk if parentCubeIdPk exists ... */ }
                newTargetState = { ...newTargetState, ...prefillData };
            }
        }

        console.log("PerspectiveForm RE-SYNC EFFECT: Setting formData to:", newTargetState);
        setFormData(newTargetState);
        if (Object.keys(errors).length > 0) setErrors({}); // Reset errors

        // This effect should run if the "identity" of the form changes due to these props.
        // getInitialFormState is NOT a dependency here because it's called inside,
        // and its own dependency (parentCubeIdPk) IS in this array.
    }, [initialData, isEditMode, parentCubeIdPk]);


    const validate = () => {
        const newErrors = {};
        if (!isEditMode && (formData.PerspIdPk === '' || isNaN(parseInt(formData.PerspIdPk)) || parseInt(formData.PerspIdPk) <= 0)) {
            newErrors.PerspIdPk = 'Perspective ID is required and must be a positive number.';
        }
        if (!formData.PerspName.trim()) newErrors.PerspName = 'Perspective Name is required.';
        else if (formData.PerspName.length > 50) newErrors.PerspName = 'Name max 50 chars.';

        if (!formData.CubeIdPk) newErrors.CubeIdPk = 'Parent Customer ID is required.';

        if (isEditMode && !formData.PerspTimestamp) newErrors.form = "Timestamp missing for update.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name] || errors.form) {
            setErrors(prev => {
                const newErr = {...prev};
                delete newErr[name];
                if (Object.keys(newErr).filter(k => k !== 'form').length === 0 && prev.form === "Please correct errors." ) {
                    delete newErr.form;
                }
                return newErr;
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) {
            setErrors(prev => ({...prev, form: "Please correct the errors below."}));
            return;
        }
        const submissionData = {
            PerspName: formData.PerspName.trim(),
            PerspComments: formData.PerspComments.trim() === '' ? null : formData.PerspComments.trim(),
            CubeIdPk: formData.CubeIdPk,
        };

        if (!isEditMode) {
            submissionData.PerspIdPk = parseInt(formData.PerspIdPk, 10);
        } else {
            if (!formData.PerspTimestamp) {
                setErrors(prev => ({...prev, form: "Cannot update: Timestamp missing."}));
                return;
            }
            submissionData.PerspTimestamp = formData.PerspTimestamp;
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
        <form onSubmit={handleSubmit} className="perspective-form" style={{ border: '1px solid #ccc', padding: '15px', marginTop: '10px', marginBottom: '20px' }}>
            <h4>{isEditMode ? `Edit Perspective (ID: ${formData.PerspIdPk || (initialData && (initialData.perspIdPk || initialData.persp_id_pk))})` : 'Add New Perspective'}</h4>
            {errors.form && <p className="error-message" style={{color: 'red', fontWeight: 'bold'}}>{errors.form}</p>}
            {errors.customersDropdown && <p className="error-message" style={{color: 'orange'}}>{errors.customersDropdown}</p>}


            <fieldset>
                <legend>Perspective Details</legend>
                <div className="form-group">
                    <label htmlFor="PerspIdPkForm">Perspective ID (*)</label>
                    <input type="number" id="PerspIdPkForm" name="PerspIdPk" value={formData.PerspIdPk} onChange={handleChange} required readOnly={isEditMode} />
                    {errors.PerspIdPk && <p className="error-message">{errors.PerspIdPk}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="PerspNameForm">Perspective Name (*)</label>
                    <input type="text" id="PerspNameForm" name="PerspName" value={formData.PerspName} onChange={handleChange} maxLength="50" required />
                    {errors.PerspName && <p className="error-message">{errors.PerspName}</p>}
                </div>

                {/* Customer Selector - Show if adding globally (no parentCubeIdPk) and not editing */}
                {!isEditMode && !parentCubeIdPk && ( // <<<< THIS IS THE CONDITION
                    <div className="form-group">
                        <label htmlFor="CubeIdPkPerspForm">Parent Customer (*)</label>
                        {loadingCustomers ? <p>Loading customers...</p> : (
                            <select id="CubeIdPkPerspForm" name="CubeIdPk" value={formData.CubeIdPk} onChange={handleChange} required>
                                <option value="">--- Select Customer ---</option>
                                {customers.map(c => <option key={c.cube_id_pk} value={c.cube_id_pk}>{c.cube_name} ({c.cube_id_pk})</option>)}
                            </select>
                        )}
                        {errors.CubeIdPk && <p className="error-message">{errors.CubeIdPk}</p>}
                        {errors.customersDropdown && <p className="error-message">{errors.customersDropdown}</p>}
                    </div>
                )}
                {/* Display Parent Customer ID if it's fixed (edit mode or adding via manager) */}
                {(isEditMode || parentCubeIdPk) && ( // <<<< OR THIS CONDITION FOR READ-ONLY
                    <div className="form-group">
                        <label>Parent Customer</label>
                        <input type="text" value={formData.CubeIdPk} readOnly disabled placeholder={parentCubeIdPk || (initialData && (initialData.cubeIdPk || initialData.cube_id_pk)) || "N/A"} />
                    </div>
                )}

                <div className="form-group">
                    <label htmlFor="PerspCommentsForm">Comments (Optional)</label>
                    <textarea id="PerspCommentsForm" name="PerspComments" value={formData.PerspComments} onChange={handleChange} rows="4" />
                    {errors.PerspComments && <p className="error-message">{errors.PerspComments}</p>}
                </div>
            </fieldset>

            <div className="form-actions" style={{ marginTop: '20px' }}>
                <button type="submit" className="primary">{isEditMode ? 'Update Perspective' : 'Add Perspective'}</button>
                <button type="button" className="secondary" onClick={onCancel} style={{ marginLeft: '10px' }}>Cancel</button>
            </div>
        </form>
    );
};

export default PerspectiveForm;