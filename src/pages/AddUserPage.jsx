// src/pages/AddUserPage.jsx
import React, {useMemo} from 'react';
import { useNavigate } from 'react-router-dom';
import UserForm from '../components/UserForm';
import { createUser } from '../api/userService';

function AddUserPage() {
    const navigate = useNavigate();

    const handleAddUser = async (userData) => {
        try {
            const newUser = await createUser(userData);
            alert(`User "${newUser.user_firstname} ${newUser.user_lastname}" (ID: ${newUser.user_id_pk}) created successfully!`);
            navigate('/users');
        } catch (error) {
            console.error('Failed to create user:', error);
            // Error display is primarily handled by UserForm now
            // This alert is a fallback.
            // alert(`Error creating user: ${error.response?.data?.message || error.message}`);
            throw error; // Re-throw for UserForm to catch and display specific errors
        }
    };

    const stableEmptyInitialData = useMemo(() => ({}), []);

    return (
        <div>
            <h2>Add New User</h2>
            <UserForm
                onSubmit={handleAddUser}
                onCancel={() => navigate('/users')}
                initialData={stableEmptyInitialData}
                isEditMode={false}
            />
        </div>
    );
}
export default AddUserPage;