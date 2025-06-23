// src/components/PerspectiveList.jsx
import React from 'react';

const PerspectiveList = ({ perspectives, onEdit, onDelete, loading, error }) => {
    if (loading) return <p>Loading perspectives...</p>;
    if (error) return <p className="error-message">Error loading perspectives: {error.message || JSON.stringify(error)}</p>;

    if (!perspectives || perspectives.length === 0) {
        return <p>No perspectives defined for this customer yet.</p>;
    }

    return (
        <div className="perspective-list-container">
            <table>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Customer ID</th> {/* Or Customer Name if API returns it */}
                    <th>Comments</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {/* Assuming API DTO has PascalCase keys like PerspIdPk, PerspName, CubeIdPk, CustomerName */}
                {perspectives.map((psp) => (
                    <tr key={psp.perspIdPk}>
                        <td>{psp.perspIdPk}</td>
                        <td>{psp.perspName}</td>
                        <td>{psp.customerName || psp.cubeIdPk}</td> {/* Display name if available */}
                        <td title={psp.perspComments} style={{maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                            {psp.perspComments || 'N/A'}
                        </td>
                        <td className="actions">
                            <button className="secondary" onClick={() => onEdit(psp)}>Edit</button>
                            <button className="danger" onClick={() => onDelete(psp.perspIdPk)}>Delete</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default PerspectiveList;