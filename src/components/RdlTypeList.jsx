// src/components/RdlTypeList.jsx
import React from 'react';
// No useNavigate needed here if all actions are handled by parent via props

const RdlTypeList = ({ rdlTypes, loading, error }) => {
    // Log props to see what's being received, especially when "All Groups" is selected
    // console.log("RdlTypeList - Props received: loading:", loading, "error:", error, "rdlTypes:", rdlTypes);

    if (loading) {
        return <p>Loading RDL types...</p>;
    }
    if (error) {
        // Ensure error is an object with a message property or a string
        const errorMessage = typeof error === 'string' ? error : error?.message || 'An unknown error occurred while loading RDL types.';
        return <p className="error-message">Error: {errorMessage}</p>;
    }

    if (!rdlTypes || !Array.isArray(rdlTypes) || rdlTypes.length === 0) {
        // console.log("RdlTypeList - No RDL types to display.");
        return <p>No RDL types found matching your criteria or defined in the system.</p>;
    }

    return (
        <div className="rdltype-list-container" style={{overflowX: 'auto'}}>
            <table>
                <thead>
                <tr>
                    <th>Type ID (RdlTypeIdPk)</th>
                    <th>Type Label (RdlTypeLabel)</th>
                    <th>Group ID (RdlGroupIdPk)</th>
                    <th>Group Name (RdlGroupName)</th>
                    {/* If you add timestamp to RdlTypeDto and want to display it: */}
                    {/* <th>Timestamp</th> */}
                </tr>
                </thead>
                <tbody>
                {rdlTypes.map((type) => (
                    <tr key={type.rdlTypeIdPk}> {/* Use the unique RDL Type ID as the key */}
                        <td>{type.rdlTypeIdPk === "" ? "'' (Empty String ID)" : type.rdlTypeIdPk}</td>
                        <td>{type.rdlTypeLabel || 'N/A'}</td>
                        <td>{type.rdlGroupIdPk || 'N/A'}</td>
                        <td>{type.rdlGroupName || 'N/A'}</td>
                        {/*
                            <td>
                                {type.RdlTypeTimestamp
                                    ? new Date(type.RdlTypeTimestamp).toLocaleString()
                                    : 'N/A'}
                            </td>
                            */}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default RdlTypeList;