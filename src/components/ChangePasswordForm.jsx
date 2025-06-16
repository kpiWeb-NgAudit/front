// src/components/ChangePasswordForm.jsx
import React, { useState } from 'react';

const ChangePasswordForm = ({ userId, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        OldPassword: '',
        NewPassword: '',
        ConfirmNewPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({...prev, [name]: null}));
        if (errors.form) setErrors(prev => ({...prev, form: null})); // Clear general form error on change
        setSuccessMessage(''); // Clear success message on change
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.OldPassword) newErrors.OldPassword = 'Old Password is required.';
        if (!formData.NewPassword) newErrors.NewPassword = 'New Password is required.';
        else if (formData.NewPassword.length < 8 || formData.NewPassword.length > 100) newErrors.NewPassword = 'New Password must be 8-100 characters.';
        if (!formData.ConfirmNewPassword) newErrors.ConfirmNewPassword = 'Confirm New Password is required.';
        else if (formData.NewPassword && formData.ConfirmNewPassword !== formData.NewPassword) newErrors.ConfirmNewPassword = 'New passwords do not match.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccessMessage('');
        setErrors({}); // Clear previous errors
        if (!validate()) {
            setErrors(prev => ({...prev, form: "Please correct the password errors."}));
            return;
        }
        try {
            // onSubmit prop will call changeUserPassword(userId, formData) from EditUserPage
            const result = await onSubmit(userId, formData);
            setSuccessMessage(result?.message || 'Password changed successfully!');
            setFormData({ OldPassword: '', NewPassword: '', ConfirmNewPassword: '' }); // Clear form
            // onCancel might be called here by parent if it's a modal
        } catch (error) {
            console.error("ChangePasswordForm submission error:", error);
            const errorMsg = error.response?.data?.message ||
                error.response?.data?.title ||
                (error.response?.data?.errors && Object.values(error.response.data.errors).flat().join(' ')) || // For ModelState errors
                error.message ||
                'Failed to change password.';
            setErrors({ form: errorMsg });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="change-password-form" style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
            <h4>Change Password for User ID: {userId}</h4>
            {errors.form && <p className="error-message" style={{color: 'red', fontWeight: 'bold'}}>{errors.form}</p>}
            {successMessage && <p style={{color: 'green'}}>{successMessage}</p>}

            <div className="form-group">
                <label htmlFor="OldPasswordForm">Old Password (*)</label>
                <input type="password" id="OldPasswordForm" name="OldPassword" value={formData.OldPassword} onChange={handleChange} required />
                {errors.OldPassword && <p className="error-message">{errors.OldPassword}</p>}
            </div>
            <div className="form-group">
                <label htmlFor="NewPasswordForm">New Password (*)</label>
                <input type="password" id="NewPasswordForm" name="NewPassword" value={formData.NewPassword} onChange={handleChange} required />
                {errors.NewPassword && <p className="error-message">{errors.NewPassword}</p>}
            </div>
            <div className="form-group">
                <label htmlFor="ConfirmNewPasswordForm">Confirm New Password (*)</label>
                <input type="password" id="ConfirmNewPasswordForm" name="ConfirmNewPassword" value={formData.ConfirmNewPassword} onChange={handleChange} required />
                {errors.ConfirmNewPassword && <p className="error-message">{errors.ConfirmNewPassword}</p>}
            </div>
            <div className="form-actions" style={{ marginTop: '10px' }}>
                <button type="submit" className="primary">Change Password</button>
                {onCancel && <button type="button" className="secondary" onClick={onCancel} style={{ marginLeft: '10px' }}>Close</button>}
            </div>
        </form>
    );
};

export default ChangePasswordForm;