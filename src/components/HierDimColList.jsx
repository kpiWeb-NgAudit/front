// src/components/HierDimColList.jsx
import React from 'react';
// No navigate needed here if edit/delete are handled by parent through props

const HierDimColList = ({
                            hierDimCols,
                            onEdit,  // Function to trigger edit modal/form: (hierDimCol) => void
                            onDelete, // Function to trigger delete: (hierIdPk, dimcolIdPk) => void
                            loading,
                            error,
                            // dimColumnsMap // Optional: Pass a map of { dimcolId: dimcolName } for display
                        }) => {

    if (loading) return <p>Loading hierarchy column associations...</p>;
    if (error) return <p className="error-message">Error loading associations: {error.message || JSON.stringify(error)}</p>;

    if (!hierDimCols || hierDimCols.length === 0) {
        return <p>No dimension columns are currently associated with this hierarchy.</p>;
    }

    return (
        <table>
            <thead>
            <tr>
                <th>Dim Column ID</th>
                {/*<th>Dim Column Name</th>  You'd get this from dimColumnsMap or by including in API response DTO */}
                <th>Level</th>
                <th>RDL Type Presname Col</th>
                <th>Actions</th>
            </tr>
            </thead>
            <tbody>
            {hierDimCols.map((hdc) => (
                <tr key={`${hdc.hierIdPk}-${hdc.dimcolIdPk}`}>
                    <td>{hdc.dimcolIdPk}</td>
                    <td>{hdc.dimensionColumnName || 'N/A'}</td>
                    <td>{hdc.hierDimLevel}</td>
                    <td>{hdc.hierDimRdlTypePresnameCol}</td>
                    <td className="actions">
                        <button
                            className="secondary"
                            onClick={() => onEdit(hdc)}
                        >
                            Edit
                        </button>
                        <button
                            className="danger"
                            onClick={() => onDelete(hdc.hierIdPk, hdc.dimcolIdPk)}
                        >
                            Remove
                        </button>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
    );
};

export default HierDimColList;