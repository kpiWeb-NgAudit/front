import React from 'react';

const CubesetList = ({ cubesets, onEdit, onDelete, loading, error }) => {
    if (loading) return <p>Loading cubesets...</p>;
    if (error) return <p className="error-message">Error loading cubesets: {error}</p>;

    if (!cubesets || cubesets.length === 0) {
        return <p>No cubesets defined for this customer yet.</p>;
    }

    return (
        <div className="cubeset-list-container">
            <table>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Cube Name</th>
                    <th>Hidden</th>
                    <th>Dynamic</th>
                    <th>Pres. Order</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {cubesets.map((cs) => (
                    <tr key={cs.cubeset_id_pk}>
                        <td>{cs.cubeset_id_pk}</td>
                        <td>{cs.cubeset_name}</td>
                        <td>{cs.cubeset_cubename}</td>
                        <td>{cs.cubeset_hidden}</td>
                        <td>{cs.cubeset_dynamic}</td>
                        <td>{cs.cubeset_presorder}</td>
                        <td className="actions">
                            <button className="secondary" onClick={() => onEdit(cs)}>Edit</button>
                            <button className="danger" onClick={() => onDelete(cs.cubeset_id_pk)}>Delete</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default CubesetList;