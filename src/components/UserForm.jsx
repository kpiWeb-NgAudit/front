// src/components/UserForm.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    USER_TYPES, USER_RBUILDER_OPTIONS, USER_RPTADMIN_OPTIONS, USER_DATAMARTACCESS_OPTIONS,
    getDropdownOptions, getYesNoOptions
} from '../constants/userEnums';

const snakeToPascal = (str) => {
    if (!str) return str;
    if (str.toLowerCase().endsWith("_pk")) {
        const prefix = str.substring(0, str.length - 3);
        return prefix.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join('') + 'Pk';
    }
    return str.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join('');
};


const UserForm = ({ onSubmit, onCancel, initialData = {}, isEditMode = false }) => {
    const getInitialFormState = useCallback(() => ({
        UserIdPk: '', // Required for create
        UserFirstname: '',
        UserLastname: '',
        UserEmail: '',
        UserType: USER_TYPES[0] || '',
        UserRbuilder: USER_RBUILDER_OPTIONS[0] || '', // Assuming "RBNO" is the first
        UserRptadmin: USER_RPTADMIN_OPTIONS[0] || '', // Assuming "RPTADMNO" is the first
        UserTargetsite: '',
        UserDatamartaccess: USER_DATAMARTACCESS_OPTIONS[0] || '', // Assuming "UDMANO" is the first
        Password: '', // Only for create mode
        ConfirmPassword: '', // Only for create mode
        UserTimestamp: null, // For edit mode submission
    }), []);

    const [formData, setFormData] = useState(getInitialFormState());
    const [errors, setErrors] = useState({});

    useEffect(() => {
        console.log("UserForm POPULATE EFFECT: isEditMode:", isEditMode, "initialData provided:", !!(initialData && Object.keys(initialData).length > 0) );
        let newPopulatedState = getInitialFormState(); // Always start fresh
        let populatedState = getInitialFormState();
        if (isEditMode && initialData && Object.keys(initialData).length > 0) {
            console.log("UserForm POPULATE EFFECT (Edit Mode): Populating from initialData", initialData);
            for (const backendKey in initialData) {
                if (initialData.hasOwnProperty(backendKey)) {
                    const formKey = snakeToPascal(backendKey);
                    if (populatedState.hasOwnProperty(formKey)) {
                        const value = initialData[backendKey];
                        if (value === null || typeof value === 'undefined') {
                            populatedState[formKey] = '';
                        } else if (typeof value === 'number' || typeof value === 'boolean') { // Booleans from DB might be true/false
                            populatedState[formKey] = String(value);
                        } else if (formKey === 'UserTimestamp' && value) {
                            populatedState[formKey] = value;
                        } else {
                            populatedState[formKey] = value;
                        }
                    }
                }
            }
            if (initialData.user_id_pk) populatedState.UserIdPk = String(initialData.user_id_pk);
            // Clear password fields for edit mode as they are not part of initialData for update
            populatedState.Password = '';
            populatedState.ConfirmPassword = '';


        } else if (!isEditMode) {
        // For create mode, newPopulatedState is already getInitialFormState().
        // If 'initialData' was meant for pre-filling create mode (uncommon for this form beyond defaults)
        // you'd merge it here. But since we used stableEmptyInitialData, initialData is {}.
        console.log("UserForm POPULATE EFFECT (Create Mode): Using default initial state.");
        }
        // Only set state if it has genuinely changed to prevent unnecessary renders/loops
        // This comparison is shallow, for deep objects use a library or a more robust check.
        // However, the primary goal is to ensure the dependencies of this useEffect are correct.
        if (JSON.stringify(formData) !== JSON.stringify(newPopulatedState)) {
            console.log("UserForm POPULATE EFFECT: Setting formData to:", newPopulatedState);
            setFormData(newPopulatedState);
        } else {
            console.log("UserForm POPULATE EFFECT: formData is already the same as newPopulatedState.");
        }
        setErrors({}); // Reset errors on re-initialization


        setFormData(populatedState);
        setErrors({});
    }, [initialData, isEditMode, getInitialFormState]);

    const validate = () => {
        const newErrors = {};
        if (!isEditMode && !formData.UserIdPk.trim()) newErrors.UserIdPk = 'User ID is required.';
        else if (formData.UserIdPk && formData.UserIdPk.length > 20) newErrors.UserIdPk = 'User ID max 20 chars.';

        if (!formData.UserFirstname.trim()) newErrors.UserFirstname = 'First Name is required.';
        else if (formData.UserFirstname.length > 25) newErrors.UserFirstname = 'First Name max 25 chars.';
        if (!formData.UserLastname.trim()) newErrors.UserLastname = 'Last Name is required.';
        else if (formData.UserLastname.length > 25) newErrors.UserLastname = 'Last Name max 25 chars.';

        if (!formData.UserEmail.trim()) newErrors.UserEmail = 'Email is required.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.UserEmail)) newErrors.UserEmail = 'Invalid email format.';
        else if (formData.UserEmail.length > 100) newErrors.UserEmail = 'Email max 100 chars.';

        if (!formData.UserType) newErrors.UserType = 'User Type is required.';
        if (!formData.UserRbuilder) newErrors.UserRbuilder = 'Report Builder access is required.';
        if (!formData.UserRptadmin) newErrors.UserRptadmin = 'Report Admin access is required.';
        if (!formData.UserTargetsite.trim()) newErrors.UserTargetsite = 'Target Site is required.';
        else if (formData.UserTargetsite.length > 100) newErrors.UserTargetsite = 'Target Site max 100 chars.';
        if (!formData.UserDatamartaccess) newErrors.UserDatamartaccess = 'Data Mart Access is required.';

        if (!isEditMode) { // Password validation only for create mode
            if (!formData.Password) newErrors.Password = 'Password is required.';
            else if (formData.Password.length < 8 || formData.Password.length > 100) newErrors.Password = 'Password must be 8-100 characters.';
            // Add more complex regex validation for password if needed here
            if (!formData.ConfirmPassword) newErrors.ConfirmPassword = 'Confirm Password is required.';
            else if (formData.Password && formData.ConfirmPassword !== formData.Password) newErrors.ConfirmPassword = 'Passwords do not match.';
        }
        if (isEditMode && !formData.UserTimestamp) newErrors.form = "Timestamp missing for update.";

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
            setErrors(prev => ({...prev, form: "Please correct the errors below."}));
            return;
        }
        const submissionData = {
            UserFirstname: formData.UserFirstname.trim(),
            UserLastname: formData.UserLastname.trim(),
            UserEmail: formData.UserEmail.trim(),
            UserType: formData.UserType,
            UserRbuilder: formData.UserRbuilder,
            UserRptadmin: formData.UserRptadmin,
            UserTargetsite: formData.UserTargetsite.trim(),
            UserDatamartaccess: formData.UserDatamartaccess,
        };

        if (isEditMode) {
            if (!formData.UserTimestamp) {
                setErrors(prev => ({...prev, form: "Cannot update: Timestamp is missing."}));
                return;
            }
            submissionData.UserTimestamp = formData.UserTimestamp;
        } else { // Create mode
            submissionData.UserIdPk = formData.UserIdPk.trim();
            submissionData.Password = formData.Password; // Password only for create
            submissionData.ConfirmPassword = formData.ConfirmPassword; // DTO expects this
        }

        try {
            await onSubmit(submissionData);
            if (onCancel && !isEditMode) onCancel(); // Typically close form on successful creation
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.response?.data?.title || error.message || 'Submission failed.';
            setErrors(prev => ({ ...prev, form: errorMsg }));
            if (error.response?.data?.errors) {
                const backendFieldErrors = {};
                for (const key in error.response.data.errors) {
                    backendFieldErrors[snakeToPascal(key)] = error.response.data.errors[key].join(', ');
                }
                setErrors(prev => ({ ...prev, ...backendFieldErrors }));
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="user-form">
            <h4>{isEditMode ? `Edit User Details (ID: ${formData.UserIdPk})` : 'Create New User'}</h4>
            {errors.form && <p className="error-message" style={{color: 'red', fontWeight: 'bold'}}>{errors.form}</p>}

            <fieldset>
                <legend>User Information</legend>
                {!isEditMode && (
                    <div className="form-group">
                        <label htmlFor="UserIdPkForm">User ID (*)</label>
                        <input type="text" id="UserIdPkForm" name="UserIdPk" value={formData.UserIdPk} onChange={handleChange} maxLength="20" required />
                        {errors.UserIdPk && <p className="error-message">{errors.UserIdPk}</p>}
                    </div>
                )}
                {isEditMode && (
                    <div className="form-group">
                        <label>User ID</label>
                        <input type="text" value={formData.UserIdPk} readOnly disabled />
                    </div>
                )}
                <div className="form-group">
                    <label htmlFor="UserFirstnameForm">First Name (*)</label>
                    <input type="text" id="UserFirstnameForm" name="UserFirstname" value={formData.UserFirstname} onChange={handleChange} maxLength="25" required />
                    {errors.UserFirstname && <p className="error-message">{errors.UserFirstname}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="UserLastnameForm">Last Name (*)</label>
                    <input type="text" id="UserLastnameForm" name="UserLastname" value={formData.UserLastname} onChange={handleChange} maxLength="25" required />
                    {errors.UserLastname && <p className="error-message">{errors.UserLastname}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="UserEmailForm">Email (*)</label>
                    <input type="email" id="UserEmailForm" name="UserEmail" value={formData.UserEmail} onChange={handleChange} maxLength="100" required />
                    {errors.UserEmail && <p className="error-message">{errors.UserEmail}</p>}
                </div>
            </fieldset>

            {!isEditMode && (
                <fieldset>
                    <legend>Password (*)</legend>
                    <div className="form-group">
                        <label htmlFor="PasswordForm">Password</label>
                        <input type="password" id="PasswordForm" name="Password" value={formData.Password} onChange={handleChange} required />
                        {errors.Password && <p className="error-message">{errors.Password}</p>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="ConfirmPasswordForm">Confirm Password</label>
                        <input type="password" id="ConfirmPasswordForm" name="ConfirmPassword" value={formData.ConfirmPassword} onChange={handleChange} required />
                        {errors.ConfirmPassword && <p className="error-message">{errors.ConfirmPassword}</p>}
                    </div>
                </fieldset>
            )}

            <fieldset>
                <legend>Access & Permissions</legend>
                <div className="form-group">
                    <label htmlFor="UserTypeForm">User Type (*)</label>
                    <select id="UserTypeForm" name="UserType" value={formData.UserType} onChange={handleChange} required>
                        {getDropdownOptions(USER_TYPES).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    {errors.UserType && <p className="error-message">{errors.UserType}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="UserRbuilderForm">Report Builder (*)</label>
                    <select id="UserRbuilderForm" name="UserRbuilder" value={formData.UserRbuilder} onChange={handleChange} required>
                        {getYesNoOptions("RBYES", "RBNO").map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    {errors.UserRbuilder && <p className="error-message">{errors.UserRbuilder}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="UserRptadminForm">Report Admin (*)</label>
                    <select id="UserRptadminForm" name="UserRptadmin" value={formData.UserRptadmin} onChange={handleChange} required>
                        {getYesNoOptions("RPTADMYES", "RPTADMNO").map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    {errors.UserRptadmin && <p className="error-message">{errors.UserRptadmin}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="UserDatamartaccessForm">Data Mart Access (*)</label>
                    <select id="UserDatamartaccessForm" name="UserDatamartaccess" value={formData.UserDatamartaccess} onChange={handleChange} required>
                        {getYesNoOptions("UDMAYES", "UDMANO").map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    {errors.UserDatamartaccess && <p className="error-message">{errors.UserDatamartaccess}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="UserTargetsiteForm">Target Site (*)</label>
                    <input type="text" id="UserTargetsiteForm" name="UserTargetsite" value={formData.UserTargetsite} onChange={handleChange} maxLength="100" required />
                    {errors.UserTargetsite && <p className="error-message">{errors.UserTargetsite}</p>}
                </div>
            </fieldset>

            <div className="form-actions" style={{ marginTop: '20px' }}>
                <button type="submit" className="primary">{isEditMode ? 'Update User Details' : 'Create User'}</button>
                <button type="button" className="secondary" onClick={onCancel} style={{ marginLeft: '10px' }}>Cancel</button>
            </div>
        </form>
    );
};

export default UserForm;