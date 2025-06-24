// Créer ce nouveau fichier : src/pages/SourceFactAssociationListPage.jsx

import React, { useState, useEffect } from 'react';
import sourceFactService from '../api/sourceFactService';
import { Link } from 'react-router-dom';

function SourceFactAssociationListPage() {
    const [associations, setAssociations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        sourceFactService.getAllSourceFacts()
            .then(response => {
                setAssociations(response.data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.response?.data?.message || 'Failed to load associations.');
                setLoading(false);
            });
    }, []);

    if (loading) return <p>Loading source-fact associations...</p>;
    if (error) return <p className="alert alert-danger">{error}</p>;

    return (
        <div className="container mt-4">
            <h2>All Source-Fact Associations</h2>
            <p>This is a read-only list for auditing purposes. Management is done on the 'Edit Source' page.</p>
            <table className="table table-striped">
                <thead>
                <tr>
                    <th>Source</th>
                    <th>Associated Fact</th>
                    <th>Days to Load</th>
                    <th>Autodoc</th>
                </tr>
                </thead>
                <tbody>
                {associations.map(item => (
                    <tr key={`${item.sourceId}-${item.factId}`}>
                        <td>
                            <Link to={`/sources/edit/${item.sourceId}`}>{item.sourceDescription || `Source ID: ${item.sourceId}`}</Link>
                        </td>
                        <td>
                            <Link to={`/facts/edit/${item.factId}`}>{item.factShortPresName}</Link>
                        </td>
                        <td>{item.nbDaysLoad}</td>
                        <td>{item.autodoc}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

export default SourceFactAssociationListPage;