// src/components/FactColumnList.jsx
import React from 'react';
import { Link } from 'react-router-dom'; // For linking to parent Fact

const FactColumnList = ({ factColumns, onEdit, onDelete, loading, error, onAdd }) => {
    if (loading) return <p>Loading fact columns...</p>;
    if (error) return <p className="error-message">Error: {error.message || JSON.stringify(error)}</p>;

    if (!factColumns || factColumns.length === 0) {
        return (
            <div>
                <p>No fact columns found.</p>
                {onAdd && <button className="primary" onClick={onAdd} style={{marginTop:'10px'}}>Add New Fact Column</button>}
            </div>
        );
    }

    return (
        <div>
            {onAdd && <button className="primary" onClick={onAdd} style={{marginBottom:'20px'}}>Add New Fact Column</button>}
            <div style={{overflowX: "auto"}}>
                <table>
                    <thead>
                    <tr>
                        <th>Col ID</th>
                        <th>Col Name</th>
                        <th>Use</th>
                        <th>Type</th>
                        <th>Fact Name (ID)</th>
                        <th>DimCol ID (Name)</th>
                        <th>Work Order</th>
                        <th>Visible</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {/* Assuming DTO has PascalCase keys: factcolIdPk, factcolCname, factName, dimensionColumnName etc. */}
                    {factColumns.map((col) => (
                        <tr key={col.factcolIdPk}>
                            <td>{col.factcolIdPk}</td>
                            <td title={col.factcolCname}>{col.factcolCname}</td>
                            <td>{col.factcolUse}</td>
                            <td>{col.factcolType}</td>
                            <td>
                                <Link to={`/facts/edit/${col.factIdPk}`}>
                                    {col.factName || `Fact ${col.factIdPk}`}
                                </Link>
                            </td>
                            <td>
                                {col.dimcolIdPk ? (
                                    <Link to={`/dimensions/edit/${col.dimension?.dim_id_pk}/column/${col.dimcolIdPk}`}> {/* Hypothetical detailed dimcol link */}
                                        {col.dimensionColumnName || `DimCol ${col.dimcolIdPk}`}
                                    </Link>
                                ) : 'N/A'}
                            </td>
                            <td>{col.factcolWorkOrder}</td>
                            <td>{col.factcolCubeVisible}</td>
                            <td className="actions">
                                <button className="secondary" onClick={() => onEdit(col)}>Edit</button>
                                <button className="danger" onClick={() => onDelete(col.factcolIdPk)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FactColumnList;