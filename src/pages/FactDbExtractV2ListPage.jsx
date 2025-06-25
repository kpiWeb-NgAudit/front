// Créez ce nouveau fichier : src/pages/FactDbExtractV2ListPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import factDbExtractV2Service from '../api/factDbExtractV2Service';

function FactDbExtractV2ListPage() {
    const [extracts, setExtracts] = useState([]);
    const [paginationInfo, setPaginationInfo] = useState({ pageNumber: 1, pageSize: 20 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Note: Le backend ne retourne pas le total. On fait une pagination simple.
    const fetchExtracts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await factDbExtractV2Service.getAllExtracts(paginationInfo);
            setExtracts(response.data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load extracts.");
        } finally {
            setLoading(false);
        }
    }, [paginationInfo]);

    useEffect(() => {
        fetchExtracts();
    }, [fetchExtracts]);

    // Pour une pagination simple sans total, on peut juste incrémenter/décrémenter.
    const handlePageChange = (direction) => {
        if (direction === 'next') {
            setPaginationInfo(prev => ({ ...prev, pageNumber: prev.pageNumber + 1 }));
        } else if (direction === 'prev' && paginationInfo.pageNumber > 1) {
            setPaginationInfo(prev => ({ ...prev, pageNumber: prev.pageNumber - 1 }));
        }
    };

    if (loading) return <p>Loading Fact DB Extracts...</p>;
    if (error) return <p className="alert alert-danger">{error}</p>;

    return (
        <div className="container mt-4">
            <h2>Fact DB Extracts (All)</h2>
            <p>This is a read-only audit list. Management is done on the 'Edit Fact' page.</p>
            <table className="table table-striped">
                <thead>
                <tr>
                    <th>Associated Fact</th>
                    <th>Prod Source ID</th>
                    <th>Customer ID</th>
                    <th>Date Inserted</th>
                    <th>Comments</th>
                </tr>
                </thead>
                <tbody>
                {extracts.map((item, index) => (
                    <tr key={`${item.factId}-${item.prodDataSourceId}-${item.dateInsert}`}>
                        <td><Link to={`/facts/edit/${item.factId}`}>{item.factName}</Link></td>
                        <td>{item.prodDataSourceId}</td>
                        <td>{item.customerId}</td>
                        <td>{new Date(item.dateInsert).toLocaleString()}</td>
                        <td>{item.comments}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            <nav>
                <ul className="pagination">
                    <li className={`page-item ${paginationInfo.pageNumber === 1 ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => handlePageChange('prev')}>Previous</button>
                    </li>
                    <li className={`page-item ${extracts.length < paginationInfo.pageSize ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => handlePageChange('next')}>Next</button>
                    </li>
                </ul>
            </nav>
        </div>
    );
}

export default FactDbExtractV2ListPage;