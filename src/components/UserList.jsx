// src/components/UserList.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const UserList = ({ users, onDelete, loading, error, onAdd }) => {
    const navigate = useNavigate();

    if (loading) return <p>Loading users...</p>;
    if (error) return <p className="error-message">Error loading users: {error.message || JSON.stringify(error)}</p>;

    const noUsersContent = (
        <div>
            <p>No users found.</p>
            {onAdd && (
                <button className="primary" onClick={onAdd} style={{ marginTop: '10px' }}>
                    Add New User
                </button>
            )}
        </div>
    );

    if (!users || users.length === 0) {
        return noUsersContent;
    }

    return (
        <div>
            {onAdd && (
                <button className="primary" onClick={onAdd} style={{ marginBottom: '20px' }}>
                    Add New User
                </button>
            )}
            <table>
                <thead>
                <tr>
                    <th>User ID</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Email</th>
                    <th>Type</th>
                    <th>Target Site</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {users.map((user) => (
                    <tr key={user.user_id_pk}>
                        <td>{user.user_id_pk}</td>
                        <td>{user.user_firstname}</td>
                        <td>{user.user_lastname}</td>
                        <td>{user.user_email}</td>
                        <td>{user.user_type}</td>
                        <td>{user.user_targetsite}</td>
                        <td className="actions">
                            <button
                                className="secondary"
                                onClick={() => navigate(`/users/edit/${user.user_id_pk}`)}
                            >
                                Edit
                            </button>
                            <button
                                className="danger"
                                onClick={() => onDelete(user.user_id_pk)}
                            >
                                Delete
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserList;