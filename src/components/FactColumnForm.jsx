// src/components/FactColumnForm.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getAllFacts } from '../api/factService';
import { getAllDimColumns } from '../api/dimColumnService';
import {
    FACTCOL_USE_OPTIONS, FACTCOL_TYPE_OPTIONS, FACTCOL_CUBEVISIBLE_OPTIONS,
    FACTCOL_CUBEAGGREGAT_OPTIONS, FACTCOL_INDEXDATAMART_OPTIONS,
    getDropdownOptions, getOptionalDropdownOptions
} from '../constants/factColumnEnums';

// Helper for consistent key transformation
const snakeToPascal = (str) => {
    if (!str) return str;
    if (str.toLowerCase().endsWith("_pk")) {
        const prefix = str.substring(0, str.length - 3);
        return prefix.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join('') + 'Pk';
    }
    let s = str;
    if (s.startsWith("factcol_")) s = s.substring(8);
    else if (s.startsWith("dimcol_")) s = s.substring(7);
    else if (s.startsWith("fact_")) s = s.substring(5);
    return s.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join('');
};

const FactColumnForm = ({ onSubmit, onCancel, initialData = {}, parentFactIdPk, isEditMode = false }) => {
    const [facts, setFacts] = useState([]); // For parent fact dropdown (if adding globally)
    const [dimColumns, setDimColumns] = useState([]); // For linked dimension column dropdown
    const [loadingDropdowns, setLoadingDropdowns] = useState(true);

    const getInitialFormState = useCallback(() => {
        return {
            FactcolIdPk: '',
            FactcolCname: '',
            FactcolUse: FACTCOL_USE_OPTIONS[0] || '',
            FactcolType: FACTCOL_TYPE_OPTIONS[0] || '',
            DimcolIdPk: '', // Nullable int, empty string for form
            FactcolShortCubeName: '',
            FactcolShortPresName: '',
            FactcolWorkOrder: 0,
            FactcolCubeVisible: FACTCOL_CUBEVISIBLE_OPTIONS[0] || '',
            FactcolCubeAggregat: FACTCOL_CUBEAGGREGAT_OPTIONS[0] || '',
            FactcolCubeFormula: '',
            FactcolIndexDataMart: FACTCOL_INDEXDATAMART_OPTIONS[0] || '',
            FactcolComments: '',
            FactcolDisplayFolder: '',
            FactIdPk: parentFactIdPk || '', // FK to Parent Fact, pre-filled
            FactcolTimestamp: null,
        };
    }, [parentFactIdPk]);

    const [formData, setFormData] = useState(getInitialFormState);
    const [errors, setErrors] = useState({});

    // Fetch data for dropdowns
    useEffect(() => {
        setLoadingDropdowns(true);
        const fetches = [];
        // Fetch parent facts only if adding globally and parentFactIdPk is not set
        if (!isEditMode && !parentFactIdPk) {
            fetches.push(getAllFacts({ pageSize: 1000 }).then(res => Array.isArray(res.data) ? res.data : []));
        } else {
            fetches.push(Promise.resolve(facts)); // Keep existing or empty for facts
        }
        // Always fetch all dimension columns (could be filtered later if too many)
        fetches.push(getAllDimColumns({ pageSize: 2000 }).then(res => Array.isArray(res.data) ? res.data : []));

        Promise.allSettled(fetches)
            .then(([factRes, dimColRes]) => {
                if (factRes.status === 'fulfilled' && factRes.value) setFacts(factRes.value);
                else if (factRes.status === 'rejected' && !isEditMode && !parentFactIdPk) console.error("Failed to load facts for dropdown:", factRes.reason);

                if (dimColRes.status === 'fulfilled' && dimColRes.value) setDimColumns(dimColRes.value);
                else console.error("Failed to load dimension columns for dropdown:", dimColRes.reason);
            })
            .catch(err => console.error("Error fetching dropdown data for FactColumnForm", err))
            .finally(() => setLoadingDropdowns(false));
    }, [isEditMode, parentFactIdPk]); // facts.length removed as it caused loops


    // Populate/Reset form based on props
    useEffect(() => {
        let newFormState = getInitialFormState();
        if (isEditMode && initialData && Object.keys(initialData).length > 0) {
            newFormState = { ...newFormState };
            for (const backendKey in initialData) {
                if (initialData.hasOwnProperty(backendKey)) {
                    const formKey = initialData.hasOwnProperty(snakeToPascal(backendKey)) ? snakeToPascal(backendKey) : backendKey;
                    if (newFormState.hasOwnProperty(formKey)) {
                        const value = initialData[backendKey];
                        if (value === null || typeof value === 'undefined') newFormState[formKey] = '';
                        else if (typeof value === 'number') newFormState[formKey] = String(value);
                        else if (formKey === 'FactcolTimestamp' && value) newFormState[formKey] = value;
                        else newFormState[formKey] = value;
                    }
                }
            }
            if (initialData.factcolIdPk !== undefined) newFormState.FactcolIdPk = String(initialData.factcolIdPk);
            else if (initialData.factcol_id_pk !== undefined) newFormState.FactcolIdPk = String(initialData.factcol_id_pk);

            if (initialData.factIdPk !== undefined) newFormState.FactIdPk = String(initialData.factIdPk);
            else if (initialData.fact_id_pk !== undefined) newFormState.FactIdPk = String(initialData.fact_id_pk);

            if (initialData.dimcolIdPk !== undefined) newFormState.DimcolIdPk = initialData.dimcolIdPk === null ? '' : String(initialData.dimcolIdPk);
            else if (initialData.dimcol_id_pk !== undefined) newFormState.DimcolIdPk = initialData.dimcol_id_pk === null ? '' : String(initialData.dimcol_id_pk);

        } else if (!isEditMode && initialData && Object.keys(initialData).length > 0) {
            newFormState = { ...newFormState, ...initialData }; // For create mode pre-fills
            if (parentFactIdPk) newFormState.FactIdPk = parentFactIdPk;
        }
        setFormData(newFormState);
        setErrors({});
    }, [initialData, isEditMode, parentFactIdPk, getInitialFormState]);


    const validate = () => {
        const newErrors = {};
        if (!isEditMode && (formData.FactcolIdPk === '' || isNaN(parseInt(formData.FactcolIdPk)) || parseInt(formData.FactcolIdPk) <= 0)) {
            newErrors.FactcolIdPk = 'Column ID is required and must be a positive number.';
        }
        if (!formData.FactcolCname.trim()) newErrors.FactcolCname = 'Column Name (CName) is required.';
        else if (formData.FactcolCname.length > 100) newErrors.FactcolCname = 'CName max 100 chars.';
        if (!formData.FactcolUse) newErrors.FactcolUse = 'Use type is required.';
        if (!formData.FactcolType) newErrors.FactcolType = 'Data Type is required.';
        if (formData.FactcolUse === 'FK' && !formData.DimcolIdPk) {
            newErrors.DimcolIdPk = 'Dimension Column is required when Use type is FK.';
        }
        if (!formData.FactcolShortCubeName.trim()) newErrors.FactcolShortCubeName = 'Short Cube Name is required.';
        else if (formData.FactcolShortCubeName.length > 30) newErrors.FactcolShortCubeName = 'Short Cube Name max 30 chars.';
        if (!formData.FactcolShortPresName.trim()) newErrors.FactcolShortPresName = 'Short Pres. Name is required.';
        else if (formData.FactcolShortPresName.length > 30) newErrors.FactcolShortPresName = 'Short Pres. Name max 30 chars.';

        if (formData.FactcolWorkOrder === '' || isNaN(parseInt(formData.FactcolWorkOrder))) newErrors.FactcolWorkOrder = 'Work Order must be a number.';
        else if (parseInt(formData.FactcolWorkOrder) < 0) newErrors.FactcolWorkOrder = 'Work Order cannot be negative.';

        if (!formData.FactcolCubeVisible) newErrors.FactcolCubeVisible = 'Cube Visible option is required.';
        if (!formData.FactcolCubeAggregat) newErrors.FactcolCubeAggregat = 'Cube Aggregation is required.';
        if (!formData.FactcolIndexDataMart) newErrors.FactcolIndexDataMart = 'Index Data Mart option is required.';
        if (!formData.FactIdPk) newErrors.FactIdPk = 'Parent Fact ID is required.';

        if (isEditMode && !formData.FactcolTimestamp) newErrors.form = "Timestamp missing for update.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if(errors[name] || errors.form) setErrors(prev => {
            const newErr = {...prev}; delete newErr[name];
            if(Object.keys(newErr).filter(k=>k!=='form').length === 0 && prev.form === "Please correct errors.") delete newErr.form;
            return newErr;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) {
            setErrors(prev => ({...prev, form: "Please correct the errors below."}));
            return;
        }
        const submissionData = {
            FactcolCname: formData.FactcolCname.trim(),
            FactcolUse: formData.FactcolUse,
            FactcolType: formData.FactcolType,
            DimcolIdPk: formData.DimcolIdPk ? parseInt(formData.DimcolIdPk, 10) : null,
            FactcolShortCubeName: formData.FactcolShortCubeName.trim(),
            FactcolShortPresName: formData.FactcolShortPresName.trim(),
            FactcolWorkOrder: parseInt(formData.FactcolWorkOrder, 10),
            FactcolCubeVisible: formData.FactcolCubeVisible,
            FactcolCubeAggregat: formData.FactcolCubeAggregat,
            FactcolCubeFormula: formData.FactcolCubeFormula.trim() === '' ? null : formData.FactcolCubeFormula.trim(),
            FactcolIndexDataMart: formData.FactcolIndexDataMart,
            FactcolComments: formData.FactcolComments.trim() === '' ? null : formData.FactcolComments.trim(),
            FactcolDisplayFolder: formData.FactcolDisplayFolder.trim() === '' ? null : formData.FactcolDisplayFolder.trim(),
            FactIdPk: parseInt(formData.FactIdPk, 10),
        };

        if (!isEditMode) {
            submissionData.FactcolIdPk = parseInt(formData.FactcolIdPk, 10);
        } else {
            if (!formData.FactcolTimestamp) { /* Error handled in validate */ return; }
            submissionData.FactcolTimestamp = formData.FactcolTimestamp;
        }

        try {
            await onSubmit(submissionData);
        } catch (error) { /* ... error handling as in other forms ... */ }
    };

    return (
        <form onSubmit={handleSubmit} className="factcolumn-form">
            <h4>{isEditMode ? `Edit Fact Column (ID: ${formData.FactcolIdPk})` : 'Add New Fact Column'}</h4>
            {errors.form && <p className="error-message">{errors.form}</p>}

            <fieldset>
                <legend>Identification & Parent Fact</legend>
                <div className="form-group">
                    <label htmlFor="FactcolIdPkForm">Column ID (*)</label>
                    <input type="number" id="FactcolIdPkForm" name="FactcolIdPk" value={formData.FactcolIdPk} onChange={handleChange} required readOnly={isEditMode} />
                    {errors.FactcolIdPk && <p className="error-message">{errors.FactcolIdPk}</p>}
                </div>

                {!isEditMode && !parentFactIdPk && (
                    <div className="form-group">
                        <label htmlFor="FactIdPkFormFc">Parent Fact (*)</label>
                        {loadingDropdowns ? <p>Loading facts...</p> : (
                            <select id="FactIdPkFormFc" name="FactIdPk" value={formData.FactIdPk} onChange={handleChange} required>
                                <option value="">--- Select Fact ---</option>
                                {facts.map(f => <option key={f.fact_id_pk} value={f.fact_id_pk}>{f.fact_tname} (ID: {f.fact_id_pk})</option>)}
                            </select>
                        )}
                        {errors.FactIdPk && <p className="error-message">{errors.FactIdPk}</p>}
                    </div>
                )}
                {(isEditMode || parentFactIdPk) && (
                    <div className="form-group"><label>Parent Fact</label><input type="text" value={formData.FactIdPk} readOnly disabled /></div>
                )}
            </fieldset>

            <fieldset>
                <legend>Column Definition</legend>
                <div className="form-group">
                    <label htmlFor="FactcolCnameForm">Column Name (CName) (*)</label>
                    <input type="text" id="FactcolCnameForm" name="FactcolCname" value={formData.FactcolCname} onChange={handleChange} maxLength="100" required />
                    {errors.FactcolCname && <p className="error-message">{errors.FactcolCname}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="FactcolUseForm">Use (*)</label>
                    <select id="FactcolUseForm" name="FactcolUse" value={formData.FactcolUse} onChange={handleChange} required>
                        {getDropdownOptions(FACTCOL_USE_OPTIONS).map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    {errors.FactcolUse && <p className="error-message">{errors.FactcolUse}</p>}
                </div>
                {formData.FactcolUse === 'FK' && (
                    <div className="form-group">
                        <label htmlFor="DimcolIdPkFormFc">Linked Dimension Column (* if Use is FK)</label>
                        {loadingDropdowns ? <p>Loading dimension columns...</p> : (
                            <select id="DimcolIdPkFormFc" name="DimcolIdPk" value={formData.DimcolIdPk} onChange={handleChange} required={formData.FactcolUse === 'FK'}>
                                <option value="">--- Select Dimension Column ---</option>
                                {/* Assuming dimColumns have dimcol_id_pk and dimcol_cname */}
                                {dimColumns.map(dc=><option key={dc.dimcol_id_pk} value={dc.dimcol_id_pk}>{dc.dimcol_cname} (ID: {dc.dimcol_id_pk})</option>)}
                            </select>
                        )}
                        {errors.DimcolIdPk && <p className="error-message">{errors.DimcolIdPk}</p>}
                    </div>
                )}
                <div className="form-group">
                    <label htmlFor="FactcolTypeForm">Data Type (*)</label>
                    <select id="FactcolTypeForm" name="FactcolType" value={formData.FactcolType} onChange={handleChange} required>
                        {getDropdownOptions(FACTCOL_TYPE_OPTIONS).map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    {errors.FactcolType && <p className="error-message">{errors.FactcolType}</p>}
                </div>
            </fieldset>

            <fieldset>
                <legend>Cube Representation</legend>
                <div className="form-group">
                    <label htmlFor="FactcolShortCubeNameForm">Short Cube Name (*)</label>
                    <input type="text" id="FactcolShortCubeNameForm" name="FactcolShortCubeName" value={formData.FactcolShortCubeName} onChange={handleChange} maxLength="30" required />
                    {errors.FactcolShortCubeName && <p className="error-message">{errors.FactcolShortCubeName}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="FactcolShortPresNameForm">Short Presentation Name (*)</label>
                    <input type="text" id="FactcolShortPresNameForm" name="FactcolShortPresName" value={formData.FactcolShortPresName} onChange={handleChange} maxLength="30" required />
                    {errors.FactcolShortPresName && <p className="error-message">{errors.FactcolShortPresName}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="FactcolWorkOrderForm">Work Order (*)</label>
                    <input type="number" id="FactcolWorkOrderForm" name="FactcolWorkOrder" value={formData.FactcolWorkOrder} onChange={handleChange} required />
                    {errors.FactcolWorkOrder && <p className="error-message">{errors.FactcolWorkOrder}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="FactcolCubeVisibleForm">Cube Visible (*)</label>
                    <select id="FactcolCubeVisibleForm" name="FactcolCubeVisible" value={formData.FactcolCubeVisible} onChange={handleChange} required>
                        {getDropdownOptions(FACTCOL_CUBEVISIBLE_OPTIONS).map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    {errors.FactcolCubeVisible && <p className="error-message">{errors.FactcolCubeVisible}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="FactcolCubeAggregatForm">Cube Aggregation (*)</label>
                    <select id="FactcolCubeAggregatForm" name="FactcolCubeAggregat" value={formData.FactcolCubeAggregat} onChange={handleChange} required>
                        {getDropdownOptions(FACTCOL_CUBEAGGREGAT_OPTIONS).map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    {errors.FactcolCubeAggregat && <p className="error-message">{errors.FactcolCubeAggregat}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="FactcolCubeFormulaForm">Cube Formula (Optional)</label>
                    <textarea id="FactcolCubeFormulaForm" name="FactcolCubeFormula" value={formData.FactcolCubeFormula} onChange={handleChange} maxLength="4000" rows="3" />
                    {errors.FactcolCubeFormula && <p className="error-message">{errors.FactcolCubeFormula}</p>}
                </div>
            </fieldset>

            <fieldset>
                <legend>Data Mart & Other</legend>
                <div className="form-group">
                    <label htmlFor="FactcolIndexDataMartForm">Index Data Mart (*)</label>
                    <select id="FactcolIndexDataMartForm" name="FactcolIndexDataMart" value={formData.FactcolIndexDataMart} onChange={handleChange} required>
                        {getDropdownOptions(FACTCOL_INDEXDATAMART_OPTIONS).map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    {errors.FactcolIndexDataMart && <p className="error-message">{errors.FactcolIndexDataMart}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="FactcolDisplayFolderForm">Display Folder (Optional)</label>
                    <input type="text" id="FactcolDisplayFolderForm" name="FactcolDisplayFolder" value={formData.FactcolDisplayFolder} onChange={handleChange} maxLength="100" />
                    {errors.FactcolDisplayFolder && <p className="error-message">{errors.FactcolDisplayFolder}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="FactcolCommentsForm">Comments (Optional)</label>
                    <textarea id="FactcolCommentsForm" name="FactcolComments" value={formData.FactcolComments} onChange={handleChange} rows="3" />
                    {errors.FactcolComments && <p className="error-message">{errors.FactcolComments}</p>}
                </div>
            </fieldset>

            <div className="form-actions" style={{ marginTop: '20px' }}>
                <button type="submit" className="primary">{isEditMode ? 'Update Fact Column' : 'Add Fact Column'}</button>
                <button type="button" className="secondary" onClick={onCancel} style={{ marginLeft: '10px' }}>Cancel</button>
            </div>
        </form>
    );
};

export default FactColumnForm;