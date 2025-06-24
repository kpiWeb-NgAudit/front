// src/components/CalcTypeList.jsx
import React from 'react';

const CalcTypeList = ({ calcTypes, loading, error }) => {
    if (loading) return <p>Loading calculation types...</p>;
    if (error) return <p className="error-message">Error loading calculation types: {error.message || JSON.stringify(error)}</p>;

    if (!calcTypes || !Array.isArray(calcTypes) || calcTypes.length === 0) {
        return <p>No calculation types found or defined in the system.</p>;
    }

    return (
        <div className="calctype-list-container" style={{overflowX: 'auto'}}>
            <table>
                <thead>
                <tr>
                    <th>Calc Type ID (Code)</th>
                    <th>Description (Comments)</th>
                    {/* Timestamp is usually not shown */}
                </tr>
                </thead>
                <tbody>
                {/* Assuming API DTO has CalcTypeType, CalcTypeComments */}
                {calcTypes.map((ct) => (
                    <tr key={ct.calcTypeType}> {/* PK is the type string itself */}
                        <td><code>{ct.calcTypeType === "" ? "'' (Empty String)" : ct.calcTypeType}</code></td>
                        <td>{ct.calcTypeComments}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default CalcTypeList;