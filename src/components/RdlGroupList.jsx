// src/components/RdlGroupList.jsx
import React from 'react';

const RdlGroupList = ({ rdlGroups, loading, error }) => {
    if (loading) return <p>Loading RDL groups...</p>;
    if (error) return <p className="error-message">Error loading RDL groups: {error.message || JSON.stringify(error)}</p>;

    if (!rdlGroups || !Array.isArray(rdlGroups) || rdlGroups.length === 0) { // Added Array.isArray check
        return <p>No RDL groups found or defined in the system.</p>;
    }

    return (
        <div className="rdlgroup-list-container">
            <table>
                <thead>
                <tr>
                    <th>Group ID</th> {/* Simplified header */}
                    <th>Group Name</th> {/* Simplified header */}
                </tr>
                </thead>
                <tbody>
                {/* API DTO from your backend returns rdlGroupIdPk, rdlGroupName */}
                {rdlGroups.map((group) => (
                    <tr key={group.rdlGroupIdPk}>
                        <td>{group.rdlGroupIdPk}</td>
                        <td>{group.rdlGroupName || 'N/A'}</td> {/* CORRECTED to rdlGroupName */}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default RdlGroupList;