// src/components/CubeUserAssociationForm.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getAllUsers } from '../api/userService'; // To select a user to associate
import { getAllRoles } from '../api/roleService';   // To select a role for this customer
import { CUBE_USER_WHEN_SEND_STATS_OPTIONS, getDropdownOptions } from '../constants/cubeUserEnums';

const CubeUserAssociationForm = ({
                                     onSubmit,
                                     onCancel,
                                     initialData = {}, // For editing: CubeUserDto
                                                       // For adding: { CubeIdPk } (parent customer ID)
                                     customerAllUsers, // OPTIONAL: Pre-fetched list of all users in the system
                                     customerAllRoles, // OPTIONAL: Pre-fetched list of all roles FOR THIS CUSTOMER
                                     isEditMode = false
                                 }) => {
    const [availableUsers, setAvailableUsers] = useState(customerAllUsers || []);
    const [availableRoles, setAvailableRoles] = useState(customerAllRoles || []);
    const [loadingUsers, setLoadingUsers] = useState(!customerAllUsers);
    const [loadingRoles, setLoadingRoles] = useState(!customerAllRoles);

    const getInitialFormState = useCallback(() => ({
        CubeIdPk: initialData.CubeIdPk || (isEditMode ? initialData.cubeIdPk : ''), // Set from initialData or parent
        UserIdPk: isEditMode ? initialData.userIdPk || '' : '', // User selects for add, pre-filled for edit
        RoleIdPk: isEditMode ? initialData.roleIdPk || '' : '',
        CubeUserWhenSendStatsIfAdmin: isEditMode
            ? initialData.cubeUserWhenSendStatsIfAdmin || CUBE_USER_WHEN_SEND_STATS_OPTIONS[0]
            : CUBE_USER_WHEN_SEND_STATS_OPTIONS[0],
        CubeUserTimestamp: isEditMode ? initialData.cubeUserTimestamp || null : null,
    }), [initialData, isEditMode]);

    const [formData, setFormData] = useState(getInitialFormState());
    const [errors, setErrors] = useState({});

    // Fetch all users if not provided (for "Add User" dropdown)
    useEffect(() => {
        if (!isEditMode && !customerAllUsers) { // Only if adding and users not passed in
            setLoadingUsers(true);
            getAllUsers({ pageSize: 1000 }) // Fetch all users
                .then(response => setAvailableUsers(response.data || []))
                .catch(err => {
                    console.error("Failed to fetch users for association form:", err);
                    setErrors(prev => ({ ...prev, users: "Failed to load users."}));
                })
                .finally(() => setLoadingUsers(false));
        } else if (customerAllUsers) {
            setAvailableUsers(customerAllUsers);
            setLoadingUsers(false);
        }
    }, [isEditMode, customerAllUsers]);

    // Fetch roles for the specific customer if not provided (for "Select Role" dropdown)
    useEffect(() => {
        const currentCubeId = formData.CubeIdPk || (initialData && initialData.CubeIdPk);
        if (currentCubeId && !customerAllRoles) { // Only if CubeIdPk is known and roles not passed in
            setLoadingRoles(true);
            getAllRoles({ cubeIdPk: currentCubeId, pageSize: 200 }) // Roles for this customer
                .then(response => setAvailableRoles(response.data || []))
                .catch(err => {
                    console.error(`Failed to fetch roles for customer ${currentCubeId}:`, err);
                    setErrors(prev => ({...prev, roles: "Failed to load roles for this customer."}));
                })
                .finally(() => setLoadingRoles(false));
        } else if (customerAllRoles) {
            setAvailableRoles(customerAllRoles);
            setLoadingRoles(false);
        } else if (!currentCubeId) {
            setAvailableRoles([]); // Clear roles if no customer selected/known
            setLoadingRoles(false);
        }
    }, [formData.CubeIdPk, initialData, customerAllRoles]);


    // Effect to reset/populate form when initialData (for edit) or parent CubeIdPk (for add) changes
    useEffect(() => {
        const newFormState = getInitialFormState(); // This already considers initialData's CubeIdPk if isEditMode
        if (isEditMode && initialData) {
            // getInitialFormState already used initialData, but we can be more explicit here if needed
            // for specific fields or ensure casing is right.
            newFormState.UserIdPk = String(initialData.userIdPk || '');
            newFormState.RoleIdPk = String(initialData.roleIdPk || '');
            newFormState.CubeUserWhenSendStatsIfAdmin = initialData.cubeUserWhenSendStatsIfAdmin || CUBE_USER_WHEN_SEND_STATS_OPTIONS[0];
            newFormState.CubeUserTimestamp = initialData.cubeUserTimestamp || null;
        }
        setFormData(newFormState);
        setErrors({});
    }, [initialData, isEditMode, getInitialFormState]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if(errors[name]) setErrors(prev => ({...prev, [name]: null}));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.CubeIdPk) newErrors.CubeIdPk = 'Customer ID is missing.'; // Should be pre-filled
        if (!formData.UserIdPk) newErrors.UserIdPk = 'User is required.';
        if (!formData.RoleIdPk) newErrors.RoleIdPk = 'Role is required.';
        if (!formData.CubeUserWhenSendStatsIfAdmin) newErrors.CubeUserWhenSendStatsIfAdmin = 'Send Stats option is required.';
        if (isEditMode && !formData.CubeUserTimestamp) newErrors.form = "Timestamp missing for update.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) {
            setErrors(prev => ({...prev, form: "Please correct errors."}));
            return;
        }
        const submissionData = {
            CubeIdPk: formData.CubeIdPk,
            UserIdPk: formData.UserIdPk, // Assuming this is string from select
            RoleIdPk: parseInt(formData.RoleIdPk, 10),
            CubeUserWhenSendStatsIfAdmin: formData.CubeUserWhenSendStatsIfAdmin,
        };
        if (isEditMode) {
            submissionData.CubeUserTimestamp = formData.CubeUserTimestamp;
        }

        try {
            await onSubmit(submissionData); // Calls create or update service function
            // onCancel(); // Parent will handle closing
        } catch (error) {
            setErrors(prev => ({...prev, form: error.response?.data?.message || error.message || "Submission failed"}));
            // Let parent handle re-throwing for its own alert if needed
        }
    };

    return (
        <form onSubmit={handleSubmit} className="cube-user-association-form" style={{ border: '1px solid #ccc', padding: '15px', margin: '10px 0' }}>
            <h4>{isEditMode ? `Edit User ${formData.UserIdPk} for Customer ${formData.CubeIdPk}` : `Add User to Customer ${formData.CubeIdPk}`}</h4>
            {errors.form && <p className="error-message" style={{color: 'red'}}>{errors.form}</p>}

            <div className="form-group">
                <label htmlFor="UserIdPkForm">User (*)</label>
                {isEditMode ? (
                    <input type="text" value={formData.UserIdPk} readOnly disabled />
                ) : loadingUsers ? (
                    <p>Loading users...</p>
                ) : (
                    <select id="UserIdPkForm" name="UserIdPk" value={formData.UserIdPk} onChange={handleChange} required>
                        <option value="">--- Select User ---</option>
                        {availableUsers.map(u => (
                            <option key={u.user_id_pk} value={u.user_id_pk}>
                                {u.user_firstname} {u.user_lastname} ({u.user_id_pk})
                            </option>
                        ))}
                    </select>
                )}
                {errors.UserIdPk && <p className="error-message">{errors.UserIdPk}</p>}
                {errors.users && <p className="error-message">{errors.users}</p>}
            </div>

            <div className="form-group">
                <label htmlFor="RoleIdPkForm">Role for this Customer (*)</label>
                {loadingRoles ? (
                    <p>Loading roles...</p>
                ) : (
                    <select id="RoleIdPkForm" name="RoleIdPk" value={formData.RoleIdPk} onChange={handleChange} required>
                        <option value="">--- Select Role ---</option>
                        {availableRoles.map(r => (
                            <option key={r.role_id_pk} value={r.role_id_pk}>
                                {r.role_name} (ID: {r.role_id_pk})
                            </option>
                        ))}
                        {availableRoles.length === 0 && !loadingRoles && <option value="" disabled>No roles found for this customer.</option>}
                    </select>
                )}
                {errors.RoleIdPk && <p className="error-message">{errors.RoleIdPk}</p>}
                {errors.roles && <p className="error-message">{errors.roles}</p>}
            </div>

            <div className="form-group">
                <label htmlFor="CubeUserWhenSendStatsIfAdminForm">Send Stats Option (*)</label>
                <select
                    id="CubeUserWhenSendStatsIfAdminForm"
                    name="CubeUserWhenSendStatsIfAdmin"
                    value={formData.CubeUserWhenSendStatsIfAdmin}
                    onChange={handleChange}
                    required
                >
                    {getDropdownOptions(CUBE_USER_WHEN_SEND_STATS_OPTIONS).map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                {errors.CubeUserWhenSendStatsIfAdmin && <p className="error-message">{errors.CubeUserWhenSendStatsIfAdmin}</p>}
            </div>

            <div className="form-actions">
                <button type="submit" className="primary">{isEditMode ? 'Save Changes' : 'Add Association'}</button>
                <button type="button" className="secondary" onClick={onCancel} style={{ marginLeft: '10px' }}>Cancel</button>
            </div>
        </form>
    );
};

export default CubeUserAssociationForm;