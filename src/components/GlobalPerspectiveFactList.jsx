// src/components/GlobalPerspectiveFactList.jsx
import React from 'react';
import { Link } from 'react-router-dom'; // To link to parent entities

const GlobalPerspectiveFactList = ({ associations, loading, error }) => {
    if (loading) return <p>Loading perspective-fact associations...</p>;
    if (error) return <p className="error-message">Error: {error.message || JSON.stringify(error)}</p>;

    if (!associations || associations.length === 0) {
        return <p>No perspective-fact associations found matching your criteria.</p>;
    }

    return (
        <div className="global-perspective-fact-list-container" style={{overflowX: "auto"}}>
            <table>
                <thead>
                <tr>
                    <th>Perspective ID</th>
                    <th>Perspective Name</th>
                    <th>Fact ID</th>
                    <th>Fact Name</th>
                    <th>Customer (of Perspective)</th>
                    {/* Timestamp is usually not needed for display */}
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {/* associations is an array of PerspectiveFactAssociationDto */}
                {associations.map((assoc) => (
                    <tr key={`${assoc.perspIdPk}-${assoc.factIdPk}`}>
                        <td>{assoc.perspIdPk}</td>
                        <td>{assoc.perspectiveName || 'N/A'}</td>
                        <td>{assoc.factIdPk}</td>
                        <td>{assoc.factName || 'N/A'}</td>
                        <td>{assoc.customerIdOfPerspective || 'N/A'}</td>
                        <td>
                            <Link to={`/perspectives/edit/${assoc.perspIdPk}`} className="button-link-inline" style={{marginRight: '5px'}}>
                                View Perspective
                            </Link>
                            <Link to={`/facts/edit/${assoc.factIdPk}`} className="button-link-inline">
                                View Fact
                            </Link>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default GlobalPerspectiveFactList;