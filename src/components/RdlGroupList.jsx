// src/components/RdlGroupList.jsx
import React from 'react';

const RdlGroupList = ({ rdlGroups, loading, error }) => {
    if (loading) return <p>Loading RDL groups...</p>;
    if (error) return <p className="error-message">Error loading RDL groups: {error.message || JSON.stringify(error)}</p>;

    if (!rdlGroups || rdlGroups.length === 0) {
        return <p>No RDL groups found or defined in the system.</p>;
    }

    return (
        <div className="rdlgroup-list-container">
            <table>
                <thead>
                <tr>
                    <th>Group ID (RdlGroupIdPk)</th>
                    <th>Group Label (RdlGroupLabel)</th>
                </tr>
                </thead>
                <tbody>
                {/* Assuming API DTO has RdlGroupIdPk, RdlGroupLabel */}
                {rdlGroups.map((group) => (
                    <tr key={group.rdlGroupIdPk}>
                        <td>{group.rdlGroupIdPk}</td>
                        <td>{group.rdlGroupLabel}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default RdlGroupList;