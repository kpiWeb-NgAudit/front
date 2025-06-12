// src/components/DimColumnForm.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    DIMCOL_USE_OPTIONS, DIMCOL_PURGEWHENVIRT_OPTIONS, DIMCOL_TYPE_OPTIONS,
    DIMCOL_CUBEPROC_OPTIONS, DIMCOL_CUBEVISIBLE_OPTIONS, DIMCOL_RDLSHOWFILTER_OPTIONS,
    DIMCOL_CONSTRAINTTYPE_OPTIONS, DIMCOL_DRILLTHROUGH_OPTIONS, DIMCOL_INDEXDATAMART_OPTIONS,
    getDropdownOptions, getOptionalDropdownOptions
} from '../constants/dimColumnEnums';

// Helper for consistent key transformation
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


const DimColumnForm = ({ onSubmit, onCancel, initialData = {}, parentDimensionId, isEditMode = false }) => {
    const getInitialFormState = useCallback(() => ({
        DimcolIdPk: '', // Client provides for new
        DimcolCname: '',
        DimcolUse: DIMCOL_USE_OPTIONS[0] || '',
        DimcolPurgewhenvirt: '', // Optional
        DimcolType: DIMCOL_TYPE_OPTIONS[0] || '',
        DimcolShortCubeName: '',
        DimcolShortPresName: '',
        DimcolWorkOrder: 0,
        DimcolCubeType: '', // Should this come from parent dimension? Or be set here?
        DimcolCubeProc: DIMCOL_CUBEPROC_OPTIONS[0] || '',
        DimcolCubeSort: '', // Nullable int
        DimcolCubeFormula: '', // Nullable string
        DimcolCubeVisible: DIMCOL_CUBEVISIBLE_OPTIONS[0] || '',
        DimcolRdlShowFilter: DIMCOL_RDLSHOWFILTER_OPTIONS[0] || '',
        DimcolConstraintType: DIMCOL_CONSTRAINTTYPE_OPTIONS[0] || '',
        DimcolDrillThrough: DIMCOL_DRILLTHROUGH_OPTIONS[0] || '',
        DimcolAttributeRelation: '', // Nullable int
        DimcolPropertyName: '', // Nullable int
        DimcolPropertyValue: '', // Nullable int
        DimcolDisplayFolder: '', // Nullable string
        DimcolDefaultMember: '', // Nullable string
        DimcolIndexDataMart: DIMCOL_INDEXDATAMART_OPTIONS[0] || '',
        DimcolComments: '', // Nullable string
        DimIdPk: parentDimensionId || '', // FK to Parent Dimension, pre-filled
        DimcolTimestamp: null, // For edit
    }), [parentDimensionId]);

    const [formData, setFormData] = useState(getInitialFormState());
    const [errors, setErrors] = useState({});

    useEffect(() => {
        let populatedState = { ...getInitialFormState() }; // Start with defaults including parentDimensionId

        if (isEditMode && initialData) {
            for (const backendKey in initialData) {
                if (initialData.hasOwnProperty(backendKey)) {
                    const formKey = snakeToPascal(backendKey);
                    if (populatedState.hasOwnProperty(formKey)) {
                        const value = initialData[backendKey];
                        if (value === null || typeof value === 'undefined') {
                            populatedState[formKey] = '';
                        } else if (typeof value === 'number') {
                            populatedState[formKey] = String(value);
                        } else if (formKey === 'DimcolTimestamp' && value) {
                            populatedState[formKey] = value;
                        }
                        else {
                            populatedState[formKey] = value;
                        }
                    }
                }
            }
            // Ensure PK is set correctly from initialData for edit mode
            if (initialData.dimcol_id_pk) {
                populatedState.DimcolIdPk = String(initialData.dimcol_id_pk);
            }
            // Parent DimIdPk should come from initialData if it's there, otherwise from prop
            if (initialData.dim_id_pk) {
                populatedState.DimIdPk = String(initialData.dim_id_pk);
            }

        } else if (!isEditMode) {
            // For new, DimIdPk is already set by getInitialFormState via parentDimensionId
            // If parentDimensionId was passed to initialData for some reason, it would also work.
            if (initialData && initialData.DimIdPk) { // For pre-fill on create if needed
                populatedState.DimIdPk = initialData.DimIdPk;
            }
        }
        setFormData(populatedState);
        setErrors({}); // Clear errors when form is (re)initialized
    }, [initialData, isEditMode, getInitialFormState, parentDimensionId]);


    const validate = () => {
        const newErrors = {};
        if (!isEditMode && (formData.DimcolIdPk === '' || isNaN(parseInt(formData.DimcolIdPk)))) {
            newErrors.DimcolIdPk = 'Column ID is required and must be a number.';
        }
        if (!formData.DimcolCname) newErrors.DimcolCname = 'Column Name (CName) is required.';
        else if (formData.DimcolCname.length > 100) newErrors.DimcolCname = 'CName max 100 chars.';
        if (!formData.DimcolUse) newErrors.DimcolUse = 'Use type is required.';
        if (formData.DimcolPurgewhenvirt && formData.DimcolPurgewhenvirt.length > 5) newErrors.DimcolPurgewhenvirt = 'Purge When Virt max 5 chars.';
        if (!formData.DimcolType) newErrors.DimcolType = 'Data Type is required.';
        if (!formData.DimcolShortCubeName) newErrors.DimcolShortCubeName = 'Short Cube Name is required.';
        else if (formData.DimcolShortCubeName.length > 30) newErrors.DimcolShortCubeName = 'Short Cube Name max 30 chars.';
        if (!formData.DimcolShortPresName) newErrors.DimcolShortPresName = 'Short Pres. Name is required.';
        else if (formData.DimcolShortPresName.length > 30) newErrors.DimcolShortPresName = 'Short Pres. Name max 30 chars.';
        if (formData.DimcolWorkOrder === '' || isNaN(parseInt(formData.DimcolWorkOrder))) newErrors.DimcolWorkOrder = 'Work Order must be a number.';
        if (!formData.DimcolCubeType) newErrors.DimcolCubeType = 'Cube Type is required.';
        else if (formData.DimcolCubeType.length > 20) newErrors.DimcolCubeType = 'Cube Type max 20 chars.';
        if (!formData.DimcolCubeProc) newErrors.DimcolCubeProc = 'Cube Process option is required.';

        const nullableIntFieldsToValidate = ['DimcolCubeSort', 'DimcolAttributeRelation', 'DimcolPropertyName', 'DimcolPropertyValue'];
        nullableIntFieldsToValidate.forEach(field => {
            if (formData[field] !== '' && formData[field] !== null && isNaN(parseInt(formData[field]))) {
                newErrors[field] = `${field.replace('Dimcol','')} must be a number if provided.`;
            }
        });

        if (formData.DimcolCubeFormula && formData.DimcolCubeFormula.length > 4000) newErrors.DimcolCubeFormula = 'Cube Formula max 4000 chars.';
        if (!formData.DimcolCubeVisible) newErrors.DimcolCubeVisible = 'Cube Visible option is required.';
        if (!formData.DimcolRdlShowFilter) newErrors.DimcolRdlShowFilter = 'RDL Show Filter option is required.';
        if (!formData.DimcolConstraintType) newErrors.DimcolConstraintType = 'Constraint Type is required.';
        if (!formData.DimcolDrillThrough) newErrors.DimcolDrillThrough = 'Drill Through option is required.';
        if (formData.DimcolDisplayFolder && formData.DimcolDisplayFolder.length > 50) newErrors.DimcolDisplayFolder = 'Display Folder max 50 chars.';
        if (formData.DimcolDefaultMember && formData.DimcolDefaultMember.length > 100) newErrors.DimcolDefaultMember = 'Default Member max 100 chars.';
        if (!formData.DimcolIndexDataMart) newErrors.DimcolIndexDataMart = 'Index Data Mart option is required.';
        if (!formData.DimIdPk) newErrors.DimIdPk = 'Parent Dimension ID is missing.'; // Should be pre-filled

        if (isEditMode && !formData.DimcolTimestamp) newErrors.form = "Timestamp is missing for update.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({...prev, [name]: null}));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) {
            setErrors(prev => ({...prev, form: "Please correct the errors."}));
            return;
        }
        const submissionData = { ...formData };

        // Convert to integers / nulls
        const intFields = ['DimcolWorkOrder'];
        if (!isEditMode) intFields.push('DimcolIdPk');
        intFields.forEach(f => submissionData[f] = (submissionData[f] !== '' && !isNaN(submissionData[f])) ? parseInt(submissionData[f], 10) : 0);

        const nullableIntFields = ['DimcolCubeSort', 'DimcolAttributeRelation', 'DimcolPropertyName', 'DimcolPropertyValue'];
        nullableIntFields.forEach(f => submissionData[f] = (submissionData[f] === '' || submissionData[f] === null || isNaN(parseInt(submissionData[f]))) ? null : parseInt(submissionData[f], 10));

        const optionalStringFields = ['DimcolPurgewhenvirt', 'DimcolCubeFormula', 'DimcolDisplayFolder', 'DimcolDefaultMember', 'DimcolComments'];
        optionalStringFields.forEach(f => { if (submissionData[f] === "") submissionData[f] = null; });

        submissionData.DimIdPk = parseInt(submissionData.DimIdPk, 10); // Ensure parent DimIdPk is int

        if (!isEditMode) delete submissionData.DimcolTimestamp;

        try {
            await onSubmit(submissionData);
        } catch (error) {
            console.error("Submission error in DimColumnForm:", error);
            const errorMsg = error.response?.data?.message || error.response?.data?.title || error.message || 'Submission failed.';
            setErrors(prev => ({ ...prev, form: errorMsg }));
            if (error.response?.data?.errors) {
                const backendFieldErrors = {};
                for (const key in error.response.data.errors) {
                    backendFieldErrors[snakeToPascal(key)] = error.response.data.errors[key].join(', ');
                }
                setErrors(prev => ({ ...prev, ...backendFieldErrors }));
            }
            throw error; // Re-throw for parent component if needed
        }
    };
    // Group fields into fieldsets for better organization
    const generalFields = ['DimcolIdPk', 'DimcolCname', 'DimcolUse', 'DimcolPurgewhenvirt', 'DimcolType'];
    const cubeRelatedFields = ['DimcolShortCubeName', 'DimcolShortPresName', 'DimcolWorkOrder', 'DimcolCubeType', 'DimcolCubeProc', 'DimcolCubeSort', 'DimcolCubeFormula', 'DimcolCubeVisible'];
    const rdlAndConstraintFields = ['DimcolRdlShowFilter', 'DimcolConstraintType', 'DimcolDrillThrough', 'DimcolIndexDataMart'];
    const fkAndOtherFields = ['DimcolAttributeRelation', 'DimcolPropertyName', 'DimcolPropertyValue', 'DimcolDisplayFolder', 'DimcolDefaultMember', 'DimcolComments'];


    return (
        <form onSubmit={handleSubmit} className="dimcolumn-form" style={{ border: '1px solid #ccc', padding: '15px', marginTop: '10px', marginBottom: '20px' }}>
            <h4>{isEditMode ? `Edit Dimension Column (ID: ${formData.DimcolIdPk})` : 'Add New Dimension Column'}</h4>
            {errors.form && <p className="error-message" style={{color: 'red', fontWeight: 'bold'}}>{errors.form}</p>}
            <p>Parent Dimension ID: {formData.DimIdPk || "Not set"}</p>


            <fieldset>
                <legend>Basic Column Info</legend>
                <div className="form-group">
                    <label htmlFor="DimcolIdPk">Column ID (*)</label>
                    <input type="number" name="DimcolIdPk" value={formData.DimcolIdPk} onChange={handleChange} required readOnly={isEditMode} />
                    {errors.DimcolIdPk && <p className="error-message">{errors.DimcolIdPk}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="DimcolCname">Column Name (CName) (*)</label>
                    <input type="text" name="DimcolCname" value={formData.DimcolCname} onChange={handleChange} maxLength="100" required />
                    {errors.DimcolCname && <p className="error-message">{errors.DimcolCname}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="DimcolUse">Use (*)</label>
                    <select name="DimcolUse" value={formData.DimcolUse} onChange={handleChange} required>
                        {getDropdownOptions(DIMCOL_USE_OPTIONS).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    {errors.DimcolUse && <p className="error-message">{errors.DimcolUse}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="DimcolType">Data Type (*)</label>
                    <select name="DimcolType" value={formData.DimcolType} onChange={handleChange} required>
                        {getDropdownOptions(DIMCOL_TYPE_OPTIONS).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    {errors.DimcolType && <p className="error-message">{errors.DimcolType}</p>}
                </div>
            </fieldset>

            <fieldset>
                <legend>Cube Representation</legend>
                <div className="form-group">
                    <label htmlFor="DimcolShortCubeName">Short Cube Name (*)</label>
                    <input type="text" name="DimcolShortCubeName" value={formData.DimcolShortCubeName} onChange={handleChange} maxLength="30" required />
                    {errors.DimcolShortCubeName && <p className="error-message">{errors.DimcolShortCubeName}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="DimcolShortPresName">Short Presentation Name (*)</label>
                    <input type="text" name="DimcolShortPresName" value={formData.DimcolShortPresName} onChange={handleChange} maxLength="30" required />
                    {errors.DimcolShortPresName && <p className="error-message">{errors.DimcolShortPresName}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="DimcolWorkOrder">Work Order (*)</label>
                    <input type="number" name="DimcolWorkOrder" value={formData.DimcolWorkOrder} onChange={handleChange} required />
                    {errors.DimcolWorkOrder && <p className="error-message">{errors.DimcolWorkOrder}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="DimcolCubeType">Cube Type (*)</label>
                    <input type="text" name="DimcolCubeType" value={formData.DimcolCubeType} onChange={handleChange} maxLength="20" required />
                    {/* Consider if this should be a dropdown based on dimension.dim_cubetype or a fixed list */}
                    {errors.DimcolCubeType && <p className="error-message">{errors.DimcolCubeType}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="DimcolCubeProc">Cube Process (*)</label>
                    <select name="DimcolCubeProc" value={formData.DimcolCubeProc} onChange={handleChange} required>
                        {getDropdownOptions(DIMCOL_CUBEPROC_OPTIONS).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    {errors.DimcolCubeProc && <p className="error-message">{errors.DimcolCubeProc}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="DimcolCubeVisible">Cube Visible (*)</label>
                    <select name="DimcolCubeVisible" value={formData.DimcolCubeVisible} onChange={handleChange} required>
                        {getDropdownOptions(DIMCOL_CUBEVISIBLE_OPTIONS).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    {errors.DimcolCubeVisible && <p className="error-message">{errors.DimcolCubeVisible}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="DimcolCubeFormula">Cube Formula (Optional)</label>
                    <textarea name="DimcolCubeFormula" value={formData.DimcolCubeFormula} onChange={handleChange} maxLength="4000" rows="3" />
                    {errors.DimcolCubeFormula && <p className="error-message">{errors.DimcolCubeFormula}</p>}
                </div>
            </fieldset>

            <fieldset>
                <legend>Settings & Behavior</legend>
                <div className="form-group">
                    <label htmlFor="DimcolPurgewhenvirt">Purge When Virt (Optional)</label>
                    <select name="DimcolPurgewhenvirt" value={formData.DimcolPurgewhenvirt} onChange={handleChange}>
                        {getOptionalDropdownOptions(DIMCOL_PURGEWHENVIRT_OPTIONS, "--- Not Purged ---").map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    {errors.DimcolPurgewhenvirt && <p className="error-message">{errors.DimcolPurgewhenvirt}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="DimcolRdlShowFilter">RDL Show Filter (*)</label>
                    <select name="DimcolRdlShowFilter" value={formData.DimcolRdlShowFilter} onChange={handleChange} required>
                        {getDropdownOptions(DIMCOL_RDLSHOWFILTER_OPTIONS).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    {errors.DimcolRdlShowFilter && <p className="error-message">{errors.DimcolRdlShowFilter}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="DimcolConstraintType">Constraint Type (*)</label>
                    <select name="DimcolConstraintType" value={formData.DimcolConstraintType} onChange={handleChange} required style={{maxWidth: '100%'}}>
                        {getDropdownOptions(DIMCOL_CONSTRAINTTYPE_OPTIONS).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    {errors.DimcolConstraintType && <p className="error-message">{errors.DimcolConstraintType}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="DimcolDrillThrough">Drill Through (*)</label>
                    <select name="DimcolDrillThrough" value={formData.DimcolDrillThrough} onChange={handleChange} required>
                        {getDropdownOptions(DIMCOL_DRILLTHROUGH_OPTIONS).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    {errors.DimcolDrillThrough && <p className="error-message">{errors.DimcolDrillThrough}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="DimcolIndexDataMart">Index Data Mart (*)</label>
                    <select name="DimcolIndexDataMart" value={formData.DimcolIndexDataMart} onChange={handleChange} required>
                        {getDropdownOptions(DIMCOL_INDEXDATAMART_OPTIONS).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    {errors.DimcolIndexDataMart && <p className="error-message">{errors.DimcolIndexDataMart}</p>}
                </div>
            </fieldset>

            <fieldset>
                <legend>Optional FKs & Details</legend>
                <div className="form-group">
                    <label htmlFor="DimcolCubeSort">Cube Sort (FK - Optional)</label>
                    <input type="number" name="DimcolCubeSort" value={formData.DimcolCubeSort} onChange={handleChange} />
                    {errors.DimcolCubeSort && <p className="error-message">{errors.DimcolCubeSort}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="DimcolAttributeRelation">Attribute Relation (FK - Optional)</label>
                    <input type="number" name="DimcolAttributeRelation" value={formData.DimcolAttributeRelation} onChange={handleChange} />
                    {errors.DimcolAttributeRelation && <p className="error-message">{errors.DimcolAttributeRelation}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="DimcolPropertyName">Property Name (FK - Optional)</label>
                    <input type="number" name="DimcolPropertyName" value={formData.DimcolPropertyName} onChange={handleChange} />
                    {errors.DimcolPropertyName && <p className="error-message">{errors.DimcolPropertyName}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="DimcolPropertyValue">Property Value (FK - Optional)</label>
                    <input type="number" name="DimcolPropertyValue" value={formData.DimcolPropertyValue} onChange={handleChange} />
                    {errors.DimcolPropertyValue && <p className="error-message">{errors.DimcolPropertyValue}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="DimcolDisplayFolder">Display Folder (Optional)</label>
                    <input type="text" name="DimcolDisplayFolder" value={formData.DimcolDisplayFolder} onChange={handleChange} maxLength="50" />
                    {errors.DimcolDisplayFolder && <p className="error-message">{errors.DimcolDisplayFolder}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="DimcolDefaultMember">Default Member (Optional)</label>
                    <input type="text" name="DimcolDefaultMember" value={formData.DimcolDefaultMember} onChange={handleChange} maxLength="100" />
                    {errors.DimcolDefaultMember && <p className="error-message">{errors.DimcolDefaultMember}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="DimcolComments">Comments (Optional)</label>
                    <textarea name="DimcolComments" value={formData.DimcolComments} onChange={handleChange} rows="3" />
                    {errors.DimcolComments && <p className="error-message">{errors.DimcolComments}</p>}
                </div>
            </fieldset>

            <div className="form-actions">
                <button type="submit" className="primary">{isEditMode ? 'Update Column' : 'Add Column'}</button>
                <button type="button" className="secondary" onClick={onCancel} style={{ marginLeft: '10px' }}>Cancel</button>
            </div>
        </form>
    );
};

export default DimColumnForm;