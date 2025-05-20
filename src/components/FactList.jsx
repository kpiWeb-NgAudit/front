// src/components/FactList.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FACT_TYPES, FACT_ZONE_SPES, FACT_PARTITION_TYPES } from '../constants/enums'; // For displaying labels

const FactList = ({ facts, onDelete, loading, error }) => {
    const navigate = useNavigate();

    if (loading) return <p>Loading facts...</p>;
    if (error) return <p className="error-message">Error loading facts: {error.message || JSON.stringify(error)}</p>;
    if (!facts || facts.length === 0) return <p>No facts found. <Link to="/add">Add one?</Link></p>;

    const formatDateTime = (isoString) => {
        if (!isoString) return 'N/A';
        try {
            return new Date(isoString).toLocaleString();
        } catch (e) {
            return isoString; // Fallback
        }
    };

    return (
        <div>
            <button className="primary" onClick={() => navigate('/add')} style={{ marginBottom: '20px' }}>
                Add New Fact
            </button>
            <table>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Tech Name</th>
                    <th>Type</th>
                    <th>Short Cube Name</th>
                    <th>Customer ID</th>
                    <th>Zone SPE</th>
                    <th>Partition Type</th>
                    <th>Last Update</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {facts.map((fact) => (
                    <tr key={fact.factIdPk}>
                        <td>{fact.factIdPk}</td>
                        <td>{fact.factTname}</td>
                        <td>{FACT_TYPES[fact.factType] || fact.factType}</td>
                        <td>{fact.factShortcubename}</td>
                        <td>{fact.customerCubeIdPk}</td>
                        <td>{FACT_ZONE_SPES[fact.factZonespe] || fact.factZonespe}</td>
                        <td>{FACT_PARTITION_TYPES[fact.factPartitiontype] || fact.factPartitiontype}</td>
                        <td>{formatDateTime(fact.factLastupdate)}</td>
                        <td className="actions">
                            <button className="secondary" onClick={() => navigate(`/edit/${fact.factIdPk}`)}>Edit</button>
                            <button className="danger" onClick={() => {
                                if (window.confirm(`Are you sure you want to delete fact "${fact.factTname}" (ID: ${fact.factIdPk})?`)) {
                                    onDelete(fact.factIdPk);
                                }
                            }}>Delete</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default FactList;