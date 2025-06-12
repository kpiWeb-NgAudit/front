// src/components/HierarchyList.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const HierarchyList = ({ hierarchies, onDelete, loading, error, onAdd, parentIdForFilter, parentType }) => {
    const navigate = useNavigate();

    // No formatDate needed here unless you add a date field to the list

    if (loading) return <p>Loading hierarchies...</p>;
    if (error) return <p className="error-message">Error loading hierarchies: {error.message || JSON.stringify(error)}</p>;

    const noHierarchiesContent = (
        <div>
            <p>No hierarchies found {parentIdForFilter ? `for ${parentType} ID ${parentIdForFilter}` : ''}.</p>
            {onAdd && (
                <button className="primary" onClick={onAdd} style={{ marginTop: '10px' }}>
                    Add New Hierarchy
                </button>
            )}
        </div>
    );

    if (!hierarchies || hierarchies.length === 0) {
        return noHierarchiesContent;
    }

    return (
        <div>
            {onAdd && (
                <button className="primary" onClick={onAdd} style={{ marginBottom: '20px' }}>
                    Add New Hierarchy
                </button>
            )}
            <table>
                <thead>
                <tr>
                    <th>ID (HierIdPk)</th>
                    <th>Cube Name (HierCubeName)</th>
                    <th>Visible</th>
                    <th>RDL Filter</th>
                    <th>Dimension ID (DimIdPk)</th>
                    <th>Work Order</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {hierarchies.map((hier) => (
                    <tr key={hier.hier_id_pk}> {/* Use actual PK name from data */}
                        <td>{hier.hier_id_pk}</td>
                        <td>{hier.hier_cubename}</td>
                        <td>{hier.hier_visiblecube}</td>
                        <td>{hier.hier_rdlshowfilter}</td>
                        <td>{hier.dim_id_pk}</td>
                        <td>{hier.hier_workorder}</td>
                        <td className="actions">
                            <button
                                className="secondary"
                                onClick={() => navigate(`/hierarchies/edit/${hier.hier_id_pk}`)}
                            >
                                Edit
                            </button>
                            <button
                                className="danger"
                                onClick={() => onDelete(hier.hier_id_pk)}
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

export default HierarchyList;