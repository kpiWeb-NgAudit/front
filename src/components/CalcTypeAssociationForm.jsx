// src/components/CalcTypeAssociationForm.jsx
import React, { useState, useEffect, useCallback } from 'react';
// No need to import getAllCalcTypes here, availableCalcTypes will be a prop
import {
    CALCFACTCOL_VISIBLE_OPTIONS, CALCFACTCOL_TYPEFORFORMAT_OPTIONS,
    CALCFACTCOL_SHOWTOTALINRDL_OPTIONS,
    getDropdownOptions, getOptionalDropdownOptions // Assuming these are in calcTypeFactColEnums.js
} from '../constants/calcTypeFactColEnums'; // Or your shared enums file

const snakeToPascal = (str) => {
    if (!str) return str;
    if (str.toLowerCase().endsWith("_pk")) {
        const prefix = str.substring(0, str.length - 3);
        return prefix.split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join('') + 'Pk';
    }
    return str.split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('');
};

const CalcTypeAssociationForm = ({
                                     onSubmit,
                                     onCancel,
                                     initialData = {}, // For editing: full CalcTypeFactColDto (or entity)
                                                       // For adding: {} (FactcolIdPk is passed as a separate prop)
                                     availableCalcTypes, // Array of ALL CalcTypeDto (from calctypes table, passed by manager)
                                     existingCalcTypeAssociationsForFactCol, // Array of CalcTypeFactColDto for the current FactCol
                                     isEditMode = false,
                                     currentFactColIdPk // Passed from manager, always present
                                 }) => {

    const getInitialFormState = useCallback(() => {
        const defaults = {
            // PK part for new associations, selected by user
            CalcTypeType: '',
            // Attributes of the calctype_factcol join table
            CalcfactcolCubeSuffix: '',
            CalcfactcolPresSuffix: '',
            CalcfactcolVisible: CALCFACTCOL_VISIBLE_OPTIONS[0] || '', // Default to first option
            CalcfactcolTypeForFormat: '', // Default to "Not Set" or empty
            CalcfactcolShowTotalInRdl: '', // Default to "Not Set" or empty
            CalcfactcolMdxFormula: '',
            CalcfactcolComments: '',
            CalcfactcolDisplayFolder: '',
            // Note: The 10 specific simple/complex calctype fields from rdlgroup_factcol are NOT here.
            // This form is for the attributes of the calctype_factcol table itself.
            // If your calctype_factcol table ALSO has those 10 specific string calctypes, add them here.
            // Based on your last schema for calctype_factcol, it did:
            RdlgroupfactcolRdlsimpleCalctype0: '', RdlgroupfactcolRdlsimpleCalctype1: '',
            RdlgroupfactcolRdlsimpleCalctype2: '', RdlgroupfactcolRdlsimpleCalctype3: '',
            RdlgroupfactcolRdlsimpleCalctype4: '',
            RdlgroupfactcolRdlcomplexCalctype0: '', RdlgroupfactcolRdlcomplexCalctype1: '',
            RdlgroupfactcolRdlcomplexCalctype2: '', RdlgroupfactcolRdlcomplexCalctype3: '',
            RdlgroupfactcolRdlcomplexCalctype4: '',

            CalcfactcolTimestamp: null, // For edit mode submission
        };

        if (isEditMode && initialData) {
            let editState = { ...defaults };
            for (const key in initialData) { // Assuming initialData keys (from DTO) are PascalCase
                if (initialData.hasOwnProperty(key) && editState.hasOwnProperty(key)) {
                    const value = initialData[key];
                    editState[key] = (value === null || value === undefined) ? '' : String(value);
                }
            }
            // Ensure PK for edit mode is set correctly
            if (initialData.calcTypeType) editState.CalcTypeType = String(initialData.calcTypeType);
            if (initialData.calcfactcolTimestamp) editState.CalcfactcolTimestamp = initialData.calcfactcolTimestamp;
            return editState;
        }
        return defaults;
    }, [initialData, isEditMode]);

    const [formData, setFormData] = useState(getInitialFormState);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        console.log("CalcTypeAssociationForm RE-SYNC/POPULATE: isEditMode:", isEditMode, "initialData:", initialData);
        setFormData(getInitialFormState());
        setErrors({});
    }, [initialData, isEditMode, getInitialFormState]);


    const validate = () => {
        const newErrors = {};
        if (!isEditMode && !formData.CalcTypeType) {
            newErrors.CalcTypeType = 'A Calculation Type must be selected.';
        }
        if (!formData.CalcfactcolCubeSuffix.trim()) newErrors.CalcfactcolCubeSuffix = 'Cube Suffix is required.';
        else if (formData.CalcfactcolCubeSuffix.length > 25) newErrors.CalcfactcolCubeSuffix = 'Cube Suffix max 25 chars.';

        if (!formData.CalcfactcolPresSuffix.trim()) newErrors.CalcfactcolPresSuffix = 'Presentation Suffix is required.';
        else if (formData.CalcfactcolPresSuffix.length > 25) newErrors.CalcfactcolPresSuffix = 'Pres. Suffix max 25 chars.';

        if (!formData.CalcfactcolVisible) newErrors.CalcfactcolVisible = 'Visible option is required.';

        // Validation for the 10 specific calctype fields (if they are part of this table as per your last schema)
        // For example, check if they are within the allowed list from RDL_CALC_TYPE_IDENTIFIERS
        // (This would require RDL_CALC_TYPE_IDENTIFIERS to be imported)
        const calcTypeFieldsToValidate = [
            'RdlgroupfactcolRdlsimpleCalctype0', 'RdlgroupfactcolRdlsimpleCalctype1',
            'RdlgroupfactcolRdlsimpleCalctype2', 'RdlgroupfactcolRdlsimpleCalctype3',
            'RdlgroupfactcolRdlsimpleCalctype4', 'RdlgroupfactcolRdlcomplexCalctype0',
            'RdlgroupfactcolRdlcomplexCalctype1', 'RdlgroupfactcolRdlcomplexCalctype2',
            'RdlgroupfactcolRdlcomplexCalctype3', 'RdlgroupfactcolRdlcomplexCalctype4'
        ];
        // Assuming RDL_CALC_TYPE_IDENTIFIERS is imported from '../constants/calcTypeFactColEnums'
        // import { RDL_CALC_TYPE_IDENTIFIERS } from '../constants/calcTypeFactColEnums';
        // calcTypeFieldsToValidate.forEach(field => {
        //     if (formData[field] && !RDL_CALC_TYPE_IDENTIFIERS.includes(formData[field])) {
        //         newErrors[field] = `Invalid calculation type selected for ${field.replace('RdlgroupfactcolRdl', '').replace('Calctype', ' Calc Type ')}.`;
        //     }
        // });


        if (isEditMode && !formData.CalcfactcolTimestamp) newErrors.form = "Timestamp is missing for update.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if(errors[name]) setErrors(prev => ({...prev, [name]: null}));
        if(errors.form && Object.keys(errors).length === 1) setErrors({}); // Clear general form error if only it exists
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) { setErrors(prev => ({...prev, form: "Please correct errors."})); return; }

        const submissionData = {
            FactcolIdPk: currentFactColIdPk, // From parent manager context
            CalcTypeType: formData.CalcTypeType,
            CalcfactcolCubeSuffix: formData.CalcfactcolCubeSuffix.trim(),
            CalcfactcolPresSuffix: formData.CalcfactcolPresSuffix.trim(),
            CalcfactcolVisible: formData.CalcfactcolVisible,
            CalcfactcolTypeForFormat: formData.CalcfactcolTypeForFormat || null,
            CalcfactcolShowTotalInRdl: formData.CalcfactcolShowTotalInRdl || null,
            CalcfactcolMdxFormula: formData.CalcfactcolMdxFormula.trim() === '' ? null : formData.CalcfactcolMdxFormula.trim(),
            CalcfactcolComments: formData.CalcfactcolComments.trim() === '' ? null : formData.CalcfactcolComments.trim(),
            CalcfactcolDisplayFolder: formData.CalcfactcolDisplayFolder.trim() === '' ? null : formData.CalcfactcolDisplayFolder.trim(),
            // Add the 10 specific calctype fields if they are part of this DTO/entity
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
        if (isEditMode) submissionData.CalcfactcolTimestamp = formData.CalcfactcolTimestamp;

        try { await onSubmit(submissionData); }
        catch (error) { /* ... standard error display ... */ }
    };

    // Filter availableCalcTypes for "Add" mode dropdown
    const calcTypesForDropdown = isEditMode || !availableCalcTypes
        ? availableCalcTypes // For edit, just need to find the current one if displaying name
        : availableCalcTypes.filter(ct =>
            !existingCalcTypeAssociationsForFactCol?.some(assoc => assoc.calcTypeType === ct.calcTypeType)
        );

    // For the 10 calculation type dropdowns
    const calcTypeFieldsDefinition = [
        { name: "RdlgroupfactcolRdlsimpleCalctype0", label: "Simple Calc 0" }, { name: "RdlgroupfactcolRdlsimpleCalctype1", label: "Simple Calc 1" },
        { name: "RdlgroupfactcolRdlsimpleCalctype2", label: "Simple Calc 2" }, { name: "RdlgroupfactcolRdlsimpleCalctype3", label: "Simple Calc 3" },
        { name: "RdlgroupfactcolRdlsimpleCalctype4", label: "Simple Calc 4" }, { name: "RdlgroupfactcolRdlcomplexCalctype0", label: "Complex Calc 0" },
        { name: "RdlgroupfactcolRdlcomplexCalctype1", label: "Complex Calc 1" }, { name: "RdlgroupfactcolRdlcomplexCalctype2", label: "Complex Calc 2" },
        { name: "RdlgroupfactcolRdlcomplexCalctype3", label: "Complex Calc 3" }, { name: "RdlgroupfactcolRdlcomplexCalctype4", label: "Complex Calc 4" },
    ];


    return (
        <form onSubmit={handleSubmit} className="calctype-association-form">
            <h4>{isEditMode ? `Edit Settings for CalcType '${formData.CalcTypeType}' on FactCol ${currentFactColIdPk}` : `Associate CalcType with FactCol ${currentFactColIdPk}`}</h4>
            {errors.form && <p className="error-message">{errors.form}</p>}

            {!isEditMode && (
                <div className="form-group">
                    <label htmlFor="CalcTypeTypeFormAssoc">Calculation Type (*)</label>
                    <select id="CalcTypeTypeFormAssoc" name="CalcTypeType" value={formData.CalcTypeType} onChange={handleChange} required>
                        <option value="">--- Select Calculation Type ---</option>
                        {/* availableCalcTypes is array of CalcTypeDto {calcTypeType, calcTypeComments} */}
                        {calcTypesForDropdown && calcTypesForDropdown.map(ct => (
                            <option key={ct.calcTypeType} value={ct.calcTypeType}>
                                {ct.calcTypeComments} ({ct.calcTypeType})
                            </option>
                        ))}
                        {(!calcTypesForDropdown || calcTypesForDropdown.length === 0) && <option value="" disabled>No new types to associate.</option>}
                    </select>
                    {errors.CalcTypeType && <p className="error-message">{errors.CalcTypeType}</p>}
                </div>
            )}
            {isEditMode && (
                <div className="form-group">
                    <label>Calculation Type (Fixed)</label>
                    <input type="text" value={formData.CalcTypeType} readOnly disabled />
                </div>
            )}

            <fieldset>
                <legend>Association Attributes</legend>
                <div className="form-group">
                    <label htmlFor="CalcfactcolCubeSuffixForm">Cube Suffix (*)</label>
                    <input type="text" id="CalcfactcolCubeSuffixForm" name="CalcfactcolCubeSuffix" value={formData.CalcfactcolCubeSuffix} onChange={handleChange} maxLength="25" required />
                    {errors.CalcfactcolCubeSuffix && <p className="error-message">{errors.CalcfactcolCubeSuffix}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="CalcfactcolPresSuffixForm">Presentation Suffix (*)</label>
                    <input type="text" id="CalcfactcolPresSuffixForm" name="CalcfactcolPresSuffix" value={formData.CalcfactcolPresSuffix} onChange={handleChange} maxLength="25" required />
                    {errors.CalcfactcolPresSuffix && <p className="error-message">{errors.CalcfactcolPresSuffix}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="CalcfactcolVisibleForm">Visible (*)</label>
                    <select id="CalcfactcolVisibleForm" name="CalcfactcolVisible" value={formData.CalcfactcolVisible} onChange={handleChange} required>
                        {getDropdownOptions(CALCFACTCOL_VISIBLE_OPTIONS).map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    {errors.CalcfactcolVisible && <p className="error-message">{errors.CalcfactcolVisible}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="CalcfactcolTypeForFormatForm">Type for Formatting (Optional)</label>
                    <select id="CalcfactcolTypeForFormatForm" name="CalcfactcolTypeForFormat" value={formData.CalcfactcolTypeForFormat || ''} onChange={handleChange}>
                        {getOptionalDropdownOptions(CALCFACTCOL_TYPEFORFORMAT_OPTIONS, "--- Default ---").map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    {errors.CalcfactcolTypeForFormat && <p className="error-message">{errors.CalcfactcolTypeForFormat}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="CalcfactcolShowTotalInRdlForm">Show Total in RDL (Optional)</label>
                    <select id="CalcfactcolShowTotalInRdlForm" name="CalcfactcolShowTotalInRdl" value={formData.CalcfactcolShowTotalInRdl || ''} onChange={handleChange}>
                        {getOptionalDropdownOptions(CALCFACTCOL_SHOWTOTALINRDL_OPTIONS, "--- Default ---").map(o => <option key={o.value} value={o.value}>{o.label === 'RDLSHTOTY' ? 'Yes' : (o.label === 'RDLSHTOTN' ? 'No' : o.label)}</option>)}
                    </select>
                    {errors.CalcfactcolShowTotalInRdl && <p className="error-message">{errors.CalcfactcolShowTotalInRdl}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="CalcfactcolMdxFormulaForm">MDX Formula (Optional)</label>
                    <textarea id="CalcfactcolMdxFormulaForm" name="CalcfactcolMdxFormula" value={formData.CalcfactcolMdxFormula} onChange={handleChange} rows="4" />
                    {errors.CalcfactcolMdxFormula && <p className="error-message">{errors.CalcfactcolMdxFormula}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="CalcfactcolDisplayFolderForm">Display Folder (Optional)</label>
                    <input type="text" id="CalcfactcolDisplayFolderForm" name="CalcfactcolDisplayFolder" value={formData.CalcfactcolDisplayFolder} onChange={handleChange} maxLength="100" />
                    {errors.CalcfactcolDisplayFolder && <p className="error-message">{errors.CalcfactcolDisplayFolder}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="CalcfactcolCommentsForm">Comments (Optional)</label>
                    <textarea id="CalcfactcolCommentsForm" name="CalcfactcolComments" value={formData.CalcfactcolComments} onChange={handleChange} rows="3" />
                    {errors.CalcfactcolComments && <p className="error-message">{errors.CalcfactcolComments}</p>}
                </div>
            </fieldset>

            <fieldset>
                <legend>Specific Calculation Type Overrides (Optional)</legend>
                {calcTypeFieldsDefinition.map(field => (
                    <div className="form-group" key={field.name}>
                        <label htmlFor={`${field.name}Form`}>{field.label}</label>
                        <select
                            id={`${field.name}Form`}
                            name={field.name}
                            value={formData[field.name] || ''}
                            onChange={handleChange}
                        >
                            {/* Uses getCalcTypeDropdownOptions from calcTypeFactColEnums */}
                            {getCalcTypeDropdownOptions().map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        {errors[field.name] && <p className="error-message">{errors[field.name]}</p>}
                    </div>
                ))}
            </fieldset>

            <div className="form-actions">
                <button type="submit" className="primary">{isEditMode ? 'Save Settings' : 'Associate & Set Settings'}</button>
                <button type="button" className="secondary" onClick={onCancel}>Cancel</button>
            </div>
        </form>
    );
};
export default CalcTypeAssociationForm;