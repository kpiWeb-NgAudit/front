// src/components/FactForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FACT_TYPES,
    FACT_DATA_FILE_TYPES,
    FACT_ZONE_SPES,
    FACT_PARTITION_TYPES,
    getEnumOptions,
} from '../constants/enums';

const FactForm = ({ onSubmit, initialData = {}, isEditMode = false }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        factTname: '',
        factType: '',
        factdbextrIdPk: '', // Keep as string for input, convert to number on submit if needed
        factProccube: 'FPROCY', // Default and often fixed
        factShortcubename: '',
        factShortpresname: '',
        factWorkorder: '', // Keep as string for input
        customerCubeIdPk: '',
        factFactdatafiletype: '',
        factFactdatafilename: '',
        factFactdatafilecheckunicity: false,
        factZonespe: '',
        factComments: '',
        factPartitiontype: '',
        // factLastupdate & factTimestamp are not part of the form
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isEditMode && initialData) {
            // Ensure all fields expected by form are present, even if null/undefined from API
            const populatedData = { ...formData, ...initialData };

            // Convert potential nulls from backend to empty strings for controlled inputs
            for (const key in populatedData) {
                if (populatedData[key] === null || typeof populatedData[key] === 'undefined') {
                    if (key === 'factFactdatafilecheckunicity') { // boolean
                        populatedData[key] = false;
                    } else {
                        populatedData[key] = '';
                    }
                } else if (typeof populatedData[key] === 'number' && key !== 'factdbextrIdPk' && key !== 'factWorkorder') {
                    // Keep numbers as numbers unless they are IDs that might be optional strings in form
                } else if (key === 'factdbextrIdPk' || key === 'factWorkorder') {
                    populatedData[key] = String(populatedData[key]); // Convert numbers to strings for input fields
                }
            }
            // factProccube should always be FPROCY on edit based on DTO
            populatedData.factProccube = initialData.factProccube || 'FPROCY';
            setFormData(populatedData);
        } else if (!isEditMode) {
            // For create mode, ensure defaults like factProccube are set
            setFormData(prev => ({ ...prev, factProccube: 'FPROCY' }));
        }
    }, [initialData, isEditMode]);

    const validate = () => {
        const newErrors = {};
        if (!formData.factTname) newErrors.factTname = 'Technical Name is required.';
        else if (formData.factTname.length > 20) newErrors.factTname = 'Technical Name max 20 chars.';

        if (!formData.factType) newErrors.factType = 'Fact Type is required.';

        if (!formData.factProccube) newErrors.factProccube = 'Process Cube is required.';
        else if (formData.factProccube !== 'FPROCY') newErrors.factProccube = 'Process Cube must be FPROCY.';

        if (!formData.factShortcubename) newErrors.factShortcubename = 'Short Cube Name is required.';
        else if (formData.factShortcubename.length > 20) newErrors.factShortcubename = 'Short Cube Name max 20 chars.';

        if (!formData.factShortpresname) newErrors.factShortpresname = 'Short Presentation Name is required.';
        else if (formData.factShortpresname.length > 30) newErrors.factShortpresname = 'Short Presentation Name max 30 chars.';

        if (formData.factWorkorder === '' || isNaN(parseInt(formData.factWorkorder, 10))) newErrors.factWorkorder = 'Work Order is required and must be a number.';

        if (!formData.customerCubeIdPk) newErrors.customerCubeIdPk = 'Customer ID is required.';
        else if (formData.customerCubeIdPk.length > 15) newErrors.customerCubeIdPk = 'Customer ID max 15 chars.';

        if (formData.factFactdatafilename && formData.factFactdatafilename.length > 50) {
            newErrors.factFactdatafilename = 'Data File Name max 50 chars.';
        }

        if (!formData.factZonespe) newErrors.factZonespe = 'Zone SPE is required.';
        if (!formData.factPartitiontype) newErrors.factPartitiontype = 'Partition Type is required.';

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
        if (!validate()) return;

        const submissionData = { ...formData };

        // Convert specific fields to numbers or handle optionals
        submissionData.factWorkorder = parseInt(formData.factWorkorder, 10);
        submissionData.factdbextrIdPk = formData.factdbextrIdPk ? parseInt(formData.factdbextrIdPk, 10) : null;

        // Ensure optional enums are null if empty string
        if (!submissionData.factFactdatafiletype) submissionData.factFactdatafiletype = null;

        // factFactdatafilecheckunicity is boolean, already handled by checkbox
        // factComments can be empty string or null, backend DTO handles @Size for max text length

        // Remove fields not in Create/Update DTOs (if any were added to local state by mistake)
        // e.g., if factIdPk was somehow included in formData for create
        if (!isEditMode) {
            delete submissionData.factIdPk; // Should not be there anyway for create
        }
        // For update, factIdPk is in URL, not body. Backend doesn't expect factLastupdate/factTimestamp
        delete submissionData.factLastupdate;
        delete submissionData.factTimestamp;


        try {
            await onSubmit(submissionData);
            // Navigation or success message handled by parent component
        } catch (error) {
            console.error("Submission error:", error.response?.data || error.message);
            const apiErrors = error.response?.data?.errors || {}; // Assuming Spring validation errors are in 'errors'
            if (error.response?.data && typeof error.response.data === 'string') {
                setErrors(prev => ({ ...prev, form: error.response.data }));
            } else if (error.response?.data?.message) { // General error message
                setErrors(prev => ({ ...prev, form: error.response.data.message }));
            }
            // TODO: Map backend validation errors (e.g., error.response.data.errors) to form fields
            // For now, just a general error
            // setErrors({ form: 'Submission failed. Check console for details.' });
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {errors.form && <p className="error-message">{errors.form}</p>}

            <div className="form-group">
                <label htmlFor="factTname">Technical Name (*)</label>
                <input type="text" id="factTname" name="factTname" value={formData.factTname} onChange={handleChange} maxLength="20" required />
                {errors.factTname && <p className="error-message">{errors.factTname}</p>}
            </div>

            <div className="form-group">
                <label htmlFor="factType">Fact Type (*)</label>
                <select id="factType" name="factType" value={formData.factType} onChange={handleChange} required>
                    <option value="">Select Type</option>
                    {getEnumOptions(FACT_TYPES).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
                {errors.factType && <p className="error-message">{errors.factType}</p>}
            </div>

            <div className="form-group">
                <label htmlFor="factdbextrIdPk">DB Extraction ID</label>
                <input type="number" id="factdbextrIdPk" name="factdbextrIdPk" value={formData.factdbextrIdPk} onChange={handleChange} />
                {/* No specific validation in DTO other than being Integer */}
            </div>

            <div className="form-group">
                <label htmlFor="factProccube">Process Cube (*)</label>
                <input type="text" id="factProccube" name="factProccube" value={formData.factProccube} onChange={handleChange} maxLength="6" required readOnly={isEditMode} />
                {/* readOnly on edit because UpdateDTO enforces FPROCY. CreateDTO allows it, service defaults. */}
                {errors.factProccube && <p className="error-message">{errors.factProccube}</p>}
            </div>

            <div className="form-group">
                <label htmlFor="factShortcubename">Short Cube Name (*)</label>
                <input type="text" id="factShortcubename" name="factShortcubename" value={formData.factShortcubename} onChange={handleChange} maxLength="20" required />
                {errors.factShortcubename && <p className="error-message">{errors.factShortcubename}</p>}
            </div>

            <div className="form-group">
                <label htmlFor="factShortpresname">Short Presentation Name (*)</label>
                <input type="text" id="factShortpresname" name="factShortpresname" value={formData.factShortpresname} onChange={handleChange} maxLength="30" required />
                {errors.factShortpresname && <p className="error-message">{errors.factShortpresname}</p>}
            </div>

            <div className="form-group">
                <label htmlFor="factWorkorder">Work Order (*)</label>
                <input type="number" id="factWorkorder" name="factWorkorder" value={formData.factWorkorder} onChange={handleChange} required />
                {errors.factWorkorder && <p className="error-message">{errors.factWorkorder}</p>}
            </div>

            <div className="form-group">
                <label htmlFor="customerCubeIdPk">Customer Cube ID (*)</label>
                <input type="text" id="customerCubeIdPk" name="customerCubeIdPk" value={formData.customerCubeIdPk} onChange={handleChange} maxLength="15" required />
                {errors.customerCubeIdPk && <p className="error-message">{errors.customerCubeIdPk}</p>}
            </div>

            <div className="form-group">
                <label htmlFor="factFactdatafiletype">Data File Type</label>
                <select id="factFactdatafiletype" name="factFactdatafiletype" value={formData.factFactdatafiletype} onChange={handleChange}>
                    <option value="">Select Data File Type (Optional)</option>
                    {getEnumOptions(FACT_DATA_FILE_TYPES).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
            </div>

            <div className="form-group">
                <label htmlFor="factFactdatafilename">Data File Name</label>
                <input type="text" id="factFactdatafilename" name="factFactdatafilename" value={formData.factFactdatafilename} onChange={handleChange} maxLength="50" />
                {errors.factFactdatafilename && <p className="error-message">{errors.factFactdatafilename}</p>}
            </div>

            <div className="form-group">
                <label htmlFor="factFactdatafilecheckunicity">
                    <input type="checkbox" id="factFactdatafilecheckunicity" name="factFactdatafilecheckunicity" checked={formData.factFactdatafilecheckunicity} onChange={handleChange} />
                    Check Data File Unicity
                </label>
            </div>

            <div className="form-group">
                <label htmlFor="factZonespe">Zone SPE (*)</label>
                <select id="factZonespe" name="factZonespe" value={formData.factZonespe} onChange={handleChange} required>
                    <option value="">Select Zone SPE</option>
                    {getEnumOptions(FACT_ZONE_SPES).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
                {errors.factZonespe && <p className="error-message">{errors.factZonespe}</p>}
            </div>

            <div className="form-group">
                <label htmlFor="factComments">Comments</label>
                <textarea id="factComments" name="factComments" value={formData.factComments} onChange={handleChange} rows="4"></textarea>
                {/* Max length for TEXT is very large, usually not a concern for textarea */}
            </div>

            <div className="form-group">
                <label htmlFor="factPartitiontype">Partition Type (*)</label>
                <select id="factPartitiontype" name="factPartitiontype" value={formData.factPartitiontype} onChange={handleChange} required>
                    <option value="">Select Partition Type</option>
                    {getEnumOptions(FACT_PARTITION_TYPES).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
                {errors.factPartitiontype && <p className="error-message">{errors.factPartitiontype}</p>}
            </div>

            <button type="submit" className="primary">{isEditMode ? 'Update' : 'Create'} Fact</button>
            <button type="button" className="secondary" onClick={() => navigate('/')} style={{marginLeft: '10px'}}>Cancel</button>
        </form>
    );
};

export default FactForm;