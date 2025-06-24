// Créez ce nouveau fichier : src/pages/OlapQueryLogPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import olapQueryLogService from '../api/olapQueryLogService';
import OlapQueryLogList from '../components/OlapQueryLogList';
import Pagination from '../components/Pagination';

function OlapQueryLogPage() {
    const [logs, setLogs] = useState([]);
    const [pagination, setPagination] = useState({ pageIndex: 1, pageSize: 20, totalPages: 0, totalCount: 0 });
    const [filters, setFilters] = useState({ userFilter: '', startDateFilter: '', endDateFilter: '' });
    const [activeFilters, setActiveFilters] = useState(filters); // Pour ne lancer la recherche qu'au clic
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                pageIndex: pagination.pageIndex,
                pageSize: pagination.pageSize,
                ...activeFilters
            };
            const response = await olapQueryLogService.getLogs(params);
            const { items, totalPages, totalCount } = response.data;
            setLogs(items);
            setPagination(prev => ({ ...prev, totalPages, totalCount }));
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load logs. The server might be busy or an error occurred.");
        } finally {
            setLoading(false);
        }
    }, [pagination.pageIndex, pagination.pageSize, activeFilters]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleApplyFilters = (e) => {
        e.preventDefault();
        setPagination(prev => ({...prev, pageIndex: 1})); // Réinitialiser à la première page
        setActiveFilters(filters);
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({...prev, pageIndex: newPage}));
    };

    return (
        <div className="container mt-4">
            <h2>OLAP Query Logs</h2>

            <form onSubmit={handleApplyFilters} className="card card-body mb-4">
                <div className="row g-3 align-items-end">
                    <div className="col-md-4">
                        <label htmlFor="userFilter" className="form-label">Filter by User</label>
                        <input type="text" id="userFilter" name="userFilter" className="form-control"
                               value={filters.userFilter} onChange={handleFilterChange} />
                    </div>
                    <div className="col-md-3">
                        <label htmlFor="startDateFilter" className="form-label">Start Date</label>
                        <input type="date" id="startDateFilter" name="startDateFilter" className="form-control"
                               value={filters.startDateFilter} onChange={handleFilterChange} />
                    </div>
                    <div className="col-md-3">
                        <label htmlFor="endDateFilter" className="form-label">End Date</label>
                        <input type="date" id="endDateFilter" name="endDateFilter" className="form-control"
                               value={filters.endDateFilter} onChange={handleFilterChange} />
                    </div>
                    <div className="col-md-2">
                        <button type="submit" className="btn btn-primary w-100">Apply Filters</button>
                    </div>
                </div>
            </form>

            {loading && <p className="text-center">Loading logs...</p>}
            {error && <p className="alert alert-danger">{error}</p>}
            {!loading && !error && (
                <>
                    <p>Total logs found: <strong>{pagination.totalCount}</strong></p>
                    <OlapQueryLogList logs={logs} />
                    <Pagination
                        currentPage={pagination.pageIndex}
                        totalPages={pagination.totalPages}
                        onPageChange={handlePageChange}
                    />
                </>
            )}
        </div>
    );
}

export default OlapQueryLogPage;