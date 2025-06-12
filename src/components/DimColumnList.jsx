// src/components/DimColumnList.jsx
import React from 'react';

const DimColumnList = ({ dimColumns, onEdit, onDelete, loading, error }) => {
    if (loading) return <p>Loading dimension columns...</p>;
    if (error) return <p className="error-message">Error loading dimension columns: {error}</p>;

    if (!dimColumns || dimColumns.length === 0) {
        return <p>No dimension columns defined for this dimension yet.</p>;
    }

    return (
        <div className="dimcolumn-list-container" style={{overflowX: 'auto'}}>
            <table>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Col Name (CName)</th>
                    <th>Use</th>
                    <th>Type</th>
                    <th>Short Cube Name</th>
                    <th>Work Order</th>
                    <th>Visible</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {dimColumns.map((col) => (
                    <tr key={col.dimcol_id_pk}>
                        <td>{col.dimcol_id_pk}</td>
                        <td>{col.dimcol_cname}</td>
                        <td>{col.dimcol_use}</td>
                        <td>{col.dimcol_type}</td>
                        <td>{col.dimcol_shortcubename}</td>
                        <td>{col.dimcol_workorder}</td>
                        <td>{col.dimcol_cubevisible}</td>
                        <td className="actions">
                            <button className="secondary" onClick={() => onEdit(col)}>Edit</button>
                            <button className="danger" onClick={() => onDelete(col.dimcol_id_pk)}>Delete</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default DimColumnList;