// src/components/RdlListList.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom'; // Only if onEdit navigates directly

const RdlListList = ({ rdlLists, onEdit, onDelete, loading, error, onAdd }) => {
    // const navigate = useNavigate(); // Uncomment if onEdit uses navigate directly here

    console.log("RdlListList PROPS: loading:", loading, "error:", error, "rdlLists:", rdlLists, "Is rdlLists an array?", Array.isArray(rdlLists));

    if (loading) {
        console.log("RdlListList RENDERING: Loading...");
        return <p>Loading RDL lists...</p>;
    }
    if (error) {
        const errorMessage = typeof error === 'string' ? error : error?.message || 'An unknown error occurred.';
        console.log("RdlListList RENDERING: Error state - ", errorMessage);
        return <p className="error-message">Error loading RDL lists: {errorMessage}</p>;
    }

    if (!rdlLists || !Array.isArray(rdlLists) || rdlLists.length === 0) {
        console.log("RdlListList RENDERING: No RDL lists content.");
        const noRdlListsContent = (
            <div>
                <p>No RDL lists found.</p>
                {onAdd && (
                    <button className="primary" onClick={onAdd} style={{ marginTop: '10px' }}>
                        Add New RDL List
                    </button>
                )}
            </div>
        );
        return noRdlListsContent;
    }

    console.log("RdlListList RENDERING: Proceeding to map rdlLists. Count:", rdlLists.length);
    return (
        <div>
            {onAdd && (
                <button className="primary" onClick={onAdd} style={{ marginBottom: '20px' }}>
                    Add New RDL List
                </button>
            )}
            <div style={{overflowX: "auto"}}>
                <table>
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Customer</th>
                        <th>Theme</th>
                        <th>RDL Type</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {rdlLists.map((item) => {
                        // Log each item to check its structure if needed
                        // console.log("RdlListList MAPPING item:", item);
                        return (
                            <tr key={item.rdlListIdPk}> {/* Assuming DTO uses PascalCase */}
                                <td>{item.rdlListIdPk}</td>
                                <td title={item.rdlListName}>{item.rdlListName}</td>
                                <td title={item.rdlListDescription} style={{maxWidth: '250px', whiteSpace: 'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
                                    {item.rdlListDescription}
                                </td>
                                <td>{item.customerName || item.cubeIdPk || 'N/A'}</td>
                                <td>{item.themeLabel || item.themeIdPk || 'N/A'}</td>
                                <td>{item.rdlTypeName || item.rdlTypeIdPk || 'N/A'}</td>
                                <td className="actions">
                                    <button
                                        className="secondary"
                                        onClick={() => onEdit(item)} // Pass the whole item
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="danger"
                                        onClick={() => onDelete(item.rdlListIdPk)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RdlListList;