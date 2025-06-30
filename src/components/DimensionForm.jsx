// src/components/DimensionForm.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    DIM_DB_FETCH_TYPES, DIM_PROC_CUBE_OPTIONS, DIM_VISIBLE_OPTIONS,
    DIM_CUBE_TYPES, DIM_DELETE_ORPHEAN_OPTIONS, DIM_COUNT_MEASURE_GROUP_OPTIONS,
    DIM_VERSIONS, DIM_EXIST_QUOTES_OPTIONS,
    getDropdownOptions, getOptionalDropdownOptions
} from '../constants/dimensionEnums';
import { getAllCustomers } from '../api/customerService'; // To fetch customers for dropdown

const specialCaseMap = {
    dim_shortcubename: 'DimShortCubeName',
    dim_shortpresname: 'DimShortPresName',
    // Add more special cases if needed
};

const snakeToPascal = (str) => {
    if (!str) return str;
    if (specialCaseMap[str]) return specialCaseMap[str];
    return str.split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
};

const DimensionForm = ({ onSubmit, initialData = null, isEditMode = false }) => {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]); // For customer dropdown

    const getInitialFormState = useCallback(() => ({
        // From CreateDimensionDto
        DimIdPk: '', // Required for create mode since ValueGeneratedNever
        DimTname: '',
        DimDbFetch: DIM_DB_FETCH_TYPES[0] || '',
        DimDbExtrIdPk: '', // Nullable int
        DimProcCube: DIM_PROC_CUBE_OPTIONS[0] || '',
        DimVisible: DIM_VISIBLE_OPTIONS[0] || '',
        DimShortCubeName: '',
        DimShortPresName: '',
        DimWorkOrder: 0,
        DimCubeType: DIM_CUBE_TYPES[0] || '',
        DimNbDaysKeep: 0,
        DimDeleteOrphean: DIM_DELETE_ORPHEAN_OPTIONS[0] || '',
        DimLimitNbRowsProcessed: '', // Nullable int
        DimComments: '',
        DimCountMeasureGroup: DIM_COUNT_MEASURE_GROUP_OPTIONS[0] || '',
        DimDimColRefsVirtuals: 0,
        DimDimColRefsVirtuals2: 0,
        DimDimColRefsVirtuals3: 0,
        DimDimColRefsVirtuals4: 0,
        DimDimColRefsVirtuals5: 0,
        DimDimColRefsVirtuals6: 0,
        DimDimColRefsVirtuals7: 0,
        DimDimVersion: DIM_VERSIONS[0] || '',
        DimDimExistQuotes: DIM_EXIST_QUOTES_OPTIONS[0] || '',
        CubeIdPk: '', // Foreign Key - will be a dropdown
        // For UpdateDimensionDto (only relevant in edit mode)
        DimTimestamp: null,
    }), []); // No dependencies, it's a pure function of constants

    const [formData, setFormData] = useState(getInitialFormState());
    const [errors, setErrors] = useState({});
    const [loadingCustomers, setLoadingCustomers] = useState(true);

    useEffect(() => {
        const fetchCustomersForDropdown = async () => {
            try {
                setLoadingCustomers(true);
                const customerData = await getAllCustomers(); // Assuming this returns all customers
                setCustomers(customerData || []);
            } catch (error) {
                console.error("Failed to fetch customers for dropdown:", error);
                setErrors(prev => ({ ...prev, customers: 'Failed to load customers.' }));
            } finally {
                setLoadingCustomers(false);
            }
        };
        fetchCustomersForDropdown();
    }, []);

    useEffect(() => {
        if (isEditMode && initialData) {
            console.log('DimensionForm initialData:', initialData); // Debug log
            const populatedData = { ...getInitialFormState() };

            for (const keyInDto in initialData) {
                if (initialData.hasOwnProperty(keyInDto)) {
                    const formKey = snakeToPascal(keyInDto); // use the utility function
                    console.log(`Mapping backend key: ${keyInDto} → ${formKey}, value:`, initialData[keyInDto]); // Debug log

                    if (populatedData.hasOwnProperty(formKey)) {
                        const value = initialData[keyInDto];

                        if (value === null || typeof value === 'undefined') {
                            populatedData[formKey] = '';
                        } else if (typeof value === 'number') {
                            populatedData[formKey] = String(value);
                        } else if (formKey === 'DimTimestamp' && value) {
                            populatedData[formKey] = value; // Keep timestamp bytes
                        } else {
                            populatedData[formKey] = value;
                        }
                    } else {
                        console.warn(`Unmapped backend key: ${keyInDto} → ${formKey}`);
                    }
                }
            }

            console.log('DimensionForm populatedData:', populatedData); // Debug log
            setFormData(populatedData);
        } else if (!isEditMode) {
            setFormData(getInitialFormState());
        }
    }, [initialData, isEditMode, getInitialFormState]);

    const validate = () => {
        const newErrors = {};
        // Basic Validations (lengths, required for non-dropdowns)
        if (!isEditMode && (formData.DimIdPk === '' || isNaN(parseInt(formData.DimIdPk)))) {
            newErrors.DimIdPk = 'Dimension ID is required and must be a number for new dimensions.';
        } else if (formData.DimIdPk !== '' && isNaN(parseInt(formData.DimIdPk))) {
            newErrors.DimIdPk = 'Dimension ID must be a number.';
        }

        if (!formData.DimTname) newErrors.DimTname = 'Table Name is required.';
        else if (formData.DimTname.length > 20) newErrors.DimTname = 'Table Name max 20 chars.';

        if (!formData.DimDbFetch) newErrors.DimDbFetch = 'DB Fetch Type is required.';
        if (!formData.DimProcCube) newErrors.DimProcCube = 'Process Cube option is required.';
        if (!formData.DimVisible) newErrors.DimVisible = 'Visible option is required.';

        if (!formData.DimShortCubeName) newErrors.DimShortCubeName = 'Short Cube Name is required.';
        else if (formData.DimShortCubeName.length > 20) newErrors.DimShortCubeName = 'Short Cube Name max 20 chars.';

        if (!formData.DimShortPresName) newErrors.DimShortPresName = 'Short Presentation Name is required.';
        else if (formData.DimShortPresName.length > 30) newErrors.DimShortPresName = 'Short Pres. Name max 30 chars.';

        if (formData.DimWorkOrder === '' || isNaN(parseInt(formData.DimWorkOrder))) {
            newErrors.DimWorkOrder = 'Work Order must be a number.';
        }else if (parseInt(formData.DimWorkOrder) <= 0) { // Or just !== 0 if 0 is never allowed
            newErrors.DimWorkOrder = 'Work Order must be greater than 0.';
        }
        if (!formData.DimCubeType) newErrors.DimCubeType = 'Dimension Cube Type is required.';
        if (formData.DimNbDaysKeep === '' || isNaN(parseInt(formData.DimNbDaysKeep))) newErrors.DimNbDaysKeep = 'Days to Keep must be a number.';
        if (!formData.DimDeleteOrphean) newErrors.DimDeleteOrphean = 'Delete Orphean option is required.';

        if (formData.DimLimitNbRowsProcessed !== '' && isNaN(parseInt(formData.DimLimitNbRowsProcessed))) {
            newErrors.DimLimitNbRowsProcessed = 'Limit Rows Processed must be a number if provided.';
        }
        if (!formData.DimCountMeasureGroup) newErrors.DimCountMeasureGroup = 'Count Measure Group option is required.';

        // For DimColRefsVirtuals 1-7
        for (let i = 1; i <= 7; i++) {
            const fieldName = `DimDimColRefsVirtuals${i === 1 ? '' : i}`;
            if (formData[fieldName] === '' || isNaN(parseInt(formData[fieldName]))) {
                newErrors[fieldName] = `Col Refs Virtuals ${i} must be a number.`;
            }
        }
        if (!formData.DimDimVersion) newErrors.DimDimVersion = 'Dimension Version is required.';
        if (!formData.DimDimExistQuotes) newErrors.DimDimExistQuotes = 'Exists Quotes option is required.';
        if (!formData.CubeIdPk) newErrors.CubeIdPk = 'Customer ID is required.';

        if (isEditMode && !formData.DimTimestamp) {
            newErrors.DimTimestamp = 'Timestamp is missing for update. Please refresh the data.';
        }


        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) {
            console.log("DimensionForm Validation Errors:", errors);
            alert("Please correct the form errors.");
            return;
        }

        const submissionData = { ...formData };

        // Convert numeric fields from string to int
        const intFields = [
            'DimWorkOrder', 'DimNbDaysKeep',
            'DimDimColRefsVirtuals', 'DimDimColRefsVirtuals2', 'DimDimColRefsVirtuals3',
            'DimDimColRefsVirtuals4', 'DimDimColRefsVirtuals5', 'DimDimColRefsVirtuals6',
            'DimDimColRefsVirtuals7'
        ];
        if (!isEditMode) { // DimIdPk is only int for create
            intFields.push('DimIdPk');
        }

        intFields.forEach(field => {
            if (submissionData[field] !== '' && !isNaN(submissionData[field])) {
                submissionData[field] = parseInt(submissionData[field], 10);
            } else {
                submissionData[field] = 0; // Default to 0 if empty or NaN for non-nullable ints
            }
        });

        // Handle nullable int fields
        const nullableIntFields = ['DimDbExtrIdPk', 'DimLimitNbRowsProcessed'];
        nullableIntFields.forEach(field => {
            if (submissionData[field] === '' || submissionData[field] === null || isNaN(parseInt(submissionData[field]))) {
                submissionData[field] = null;
            } else {
                submissionData[field] = parseInt(submissionData[field], 10);
            }
        });

        // Handle optional string fields that should be null if empty
        const optionalStringFields = ['DimComments']; // Add more if any
        optionalStringFields.forEach(field => {
            if (submissionData[field] === "") {
                submissionData[field] = null;
            }
        });


        // Ensure DimTimestamp is included for edit mode, but not for create
        if (!isEditMode) {
            delete submissionData.DimTimestamp;
        } else if (isEditMode && (!initialData || !initialData.dim_timestamp)) {

            // This case should ideally be caught by validation, but as a safeguard:
            console.error("Timestamp missing in initialData for edit mode.");
            alert("Error: Timestamp is missing. Cannot update.");
            return;
        }


        try {
            await onSubmit(submissionData); // This calls the function passed from Add/Edit page
        } catch (error) {
            console.error("Submission error in DimensionForm:", error);
            if (error.response?.data?.errors) {
                const backendErrors = {};
                // Map backend error keys (snake_case) to form field names (PascalCase) if necessary
                for (const key in error.response.data.errors) {
                    const formKey = key.charAt(0).toUpperCase() + key.slice(1).replace(/_([a-z])/g, g => g[1].toUpperCase());
                    backendErrors[formKey] = error.response.data.errors[key].join(', ');
                }
                setErrors(prev => ({ ...prev, ...backendErrors, form: 'Backend validation failed.' }));
                // alert("Backend validation failed. Check field errors."); // Alert in parent page
            } else if (error.response?.status === 409 && error.response?.data) {
                // ASP.NET Core returns ModelState directly when Conflict(ModelState) is used
                const backendErrors = {};
                const modelState = error.response.data; // This should be the ModelState object
                for (const key in modelState) {
                    // Key from ModelState might be "DimIdPk" or "dimensionDto.DimIdPk"
                    // We need to normalize it to just "DimIdPk"
                    const normalizedKey = key.includes('.') ? key.split('.').pop() : key;
                    // Ensure the key exists on our form state before trying to set an error for it.
                    // This assumes DTO property names are PascalCase in ModelState when returned from Conflict(ModelState)
                    if (formData.hasOwnProperty(normalizedKey) || normalizedKey.toLowerCase() === 'form') {
                        backendErrors[normalizedKey] = modelState[key].join(', ');
                    } else {
                        // If the key from ModelState doesn't directly match a form field,
                        // accumulate it as a general form error or log it.
                        // For simplicity, let's add to a general form error for now.
                        backendErrors.form = (backendErrors.form ? backendErrors.form + " " : "") + modelState[key].join(', ');
                        console.warn(`Conflict error for unmapped key: ${key}`, modelState[key]);
                    }
                }
                setErrors(prev => ({...prev, ...backendErrors, form: backendErrors.form || 'A conflict occurred.'}));


            } else if (error.response?.data?.title) {
                setErrors({ form: error.response.data.title });
            } else {
                setErrors({ form: 'An unexpected error occurred during submission.' });
            }
            // Re-throw so parent page (Add/EditDimensionPage) can also handle it (e.g., show generic alert)
            throw error;
        }
    };

    if (loadingCustomers && !isEditMode) { // Only block for create if customers are essential for selection
        return <p>Loading customer data...</p>;
    }


    return (
        <form onSubmit={handleSubmit} className="dimension-form">
            {errors.form && <p className="error-message">{errors.form}</p>}

            <fieldset>
                <legend>Core Dimension Info</legend>
                <div className="form-group">
                    <label htmlFor="DimIdPk">Dimension ID (DimIdPk) (*)</label>
                    <input
                        type="number"
                        id="DimIdPk"
                        name="DimIdPk"
                        value={formData.DimIdPk}
                        onChange={handleChange}
                        required
                        readOnly={isEditMode}
                    />
                    {errors.DimIdPk && <p className="error-message">{errors.DimIdPk}</p>}
                </div>

                <div className="form-group">
                    <label htmlFor="DimTname">Table Name (DimTname) (*)</label>
                    <input
                        type="text"
                        id="DimTname"
                        name="DimTname"
                        value={formData.DimTname}
                        onChange={handleChange}
                        maxLength="20"
                        required
                    />
                    {errors.DimTname && <p className="error-message">{errors.DimTname}</p>}
                </div>

                <div className="form-group">
                    <label htmlFor="CubeIdPk">Customer (CubeIdPk) (*)</label>
                    {loadingCustomers ? <p>Loading customers...</p> : (
                        <select
                            id="CubeIdPk"
                            name="CubeIdPk"
                            value={formData.CubeIdPk}
                            onChange={handleChange}
                            required
                        >
                            <option value="">--- Select Customer ---</option>
                            {customers.map(cust => (
                                <option key={cust.cube_id_pk} value={cust.cube_id_pk}>
                                    {cust.cube_name} ({cust.cube_id_pk})
                                </option>
                            ))}
                        </select>
                    )}
                    {errors.CubeIdPk && <p className="error-message">{errors.CubeIdPk}</p>}
                    {errors.customers && <p className="error-message">{errors.customers}</p>}
                </div>

                <div className="form-group">
                    <label htmlFor="DimShortCubeName">Short Cube Name (*)</label>
                    <input type="text" id="DimShortCubeName" name="DimShortCubeName" value={formData.DimShortCubeName} onChange={handleChange} maxLength="20" required />
                    {errors.DimShortCubeName && <p className="error-message">{errors.DimShortCubeName}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="DimShortPresName">Short Presentation Name (*)</label>
                    <input type="text" id="DimShortPresName" name="DimShortPresName" value={formData.DimShortPresName} onChange={handleChange} maxLength="30" required />
                    {errors.DimShortPresName && <p className="error-message">{errors.DimShortPresName}</p>}
                </div>

            </fieldset>

            <fieldset>
                <legend>Configuration</legend>
                <div className="form-group">
                    <label htmlFor="DimDbFetch">DB Fetch Type (*)</label>
                    <select id="DimDbFetch" name="DimDbFetch" value={formData.DimDbFetch} onChange={handleChange} required>
                        {getDropdownOptions(DIM_DB_FETCH_TYPES).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    {errors.DimDbFetch && <p className="error-message">{errors.DimDbFetch}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="DimProcCube">Process Cube (*)</label>
                    <select id="DimProcCube" name="DimProcCube" value={formData.DimProcCube} onChange={handleChange} required>
                        {getDropdownOptions(DIM_PROC_CUBE_OPTIONS).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    {errors.DimProcCube && <p className="error-message">{errors.DimProcCube}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="DimVisible">Visible (*)</label>
                    <select id="DimVisible" name="DimVisible" value={formData.DimVisible} onChange={handleChange} required>
                        {getDropdownOptions(DIM_VISIBLE_OPTIONS).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    {errors.DimVisible && <p className="error-message">{errors.DimVisible}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="DimCubeType">Dimension Cube Type (*)</label>
                    <select id="DimCubeType" name="DimCubeType" value={formData.DimCubeType} onChange={handleChange} required>
                        {getDropdownOptions(DIM_CUBE_TYPES).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    {errors.DimCubeType && <p className="error-message">{errors.DimCubeType}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="DimDeleteOrphean">Delete Orphean (*)</label>
                    <select id="DimDeleteOrphean" name="DimDeleteOrphean" value={formData.DimDeleteOrphean} onChange={handleChange} required>
                        {getDropdownOptions(DIM_DELETE_ORPHEAN_OPTIONS).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    {errors.DimDeleteOrphean && <p className="error-message">{errors.DimDeleteOrphean}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="DimCountMeasureGroup">Count Measure Group (*)</label>
                    <select id="DimCountMeasureGroup" name="DimCountMeasureGroup" value={formData.DimCountMeasureGroup} onChange={handleChange} required>
                        {getDropdownOptions(DIM_COUNT_MEASURE_GROUP_OPTIONS).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    {errors.DimCountMeasureGroup && <p className="error-message">{errors.DimCountMeasureGroup}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="DimDimVersion">Dimension Version (*)</label>
                    <select id="DimDimVersion" name="DimDimVersion" value={formData.DimDimVersion} onChange={handleChange} required>
                        {getDropdownOptions(DIM_VERSIONS).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    {errors.DimDimVersion && <p className="error-message">{errors.DimDimVersion}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="DimDimExistQuotes">Exists Quotes (*)</label>
                    <select id="DimDimExistQuotes" name="DimDimExistQuotes" value={formData.DimDimExistQuotes} onChange={handleChange} required>
                        {getDropdownOptions(DIM_EXIST_QUOTES_OPTIONS).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    {errors.DimDimExistQuotes && <p className="error-message">{errors.DimDimExistQuotes}</p>}
                </div>
            </fieldset>

            <fieldset>
                <legend>Numeric Details</legend>
                <div className="form-group">
                    <label htmlFor="DimWorkOrder">Work Order (*)</label>
                    <input type="number" id="DimWorkOrder" name="DimWorkOrder" value={formData.DimWorkOrder} onChange={handleChange} required />
                    {errors.DimWorkOrder && <p className="error-message">{errors.DimWorkOrder}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="DimNbDaysKeep">Days to Keep (*)</label>
                    <input type="number" id="DimNbDaysKeep" name="DimNbDaysKeep" value={formData.DimNbDaysKeep} onChange={handleChange} required />
                    {errors.DimNbDaysKeep && <p className="error-message">{errors.DimNbDaysKeep}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="DimDbExtrIdPk">DB Extract ID (Optional)</label>
                    <input type="number" id="DimDbExtrIdPk" name="DimDbExtrIdPk" value={formData.DimDbExtrIdPk} onChange={handleChange} />
                    {errors.DimDbExtrIdPk && <p className="error-message">{errors.DimDbExtrIdPk}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="DimLimitNbRowsProcessed">Limit Rows Processed (Optional)</label>
                    <input type="number" id="DimLimitNbRowsProcessed" name="DimLimitNbRowsProcessed" value={formData.DimLimitNbRowsProcessed} onChange={handleChange} />
                    {errors.DimLimitNbRowsProcessed && <p className="error-message">{errors.DimLimitNbRowsProcessed}</p>}
                </div>
                {/* DimColRefsVirtuals 1-7 */}
                {[...Array(7)].map((_, i) => {
                    const fieldName = `DimDimColRefsVirtuals${i === 0 ? '' : i + 1}`;
                    return (
                        <div className="form-group" key={fieldName}>
                            <label htmlFor={fieldName}>{`Col Refs Virtuals ${i + 1}`} (*)</label>
                            <input type="number" id={fieldName} name={fieldName} value={formData[fieldName]} onChange={handleChange} required />
                            {errors[fieldName] && <p className="error-message">{errors[fieldName]}</p>}
                        </div>
                    );
                })}
            </fieldset>

            <fieldset>
                <legend>Other</legend>
                <div className="form-group">
                    <label htmlFor="DimComments">Comments (Optional)</label>
                    <textarea id="DimComments" name="DimComments" value={formData.DimComments} onChange={handleChange} rows="3" />
                    {errors.DimComments && <p className="error-message">{errors.DimComments}</p>}
                </div>
            </fieldset>

            {isEditMode && formData.DimTimestamp && (
                <div className="form-group" style={{ display: 'none' }}>
                    {/* Hidden field for timestamp, not user-editable but needed for submission */}
                    <input type="hidden" name="DimTimestamp" value={formData.DimTimestamp} />
                </div>
            )}


            <button type="submit" className="primary">{isEditMode ? 'Update Dimension' : 'Create Dimension'}</button>
            <button type="button" className="secondary" onClick={() => navigate('/dimensions')} style={{ marginLeft: '10px' }}>Cancel</button>
        </form>
    );
};

export default DimensionForm;