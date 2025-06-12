// src/components/HierarchyForm.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    HIER_VISIBLE_CUBE_OPTIONS, HIER_RDL_SHOW_FILTER_OPTIONS,
    getDropdownOptions
} from '../constants/hierarchyEnums';
import { getAllDimensions } from '../api/dimensionService'; // To fetch dimensions for dropdown

// Helper function (can be in a utils file)
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

const HierarchyForm = ({ onSubmit, initialData = null, isEditMode = false }) => {
    const navigate = useNavigate();
    const [dimensions, setDimensions] = useState([]); // For dimension dropdown
    const [loadingDimensions, setLoadingDimensions] = useState(true);

    const getInitialFormState = useCallback(() => ({
        HierIdPk: '',
        HierCubeName: '',
        HierVisibleCube: HIER_VISIBLE_CUBE_OPTIONS[0] || '',
        HierRdlShowFilter: HIER_RDL_SHOW_FILTER_OPTIONS[0] || '',
        DimIdPk: '', // This will be populated
        HierWorkOrder: 0,
        HierComments: '',
        HierTimestamp: null,
    }), []); // Pass enums if they were dynamic, but they are constants

    const [formData, setFormData] = useState(getInitialFormState());
    const [errors, setErrors] = useState({});

    // Effect 1: Fetch dimensions (runs once on mount)
    useEffect(() => {
        console.log("HierarchyForm MOUNT/FETCH EFFECT: Starting to fetch dimensions...");
        let isMounted = true; // To prevent state updates on unmounted component

        const fetchDim = async () => {
            setLoadingDimensions(true); // Ensure it's true before fetch
            try {
                const dimResponse = await getAllDimensions({ pageSize: 500 });
                console.log("HierarchyForm FETCH EFFECT: API response for dimensions:", dimResponse); // <<<< KEY LOG 1
                if (isMounted) {
                    setDimensions(dimResponse.data || []);
                    console.log("HierarchyForm FETCH EFFECT: Called setDimensions with:", dimResponse.data || []); // <<<< KEY LOG 2
                }
            } catch (error) {
                console.error("HierarchyForm FETCH EFFECT: Failed to fetch dimensions:", error);
                if (isMounted) {
                    setErrors(prev => ({ ...prev, dimensions: 'Failed to load dimensions.' }));
                    setDimensions([]);
                }
            } finally {
                if (isMounted) {
                    setLoadingDimensions(false);
                    //console.log("HierarchyForm FETCH EFFECT: Finished fetching dimensions. Loading now:", false);
                }
            }
        };

        fetchDim();

        return () => {
            isMounted = false; // Cleanup on unmount
        };
    }, []); // Empty dependency array: runs only on mount and unmount

    // Effect 2: Populate formData when initialData, mode, or dimensions data changes
    useEffect(() => {
        console.log("HierarchyForm POPULATE EFFECT: Running. isEditMode:", isEditMode, "loadingDimensions:", loadingDimensions, "initialData:", initialData, "dimensions count:", dimensions.length); // <<<< KEY LOG 3

        if (loadingDimensions) {
            console.log("HierarchyForm POPULATE EFFECT: Still loading dimensions, skipping form population.");
            return; // Don't try to populate form until dimensions are loaded
        }

        const baseState = getInitialFormState();
        let newFormData = { ...baseState };

        if (isEditMode) {
            if (initialData) {
                console.log("HierarchyForm POPULATE EFFECT (Edit Mode): Populating from initialData", initialData);
                let preSelectedDimId = '';
                for (const backendKey in initialData) {
                    if (initialData.hasOwnProperty(backendKey)) {
                        const formKey = snakeToPascal(backendKey);
                        if (newFormData.hasOwnProperty(formKey)) {
                            const value = initialData[backendKey];
                            // When mapping dim_id_pk from initialData to formData.DimIdPk for the select
                            if (formKey === 'DimIdPk' && value !== null && typeof value !== 'undefined') {
                                preSelectedDimId = String(value);
                            }

                            if (value === null || typeof value === 'undefined') {
                                newFormData[formKey] = '';
                            } else if (typeof value === 'number' && formKey !== 'DimIdPk') { // For most numbers
                                newFormData[formKey] = String(value);
                            } else if (formKey === 'HierTimestamp' && value) {
                                newFormData[formKey] = value;
                            } else { // For strings and DimIdPk (which we want as string for select)
                                newFormData[formKey] = String(value);
                            }
                        }
                    }
                }
                if (initialData.hier_id_pk) { // Ensure HierIdPk (PK of hierarchy) is set
                    newFormData.HierIdPk = String(initialData.hier_id_pk);
                }
                if (preSelectedDimId) { // This is the parent Dimension ID for the dropdown
                    newFormData.DimIdPk = preSelectedDimId;
                }
                console.log("HierarchyForm POPULATE EFFECT (Edit Mode): newFormData after population:", newFormData);
            } else {
                console.log("HierarchyForm POPULATE EFFECT (Edit Mode): No initialData, resetting.");
                newFormData = baseState; // Reset if in edit mode but initialData is missing
            }
        } else { // Create mode
            console.log("HierarchyForm POPULATE EFFECT (Create Mode): Setting up for create.");
            if (initialData && initialData.DimIdPk) { // Pre-selected DimIdPk from query params
                const isValidPreselection = dimensions.some(d => String(d.dim_id_pk) === String(initialData.DimIdPk));
                newFormData.DimIdPk = isValidPreselection ? String(initialData.DimIdPk) : '';
                console.log("HierarchyForm POPULATE EFFECT (Create Mode): Preselected DimIdPk:", newFormData.DimIdPk);
            }
        }
        setFormData(newFormData);

    }, [initialData, isEditMode, getInitialFormState, loadingDimensions, dimensions]); // Dependencies


    const validate = () => {
        const newErrors = {};
        if (!isEditMode && (formData.HierIdPk === '' || isNaN(parseInt(formData.HierIdPk)))) {
            newErrors.HierIdPk = 'Hierarchy ID is required and must be a number.';
        } else if (formData.HierIdPk !== '' && isNaN(parseInt(formData.HierIdPk))) {
            newErrors.HierIdPk = 'Hierarchy ID must be a number if provided.';
        }
        if (!formData.HierCubeName) newErrors.HierCubeName = 'Cube Name is required.';
        else if (formData.HierCubeName.length > 20) newErrors.HierCubeName = 'Cube Name max 20 chars.';
        if (!formData.HierVisibleCube) newErrors.HierVisibleCube = 'Visible Cube option is required.';
        if (!formData.HierRdlShowFilter) newErrors.HierRdlShowFilter = 'RDL Show Filter option is required.';
        if (!formData.DimIdPk) newErrors.DimIdPk = 'Dimension ID is required.';
        else if (isNaN(parseInt(formData.DimIdPk))) newErrors.DimIdPk = 'Dimension ID must be a number.';
        if (formData.HierWorkOrder === '' || isNaN(parseInt(formData.HierWorkOrder))) newErrors.HierWorkOrder = 'Work Order must be a number.';

        if (isEditMode && !formData.HierTimestamp) {
            newErrors.HierTimestamp = 'Timestamp is missing. Please refresh.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) {
            alert("Please correct form errors.");
            return;
        }
        const submissionData = { ...formData };

        const intFields = ['HierWorkOrder', 'DimIdPk']; // DimIdPk is also int
        if (!isEditMode) intFields.push('HierIdPk');
        intFields.forEach(field => {
            submissionData[field] = (submissionData[field] !== '' && !isNaN(submissionData[field]))
                ? parseInt(submissionData[field], 10) : 0; // Or handle error if 0 is not valid
        });

        if (submissionData.HierComments === "") submissionData.HierComments = null;

        if (!isEditMode) delete submissionData.HierTimestamp;

        try {
            await onSubmit(submissionData);
        } catch (error) {
            console.error("Submission error in HierarchyForm:", error);
            if (error.response?.data?.errors) {
                const backendErrors = {};
                for (const key in error.response.data.errors) {
                    const formKey = snakeToPascal(key);
                    backendErrors[formKey] = error.response.data.errors[key].join(', ');
                }
                setErrors(prev => ({ ...prev, ...backendErrors, form: 'Backend validation failed.' }));
            } else if (error.response?.data?.title) {
                setErrors({ form: error.response.data.title });
            } else {
                setErrors({ form: 'An unexpected error occurred.' });
            }
            throw error;
        }
    };

    return (
        <form onSubmit={handleSubmit} className="hierarchy-form">
            {errors.form && <p className="error-message">{errors.form}</p>}
            <fieldset>
                <legend>Core Hierarchy Info</legend>
                <div className="form-group">
                    <label htmlFor="HierIdPk">Hierarchy ID (*)</label>
                    <input type="number" id="HierIdPk" name="HierIdPk" value={formData.HierIdPk} onChange={handleChange} required readOnly={isEditMode} />
                    {errors.HierIdPk && <p className="error-message">{errors.HierIdPk}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="HierCubeName">Cube Name (*)</label>
                    <input type="text" id="HierCubeName" name="HierCubeName" value={formData.HierCubeName} onChange={handleChange} maxLength="20" required />
                    {errors.HierCubeName && <p className="error-message">{errors.HierCubeName}</p>}
                </div>

                <div className="form-group">
                    <label htmlFor="DimIdPk">Parent Dimension (*)</label>
                    {(() => {
                        if (loadingDimensions) return <p>Loading dimensions...</p>;
                        if (dimensions.length === 0 && !errors.dimensions) return <p>No dimensions available to select.</p>;
                        return (
                            <select
                                id="DimIdPk"
                                name="DimIdPk"
                                value={formData.DimIdPk} // This is the critical part
                                onChange={handleChange}
                                required
                            >
                                <option value="">--- Select Dimension ---</option>
                                {dimensions.map(d => (
                                    <option key={d.dim_id_pk} value={String(d.dim_id_pk)}>
                                        {d.dim_tname} (ID: {d.dim_id_pk})
                                    </option>
                                ))}
                            </select>
                        );
                    })()}
                    {errors.DimIdPk && <p className="error-message">{errors.DimIdPk}</p>}
                    {errors.dimensions && <p className="error-message">{errors.dimensions}</p>}
                </div>

            </fieldset>

            <fieldset>
                <legend>Configuration</legend>
                <div className="form-group">
                    <label htmlFor="HierVisibleCube">Visible in Cube (*)</label>
                    <select id="HierVisibleCube" name="HierVisibleCube" value={formData.HierVisibleCube} onChange={handleChange} required>
                        {getDropdownOptions(HIER_VISIBLE_CUBE_OPTIONS).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    {errors.HierVisibleCube && <p className="error-message">{errors.HierVisibleCube}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="HierRdlShowFilter">RDL Show Filter (*)</label>
                    <select id="HierRdlShowFilter" name="HierRdlShowFilter" value={formData.HierRdlShowFilter} onChange={handleChange} required>
                        {getDropdownOptions(HIER_RDL_SHOW_FILTER_OPTIONS).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    {errors.HierRdlShowFilter && <p className="error-message">{errors.HierRdlShowFilter}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="HierWorkOrder">Work Order (*)</label>
                    <input type="number" id="HierWorkOrder" name="HierWorkOrder" value={formData.HierWorkOrder} onChange={handleChange} required />
                    {errors.HierWorkOrder && <p className="error-message">{errors.HierWorkOrder}</p>}
                </div>
            </fieldset>

            <fieldset>
                <legend>Other</legend>
                <div className="form-group">
                    <label htmlFor="HierComments">Comments (Optional)</label>
                    <textarea id="HierComments" name="HierComments" value={formData.HierComments} onChange={handleChange} rows="3"></textarea>
                    {errors.HierComments && <p className="error-message">{errors.HierComments}</p>}
                </div>
            </fieldset>

            <button type="submit" className="primary">{isEditMode ? 'Update Hierarchy' : 'Create Hierarchy'}</button>
            <button type="button" className="secondary" onClick={() => navigate(formData.DimIdPk ? `/hierarchies?dimIdPk=${formData.DimIdPk}` : '/hierarchies')} style={{ marginLeft: '10px' }}>Cancel</button>
        </form>
    );
};

export default HierarchyForm;