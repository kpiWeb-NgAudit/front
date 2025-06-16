// src/components/CubeUserAssociationList.jsx
import React from 'react';

const CubeUserAssociationList = ({ associations, onEdit, onDelete, loading, error }) => {
    if (loading) return <p>Loading user associations...</p>;
    if (error) return <p className="error-message">Error loading associations: {error.message || JSON.stringify(error)}</p>;

    if (!associations || associations.length === 0) {
        return <p>No users are currently associated with this customer.</p>;
    }

    return (
        <div className="cube-user-list-container">
            <table>
                <thead>
                <tr>
                    <th>User ID</th>
                    <th>User Name</th> {/* From CubeUserDto */}
                    <th>Role Name</th> {/* From CubeUserDto */}
                    <th>Send Stats When</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {associations.map((assoc) => (
                    <tr key={`${assoc.cubeIdPk}-${assoc.userIdPk}`}>
                        <td>{assoc.userIdPk}</td>
                        <td>{assoc.userFullName || 'N/A'}</td>
                        <td>{assoc.roleName || 'N/A'}</td>
                        <td>{assoc.cubeUserWhenSendStatsIfAdmin}</td>
                        <td className="actions">
                            <button className="secondary" onClick={() => onEdit(assoc)}>Edit Role/Settings</button>
                            <button className="danger" onClick={() => onDelete(assoc.cubeIdPk, assoc.userIdPk)}>Remove User</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default CubeUserAssociationList;