// src/components/AssociatedDimensionList.jsx
import React from 'react';
import { Link } from 'react-router-dom'; // Pour lier à la page d'édition de la dimension

const AssociatedDimensionList = ({ associatedDimensions, onDisassociate, loading, error }) => {
    if (loading) return <p>Loading associated dimensions...</p>;
    if (error) return <p className="error-message">Error: {error.message || JSON.stringify(error)}</p>;

    if (!associatedDimensions || associatedDimensions.length === 0) {
        return <p>No dimensions are currently associated with this perspective.</p>;
    }

    return (
        <div className="associated-dimension-list-container">
            <table>
                <thead>
                <tr>
                    <th>Dimension ID</th>
                    <th>Dimension Name</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {/* associatedDimensions est un array de PerspDimnatDto */}
                {/* DTO a PerspId, DimId, DimensionName */}
                {associatedDimensions.map((assoc) => (
                    <tr key={`${assoc.perspId}-${assoc.dimId}`}> {/* Utiliser les clés du DTO */}
                        <td>{assoc.dimId}</td>
                        <td>
                            <Link to={`/dimensions/edit/${assoc.dimId}`}>
                                {assoc.dimensionName || 'N/A'}
                            </Link>
                        </td>
                        <td className="actions">
                            <button
                                className="danger"
                                onClick={() => onDisassociate(assoc.perspId, assoc.dimId)}
                            >
                                Disassociate
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default AssociatedDimensionList;