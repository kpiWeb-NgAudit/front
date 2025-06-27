// src/components/CubesetForm.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    CUBESET_HIDDEN_OPTIONS,
    CUBESET_DYNAMIC_OPTIONS,
    CUBESET_RDLSHOWFILTER_OPTIONS,
    getDropdownOptions
} from '../constants/cubesetEnums';
import { getAllCustomers } from '../api/customerService';
import { getNextPresOrder } from '../api/cubesetService';


// Helper for consistent key transformation from snake_case (backend) to PascalCase (form state)
const snakeToPascal = (str) => {
    if (!str) return str;

    // Gère les cas spéciaux comme _pk à la fin
    if (str.toLowerCase().endsWith("_pk")) {
        const prefix = str.substring(0, str.length - 3);
        // On ne met en majuscule que le premier mot pour les PKs
        const parts = prefix.split('_');
        return parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase() +
            parts.slice(1).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join('') + 'Pk';
    }

    // Gère les autres cas
    return str.split('_')
        .map(word => {
            // Si le mot est un acronyme connu (comme AS), on le met en majuscules.
            if (word.toLowerCase() === 'as') {
                return 'AS';
            }
            // Sinon, on met juste la première lettre en majuscule.
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join('');
};


const CubesetForm = ({ onSubmit, onCancel, initialData = {}, parentCubeIdPk, isEditMode = false }) => {
    const [customers, setCustomers] = useState([]);
    const [loadingCustomers, setLoadingCustomers] = useState(false);

    // getInitialFormState is memoized based on parentCubeIdPk.
    // Its reference changes only if parentCubeIdPk changes.
    const getInitialFormState = useCallback(() => {
        // console.log("CubesetForm: getInitialFormState called. parentCubeIdPk:", parentCubeIdPk);
        return {
            CubesetIdPk: '',
            CubesetName: '',
            CubesetCubeName: '',
            CubesetAsinstruction: '',
            CubesetHidden: CUBESET_HIDDEN_OPTIONS[0] || '',
            CubesetDynamic: CUBESET_DYNAMIC_OPTIONS[0] || '',
            CubesetRdlShowFilter: CUBESET_RDLSHOWFILTER_OPTIONS[0] || '',
            CubesetPresOrder: 0,
            CubesetComments: '',
            CubeIdPk: parentCubeIdPk || '', // Pre-fill based on prop
            CubesetTimestamp: null,
        };
    }, [parentCubeIdPk]);

    // Initialize formData. This function runs only on initial mount or if the component's key changes.
    const [formData, setFormData] = useState(() => {
        // console.log("CubesetForm: useState initializer for formData. isEditMode:", isEditMode, "parentCubeIdPk:", parentCubeIdPk, "initialData:", initialData);
        const baseState = getInitialFormState(); // Uses initial parentCubeIdPk from props at mount time

        if (isEditMode && initialData && Object.keys(initialData).length > 0) {
            let populatedState = { ...baseState };
            for (const backendKey in initialData) {
                if (initialData.hasOwnProperty(backendKey)) {
                    const formKey = snakeToPascal(backendKey);
                    if (populatedState.hasOwnProperty(formKey)) {
                        const value = initialData[backendKey];
                        if (value === null || typeof value === 'undefined') { populatedState[formKey] = ''; }
                        else if (typeof value === 'number') { populatedState[formKey] = String(value); }
                        else if (formKey === 'CubesetTimestamp' && value) { populatedState[formKey] = value; }
                        else { populatedState[formKey] = value; }
                    }
                }
            }
            if (initialData.cubeset_id_pk !== undefined) populatedState.CubesetIdPk = String(initialData.cubeset_id_pk);
            if (initialData.cube_id_pk !== undefined) populatedState.CubeIdPk = String(initialData.cube_id_pk);
            return populatedState;
        }
        // For create mode, potentially merge other initialData fields if provided for prefill
        // (beyond parentCubeIdPk which is handled by getInitialFormState)
        if (!isEditMode && initialData && Object.keys(initialData).length > 0) {
            const mergedState = { ...baseState, ...initialData }; // initialData for create usually uses PascalCase
            if (parentCubeIdPk) mergedState.CubeIdPk = parentCubeIdPk; // Ensure prop takes precedence
            return mergedState;
        }
        return baseState;
    });
    const [errors, setErrors] = useState({});

    // <<< 2. NOUVELLE FONCTION POUR GÉRER LE CHANGEMENT DE CLIENT >>>
    const handleCustomerChange = async (selectedCubeId) => {
        // Mettre à jour immédiatement la valeur du client dans le formulaire
        setFormData(prev => ({ ...prev, CubeIdPk: selectedCubeId, CubesetPresOrder: 0 }));

        // Si un client est sélectionné (et non l'option vide "Select Customer")
        if (selectedCubeId) {
            try {
                // Appeler le nouvel endpoint pour obtenir le prochain numéro d'ordre
                const nextOrder = await getNextPresOrder(selectedCubeId);
                // Mettre à jour le champ "Presentation Order" avec la valeur suggérée
                setFormData(prev => ({ ...prev, CubesetPresOrder: nextOrder }));
            } catch (error) {
                console.warn("Could not fetch next presentation order. User must enter it manually.");
                // Optionnel: informer l'utilisateur qu'il doit saisir manuellement
                setErrors(prev => ({...prev, CubesetPresOrder: "Could not fetch next order. Please enter manually."}));
            }
        }
    };

    // Effect to fetch customers for dropdown (only if adding globally)
    useEffect(() => {
        if (!isEditMode && !parentCubeIdPk) {
            setLoadingCustomers(true);
            getAllCustomers({ pageSize: 1000 })
                .then(response => {
                    setCustomers(Array.isArray(response) ? response : []);
                })
                .catch(err => {
                    console.error("CubesetForm: Failed to fetch customers", err);
                    setErrors(prev => ({...prev, customersDropdown: "Failed to load customers"}));
                    setCustomers([]);
                })
                .finally(() => setLoadingCustomers(false));
        } else {
            setLoadingCustomers(false);
            setCustomers([]);
        }
    }, [isEditMode, parentCubeIdPk]); // Runs when mode or parent context changes

    // This useEffect RE-SYNCS formData if key props (initialData, isEditMode, parentCubeIdPk) change
    // AFTER the component has already mounted. This handles external changes that require form reset/repopulation.
    useEffect(() => {
        console.log("CubesetForm RE-SYNC EFFECT: Props changed. isEditMode:", isEditMode, "parentCubeIdPk:", parentCubeIdPk, "initialData:", initialData);

        // Calculate the target state based purely on the current props
        let newTargetState = getInitialFormState(); // This will use the LATEST parentCubeIdPk from props

        if (isEditMode && initialData && Object.keys(initialData).length > 0) {
            newTargetState = { ...newTargetState }; // Start with fresh defaults for current context, then populate
            for (const backendKey in initialData) {
                if (initialData.hasOwnProperty(backendKey)) {
                    const formKey = snakeToPascal(backendKey);
                    if (newTargetState.hasOwnProperty(formKey)) {
                        const value = initialData[backendKey];
                        if (value === null || typeof value === 'undefined') {
                            newTargetState[formKey] = '';
                        } else if (typeof value === 'number') {
                            newTargetState[formKey] = String(value);
                        } else if (formKey === 'CubesetTimestamp' && value) {
                            newTargetState[formKey] = value;
                        } else {
                            newTargetState[formKey] = value;
                        }
                    }
                }
            }
            if (initialData.cubeset_id_pk !== undefined) newTargetState.CubesetIdPk = String(initialData.cubeset_id_pk);
            if (initialData.cube_id_pk !== undefined) newTargetState.CubeIdPk = String(initialData.cube_id_pk);
        } else if (!isEditMode) {
            // For create mode, newTargetState is already based on getInitialFormState (which uses parentCubeIdPk).
            // If initialData is provided for other pre-fills in create mode:
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

        console.log("CubesetForm RE-SYNC EFFECT: Setting formData due to prop change to:", newTargetState);
        setFormData(newTargetState); // This resets the form based on new props
        if (Object.keys(errors).length > 0) setErrors({}); // Reset errors when context changes

        // This effect depends on the props that define the form's context/data.
        // `getInitialFormState` is a dependency because if `parentCubeIdPk` changes, `getInitialFormState`
        // itself becomes a new function, signaling that the base structure of the form data needs to be re-evaluated.
    }, [initialData, isEditMode, parentCubeIdPk, getInitialFormState]);


    const validate = () => {
        const newErrors = {};
        if (!isEditMode && (formData.CubesetIdPk === '' || isNaN(parseInt(formData.CubesetIdPk)) || parseInt(formData.CubesetIdPk) <= 0)) {
            newErrors.CubesetIdPk = 'Cubeset ID is required and must be a positive number.';
        }
        if (!formData.CubesetName.trim()) newErrors.CubesetName = 'Cubeset Name is required.';
        else if (formData.CubesetName.length > 50) newErrors.CubesetName = 'Name max 50 chars.';

        if (!formData.CubesetCubeName.trim()) newErrors.CubesetCubeName = 'Internal Cube Name is required.';
        else if (formData.CubesetCubeName.length > 30) newErrors.CubesetCubeName = 'Internal Cube Name max 30 chars.';

        if (!formData.CubesetAsinstruction.trim()) newErrors.CubesetAsinstruction = 'AS Instruction is required.';

        if (!formData.CubesetHidden) newErrors.CubesetHidden = 'Hidden option is required.';
        if (!formData.CubesetDynamic) newErrors.CubesetDynamic = 'Dynamic option is required.';
        if (!formData.CubesetRdlShowFilter) newErrors.CubesetRdlShowFilter = 'RDL Show Filter option is required.';

        if (formData.CubesetPresOrder === '' || isNaN(parseInt(formData.CubesetPresOrder))) {
            newErrors.CubesetPresOrder = 'Presentation Order must be a number.';
        } else {
            const order = parseInt(formData.CubesetPresOrder, 10);
            if (order < 0) newErrors.CubesetPresOrder = 'Presentation Order cannot be negative.';
        }

        if (!formData.CubeIdPk) newErrors.CubeIdPk = 'Parent Customer ID is required.';

        if (isEditMode && !formData.CubesetTimestamp) newErrors.form = "Timestamp missing for update. Please refresh data.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => {
                const newErr = {...prev};
                delete newErr[name];
                // If all individual field errors are gone, clear the general form error too,
                // but only if the general form error was related to validation and not submission.
                const fieldErrorKeys = Object.keys(newErr).filter(k => k !== 'form');
                if (fieldErrorKeys.length === 0 && prev.form === "Please correct the errors below.") {
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
            CubesetName: formData.CubesetName.trim(),
            CubesetCubeName: formData.CubesetCubeName.trim(),
            CubesetAsinstruction: formData.CubesetAsinstruction.trim(),
            CubesetHidden: formData.CubesetHidden,
            CubesetDynamic: formData.CubesetDynamic,
            CubesetRdlShowFilter: formData.CubesetRdlShowFilter,
            CubesetPresOrder: parseInt(formData.CubesetPresOrder, 10),
            CubesetComments: formData.CubesetComments.trim() === '' ? null : formData.CubesetComments.trim(),
            CubeIdPk: formData.CubeIdPk,
        };

        if (!isEditMode) {
            submissionData.CubesetIdPk = parseInt(formData.CubesetIdPk, 10);
        } else {
            if (!formData.CubesetTimestamp) {
                setErrors(prev => ({...prev, form: "Cannot update: Timestamp missing."}));
                return;
            }
            submissionData.CubesetTimestamp = formData.CubesetTimestamp;
        }

        try {
            await onSubmit(submissionData);
            // Parent component (Add/Edit Page or Manager) typically handles onCancel/navigation.
        } catch (error) {
            const errorMsg = error.response?.data?.message || // For generic string messages from backend (less common with ModelState)
                error.response?.data?.title ||   // For ProblemDetails title
                error.message ||
                'Submission failed.';
            let currentErrors = { form: errorMsg }; // General form error

            if (error.response?.data?.errors) { // This is for ASP.NET Core ModelState errors
                console.log("Backend validation errors received:", error.response.data.errors);
                const backendFieldErrors = {};
                for (const keyInError in error.response.data.errors) {
                    // Backend error keys might be PascalCase (matching DTO) or camelCase
                    // Ensure your snakeToPascal or a similar utility maps them correctly to form field state keys
                    // For simplicity, assuming backend error keys might match DTO PascalCase directly
                    // or be easily transformed.
                    let formKey = keyInError;
                    // If backend returns "dto.CubesetPresOrder" or "CubesetPresOrder"
                    if (keyInError.toLowerCase().includes("cubesetpresorder")) formKey = "CubesetPresOrder";
                    else if (keyInError.toLowerCase().includes("cubesetname")) formKey = "CubesetName";
                    else if (keyInError.toLowerCase().includes("cubesetidpk")) formKey = "CubesetIdPk";
                    // Add more specific mappings if needed or use a robust snakeToPascal/camelToPascal

                    backendFieldErrors[formKey] = error.response.data.errors[keyInError].join(', ');
                }
                currentErrors = { ...currentErrors, ...backendFieldErrors };
            }
            setErrors(currentErrors);
        }

    };

    return (
        <form onSubmit={handleSubmit} className="cubeset-form" style={{ border: '1px solid #ccc', padding: '15px', marginTop: '10px', marginBottom: '20px' }}>
            <h4>{isEditMode ? `Edit Cubeset (ID: ${formData.CubesetIdPk || (initialData && initialData.cubeset_id_pk)})` : 'Add New Cubeset'}</h4>
            {errors.form && <p className="error-message" style={{color: 'red', fontWeight: 'bold'}}>{errors.form}</p>}

            <fieldset>
                <legend>Core Cubeset Info</legend>
                <div className="form-group">
                    <label htmlFor="CubesetIdPkForm">Cubeset ID (*)</label>
                    <input type="number" id="CubesetIdPkForm" name="CubesetIdPk" value={formData.CubesetIdPk} onChange={handleChange} required readOnly={isEditMode} />
                    {errors.CubesetIdPk && <p className="error-message">{errors.CubesetIdPk}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="CubesetNameForm">Display Name (*)</label>
                    <input type="text" id="CubesetNameForm" name="CubesetName" value={formData.CubesetName} onChange={handleChange} maxLength="50" required />
                    {errors.CubesetName && <p className="error-message">{errors.CubesetName}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="CubesetCubeNameForm">Internal Cube Name (*)</label>
                    <input type="text" id="CubesetCubeNameForm" name="CubesetCubeName" value={formData.CubesetCubeName} onChange={handleChange} maxLength="30" required />
                    {errors.CubesetCubeName && <p className="error-message">{errors.CubesetCubeName}</p>}
                </div>
                {!isEditMode && !parentCubeIdPk && (
                    <div className="form-group">
                        <label htmlFor="CubeIdPkCubesetForm">Parent Customer (*)</label>
                        {loadingCustomers ? <p>Loading customers...</p> : (
                            <select id="CubeIdPkCubesetForm" name="CubeIdPk" value={formData.CubeIdPk} onChange={handleChange} required>
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
            </fieldset>

            <fieldset>
                <legend>Configuration</legend>
                <div className="form-group">
                    <label htmlFor="CubesetHiddenForm">Hidden Setting (*)</label>
                    <select id="CubesetHiddenForm" name="CubesetHidden" value={formData.CubesetHidden} onChange={handleChange} required>
                        {getDropdownOptions(CUBESET_HIDDEN_OPTIONS).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    {errors.CubesetHidden && <p className="error-message">{errors.CubesetHidden}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="CubesetDynamicForm">Dynamic Setting (*)</label>
                    <select id="CubesetDynamicForm" name="CubesetDynamic" value={formData.CubesetDynamic} onChange={handleChange} required>
                        {getDropdownOptions(CUBESET_DYNAMIC_OPTIONS).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    {errors.CubesetDynamic && <p className="error-message">{errors.CubesetDynamic}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="CubesetRdlShowFilterForm">RDL Show Filter (*)</label>
                    <select id="CubesetRdlShowFilterForm" name="CubesetRdlShowFilter" value={formData.CubesetRdlShowFilter} onChange={handleChange} required>
                        {getDropdownOptions(CUBESET_RDLSHOWFILTER_OPTIONS).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    {errors.CubesetRdlShowFilter && <p className="error-message">{errors.CubesetRdlShowFilter}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="CubesetPresOrderForm">Presentation Order (*)</label>
                    <input type="number" id="CubesetPresOrderForm" name="CubesetPresOrder" value={formData.CubesetPresOrder} onChange={handleChange} required />
                    {errors.CubesetPresOrder && <p className="error-message">{errors.CubesetPresOrder}</p>}
                </div>
            </fieldset>

            <fieldset>
                <legend>Instructions & Comments</legend>
                <div className="form-group">
                    <label htmlFor="CubesetAsinstructionForm">AS Instruction (MDX/XMLA) (*)</label>
                    <textarea
                        id="CubesetAsinstructionForm"
                        name="CubesetAsinstruction"
                        value={formData.CubesetAsinstruction} // <<< CORRECTION APPLIQUÉE ICI
                        onChange={handleChange}
                        required
                        rows="5"
                    />
                    {errors.CubesetAsinstruction && <p className="error-message">{errors.CubesetAsinstruction}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="CubesetCommentsForm">Comments (Optional)</label>
                    <textarea
                        id="CubesetCommentsForm"
                        name="CubesetComments"
                        value={formData.CubesetComments}
                        onChange={handleChange}
                        rows="3"
                    />
                    {errors.CubesetComments && <p className="error-message">{errors.CubesetComments}</p>}
                </div>
            </fieldset>

            <div className="form-actions" style={{ marginTop: '20px' }}>
                <button type="submit" className="primary">{isEditMode ? 'Update Cubeset' : 'Add Cubeset'}</button>
                <button type="button" className="secondary" onClick={onCancel} style={{ marginLeft: '10px' }}>Cancel</button>
            </div>
        </form>
    );
};

export default CubesetForm;