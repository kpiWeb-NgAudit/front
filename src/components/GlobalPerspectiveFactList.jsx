// src/components/GlobalPerspectiveFactList.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const GlobalPerspectiveFactList = ({ associations, onDelete, loading, error }) => { // Added onDelete prop
    if (loading) return <p>Loading perspective-fact associations...</p>;
    if (error) return <p className="error-message">Error: {error.message || JSON.stringify(error)}</p>;

    if (!associations || !Array.isArray(associations) || associations.length === 0) {
        return <p>No perspective-fact associations found matching your criteria.</p>;
    }

    return (
        <div className="global-perspective-fact-list-container" style={{overflowX: "auto"}}>
            <table>
                <thead>
                <tr>
                    <th>Perspective Name (ID)</th>
                    <th>Fact Name (ID)</th>
                    <th>Customer (of Perspective)</th>
                    <th>Actions</th> {/* Changed header */}
                </tr>
                </thead>
                <tbody>
                {associations.map((assoc) => (
                    <tr key={`${assoc.perspIdPk}-${assoc.factIdPk}`}>
                        <td>
                            {/* Still useful to link to the perspective itself */}
                            <Link to={`/perspectives/edit/${assoc.perspIdPk}`}>
                                {assoc.perspectiveName || 'N/A'} ({assoc.perspIdPk})
                            </Link>
                        </td>
                        <td>
                            {/* Display Fact Name, maybe link to Fact if desired for info */}
                            {assoc.factName || 'N/A'} ({assoc.factIdPk})
                            {/* If you still want a link to the fact for viewing:
                                <Link to={`/facts/edit/${assoc.factIdPk}`}>
                                    {assoc.factName || 'N/A'} ({assoc.factIdPk})
                                </Link>
                                */}
                        </td>
                        <td>{assoc.customerIdOfPerspective || 'N/A'}</td>
                        <td className="actions">
                            <button
                                className="danger" // Style as a delete button
                                onClick={() => onDelete(assoc.perspIdPk, assoc.factIdPk)}
                            >
                                Delete Association
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default GlobalPerspectiveFactList;