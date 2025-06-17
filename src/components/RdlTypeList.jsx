// src/components/RdlTypeList.jsx
import React from 'react';

const RdlTypeList = ({ rdlTypes, loading, error }) => {
    if (loading) return <p>Loading RDL types...</p>;
    if (error) return <p className="error-message">Error loading RDL types: {error.message || JSON.stringify(error)}</p>;

    if (!rdlTypes || rdlTypes.length === 0) {
        return <p>No RDL types found or defined in the system.</p>;
    }

    return (
        <div className="rdltype-list-container">
            <table>
                <thead>
                <tr>
                    <th>Type ID (RdlTypeIdPk)</th>
                    <th>Type Label (RdlTypeLabel)</th>
                    <th>Group ID (RdlGroupIdPk)</th>
                    <th>Group Name (RdlGroupName)</th>
                </tr>
                </thead>
                <tbody>
                {/* Assuming API DTO has RdlTypeIdPk, RdlTypeLabel, RdlGroupIdPk, RdlGroupName */}
                {rdlTypes.map((type) => (
                    <tr key={type.rdlTypeIdPk}>
                        <td>{type.rdlTypeIdPk === "" ? "'' (Empty String ID)" : type.rdlTypeIdPk}</td>
                        <td>{type.rdlTypeLabel}</td>
                        <td>{type.rdlGroupIdPk}</td>
                        <td>{type.rdlGroupName || 'N/A'}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default RdlTypeList;