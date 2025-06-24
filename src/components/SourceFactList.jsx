// src/components/SourceFactList.jsx
import React from 'react';

function SourceFactList({ sourceFacts, onEdit, onDelete }) {
    if (!sourceFacts || sourceFacts.length === 0) {
        return <p>No facts associated with this source yet.</p>;
    }

    return (
        <table className="table table-striped mt-3">
            <thead>
            <tr>
                <th>Associated Fact</th>
                <th>Days to Load</th>
                <th>Autodoc</th>
                <th>Actions</th>
            </tr>
            </thead>
            <tbody>
            {sourceFacts.map((sf) => (
                <tr key={sf.factId}>
                    <td>{sf.factShortPresName} (ID: {sf.factId})</td>
                    <td>{sf.nbDaysLoad}</td>
                    <td>{sf.autodoc}</td>
                    <td>
                        <button className="btn btn-sm btn-secondary me-2" onClick={() => onEdit(sf)}>Edit</button>
                        <button className="btn btn-sm btn-danger" onClick={() => onDelete(sf.factId)}>Delete</button>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
    );
}

export default SourceFactList;