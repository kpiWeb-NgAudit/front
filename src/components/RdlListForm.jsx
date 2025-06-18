// src/components/RdlListForm.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getAllCustomers } from '../api/customerService';
import { getAllThemes } from '../api/themeService';
import { getAllRdlTypes } from '../api/rdlTypeService';
import { getDropdownOptions } from '../constants/rdlListEnums'; // Ensure this exists and is useful

// Helper for consistent key transformation
const snakeToPascal = (str) => {
    if (!str) return str;
    if (str.toLowerCase().endsWith("_pk")) {
        const prefix = str.substring(0, str.length - 3);
        return prefix.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join('') + 'Pk';
    }
    let s = str;
    if (s.startsWith("rdllist_")) s = s.substring(8);
    else if (s.startsWith("cube_")) s = s.substring(5);
    else if (s.startsWith("theme_")) s = s.substring(6);
    else if (s.startsWith("rdltype_")) s = s.substring(8);
    return s.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join('');
};

const RdlListForm = ({ onSubmit, onCancel, initialData = {}, parentCubeIdPk, isEditMode = false }) => {
    const [customers, setCustomers] = useState([]);
    const [themes, setThemes] = useState([]);
    const [rdlTypes, setRdlTypes] = useState([]);
    const [loadingDropdowns, setLoadingDropdowns] = useState(true);

    // getInitialFormState is memoized based on parentCubeIdPk.
    const getInitialFormState = useCallback(() => {
        // console.log("RDL_FORM: getInitialFormState. parentCubeIdPk:", parentCubeIdPk);
        return {
            RdlListIdPk: '', RdlListName: '', ThemeIdPk: '', RdlTypeIdPk: '',
            RdlListDescription: '', RdlListCode: '',
            CubeIdPk: parentCubeIdPk || '',
            RdlListTimestamp: null,
        };
    }, [parentCubeIdPk]);

    // Initialize formData using the function form of useState.
    // This logic runs only ONCE on initial mount OR if the component's key prop changes.
    const [formData, setFormData] = useState(() => {
        console.log("RDL_FORM: useState initializer for formData. isEditMode:", isEditMode, "parentCubeIdPk:", parentCubeIdPk, "initialData:", initialData);
        let stateToInitialize = getInitialFormState(); // Base state using current parentCubeIdPk

        if (isEditMode && initialData && Object.keys(initialData).length > 0) {
            console.log("RDL_FORM: useState initializer (EDIT mode) - populating from initialData");
            for (const backendKey in initialData) {
                if (initialData.hasOwnProperty(backendKey)) {
                    // Try to match backendKey (camelCase from DTO or snake_case from entity) to PascalCase formKey
                    const formKey = stateToInitialize.hasOwnProperty(snakeToPascal(backendKey)) ? snakeToPascal(backendKey) : backendKey;
                    if (stateToInitialize.hasOwnProperty(formKey)) {
                        const value = initialData[backendKey];
                        if (value === null || typeof value === 'undefined') stateToInitialize[formKey] = '';
                        else if (typeof value === 'number') stateToInitialize[formKey] = String(value);
                        else if (formKey === 'RdlListTimestamp' && value) stateToInitialize[formKey] = value;
                        else stateToInitialize[formKey] = value;
                    }
                }
            }
            // Explicitly set PKs and important FKs to ensure correct population from initialData
            if (initialData.rdlListIdPk !== undefined) stateToInitialize.RdlListIdPk = String(initialData.rdlListIdPk);
            else if (initialData.rdllist_id_pk !== undefined) stateToInitialize.RdlListIdPk = String(initialData.rdllist_id_pk);

            if (initialData.cubeIdPk !== undefined) stateToInitialize.CubeIdPk = String(initialData.cubeIdPk);
            else if (initialData.cube_id_pk !== undefined) stateToInitialize.CubeIdPk = String(initialData.cube_id_pk);

            if (initialData.themeIdPk !== undefined) stateToInitialize.ThemeIdPk = String(initialData.themeIdPk);
            else if (initialData.theme_id_pk !== undefined) stateToInitialize.ThemeIdPk = String(initialData.theme_id_pk);

            if (initialData.rdlTypeIdPk !== undefined) stateToInitialize.RdlTypeIdPk = String(initialData.rdlTypeIdPk);
            else if (initialData.rdltype_id_pk !== undefined) stateToInitialize.RdlTypeIdPk = String(initialData.rdltype_id_pk);
        } else if (!isEditMode && initialData && Object.keys(initialData).length > 0) {
            console.log("RDL_FORM: useState initializer (CREATE mode with prefill) - merging initialData");
            stateToInitialize = { ...stateToInitialize, ...initialData }; // Assuming initialData for create uses PascalCase keys
            if (parentCubeIdPk) stateToInitialize.CubeIdPk = parentCubeIdPk; // Ensure prop takes precedence
        }
        console.log("RDL_FORM: useState initializer - final state:", stateToInitialize);
        return stateToInitialize;
    });
    const [errors, setErrors] = useState({});

    // Effect to fetch data for all dropdowns
    useEffect(() => {
        console.log("RDL_FORM: Dropdown fetch EFFECT. isEditMode:", isEditMode, "parentCubeIdPk:", parentCubeIdPk);
        setLoadingDropdowns(true);
        setErrors(prev => ({ ...prev, dropdowns: null }));
        Promise.allSettled([
            (!isEditMode && !parentCubeIdPk) ? getAllCustomers({ pageSize: 1000 }) : Promise.resolve(null),
            getAllThemes(),
            getAllRdlTypes({ pageSize: 1000 })
        ]).then(([custRes, themeRes, rdlTypeRes]) => {
            if (custRes.status === 'fulfilled' && custRes.value) setCustomers(Array.isArray(custRes.value) ? custRes.value : []);
            else if (custRes.status === 'rejected' && !isEditMode && !parentCubeIdPk) console.error("Failed to load customers:", custRes.reason);

            if (themeRes.status === 'fulfilled') setThemes(Array.isArray(themeRes.value) ? themeRes.value : []);
            else console.error("Failed to load themes:", themeRes.reason);

            if (rdlTypeRes.status === 'fulfilled') setRdlTypes(Array.isArray(rdlTypeRes.value) ? rdlTypeRes.value : []);
            else console.error("Failed to load RDL types:", rdlTypeRes.reason);
        }).catch(error => {
            console.error("RdlListForm: Error in Promise.allSettled for dropdown data", error);
            setErrors(prev => ({...prev, dropdowns: "Failed to load some dropdown options."}));
        }).finally(() => {
            setLoadingDropdowns(false);
        });
    }, [isEditMode, parentCubeIdPk]);


    // This useEffect is ONLY for RE-SYNCHRONIZING formData if key props change AFTER initial mount.
    useEffect(() => {
        console.log("RDL_FORM: RE-SYNC EFFECT based on props. isEditMode:", isEditMode, "parentCubeIdPk:", parentCubeIdPk, "initialData:", initialData);

        // Calculate the target state based purely on the current props
        let newTargetState = getInitialFormState(); // This will use the LATEST parentCubeIdPk from props

        if (isEditMode && initialData && Object.keys(initialData).length > 0) {
            newTargetState = { ...newTargetState }; // Start with fresh defaults for current context, then populate
            for (const backendKey in initialData) { /* ... (mapping logic as in useState initializer) ... */
                if (initialData.hasOwnProperty(backendKey)) {
                    const formKey = initialData.hasOwnProperty(snakeToPascal(backendKey)) ? snakeToPascal(backendKey) : backendKey;
                    if (newTargetState.hasOwnProperty(formKey)) {
                        const value = initialData[backendKey];
                        if (value === null || typeof value === 'undefined') { newTargetState[formKey] = ''; }
                        else if (typeof value === 'number') { newTargetState[formKey] = String(value); }
                        else if (formKey === 'RdlListTimestamp' && value) { newTargetState[formKey] = value; }
                        else { newTargetState[formKey] = value; }
                    }
                }
            }
            if (initialData.rdlListIdPk !== undefined) newTargetState.RdlListIdPk = String(initialData.rdlListIdPk);
            else if (initialData.rdllist_id_pk !== undefined) newTargetState.RdlListIdPk = String(initialData.rdllist_id_pk);

            if (initialData.cubeIdPk !== undefined) newTargetState.CubeIdPk = String(initialData.cubeIdPk);
            else if (initialData.cube_id_pk !== undefined) newTargetState.CubeIdPk = String(initialData.cube_id_pk);

            if (initialData.themeIdPk !== undefined) newTargetState.ThemeIdPk = String(initialData.themeIdPk);
            else if (initialData.theme_id_pk !== undefined) newTargetState.ThemeIdPk = String(initialData.theme_id_pk);

            if (initialData.rdlTypeIdPk !== undefined) newTargetState.RdlTypeIdPk = String(initialData.rdlTypeIdPk);
            else if (initialData.rdltype_id_pk !== undefined) newTargetState.RdlTypeIdPk = String(initialData.rdltype_id_pk);
        } else if (!isEditMode) {
            // For create mode, newTargetState is already based on getInitialFormState.
            // If initialData has other pre-fills (e.g. from query params via AddRdlListPage):
            if (initialData && Object.keys(initialData).length > 0) {
                const prefillData = {};
                for (const keyInInitial in initialData) {
                    if (initialData.hasOwnProperty(keyInInitial)) {
                        const formKey = initialData.hasOwnProperty(snakeToPascal(keyInInitial)) ? snakeToPascal(keyInInitial) : keyInInitial;
                        if (newTargetState.hasOwnProperty(formKey) && formKey !== 'CubeIdPk') {
                            prefillData[formKey] = initialData[keyInInitial] === null || initialData[keyInInitial] === undefined ? '' : String(initialData[keyInInitial]);
                        } else if (formKey === 'CubeIdPk' && !parentCubeIdPk && initialData[keyInInitial]) {
                            prefillData[formKey] = String(initialData[keyInInitial]);
                        }
                    }
                }
                newTargetState = { ...newTargetState, ...prefillData };
            }
        }

        console.log("RDL_FORM: RE-SYNC EFFECT: Setting formData due to prop change to:", newTargetState);
        setFormData(newTargetState);
        if (Object.keys(errors).length > 0) setErrors({}); // Reset errors when context changes

        // This effect depends on the props that define the form's context/data.
        // It should NOT include getInitialFormState directly, as it's called inside.
    }, [initialData, isEditMode, parentCubeIdPk]);


    const validate = () => {
        const newErrors = {};
        if (!isEditMode && (formData.RdlListIdPk === '' || isNaN(parseInt(formData.RdlListIdPk)) || parseInt(formData.RdlListIdPk) <=0 )) {
            newErrors.RdlListIdPk = 'RDL List ID is required and must be a positive number.';
        }
        if (!formData.RdlListName.trim()) newErrors.RdlListName = 'Name is required.';
        else if (formData.RdlListName.length > 200) newErrors.RdlListName = 'Name max 200 chars.';
        if (!formData.ThemeIdPk) newErrors.ThemeIdPk = 'Theme is required.';
        if (!formData.RdlTypeIdPk) newErrors.RdlTypeIdPk = 'RDL Type is required.';
        if (!formData.RdlListDescription.trim()) newErrors.RdlListDescription = 'Description is required.';
        else if (formData.RdlListDescription.length > 200) newErrors.RdlListDescription = 'Description max 200 chars.';
        if (!formData.RdlListCode.trim()) newErrors.RdlListCode = 'RDL Code is required.';
        if (!formData.CubeIdPk) newErrors.CubeIdPk = 'Parent Customer is required.';
        if (isEditMode && !formData.RdlListTimestamp) newErrors.form = "Timestamp missing for update.";
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
                if (Object.keys(newErr).filter(k => k !== 'form').length === 0 && prev.form === "Please correct errors." ) { // Clears general form error only if it was the "correct errors" one
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
        const submissionData = { // Match CreateRdlListDto / UpdateRdlListDto (PascalCase)
            RdlListName: formData.RdlListName.trim(),
            ThemeIdPk: formData.ThemeIdPk,
            RdlTypeIdPk: formData.RdlTypeIdPk,
            RdlListDescription: formData.RdlListDescription.trim(),
            RdlListCode: formData.RdlListCode.trim(),
            CubeIdPk: formData.CubeIdPk,
        };

        if (!isEditMode) {
            submissionData.RdlListIdPk = parseInt(formData.RdlListIdPk, 10);
        } else {
            if (!formData.RdlListTimestamp) {
                setErrors(prev => ({...prev, form: "Cannot update: Timestamp missing."}));
                return;
            }
            submissionData.RdlListTimestamp = formData.RdlListTimestamp;
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
        <form onSubmit={handleSubmit} className="rdllist-form">
            <h4>{isEditMode ? `Edit RDL List (ID: ${formData.RdlListIdPk})` : 'Add New RDL List'}</h4>
            {errors.form && <p className="error-message" style={{color: 'red', fontWeight: 'bold'}}>{errors.form}</p>}
            {errors.dropdowns && <p className="error-message" style={{color: 'orange'}}>{errors.dropdowns}</p>}

            <fieldset>
                <legend>RDL List Identification</legend>
                <div className="form-group">
                    <label htmlFor="RdlListIdPkForm">RDL List ID (*)</label>
                    <input type="number" id="RdlListIdPkForm" name="RdlListIdPk" value={formData.RdlListIdPk} onChange={handleChange} required readOnly={isEditMode} />
                    {errors.RdlListIdPk && <p className="error-message">{errors.RdlListIdPk}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="RdlListNameForm">Name (*)</label>
                    <input type="text" id="RdlListNameForm" name="RdlListName" value={formData.RdlListName} onChange={handleChange} maxLength="200" required />
                    {errors.RdlListName && <p className="error-message">{errors.RdlListName}</p>}
                </div>
            </fieldset>

            <fieldset>
                <legend>Associations</legend>
                {!isEditMode && !parentCubeIdPk && (
                    <div className="form-group">
                        <label htmlFor="CubeIdPkRdlForm">Parent Customer (*)</label>
                        {loadingDropdowns ? <p>Loading customers...</p> : (
                            <select id="CubeIdPkRdlForm" name="CubeIdPk" value={formData.CubeIdPk} onChange={handleChange} required>
                                <option value="">--- Select Customer ---</option>
                                {customers.map(c => <option key={c.cube_id_pk} value={c.cube_id_pk}>{c.cube_name} ({c.cube_id_pk})</option>)}
                            </select>
                        )}
                        {errors.CubeIdPk && <p className="error-message">{errors.CubeIdPk}</p>}
                    </div>
                )}
                {(isEditMode || parentCubeIdPk) && (
                    <div className="form-group"><label>Parent Customer</label><input type="text" value={formData.CubeIdPk} readOnly disabled placeholder={parentCubeIdPk || (initialData && (initialData.cubeIdPk || initialData.cube_id_pk)) || "N/A"}/></div>
                )}

                <div className="form-group">
                    <label htmlFor="ThemeIdPkFormRdl">Theme (*)</label>
                    {loadingDropdowns ? <p>Loading themes...</p> : (
                        <select id="ThemeIdPkFormRdl" name="ThemeIdPk" value={formData.ThemeIdPk} onChange={handleChange} required>
                            <option value="">--- Select Theme ---</option>
                            {themes.map(t => <option key={t.themeIdPk} value={t.themeIdPk}>{t.themeLabel} ({t.themeIdPk})</option>)}
                        </select>
                    )}
                    {errors.ThemeIdPk && <p className="error-message">{errors.ThemeIdPk}</p>}
                </div>

                <div className="form-group">
                    <label htmlFor="RdlTypeIdPkFormRdl">RDL Type (*)</label>
                    {loadingDropdowns ? <p>Loading RDL types...</p> : (
                        <select id="RdlTypeIdPkFormRdl" name="RdlTypeIdPk" value={formData.RdlTypeIdPk} onChange={handleChange} required>
                            <option value="">--- Select RDL Type ---</option>
                            {rdlTypes.map(rt => <option key={rt.rdlTypeIdPk} value={rt.rdlTypeIdPk}>{rt.rdlTypeLabel} (Group: {rt.rdlGroupName || 'N/A'})</option>)}
                        </select>
                    )}
                    {errors.RdlTypeIdPk && <p className="error-message">{errors.RdlTypeIdPk}</p>}
                </div>
            </fieldset>

            <fieldset>
                <legend>Content</legend>
                <div className="form-group">
                    <label htmlFor="RdlListDescriptionForm">Description (*)</label>
                    <textarea id="RdlListDescriptionForm" name="RdlListDescription" value={formData.RdlListDescription} onChange={handleChange} maxLength="200" required rows="3" />
                    {errors.RdlListDescription && <p className="error-message">{errors.RdlListDescription}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="RdlListCodeForm">RDL Code (XML) (*)</label>
                    <textarea id="RdlListCodeForm" name="RdlListCode" value={formData.RdlListCode} onChange={handleChange} required rows="15" style={{ fontFamily: 'monospace', whiteSpace: 'pre', overflowWrap: 'normal', overflowX: 'scroll', width: '100%' }} />
                    {errors.RdlListCode && <p className="error-message">{errors.RdlListCode}</p>}
                </div>
            </fieldset>

            <div className="form-actions" style={{ marginTop: '20px' }}>
                <button type="submit" className="primary">{isEditMode ? 'Update RDL List' : 'Add RDL List'}</button>
                <button type="button" className="secondary" onClick={onCancel} style={{ marginLeft: '10px' }}>Cancel</button>
            </div>
        </form>
    );
};

export default RdlListForm;