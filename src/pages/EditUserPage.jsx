// src/pages/EditUserPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import UserForm from '../components/UserForm';
import ChangePasswordForm from '../components/ChangePasswordForm'; // New
import { getUserById, updateUser, changeUserPassword } from '../api/userService';

function EditUserPage() {
    const navigate = useNavigate();
    const { id } = useParams(); // User ID (string from URL)
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUserDetails = useCallback(async () => {
        if (!id) { setError(new Error("User ID missing.")); setLoading(false); return; }
        setLoading(true); setError(null);
        try {
            const data = await getUserById(id);
            setUser(data);
        } catch (err) {
            setError(err.message || "Failed to load user details.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchUserDetails();
    }, [fetchUserDetails]);

    const handleUpdateUserDetails = async (userDataFromForm) => {
        if (!id) return Promise.reject(new Error("User ID missing"));
        try {
            await updateUser(id, userDataFromForm); // updateUser doesn't typically return the full updated object
            alert(`User (ID: ${id}) details updated successfully!`);
            // Re-fetch to get the latest data including new timestamp
            fetchUserDetails();
        } catch (error) {
            console.error('Failed to update user details:', error);
            throw error; // Let UserForm display specific field errors
        }
    };

    const handleChangePassword = async (userId, passwordData) => { // userId is passed for clarity, same as id from params
        try {
            const result = await changeUserPassword(userId, passwordData);
            // Success message is handled by ChangePasswordForm itself
            // alert(result.message || 'Password changed successfully!');
        } catch (error) {
            console.error('Failed to change password:', error);
            throw error; // Let ChangePasswordForm display the error
        }
    };


    if (loading) return <p>Loading user data...</p>;
    if (error) return <p className="error-message">Error: {error}</p>;
    if (!user && !loading) return <p>User not found (ID: {id}).</p>;
    if (!user) return null;

    return (
        <div>
            <h2>Edit User (ID: {user.user_id_pk})</h2>
            <UserForm
                onSubmit={handleUpdateUserDetails}
                onCancel={() => navigate('/users')}
                initialData={user}
                isEditMode={true}
            />
            <hr style={{ margin: '30px 0' }} />
            <ChangePasswordForm
                userId={user.user_id_pk}
                onSubmit={handleChangePassword}
                // onCancel can be used if it's in a modal that needs closing
            />
            {/* Add Role/Customer association management here if needed later */}
        </div>
    );
}
export default EditUserPage;