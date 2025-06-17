// src/components/DimDbExtractV2List.jsx
import React from 'react';

const DimDbExtractV2List = ({ extracts, onEdit, onDelete, loading, error }) => {
    if (loading) return <p>Loading data extract definitions...</p>;
    if (error) return <p className="error-message">Error loading extract definitions: {error}</p>;

    if (!extracts || extracts.length === 0) {
        return <p>No data extract definitions found for this dimension.</p>;
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleString(); // Show date and time
        } catch (e) {
            return dateString;
        }
    };

    return (
        <div className="dimdbextractv2-list-container" style={{overflowX: "auto"}}>
            <table>
                <thead>
                <tr>
                    <th>Prod. Source ID</th>
                    <th>Date Insert</th>
                    <th>Comments</th>
                    {/* SQL Clause might be too long for a table view, consider a "View SQL" button */}
                    <th>Customer</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {extracts.map((ext) => (
                    // Key needs all parts of the composite PK
                    <tr key={`${ext.dimIdPk}-${ext.dimDbExtrV2ProdDataSourceId}-${new Date(ext.dimDbExtrV2DateInsert).toISOString()}`}>
                        <td>{ext.dimDbExtrV2ProdDataSourceId}</td>
                        <td>{formatDate(ext.dimDbExtrV2DateInsert)}</td>
                        <td>{ext.dimDbExtrV2Comments}</td>
                        <td>{ext.customerName || ext.cubeIdPk}</td>
                        <td className="actions">
                            <button className="secondary" onClick={() => onEdit(ext)}>Edit</button>
                            <button className="danger" onClick={() => onDelete(ext.dimIdPk, ext.dimDbExtrV2ProdDataSourceId, ext.dimDbExtrV2DateInsert)}>Delete</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default DimDbExtractV2List;