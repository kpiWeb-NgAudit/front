// src/components/PerspectiveOutcalculationForm.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getAllPerspectives } from '../api/perspectiveService'; // To select a Perspective

const PerspectiveOutcalculationForm = ({ onSubmit, onCancel, initialPerspIdPk }) => {
    const [perspectives, setPerspectives] = useState([]);
    const [loadingPerspectives, setLoadingPerspectives] = useState(true);

    const getInitialFormState = useCallback(() => ({
        PerspIdPk: initialPerspIdPk || '', // Pre-fill if provided
        Outcalculation: '',
    }), [initialPerspIdPk]);

    const [formData, setFormData] = useState(getInitialFormState);
    const [errors, setErrors] = useState({});

    useEffect(() => { // Fetch perspectives for the dropdown
        setLoadingPerspectives(true);
        getAllPerspectives({ pageSize: 1000 }) // Assuming PerspectiveDto has perspIdPk and perspName
            .then(response => setPerspectives(response.data || []))
            .catch(err => {
                console.error("Failed to load perspectives for form:", err);
                setErrors(prev => ({ ...prev, perspectivesDropdown: "Failed to load perspectives."}));
            })
            .finally(() => setLoadingPerspectives(false));
    }, []);

    // Reset form if initialPerspIdPk prop changes (e.g. parent re-renders with new preselection)
    useEffect(() => {
        setFormData(getInitialFormState());
        setErrors({});
    }, [initialPerspIdPk, getInitialFormState]);


    const validate = () => {
        const newErrors = {};
        if (!formData.PerspIdPk) newErrors.PerspIdPk = 'A Perspective must be selected.';
        if (!formData.Outcalculation.trim()) newErrors.Outcalculation = 'Outcalculation string is required.';
        else if (formData.Outcalculation.length > 100) newErrors.Outcalculation = 'Outcalculation max 100 chars.';
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
        if (!validate()) { setErrors(prev => ({...prev, form: "Please correct errors."})); return; }

        const submissionData = { // Matches CreatePerspectiveOutcalculationDto
            PerspIdPk: parseInt(formData.PerspIdPk, 10),
            Outcalculation: formData.Outcalculation.trim(),
        };

        try {
            await onSubmit(submissionData);
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.response?.data?.title || error.message || 'Submission failed.';
            setErrors({ form: errorMsg });
            // No field-specific errors from backend for this simple DTO usually,
            // unless it's a Conflict error if the association already exists.
        }
    };

    return (
        <form onSubmit={handleSubmit} className="perspective-outcalculation-form">
            <h4>Add New Perspective-Outcalculation Link</h4>
            {errors.form && <p className="error-message" style={{color:'red'}}>{errors.form}</p>}
            {errors.perspectivesDropdown && <p className="error-message" style={{color:'orange'}}>{errors.perspectivesDropdown}</p>}


            <div className="form-group">
                <label htmlFor="PerspIdPkAssocForm">Perspective (*)</label>
                {loadingPerspectives ? <p>Loading perspectives...</p> : (
                    <select id="PerspIdPkAssocForm" name="PerspIdPk" value={formData.PerspIdPk} onChange={handleChange} required>
                        <option value="">--- Select Perspective ---</option>
                        {/* Assuming perspectives have perspIdPk and perspName */}
                        {perspectives.map(p => <option key={p.perspIdPk} value={p.perspIdPk}>{p.perspName} (ID: {p.perspIdPk})</option>)}
                    </select>
                )}
                {errors.PerspIdPk && <p className="error-message">{errors.PerspIdPk}</p>}
            </div>

            <div className="form-group">
                <label htmlFor="OutcalculationForm">Outcalculation String (*)</label>
                <input type="text" id="OutcalculationForm" name="Outcalculation" value={formData.Outcalculation} onChange={handleChange} maxLength="100" required />
                {errors.Outcalculation && <p className="error-message">{errors.Outcalculation}</p>}
            </div>

            <div className="form-actions">
                <button type="submit" className="primary">Create Association</button>
                <button type="button" className="secondary" onClick={onCancel}>Cancel</button>
            </div>
        </form>
    );
};

export default PerspectiveOutcalculationForm;