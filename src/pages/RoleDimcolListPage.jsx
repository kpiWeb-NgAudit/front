// Créez ce nouveau fichier : src/pages/RoleDimcolListPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import roleDimcolService from '../api/roleDimcolService';
import Pagination from '../components/Pagination';

function RoleDimcolListPage() {
    const [permissions, setPermissions] = useState([]);
    const [pagination, setPagination] = useState({ pageIndex: 1, pageSize: 50, totalPages: 0, totalCount: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPermissions = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            const response = await roleDimcolService.getAllPermissions({ pageIndex: pagination.pageIndex, pageSize: pagination.pageSize });
            const { items, totalPages, totalCount } = response.data;
            setPermissions(items);
            setPagination(prev => ({ ...prev, totalPages, totalCount }));
        } catch (err) {
            setError("Failed to load permissions.");
        } finally {
            setLoading(false);
        }
    }, [pagination.pageIndex, pagination.pageSize]);

    useEffect(() => {
        fetchPermissions();
    }, [fetchPermissions]);

    const handlePageChange = (newPage) => {
        setPagination(prev => ({...prev, pageIndex: newPage}));
    };

    if (loading) return <p>Loading all role permissions...</p>;
    if (error) return <p className="alert alert-danger">{error}</p>;

    return (
        <div className="container mt-4">
            <h2>All Role Permissions on Dimension Columns</h2>
            <p>Total Permissions: <strong>{pagination.totalCount}</strong></p>
            <div className="table-responsive">
                <table className="table table-striped table-sm">
                    <thead>
                    <tr>
                        <th>Role</th>
                        <th>Dimension</th>
                        <th>Dimension Column</th>
                        <th>Allow Set</th>
                        <th>Visual Totals</th>
                    </tr>
                    </thead>
                    <tbody>
                    {permissions.map(p => (
                        <tr key={`${p.roleId}-${p.dimcolId}`}>
                            <td><Link to={`/roles/edit/${p.roleId}`}>{p.roleName}</Link></td>
                            <td>{p.dimensionName}</td>
                            <td>{p.dimcolName}</td>
                            <td>{p.allowSet ? '✅ Yes' : '❌ No'}</td>
                            <td>{p.visualTotals === null ? 'N/A' : (p.visualTotals ? '✅ Yes' : '❌ No')}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            <Pagination currentPage={pagination.pageIndex} totalPages={pagination.totalPages} onPageChange={handlePageChange} />
        </div>
    );
}

export default RoleDimcolListPage;