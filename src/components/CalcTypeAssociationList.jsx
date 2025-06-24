// src/components/CalcTypeAssociationList.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const CalcTypeAssociationList = ({ associations, loading, error }) => {
    if (loading) return <p>Loading CalcType associations...</p>;
    if (error) return <p className="error-message">Error: {error.message || JSON.stringify(error)}</p>;

    if (!associations || associations.length === 0) {
        return <p>No Calculation Types are currently associated with Fact Columns matching your criteria.</p>;
    }

    const displayAttribute = (attr) => attr || 'N/A'; // For all the calcfactcol_ attributes

    return (
        <div className="calctype-association-list-container" style={{overflowX: "auto"}}>
            <table>
                <thead>
                <tr>
                    <th>Fact Column (ID)</th>
                    <th>CalcType (ID)</th>
                    <th>Cube Suffix</th>
                    <th>Pres. Suffix</th>
                    <th>Visible</th>
                    {/* Add more headers for other attributes if needed for quick view */}
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {associations.map((assoc) => (
                    <tr key={`${assoc.factcolIdPk}-${assoc.calcTypeType}`}>
                        <td>
                            <Link to={`/fact-columns/edit/${assoc.factcolIdPk}`}> {/* Link to Edit FactColumn Page */}
                                {assoc.factColumnName || 'N/A'} ({assoc.factcolIdPk})
                            </Link>
                        </td>
                        <td>
                            <Link to={`/calculation-types#${assoc.calcTypeType}`}> {/* Link to CalcTypes list, maybe with anchor */}
                                {assoc.calcTypeComment || 'N/A'} ({assoc.calcTypeType})
                            </Link>
                        </td>
                        <td>{displayAttribute(assoc.calcfactcolCubeSuffix)}</td>
                        <td>{displayAttribute(assoc.calcfactcolPresSuffix)}</td>
                        <td>{displayAttribute(assoc.calcfactcolVisible)}</td>
                        <td>
                            <Link
                                to={`/fact-columns/edit/${assoc.factcolIdPk}`} // Go to FactColumn to manage its associations
                                className="button-link-inline"
                                title={`Manage CalcType settings for Fact Column ${assoc.factcolIdPk}`}
                            >
                                Manage Settings
                            </Link>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default CalcTypeAssociationList;