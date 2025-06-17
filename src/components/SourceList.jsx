// src/components/SourceList.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const SourceList = ({ sources, onEdit, onDelete, loading, error, onAdd }) => {
    const navigate = useNavigate();

    if (loading) return <p>Loading sources...</p>;
    if (error) return <p className="error-message">Error loading sources: {error.message || JSON.stringify(error)}</p>;

    const noSourcesContent = (
        <div>
            <p>No sources found.</p>
            {onAdd && ( // Show Add button if handler is provided
                <button className="primary" onClick={onAdd} style={{ marginTop: '10px' }}>
                    Add New Source
                </button>
            )}
        </div>
    );

    if (!sources || sources.length === 0) {
        return noSourcesContent;
    }

    return (
        <div>
            {onAdd && (
                <button className="primary" onClick={onAdd} style={{ marginBottom: '20px' }}>
                    Add New Source
                </button>
            )}
            <table>
                <thead>
                <tr>
                    <th>ID (SourceIdPk)</th>
                    <th>Source Number</th>
                    <th>Customer ID (CubeIdPk)</th>
                    <th>Comments</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {sources.map((src) => (
                    // Assuming backend entity uses snake_case for properties
                    <tr key={src.source_id_pk}>
                        <td>{src.source_id_pk}</td>
                        <td>{src.source_number}</td>
                        <td>{src.cube_id_pk}</td>
                        <td title={src.source_comments} style={{maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                            {src.source_comments || 'N/A'}
                        </td>
                        <td className="actions">
                            <button
                                className="secondary"
                                onClick={() => onEdit(src)} // Pass whole source object to onEdit
                            >
                                Edit
                            </button>
                            <button
                                className="danger"
                                onClick={() => onDelete(src.source_id_pk)}
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

export default SourceList;