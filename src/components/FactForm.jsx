// src/components/FactForm.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FACT_TYPES, FACT_PROC_CUBE_OPTIONS, FACT_DATA_FILE_TYPES,
    FACT_ZONE_SPE_OPTIONS, FACT_PARTITION_TYPES,
    getDropdownOptions, getOptionalDropdownOptions, getNullableBooleanOptions
} from '../constants/factEnums';
import { getAllCustomers } from '../api/customerService';

// Helper function (can be in a utils file)
const specialCaseMap = {
    fact_shortcubename: 'FactShortCubeName',
    fact_shortpresname: 'FactShortPresName',
    // Add more special cases if needed
};

const snakeToPascal = (str) => {
    if (!str) return str;
    if (specialCaseMap[str]) return specialCaseMap[str];
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


const FactForm = ({ onSubmit, initialData = null, isEditMode = false }) => {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [loadingCustomers, setLoadingCustomers] = useState(true);

    const getInitialFormState = useCallback(() => ({
        // From CreateFactDto
        FactIdPk: '', // Client provides
        FactTname: '',
        FactType: FACT_TYPES[0] || '',
        FactDbExtrIdPk: '', // Nullable int
        FactProcCube: FACT_PROC_CUBE_OPTIONS[0] || '',
        FactShortCubeName: '',
        FactShortPresName: '',
        FactWorkOrder: 0,
        CubeIdPk: '', // FK
        FactFactDataFileType: '', // Nullable enum
        FactFactDataFileName: '', // Nullable string
        FactFactDataFileCheckUnicity: '', // Nullable boolean (use '' for "not selected")
        FactZoneSpe: FACT_ZONE_SPE_OPTIONS[0] || '',
        FactComments: '', // Nullable string
        FactPartitionType: FACT_PARTITION_TYPES[0] || '',
        // For UpdateFactDto
        FactTimestamp: null,
    }), []);

    const [formData, setFormData] = useState(getInitialFormState());
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const fetchCust = async () => {
            try {
                setLoadingCustomers(true);
                const custData = await getAllCustomers();
                setCustomers(custData || []);
            } catch (error) {
                console.error("Failed to fetch customers:", error);
                setErrors(prev => ({ ...prev, customers: 'Failed to load customers.' }));
            } finally {
                setLoadingCustomers(false);
            }
        };
        fetchCust();
    }, []);

    useEffect(() => {
        if (isEditMode && initialData) {
            const newFormData = { ...getInitialFormState() };
            for (const backendKey in initialData) {
                if (initialData.hasOwnProperty(backendKey)) {
                    const formKey = snakeToPascal(backendKey);
                    if (newFormData.hasOwnProperty(formKey)) {
                        const value = initialData[backendKey];
                        if (value === null || typeof value === 'undefined') {
                            newFormData[formKey] = '';
                        } else if (formKey === 'FactFactDataFileCheckUnicity') {
                            newFormData[formKey] = value === null ? '' : String(value); // 'true', 'false', or ''
                        } else if (typeof value === 'number') {
                            newFormData[formKey] = String(value);
                        } else if (formKey === 'FactTimestamp' && value) {
                            newFormData[formKey] = value;
                        } else {
                            newFormData[formKey] = value;
                        }
                    }
                }
            }
            if (initialData.fact_id_pk) { // Ensure PK is set for edit mode
                newFormData.FactIdPk = String(initialData.fact_id_pk);
            }
            setFormData(newFormData);
        } else if (!isEditMode) {
            setFormData(getInitialFormState());
        }
    }, [initialData, isEditMode, getInitialFormState]);


    const validate = () => {
        const newErrors = {};
        if (!isEditMode && (formData.FactIdPk === '' || isNaN(parseInt(formData.FactIdPk)))) {
            newErrors.FactIdPk = 'Fact ID is required and must be a number.';
        } else if (formData.FactIdPk !== '' && isNaN(parseInt(formData.FactIdPk))) {
            newErrors.FactIdPk = 'Fact ID must be a number if provided.';
        }
        if (!formData.FactTname) newErrors.FactTname = 'Table Name is required.';
        else if (formData.FactTname.length > 20) newErrors.FactTname = 'Table Name max 20 chars.';
        if (!formData.FactType) newErrors.FactType = 'Fact Type is required.';
        if (!formData.FactProcCube) newErrors.FactProcCube = 'Process Cube option is required.';
        if (!formData.FactShortCubeName) newErrors.FactShortCubeName = 'Short Cube Name is required.';
        else if (formData.FactShortCubeName.length > 20) newErrors.FactShortCubeName = 'Short Cube Name max 20 chars.';
        if (!formData.FactShortPresName) newErrors.FactShortPresName = 'Short Pres. Name is required.';
        else if (formData.FactShortPresName.length > 30) newErrors.FactShortPresName = 'Short Pres. Name max 30 chars.';
        if (formData.FactWorkOrder === '' || isNaN(parseInt(formData.FactWorkOrder))) newErrors.FactWorkOrder = 'Work Order must be a number.';
        if (!formData.CubeIdPk) newErrors.CubeIdPk = 'Customer ID is required.';
        if (formData.FactFactDataFileName && formData.FactFactDataFileName.length > 50) newErrors.FactFactDataFileName = 'Data File Name max 50 chars.';
        if (!formData.FactZoneSpe) newErrors.FactZoneSpe = 'Zone Spe option is required.';
        if (!formData.FactPartitionType) newErrors.FactPartitionType = 'Partition Type is required.';

        if (isEditMode && !formData.FactTimestamp) {
            newErrors.FactTimestamp = 'Timestamp is missing for update. Please refresh.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value, }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) {
            alert("Please correct form errors.");
            return;
        }
        const submissionData = { ...formData };

        const intFields = ['FactWorkOrder'];
        if (!isEditMode) intFields.push('FactIdPk');
        intFields.forEach(field => {
            submissionData[field] = (submissionData[field] !== '' && !isNaN(submissionData[field]))
                ? parseInt(submissionData[field], 10) : 0;
        });

        const nullableIntFields = ['FactDbExtrIdPk'];
        nullableIntFields.forEach(field => {
            submissionData[field] = (submissionData[field] === '' || submissionData[field] === null || isNaN(parseInt(submissionData[field])))
                ? null : parseInt(submissionData[field], 10);
        });

        const optionalStringFields = ['FactFactDataFileType', 'FactFactDataFileName', 'FactComments'];
        optionalStringFields.forEach(field => {
            if (submissionData[field] === "") submissionData[field] = null;
        });

        // Handle nullable boolean
        if (submissionData.FactFactDataFileCheckUnicity === "") {
            submissionData.FactFactDataFileCheckUnicity = null;
        } else {
            submissionData.FactFactDataFileCheckUnicity = submissionData.FactFactDataFileCheckUnicity === "true";
        }


        if (!isEditMode) delete submissionData.FactTimestamp;

        try {
            await onSubmit(submissionData);
        } catch (error) {
            console.error("Submission error in FactForm:", error);
            if (error.response?.data?.errors) {
                const backendErrors = {};
                for (const key in error.response.data.errors) {
                    const formKey = snakeToPascal(key); // Convert for display
                    backendErrors[formKey] = error.response.data.errors[key].join(', ');
                }
                setErrors(prev => ({ ...prev, ...backendErrors, form: 'Backend validation failed.' }));
            } else if (error.response?.data?.title) {
                setErrors({ form: error.response.data.title });
            } else {
                setErrors({ form: 'An unexpected error occurred during submission.' });
            }
            throw error;
        }
    };

    return (
        <form onSubmit={handleSubmit} className="fact-form">
            {errors.form && <p className="error-message">{errors.form}</p>}
            <fieldset>
                <legend>Core Fact Info</legend>
                <div className="form-group">
                    <label htmlFor="FactIdPk">Fact ID (*)</label>
                    <input type="number" id="FactIdPk" name="FactIdPk" value={formData.FactIdPk} onChange={handleChange} required readOnly={isEditMode} />
                    {errors.FactIdPk && <p className="error-message">{errors.FactIdPk}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="FactTname">Table Name (*)</label>
                    <input type="text" id="FactTname" name="FactTname" value={formData.FactTname} onChange={handleChange} maxLength="20" required />
                    {errors.FactTname && <p className="error-message">{errors.FactTname}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="CubeIdPk">Customer (*)</label>
                    {loadingCustomers ? <p>Loading...</p> : (
                        <select id="CubeIdPk" name="CubeIdPk" value={formData.CubeIdPk} onChange={handleChange} required>
                            <option value="">--- Select Customer ---</option>
                            {customers.map(c => <option key={c.cube_id_pk} value={c.cube_id_pk}>{c.cube_name} ({c.cube_id_pk})</option>)}
                        </select>
                    )}
                    {errors.CubeIdPk && <p className="error-message">{errors.CubeIdPk}</p>}
                    {errors.customers && <p className="error-message">{errors.customers}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="FactShortCubeName">Short Cube Name (*)</label>
                    <input type="text" id="FactShortCubeName" name="FactShortCubeName" value={formData.FactShortCubeName} onChange={handleChange} maxLength="20" required />
                    {errors.FactShortCubeName && <p className="error-message">{errors.FactShortCubeName}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="FactShortPresName">Short Presentation Name (*)</label>
                    <input type="text" id="FactShortPresName" name="FactShortPresName" value={formData.FactShortPresName} onChange={handleChange} maxLength="30" required />
                    {errors.FactShortPresName && <p className="error-message">{errors.FactShortPresName}</p>}
                </div>
            </fieldset>

            <fieldset>
                <legend>Configuration</legend>
                <div className="form-group">
                    <label htmlFor="FactType">Fact Type (*)</label>
                    <select id="FactType" name="FactType" value={formData.FactType} onChange={handleChange} required>
                        {getDropdownOptions(FACT_TYPES).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    {errors.FactType && <p className="error-message">{errors.FactType}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="FactProcCube">Process Cube (*)</label>
                    <select id="FactProcCube" name="FactProcCube" value={formData.FactProcCube} onChange={handleChange} required>
                        {getDropdownOptions(FACT_PROC_CUBE_OPTIONS).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    {errors.FactProcCube && <p className="error-message">{errors.FactProcCube}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="FactZoneSpe">Zone Spe (*)</label>
                    <select id="FactZoneSpe" name="FactZoneSpe" value={formData.FactZoneSpe} onChange={handleChange} required>
                        {getDropdownOptions(FACT_ZONE_SPE_OPTIONS).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    {errors.FactZoneSpe && <p className="error-message">{errors.FactZoneSpe}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="FactPartitionType">Partition Type (*)</label>
                    <select id="FactPartitionType" name="FactPartitionType" value={formData.FactPartitionType} onChange={handleChange} required>
                        {getDropdownOptions(FACT_PARTITION_TYPES).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    {errors.FactPartitionType && <p className="error-message">{errors.FactPartitionType}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="FactWorkOrder">Work Order (*)</label>
                    <input type="number" id="FactWorkOrder" name="FactWorkOrder" value={formData.FactWorkOrder} onChange={handleChange} required />
                    {errors.FactWorkOrder && <p className="error-message">{errors.FactWorkOrder}</p>}
                </div>
            </fieldset>

            <fieldset>
                <legend>Data File (Optional)</legend>
                <div className="form-group">
                    <label htmlFor="FactFactDataFileType">Data File Type</label>
                    <select id="FactFactDataFileType" name="FactFactDataFileType" value={formData.FactFactDataFileType} onChange={handleChange}>
                        {getOptionalDropdownOptions(FACT_DATA_FILE_TYPES).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    {errors.FactFactDataFileType && <p className="error-message">{errors.FactFactDataFileType}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="FactFactDataFileName">Data File Name</label>
                    <input type="text" id="FactFactDataFileName" name="FactFactDataFileName" value={formData.FactFactDataFileName} onChange={handleChange} maxLength="50" />
                    {errors.FactFactDataFileName && <p className="error-message">{errors.FactFactDataFileName}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="FactFactDataFileCheckUnicity">Check Unicity in Data File</label>
                    <select id="FactFactDataFileCheckUnicity" name="FactFactDataFileCheckUnicity" value={formData.FactFactDataFileCheckUnicity} onChange={handleChange}>
                        {getNullableBooleanOptions().map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    {errors.FactFactDataFileCheckUnicity && <p className="error-message">{errors.FactFactDataFileCheckUnicity}</p>}
                </div>
            </fieldset>

            <fieldset>
                <legend>Other</legend>
                <div className="form-group">
                    <label htmlFor="FactDbExtrIdPk">DB Extract ID (Optional)</label>
                    <input type="number" id="FactDbExtrIdPk" name="FactDbExtrIdPk" value={formData.FactDbExtrIdPk} onChange={handleChange} />
                    {errors.FactDbExtrIdPk && <p className="error-message">{errors.FactDbExtrIdPk}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="FactComments">Comments (Optional)</label>
                    <textarea id="FactComments" name="FactComments" value={formData.FactComments} onChange={handleChange} rows="3"></textarea>
                    {errors.FactComments && <p className="error-message">{errors.FactComments}</p>}
                </div>
            </fieldset>

            <button type="submit" className="primary">{isEditMode ? 'Update Fact' : 'Create Fact'}</button>
            <button type="button" className="secondary" onClick={() => navigate('/facts')} style={{ marginLeft: '10px' }}>Cancel</button>
        </form>
    );
};

export default FactForm;