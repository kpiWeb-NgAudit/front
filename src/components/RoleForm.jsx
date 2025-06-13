// src/components/RoleForm.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getAllCustomers } from '../api/customerService'; // To fetch customers for the dropdown

// Helper for boolean options (can be defined here or imported if shared)
const getNullableBooleanOptions = (trueLabel = "Yes", falseLabel = "No", noneLabel = "--- (Not Set) ---") => [
    { value: "", label: noneLabel },      // Represents null
    { value: "true", label: trueLabel },  // Represents true
    { value: "false", label: falseLabel } // Represents false
];

// Helper for consistent key transformation from snake_case (backend) to PascalCase (form state)
const snakeToPascal = (str) => {
    if (!str) return str;
    // Specific handling for _pk endings
    if (str.toLowerCase().endsWith("_pk")) {
        const prefix = str.substring(0, str.length - 3);
        // Uppercase the Pk suffix and join words with PascalCase
        return prefix.split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join('') + 'Pk';
    }
    // General snake_case to PascalCase for other keys
    return str.split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('');
};


const RoleForm = ({ onSubmit, onCancel, initialData = {}, parentCubeIdPk, isEditMode = false }) => {
    const [customers, setCustomers] = useState([]);
    const [loadingCustomers, setLoadingCustomers] = useState(false);

    // getInitialFormState depends on parentCubeIdPk. It will give a new function instance
    // if parentCubeIdPk changes. This is fine.
    const getInitialFormState = useCallback(() => ({
        RoleIdPk: '',
        RoleName: '',
        RoleDescription: '',
        RoleCubeWriteAllow: '', // Represents "Not Set" (null) initially
        RoleMeasuresAllowSet: '', // Represents "Not Set" (null) initially
        RoleCustomRoleName: '',
        RoleMeasuresMdxInstruction: '',
        CubeIdPk: parentCubeIdPk || '', // Pre-fill if parentCubeIdPk is provided
        RoleComments: '',
        RoleTimestamp: null, // Only used for edit mode submission
    }), [parentCubeIdPk]);

    // Initialize formData. The initial call to getInitialFormState() is okay here.
    const [formData, setFormData] = useState(() => getInitialFormState());
    const [errors, setErrors] = useState({});

    // Effect to fetch customers for dropdown if adding globally
    useEffect(() => {
        console.log("RoleForm Customer Fetch EFFECT: isEditMode:", isEditMode, "parentCubeIdPk:", parentCubeIdPk);
        if (!isEditMode && !parentCubeIdPk) {
            setLoadingCustomers(true);
            const fetchCust = async () => {
                try {
                    console.log("RoleForm Customer Fetch EFFECT: Fetching customers...");
                    const customersArray = await getAllCustomers({ pageSize: 1000 }); // customersArray IS the array
                    console.log("CUSTOMER FETCH EFFECT: API Response (customersArray):", customersArray);

                    if (Array.isArray(customersArray)) {
                        setCustomers(customersArray); // <<<< CORRECTED: Use customersArray directly
                        console.log("CUSTOMER FETCH EFFECT: setCustomers called with:", customersArray);
                    } else {
                        console.error("CUSTOMER FETCH EFFECT: Fetched customer data is NOT an array!", customersArray);
                        setCustomers([]); // Default to empty array if something unexpected happens
                    }
                } catch (error) {
                    console.error("RoleForm Customer Fetch EFFECT: Failed to fetch customers:", error);
                    setErrors(prev => ({ ...prev, customersDropdown: 'Failed to load customers.' }));
                    setCustomers([]);
                } finally {
                    setLoadingCustomers(false);
                }
            };
            fetchCust();
        } else {
            console.log("RoleForm Customer Fetch EFFECT: Condition NOT met, not fetching customers.");
            setLoadingCustomers(false);
            setCustomers([]);
        }
    }, [isEditMode, parentCubeIdPk]);

    // Effect to Populate/Reset form based on its key input props
    useEffect(() => {
        console.log("RoleForm POPULATE/RESET EFFECT triggered. isEditMode:", isEditMode, "parentCubeIdPk:", parentCubeIdPk, "initialData keys:", initialData ? Object.keys(initialData) : "null");

        // Always start from a fresh initial state based on current props for this render
        let newFormState = getInitialFormState();

        if (isEditMode && initialData && Object.keys(initialData).length > 0) {
            console.log("RoleForm POPULATE EFFECT (Edit Mode): Populating from initialData", initialData);
            newFormState = { ...newFormState }; // Ensure we're working with a copy of the current initial state

            for (const backendKey in initialData) {
                if (initialData.hasOwnProperty(backendKey)) {
                    const formKey = snakeToPascal(backendKey); // Convert backend_key to FormKey
                    if (newFormState.hasOwnProperty(formKey)) {
                        const value = initialData[backendKey];
                        if (value === null || typeof value === 'undefined') {
                            newFormState[formKey] = ''; // Default to empty string for form inputs
                        } else if (typeof value === 'boolean') {
                            newFormState[formKey] = String(value); // "true" or "false" for select
                        } else if (formKey === 'RoleTimestamp' && value) {
                            newFormState[formKey] = value; // Keep byte[] for timestamp
                        } else { // Includes numbers (which will be string in input) and strings
                            newFormState[formKey] = String(value);
                        }
                    }
                }
            }
            // Ensure PKs are correctly set from snake_cased initialData if necessary,
            // overriding what getInitialFormState might have set if it was an empty string.
            if (initialData.role_id_pk !== undefined) newFormState.RoleIdPk = String(initialData.role_id_pk);
            if (initialData.cube_id_pk !== undefined) newFormState.CubeIdPk = String(initialData.cube_id_pk);

        } else if (!isEditMode) {
            // For create mode:
            // getInitialFormState() has already set CubeIdPk if parentCubeIdPk was present.
            // If initialData is passed for create mode (e.g., from AddRolePage with query params for OTHER fields), merge them.
            // This usually happens if AddRolePage itself tries to pre-fill something beyond CubeIdPk
            if (initialData && Object.keys(initialData).length > 0 && initialData !== getInitialFormState()) { // check if initialData has more than just what getInitialFormState provides
                console.log("RoleForm POPULATE EFFECT (Create Mode): Merging initialData for pre-fill:", initialData);
                const prefillData = {};
                for (const backendKey in initialData) { // Assuming initialData for create might use PascalCase keys already
                    if (initialData.hasOwnProperty(backendKey)) {
                        const formKey = initialData.hasOwnProperty(snakeToPascal(backendKey)) ? snakeToPascal(backendKey) : backendKey;
                        if (newFormState.hasOwnProperty(formKey) && formKey !== 'CubeIdPk') {
                            // Don't override CubeIdPk if it was already set by parentCubeIdPk via getInitialFormState
                            prefillData[formKey] = initialData[backendKey] === null || initialData[backendKey] === undefined ? '' : String(initialData[backendKey]);
                        } else if (formKey === 'CubeIdPk' && !parentCubeIdPk && initialData[backendKey]) {
                            // Only use initialData.CubeIdPk if no parentCubeIdPk prop was given
                            prefillData[formKey] = String(initialData[backendKey]);
                        }
                    }
                }
                newFormState = { ...newFormState, ...prefillData };
            } else {
                console.log("RoleForm POPULATE EFFECT (Create Mode): Form state based on getInitialFormState.");
            }
        }

        // Only update if newFormState is actually different from current formData
        // This is a shallow comparison, for complex objects a deep compare utility might be needed
        // but for form data with primitive-like values, this can help.
        if (JSON.stringify(formData) !== JSON.stringify(newFormState)) {
            console.log("RoleForm POPULATE EFFECT: Setting formData to:", newFormState);
            setFormData(newFormState);
        } else {
            console.log("RoleForm POPULATE EFFECT: newFormState is same as current formData, not updating.");
        }
        setErrors({}); // Reset errors whenever these primary props change

    }, [initialData, isEditMode, parentCubeIdPk, getInitialFormState]); // Dependencies are correct

    const validate = () => {
        const newErrors = {};
        if (!isEditMode && (formData.RoleIdPk === '' || isNaN(parseInt(formData.RoleIdPk)) || parseInt(formData.RoleIdPk) <=0 )) {
            newErrors.RoleIdPk = 'Role ID is required and must be a positive number.';
        } else if (formData.RoleIdPk !== '' && isNaN(parseInt(formData.RoleIdPk))) {
            newErrors.RoleIdPk = 'Role ID must be a number if provided.';
        }

        if (!formData.RoleName.trim()) newErrors.RoleName = 'Role Name is required.';
        else if (formData.RoleName.length > 15) newErrors.RoleName = 'Role Name max 15 chars.';

        if (!formData.RoleDescription.trim()) newErrors.RoleDescription = 'Description is required.';
        else if (formData.RoleDescription.length > 150) newErrors.RoleDescription = 'Description max 150 chars.';

        if (formData.RoleCustomRoleName && formData.RoleCustomRoleName.length > 50) {
            newErrors.RoleCustomRoleName = 'Custom Role Name max 50 chars.';
        }

        if (!formData.CubeIdPk) { // CubeIdPk must always be selected/provided
            newErrors.CubeIdPk = 'Parent Customer is required.';
        }

        if (isEditMode && !formData.RoleTimestamp) {
            newErrors.form = "Timestamp is missing for update. Please refresh data.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) { // Clear specific field error on change
            setErrors(prev => {
                const newErrors = {...prev};
                delete newErrors[name]; // Remove specific field error
                // If all individual field errors are gone, clear the general form error too
                if (Object.keys(newErrors).filter(k => k !== 'form').length === 0) {
                    delete newErrors.form;
                }
                return newErrors;
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
            // For create, RoleIdPk must be provided and is an int.
            // For edit, RoleIdPk is not in the DTO body for update (it's in URL).
            RoleName: formData.RoleName.trim(),
            RoleDescription: formData.RoleDescription.trim(),
            RoleCustomRoleName: formData.RoleCustomRoleName.trim() === '' ? null : formData.RoleCustomRoleName.trim(),
            RoleMeasuresMdxInstruction: formData.RoleMeasuresMdxInstruction.trim() === '' ? null : formData.RoleMeasuresMdxInstruction.trim(),
            CubeIdPk: formData.CubeIdPk, // Should be selected or pre-filled
            RoleComments: formData.RoleComments.trim() === '' ? null : formData.RoleComments.trim(),
        };

        if (!isEditMode) {
            submissionData.RoleIdPk = parseInt(formData.RoleIdPk, 10);
        }

        // Convert nullable booleans
        const nullableBoolFields = ['RoleCubeWriteAllow', 'RoleMeasuresAllowSet'];
        nullableBoolFields.forEach(field => {
            if (formData[field] === "true") submissionData[field] = true;
            else if (formData[field] === "false") submissionData[field] = false;
            else submissionData[field] = null;
        });

        if (isEditMode) {
            if (!formData.RoleTimestamp) {
                setErrors(prev => ({...prev, form: "Cannot update: Timestamp is missing."}));
                return; // Prevent submission
            }
            submissionData.RoleTimestamp = formData.RoleTimestamp;
        } else {
            // RoleIdPk already added for create mode.
            // Delete RoleTimestamp as it's not part of CreateRoleDto
            // (though it's initialized to null and DTO doesn't have it, so this is belt-and-suspenders)
            delete submissionData.RoleTimestamp;
        }

        try {
            await onSubmit(submissionData); // Calls createRole or updateRole
            if (onCancel) onCancel(); // Call onCancel on successful submit
        } catch (error) {
            console.error("RoleForm submission error caught in handleSubmit:", error);
            const errorMsg = error.response?.data?.message ||
                error.response?.data?.title ||
                (typeof error.response?.data === 'string' ? error.response.data : null) ||
                error.message ||
                'Submission failed. Please try again.';
            setErrors(prev => ({ ...prev, form: errorMsg }));
            if (error.response?.data?.errors) {
                const backendFieldErrors = {};
                for (const key in error.response.data.errors) {
                    const formKey = snakeToPascal(key); // Convert backend error key to form key
                    backendFieldErrors[formKey] = error.response.data.errors[key].join(', ');
                }
                setErrors(prev => ({ ...prev, ...backendFieldErrors }));
            }
            // Do not call onCancel here, let the user see the errors.
        }
    };

    return (
        <form onSubmit={handleSubmit} className="role-form" style={{ border: '1px solid #ccc', padding: '15px', marginTop: '10px', marginBottom: '20px' }}>
            <h4>{isEditMode ? `Edit Role (ID: ${formData.RoleIdPk || (initialData && initialData.role_id_pk) || 'N/A'})` : 'Add New Role'}</h4>
            {errors.form && <p className="error-message" style={{ color: 'red', fontWeight: 'bold' }}>{errors.form}</p>}

            <fieldset>
                <legend>Core Role Info</legend>
                <div className="form-group">
                    <label htmlFor="RoleIdPkForm">Role ID (*)</label>
                    <input type="number" id="RoleIdPkForm" name="RoleIdPk" value={formData.RoleIdPk} onChange={handleChange} required readOnly={isEditMode} />
                    {errors.RoleIdPk && <p className="error-message">{errors.RoleIdPk}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="RoleNameForm">Role Name (*)</label>
                    <input type="text" id="RoleNameForm" name="RoleName" value={formData.RoleName} onChange={handleChange} maxLength="15" required />
                    {errors.RoleName && <p className="error-message">{errors.RoleName}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="RoleDescriptionForm">Description (*)</label>
                    <textarea id="RoleDescriptionForm" name="RoleDescription" value={formData.RoleDescription} onChange={handleChange} maxLength="150" required rows="3" />
                    {errors.RoleDescription && <p className="error-message">{errors.RoleDescription}</p>}
                </div>

                {/* Customer Selector/Display Logic */}
                {!isEditMode && !parentCubeIdPk && (
                    <div className="form-group">
                        <label htmlFor="CubeIdPkForm">Parent Customer (*)</label>
                        {loadingCustomers ? ( // Check 1: Show loading message
                            <p>Loading customers...</p>
                        ) : customers.length === 0 && !errors.customersDropdown ? ( // Check 2: No customers and no specific error
                            <p>No customers available to select.</p> // Could be API returned empty or initial state
                        ) : ( // Check 3: Render dropdown if not loading and (customers exist or there's an error to show for the dropdown)
                            <select id="CubeIdPkForm" name="CubeIdPk" value={formData.CubeIdPk} onChange={handleChange} required>
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
                        <input
                            type="text"
                            value={formData.CubeIdPk} // This should be populated correctly now
                            readOnly
                            disabled
                            placeholder={parentCubeIdPk || (initialData && initialData.cube_id_pk) || "N/A"}/>
                    </div>
                )}
            </fieldset>

            <fieldset>
                <legend>Permissions</legend>
                <div className="form-group">
                    <label htmlFor="RoleCubeWriteAllowForm">Allow Cube Write</label>
                    <select id="RoleCubeWriteAllowForm" name="RoleCubeWriteAllow" value={formData.RoleCubeWriteAllow} onChange={handleChange}>
                        {getNullableBooleanOptions().map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    {errors.RoleCubeWriteAllow && <p className="error-message">{errors.RoleCubeWriteAllow}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="RoleMeasuresAllowSetForm">Allow Measures Set</label>
                    <select id="RoleMeasuresAllowSetForm" name="RoleMeasuresAllowSet" value={formData.RoleMeasuresAllowSet} onChange={handleChange}>
                        {getNullableBooleanOptions().map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    {errors.RoleMeasuresAllowSet && <p className="error-message">{errors.RoleMeasuresAllowSet}</p>}
                </div>
            </fieldset>

            <fieldset>
                <legend>Advanced (Optional)</legend>
                <div className="form-group">
                    <label htmlFor="RoleCustomRoleNameForm">Custom SSAS Role Name</label>
                    <input type="text" id="RoleCustomRoleNameForm" name="RoleCustomRoleName" value={formData.RoleCustomRoleName} onChange={handleChange} maxLength="50" />
                    {errors.RoleCustomRoleName && <p className="error-message">{errors.RoleCustomRoleName}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="RoleMeasuresMdxInstructionForm">Measures MDX Instruction</label>
                    <textarea id="RoleMeasuresMdxInstructionForm" name="RoleMeasuresMdxInstruction" value={formData.RoleMeasuresMdxInstruction} onChange={handleChange} rows="4" />
                    {errors.RoleMeasuresMdxInstruction && <p className="error-message">{errors.RoleMeasuresMdxInstruction}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="RoleCommentsForm">Comments</label>
                    <textarea id="RoleCommentsForm" name="RoleComments" value={formData.RoleComments} onChange={handleChange} rows="3" />
                    {errors.RoleComments && <p className="error-message">{errors.RoleComments}</p>}
                </div>
            </fieldset>

            <div className="form-actions" style={{ marginTop: '20px' }}>
                <button type="submit" className="primary">{isEditMode ? 'Update Role' : 'Add Role'}</button>
                <button type="button" className="secondary" onClick={onCancel} style={{ marginLeft: '10px' }}>Cancel</button>
            </div>
        </form>
    );
};

export default RoleForm;