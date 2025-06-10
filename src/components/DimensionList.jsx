// src/components/DimensionList.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const DimensionList = ({ dimensions, onDelete, loading, error, onAdd, cubeIdForFilter }) => {
    const navigate = useNavigate();

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString();
        } catch (e) {
            return dateString;
        }
    };

    if (loading) return <p>Loading dimensions...</p>;
    if (error) return <p className="error-message">Error loading dimensions: {error.message || JSON.stringify(error)}</p>;

    const noDimensionsContent = (
        <div>
            <p>No dimensions found {cubeIdForFilter ? `for customer ${cubeIdForFilter}` : ''}.</p>
            {onAdd && (
                <button className="primary" onClick={onAdd} style={{ marginTop: '10px' }}>
                    Add New Dimension
                </button>
            )}
        </div>
    );

    if (!dimensions || dimensions.length === 0) {
        return noDimensionsContent;
    }

    return (
        <div>
            {onAdd && (
                <button className="primary" onClick={onAdd} style={{ marginBottom: '20px' }}>
                    Add New Dimension
                </button>
            )}
            <table>
                <thead>
                <tr>
                    <th>ID (DimIdPk)</th>
                    <th>Table Name (DimTname)</th>
                    <th>Short Cube Name</th>
                    <th>Cube Type</th>
                    <th>Customer ID (CubeIdPk)</th>
                    <th>Last Update</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {dimensions.map((dim) => (
                    <tr key={dim.dim_id_pk}> {/* Use the actual primary key name from data */}
                        <td>{dim.dim_id_pk}</td>
                        <td>{dim.dim_tname}</td>
                        <td>{dim.dim_shortcubename}</td>
                        <td>{dim.dim_cubetype}</td>
                        <td>{dim.cube_id_pk}</td>
                        <td>{formatDate(dim.dim_lastupdate)}</td>
                        <td className="actions">
                            <button
                                className="secondary"
                                onClick={() => navigate(`/dimensions/edit/${dim.dim_id_pk}`)}
                            >
                                Edit
                            </button>
                            <button
                                className="danger"
                                onClick={() => onDelete(dim.dim_id_pk)}
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

export default DimensionList;