// src/components/AssociatedFactList.jsx
import React from 'react';

const AssociatedFactList = ({ associatedFacts, onDisassociate, loading, error }) => {
    if (loading) return <p>Loading associated facts...</p>;
    if (error) return <p className="error-message">Error loading associated facts: {error.message || JSON.stringify(error)}</p>;

    if (!associatedFacts || associatedFacts.length === 0) {
        return <p>No facts are currently associated with this perspective.</p>;
    }

    return (
        <div className="associated-fact-list-container">
            <table>
                <thead>
                <tr>
                    <th>Fact ID</th>
                    <th>Fact Name</th>
                    <th>Customer ID (of Fact)</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {/* associatedFacts is an array of PerspectiveFactAssociationDto */}
                {/* DTO has FactIdPk, FactName, PerspectiveName, CustomerIdOfPerspective */}
                {associatedFacts.map((assoc) => (
                    <tr key={`${assoc.perspIdPk}-${assoc.factIdPk}`}>
                        <td>{assoc.factIdPk}</td>
                        <td>{assoc.factName || 'N/A'}</td>
                        <td>{assoc.customerIdOfPerspective || 'N/A'}</td> {/* Or fact's own customer if different */}
                        <td className="actions">
                            <button
                                className="danger"
                                onClick={() => onDisassociate(assoc.perspIdPk, assoc.factIdPk)}
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

export default AssociatedFactList;