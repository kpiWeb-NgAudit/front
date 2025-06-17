// src/components/DimDbExtractV2Form.jsx
import React, { useState, useEffect, useCallback } from 'react';

// Helper for consistent key transformation (if needed for initialData mapping or backend errors)
const snakeToPascal = (str) => {
    if (!str) return str;
    if (str.toLowerCase().endsWith("_pk")) {
        const prefix = str.substring(0, str.length - 3);
        return prefix.split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join('') + 'Pk';
    }
    // General snake_case to PascalCase for other keys
    // Handle potential "dto." prefix from ModelState keys
    let s = str.startsWith("dto.") ? str.substring(4) : str;
    return s.split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('');
};


const DimDbExtractV2Form = ({
                                onSubmit,
                                onCancel,
                                initialData = {}, // For editing: DimDbExtractV2Dto (or entity with snake_case)
                                                  // For adding: { DimIdPk, CubeIdPk } (parent dimension ID and its customer ID)
                                isEditMode = false
                            }) => {
    // getInitialFormState uses props available at the time of its call
    const getInitialFormState = useCallback(() => {
        // For CREATE: DimIdPk and CubeIdPk are from the initialData prop passed by the manager
        // For EDIT: All fields come from initialData (the specific extract being edited)
        const forCreate = !isEditMode;
        const currentDimIdPk = forCreate ? initialData.DimIdPk : (initialData.dimIdPk || initialData.DimIdPk);
        const currentCubeIdPk = forCreate ? initialData.CubeIdPk : (initialData.cubeIdPk || initialData.CubeIdPk);

        return {
            DimIdPk: String(currentDimIdPk || ''), // From parent for new, from item for edit
            DimDbExtrV2ProdDataSourceId: isEditMode ? String(initialData.dimDbExtrV2ProdDataSourceId || initialData.DimDbExtrV2ProdDataSourceId || '') : '',
            DimDbExtrV2Comments: isEditMode ? initialData.dimDbExtrV2Comments || initialData.DimDbExtrV2Comments || '' : '',
            DimDbExtrV2DbSelectSqlClause: isEditMode ? initialData.dimDbExtrV2DbSelectSqlClause || initialData.DimDbExtrV2DbSelectSqlClause || '' : '',
            DimDbExtrV2DateInsert: isEditMode
                ? (initialData.dimDbExtrV2DateInsert || initialData.DimDbExtrV2DateInsert ? new Date(initialData.dimDbExtrV2DateInsert || initialData.DimDbExtrV2DateInsert).toISOString().substring(0, 16) : '')
                : new Date().toISOString().substring(0, 16), // Default to now for new
            CubeIdPk: String(currentCubeIdPk || ''), // From parent for new
            DimDbExtrV2Timestamp: isEditMode ? (initialData.dimDbExtrV2Timestamp || initialData.DimDbExtrV2Timestamp || null) : null,
        };
    }, [initialData, isEditMode]); // Dependencies for memoizing this function

    const [formData, setFormData] = useState(getInitialFormState); // Initializer function
    const [errors, setErrors] = useState({});

    // Effect to reset/populate form when initialData or mode changes
    useEffect(() => {
        console.log("DimDbExtractV2Form RE-SYNC/POPULATE: isEditMode:", isEditMode, "initialData:", initialData);
        // getInitialFormState will use the latest props due to its own useCallback dependencies
        setFormData(getInitialFormState());
        setErrors({}); // Reset errors when form context changes
    }, [initialData, isEditMode, getInitialFormState]); // Correct dependencies

    const validate = () => {
        const newErrors = {};
        if (!formData.DimIdPk && !isEditMode) newErrors.DimIdPk = 'Parent Dimension ID is missing.';
        if (formData.DimDbExtrV2ProdDataSourceId === '' || isNaN(parseInt(formData.DimDbExtrV2ProdDataSourceId))) {
            newErrors.DimDbExtrV2ProdDataSourceId = 'Prod Data Source ID is required and must be a number.';
        } else if (parseInt(formData.DimDbExtrV2ProdDataSourceId) < 0) {
            newErrors.DimDbExtrV2ProdDataSourceId = 'Prod Data Source ID cannot be negative.';
        }

        if (!formData.DimDbExtrV2Comments.trim()) newErrors.DimDbExtrV2Comments = 'Comments are required.';
        else if (formData.DimDbExtrV2Comments.length > 200) newErrors.DimDbExtrV2Comments = 'Comments max 200 chars.';

        if (!formData.DimDbExtrV2DbSelectSqlClause.trim()) newErrors.DimDbExtrV2DbSelectSqlClause = 'SQL Select Clause is required.';

        if (!formData.DimDbExtrV2DateInsert) newErrors.DimDbExtrV2DateInsert = 'Date Insert is required.';
        else {
            if (isNaN(new Date(formData.DimDbExtrV2DateInsert).getTime())) { // Check if valid date
                newErrors.DimDbExtrV2DateInsert = 'Invalid date format for Date Insert.';
            }
        }
        if (!formData.CubeIdPk && !isEditMode) newErrors.CubeIdPk = 'Parent Customer ID is missing.';

        if (isEditMode && !formData.DimDbExtrV2Timestamp) newErrors.form = "Timestamp missing for update. Cannot proceed.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name] || errors.form) { // Clear field error or general form error if user types
            setErrors(prev => {
                const newErr = {...prev};
                delete newErr[name];
                if (Object.keys(newErr).filter(k => k !== 'form').length === 0 && prev.form === "Please correct errors.") {
                    delete newErr.form;
                }
                return newErr;
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) {
            setErrors(prev => ({...prev, form: "Please correct the errors shown above."}));
            return;
        }

        const submissionData = {
            DimDbExtrV2Comments: formData.DimDbExtrV2Comments.trim(),
            DimDbExtrV2DbSelectSqlClause: formData.DimDbExtrV2DbSelectSqlClause.trim(),
        };

        if (isEditMode) {
            if (!formData.DimDbExtrV2Timestamp) {
                setErrors(prev => ({...prev, form: "Cannot update: Timestamp is missing."}));
                return;
            }
            submissionData.DimDbExtrV2Timestamp = formData.DimDbExtrV2Timestamp;
            // CubeIdPk is part of UpdateDimDbExtractV2Dto if it can be changed, otherwise it's fixed by the entity.
            // Assuming it's in DTO for now:
            submissionData.CubeIdPk = formData.CubeIdPk;
        } else { // Create mode
            submissionData.DimIdPk = parseInt(formData.DimIdPk, 10);
            submissionData.DimDbExtrV2ProdDataSourceId = parseInt(formData.DimDbExtrV2ProdDataSourceId, 10);
            submissionData.DimDbExtrV2DateInsert = new Date(formData.DimDbExtrV2DateInsert).toISOString();
            submissionData.CubeIdPk = formData.CubeIdPk;
        }

        try {
            await onSubmit(submissionData); // This will call the service function from the parent
            // onCancel(); // Parent (manager) should typically close the form on success
        } catch (error) {
            console.error("DimDbExtractV2Form submission error:", error.response || error);
            let apiErrors = {};
            let generalFormError = 'Submission failed. Please check the details and try again.';

            if (error.response) {
                const { data } = error.response;

                if (data && typeof data === 'string') {
                    generalFormError = data; // Use the plain string error from backend
                    // Try to associate with a field based on keywords
                    if (data.toLowerCase().includes("dimension with id") && data.toLowerCase().includes("not found")) {
                        apiErrors.DimIdPk = data; // This field is pre-filled, so form error is primary
                    } else if (data.toLowerCase().includes("customer id") && data.toLowerCase().includes("does not match")) {
                        apiErrors.CubeIdPk = data; // This field is pre-filled
                    } else if (data.toLowerCase().includes("already exists")) {
                        // Could try to parse which field based on message content if more specific
                        // For now, general form error is okay for this.
                    }
                } else if (data && data.errors) { // ASP.NET Core ModelState errors
                    generalFormError = data.title || "One or more validation errors occurred.";
                    for (const keyInError in data.errors) {
                        const formKey = snakeToPascal(keyInError); // Convert backend key
                        apiErrors[formKey] = data.errors[keyInError].join(', ');
                    }
                } else if (data && data.title) {
                    generalFormError = data.title;
                }
            } else {
                generalFormError = error.message || "An unexpected network error occurred.";
            }

            if (Object.keys(apiErrors).length > 0 && generalFormError === 'Submission failed. Please check the details and try again.') {
                setErrors(apiErrors); // Prioritize specific field errors
            } else {
                setErrors({ ...apiErrors, form: generalFormError });
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="dimdbextractv2-form" style={{ border: '1px solid #ccc', padding: '15px', margin: '10px 0' }}>
            <h4>{isEditMode ? `Edit Extract Definition` : 'Add New Extract Definition'}</h4>
            {errors.form && <p className="error-message" style={{color: 'red', fontWeight: 'bold'}}>{errors.form}</p>}

            <div className="form-group">
                <label>Parent Dimension ID:</label>
                <input type="text" value={formData.DimIdPk} readOnly disabled />
                {/* Errors for DimIdPk (like "not found") will show in errors.form */}
            </div>
            <div className="form-group">
                <label>Parent Customer ID:</label>
                <input type="text" value={formData.CubeIdPk} readOnly disabled />
                {/* Errors for CubeIdPk (like "does not match") will show in errors.form */}
            </div>

            <fieldset>
                <legend>Extract Definition Details</legend>
                <div className="form-group">
                    <label htmlFor="DimDbExtrV2ProdDataSourceIdForm">Prod. Data Source ID (*)</label>
                    <input type="number" id="DimDbExtrV2ProdDataSourceIdForm" name="DimDbExtrV2ProdDataSourceId"
                           value={formData.DimDbExtrV2ProdDataSourceId} onChange={handleChange} required
                           readOnly={isEditMode} /> {/* Part of PK, not editable after creation */}
                    {errors.DimDbExtrV2ProdDataSourceId && <p className="error-message">{errors.DimDbExtrV2ProdDataSourceId}</p>}
                </div>

                <div className="form-group"> {/* DateInsert is part of PK, only for create, not editable */}
                    <label htmlFor="DimDbExtrV2DateInsertForm">Date Insert (*)</label>
                    <input type="datetime-local" id="DimDbExtrV2DateInsertForm" name="DimDbExtrV2DateInsert"
                           value={formData.DimDbExtrV2DateInsert} onChange={handleChange} required
                           readOnly={isEditMode} />
                    {errors.DimDbExtrV2DateInsert && <p className="error-message">{errors.DimDbExtrV2DateInsert}</p>}
                </div>

                <div className="form-group">
                    <label htmlFor="DimDbExtrV2CommentsForm">Comments (*)</label>
                    <textarea id="DimDbExtrV2CommentsForm" name="DimDbExtrV2Comments" value={formData.DimDbExtrV2Comments}
                              onChange={handleChange} required maxLength="200" rows="3" />
                    {errors.DimDbExtrV2Comments && <p className="error-message">{errors.DimDbExtrV2Comments}</p>}
                </div>

                <div className="form-group">
                    <label htmlFor="DimDbExtrV2DbSelectSqlClauseForm">SQL Select Clause (*)</label>
                    <textarea id="DimDbExtrV2DbSelectSqlClauseForm" name="DimDbExtrV2DbSelectSqlClause"
                              value={formData.DimDbExtrV2DbSelectSqlClause} onChange={handleChange} required rows="6"
                              style={{ fontFamily: 'monospace', whiteSpace: 'pre', overflowWrap: 'normal', overflowX: 'scroll' }}/>
                    {errors.DimDbExtrV2DbSelectSqlClause && <p className="error-message">{errors.DimDbExtrV2DbSelectSqlClause}</p>}
                </div>
            </fieldset>

            <div className="form-actions" style={{ marginTop: '20px' }}>
                <button type="submit" className="primary">{isEditMode ? 'Save Changes' : 'Add Definition'}</button>
                <button type="button" className="secondary" onClick={onCancel} style={{ marginLeft: '10px' }}>Cancel</button>
            </div>
        </form>
    );
};

export default DimDbExtractV2Form;