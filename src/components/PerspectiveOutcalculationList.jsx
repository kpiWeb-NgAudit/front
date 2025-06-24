// src/components/PerspectiveOutcalculationList.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const PerspectiveOutcalculationList = ({ associations, onDelete, loading, error, onAdd }) => {
    if (loading) return <p>Loading perspective-outcalculation links...</p>;
    if (error) return <p className="error-message">Error: {error.message || JSON.stringify(error)}</p>;

    if (!associations || associations.length === 0) {
        return (
            <div>
                <p>No perspective-outcalculation links found.</p>
                {onAdd && <button className="primary" onClick={onAdd} style={{marginTop:'10px'}}>Add New Association</button>}
            </div>
        );
    }

    return (
        <div>
            {onAdd && <button className="primary" onClick={onAdd} style={{marginBottom:'20px'}}>Add New Association</button>}
            <div style={{overflowX: "auto"}}>
                <table>
                    <thead>
                    <tr>
                        <th>Perspective Name (ID)</th>
                        <th>Outcalculation String</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {/* associations is an array of PerspectiveOutcalculationDto */}
                    {associations.map((assoc) => (
                        <tr key={`${assoc.perspIdPk}-${assoc.outcalculation}`}>
                            <td>
                                <Link to={`/perspectives/edit/${assoc.perspIdPk}`}>
                                    {assoc.perspectiveName || 'N/A'} ({assoc.perspIdPk})
                                </Link>
                            </td>
                            <td><code>{assoc.outcalculation}</code></td>
                            <td className="actions">
                                <button
                                    className="danger"
                                    onClick={() => onDelete(assoc.perspIdPk, assoc.outcalculation)}
                                >
                                    Delete Association
                                </button>
                                {/* No "Edit" for the association itself, only delete or manage via parent */}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PerspectiveOutcalculationList;