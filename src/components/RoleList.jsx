// src/components/RoleList.jsx
import React from 'react';

const RoleList = ({ roles, onEdit, onDelete, loading, error }) => {
    if (loading) return <p>Loading roles...</p>;
    if (error) return <p className="error-message">Error loading roles: {error}</p>;

    if (!roles || roles.length === 0) {
        return <p>No roles defined for this customer yet.</p>;
    }

    const displayBool = (value) => {
        if (value === true) return "Yes";
        if (value === false) return "No";
        return "Not Set"; // For null
    };

    return (
        <div className="role-list-container">
            <table>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Role Name</th>
                    <th>Description</th>
                    <th>Cube Write</th>
                    <th>Measures AllowSet</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {roles.map((role) => (
                    <tr key={role.role_id_pk}>
                        <td>{role.role_id_pk}</td>
                        <td>{role.role_name}</td>
                        <td>{role.role_description}</td>
                        <td>{displayBool(role.role_cubewriteallow)}</td>
                        <td>{displayBool(role.role_measures_allowset)}</td>
                        <td className="actions">
                            <button className="secondary" onClick={() => onEdit(role)}>Edit</button>
                            <button className="danger" onClick={() => onDelete(role.role_id_pk)}>Delete</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default RoleList;