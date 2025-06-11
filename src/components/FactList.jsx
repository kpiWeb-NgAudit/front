import React from 'react';
import { useNavigate } from 'react-router-dom';

const FactList = ({ facts, onDelete, loading, error, onAdd, cubeIdForFilter }) => {
    const navigate = useNavigate();

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString();
        } catch (e) {
            return dateString;
        }
    };

    if (loading) return <p>Loading facts...</p>;
    if (error) return <p className="error-message">Error loading facts: {error.message || JSON.stringify(error)}</p>;

    const noFactsContent = (
        <div>
            <p>No facts found {cubeIdForFilter ? `for customer ${cubeIdForFilter}` : ''}.</p>
            {onAdd && (
                <button className="primary" onClick={onAdd} style={{ marginTop: '10px' }}>
                    Add New Fact
                </button>
            )}
        </div>
    );

    if (!facts || facts.length === 0) {
        return noFactsContent;
    }

    return (
        <div>
            {onAdd && (
                <button className="primary" onClick={onAdd} style={{ marginBottom: '20px' }}>
                    Add New Fact
                </button>
            )}
            <table>
                <thead>
                <tr>
                    <th>ID (FactIdPk)</th>
                    <th>Table Name (FactTname)</th>
                    <th>Type</th>
                    <th>Short Cube Name</th>
                    <th>Customer ID (CubeIdPk)</th>
                    <th>Last Update</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {facts.map((fact) => (
                    <tr key={fact.fact_id_pk}> {/* Use actual PK name from data */}
                        <td>{fact.fact_id_pk}</td>
                        <td>{fact.fact_tname}</td>
                        <td>{fact.fact_type}</td>
                        <td>{fact.fact_shortcubename}</td>
                        <td>{fact.cube_id_pk}</td>
                        <td>{formatDate(fact.fact_lastupdate)}</td>
                        <td className="actions">
                            <button
                                className="secondary"
                                onClick={() => navigate(`/facts/edit/${fact.fact_id_pk}`)}
                            >
                                Edit
                            </button>
                            <button
                                className="danger"
                                onClick={() => onDelete(fact.fact_id_pk)}
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

export default FactList;