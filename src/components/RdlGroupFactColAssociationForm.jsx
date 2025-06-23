// src/components/RdlGroupFactColAssociationForm.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getAllFactColumns } from '../api/factColumnService'; // To select a FactColumn
import { getCalcTypeDropdownOptions } from '../constants/rdlGroupFactColEnums';

const snakeToPascal = (str) => { /* ... your helper ... */ };

const RdlGroupFactColAssociationForm = ({
                                            onSubmit,
                                            onCancel,
                                            initialData = {}, // For editing: has all calctypes, FactcolIdPk, RdlGroupIdPk, Timestamp
                                                              // For adding: has RdlGroupIdPk (parent)
                                            availableFactCols, // Array of all fact columns (or those not yet associated)
                                            existingAssociationsForGroup, // Array of { factcolIdPk, ... } for current RdlGroup
                                            isEditMode = false,
                                            currentRdlGroupIdPk // Passed from manager, always present
                                        }) => {

    const getInitialFormState = useCallback(() => {
        const defaults = {
            FactcolIdPk: '', // User selects for new, read-only for edit
            RdlgroupfactcolRdlsimpleCalctype0: '', RdlgroupfactcolRdlsimpleCalctype1: '',
            RdlgroupfactcolRdlsimpleCalctype2: '', RdlgroupfactcolRdlsimpleCalctype3: '',
            RdlgroupfactcolRdlsimpleCalctype4: '',
            RdlgroupfactcolRdlcomplexCalctype0: '', RdlgroupfactcolRdlcomplexCalctype1: '',
            RdlgroupfactcolRdlcomplexCalctype2: '', RdlgroupfactcolRdlcomplexCalctype3: '',
            RdlgroupfactcolRdlcomplexCalctype4: '',
            RdlgroupFactcolTimestamp: null, // For edit
        };
        if (isEditMode && initialData) {
            const editState = {};
            for (const key in defaults) { // Populate from initialData, converting keys if necessary
                const backendKeySnake = key.replace(/([A-Z])/g, "_$1").toLowerCase().replace(/^rdlgroupfactcol_/, "rdlgroupfactcol_"); // approx snake_case
                const backendKeyCamel = key.charAt(0).toLowerCase() + key.slice(1);

                if (initialData.hasOwnProperty(key)) editState[key] = initialData[key] || ''; // PascalCase DTO
                else if (initialData.hasOwnProperty(backendKeyCamel)) editState[key] = initialData[backendKeyCamel] || ''; // camelCase JSON
                else if (initialData.hasOwnProperty(backendKeySnake)) editState[key] = initialData[backendKeySnake] || ''; // snake_case entity
                else editState[key] = defaults[key];
            }
            // Ensure PKs are correctly from initialData for edit mode
            editState.FactcolIdPk = String(initialData.factcolIdPk || initialData.FactcolIdPk || '');
            editState.RdlgroupFactcolTimestamp = initialData.rdlgroupFactcolTimestamp || initialData.RdlgroupFactcolTimestamp || null;
            return editState;
        }
        return defaults;
    }, [initialData, isEditMode]);

    const [formData, setFormData] = useState(getInitialFormState);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        setFormData(getInitialFormState());
        setErrors({});
    }, [initialData, isEditMode, getInitialFormState]);


    const validate = () => {
        const newErrors = {};
        if (!isEditMode && !formData.FactcolIdPk) {
            newErrors.FactcolIdPk = 'A Fact Column must be selected.';
        }
        // Add validation for each calctype if they had specific rules beyond the dropdown
        // For now, relying on dropdowns to provide valid values or empty string.

        // Check for duplicate association if in create mode
        if (!isEditMode && formData.FactcolIdPk && existingAssociationsForGroup) {
            if (existingAssociationsForGroup.some(assoc => assoc.factcolIdPk === parseInt(formData.FactcolIdPk))) {
                newErrors.FactcolIdPk = 'This Fact Column is already associated with this RDL Group.';
            }
        }
        if (isEditMode && !formData.RdlgroupFactcolTimestamp) {
            newErrors.form = "Timestamp is missing for update.";
        }
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
            RdlGroupIdPk: currentRdlGroupIdPk, // From parent manager context
            FactcolIdPk: parseInt(formData.FactcolIdPk, 10),
            RdlgroupfactcolRdlsimpleCalctype0: formData.RdlgroupfactcolRdlsimpleCalctype0 || null,
            RdlgroupfactcolRdlsimpleCalctype1: formData.RdlgroupfactcolRdlsimpleCalctype1 || null,
            RdlgroupfactcolRdlsimpleCalctype2: formData.RdlgroupfactcolRdlsimpleCalctype2 || null,
            RdlgroupfactcolRdlsimpleCalctype3: formData.RdlgroupfactcolRdlsimpleCalctype3 || null,
            RdlgroupfactcolRdlsimpleCalctype4: formData.RdlgroupfactcolRdlsimpleCalctype4 || null,
            RdlgroupfactcolRdlcomplexCalctype0: formData.RdlgroupfactcolRdlcomplexCalctype0 || null,
            RdlgroupfactcolRdlcomplexCalctype1: formData.RdlgroupfactcolRdlcomplexCalctype1 || null,
            RdlgroupfactcolRdlcomplexCalctype2: formData.RdlgroupfactcolRdlcomplexCalctype2 || null,
            RdlgroupfactcolRdlcomplexCalctype3: formData.RdlgroupfactcolRdlcomplexCalctype3 || null,
            RdlgroupfactcolRdlcomplexCalctype4: formData.RdlgroupfactcolRdlcomplexCalctype4 || null,
        };

        if (isEditMode) {
            if (!formData.RdlgroupFactcolTimestamp) { /* error handled in validate */ return; }
            submissionData.RdlgroupFactcolTimestamp = formData.RdlgroupFactcolTimestamp;
        }

        try {
            await onSubmit(submissionData); // Calls create or update service
        } catch (error) { /* ... error handling ... */ }
    };

    const calcTypeFields = [
        { name: "RdlgroupfactcolRdlsimpleCalctype0", label: "Simple Calc Type 0" },
        { name: "RdlgroupfactcolRdlsimpleCalctype1", label: "Simple Calc Type 1" },
        { name: "RdlgroupfactcolRdlsimpleCalctype2", label: "Simple Calc Type 2" },
        { name: "RdlgroupfactcolRdlsimpleCalctype3", label: "Simple Calc Type 3" },
        { name: "RdlgroupfactcolRdlsimpleCalctype4", label: "Simple Calc Type 4" },
        { name: "RdlgroupfactcolRdlcomplexCalctype0", label: "Complex Calc Type 0" },
        { name: "RdlgroupfactcolRdlcomplexCalctype1", label: "Complex Calc Type 1" },
        { name: "RdlgroupfactcolRdlcomplexCalctype2", label: "Complex Calc Type 2" },
        { name: "RdlgroupfactcolRdlcomplexCalctype3", label: "Complex Calc Type 3" },
        { name: "RdlgroupfactcolRdlcomplexCalctype4", label: "Complex Calc Type 4" },
    ];

    // Filter availableFactCols for "Add" mode
    const factColsForDropdown = isEditMode || !availableFactCols || !existingAssociationsForGroup
        ? availableFactCols // Show all for edit (though DimCol is read-only) or if data is missing
        : availableFactCols.filter(fc =>
            !existingAssociationsForGroup.some(assoc => assoc.factcolIdPk === fc.factcol_id_pk)
        );


    return (
        <form onSubmit={handleSubmit} className="rdlgroup-factcol-form">
            <h4>{isEditMode ? `Edit Calc Types for Fact Column ${formData.FactcolIdPk}` : 'Associate Fact Column & Set Calc Types'}</h4>
            <p>For RDL Group: {currentRdlGroupIdPk}</p>
            {errors.form && <p className="error-message">{errors.form}</p>}

            {!isEditMode && (
                <div className="form-group">
                    <label htmlFor="FactcolIdPkFormAssoc">Fact Column (*)</label>
                    <select id="FactcolIdPkFormAssoc" name="FactcolIdPk" value={formData.FactcolIdPk} onChange={handleChange} required>
                        <option value="">--- Select Fact Column ---</option>
                        {factColsForDropdown && factColsForDropdown.map(fc => (
                            // Assuming factcolumn objects have factcol_id_pk and factcol_cname
                            <option key={fc.factcol_id_pk} value={fc.factcol_id_pk}>
                                {fc.factcol_cname} (ID: {fc.factcol_id_pk})
                            </option>
                        ))}
                        {(!factColsForDropdown || factColsForDropdown.length === 0) && <option value="" disabled>No new columns to associate.</option>}
                    </select>
                    {errors.FactcolIdPk && <p className="error-message">{errors.FactcolIdPk}</p>}
                </div>
            )}
            {isEditMode && (
                <div className="form-group">
                    <label>Fact Column ID (Fixed)</label>
                    <input type="text" value={formData.FactcolIdPk} readOnly disabled />
                </div>
            )}

            {calcTypeFields.map(field => (
                <div className="form-group" key={field.name}>
                    <label htmlFor={`${field.name}Form`}>{field.label}</label>
                    <select
                        id={`${field.name}Form`}
                        name={field.name}
                        value={formData[field.name] || ''}
                        onChange={handleChange}
                    >
                        {getCalcTypeDropdownOptions().map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    {errors[field.name] && <p className="error-message">{errors[field.name]}</p>}
                </div>
            ))}

            <div className="form-actions">
                <button type="submit" className="primary">{isEditMode ? 'Save Calc Types' : 'Add Association'}</button>
                <button type="button" className="secondary" onClick={onCancel}>Cancel</button>
            </div>
        </form>
    );
};

export default RdlGroupFactColAssociationForm;