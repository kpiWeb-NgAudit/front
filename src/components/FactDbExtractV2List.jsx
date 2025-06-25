import React from 'react';

function FactDbExtractV2List({ extracts, onEdit, onDelete }) {
    if (!extracts || extracts.length === 0) {
        return <p>No data extracts defined for this fact yet.</p>;
    }
    return (
        <div className="table-responsive">
            <table className="table table-striped table-sm mt-3">
                <thead>
                <tr>
                    <th>Date Inserted</th>
                    <th>Data Source ID</th>
                    <th>Comments</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {extracts.map(ext => (
                    <tr key={`${ext.factId}-${ext.prodDataSourceId}-${ext.dateInsert}`}>
                        <td>{new Date(ext.dateInsert).toLocaleString()}</td>
                        <td>{ext.prodDataSourceId}</td>
                        <td>{ext.comments}</td>
                        <td>
                            <button className="btn btn-sm btn-secondary me-2" onClick={() => onEdit(ext)}>Edit</button>
                            <button className="btn btn-sm btn-danger" onClick={() => onDelete(ext)}>Delete</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
export default FactDbExtractV2List;