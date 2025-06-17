// src/pages/SourceListPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getAllSources, deleteSource as apiDeleteSource } from '../api/sourceService';
import { getAllCustomers } from '../api/customerService';
import SourceList from '../components/SourceList';

function SourceListPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [sources, setSources] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCubeId, setSelectedCubeId] = useState(searchParams.get('cubeIdPk') || '');
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('pageNumber')) || 1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);

    const fetchSourcesAndCustomers = useCallback(async (page = currentPage) => {
        setLoading(true); setError(null);
        try {
            const paramsForSources = { pageNumber: page, pageSize };
            if (selectedCubeId) paramsForSources.cubeIdPk = selectedCubeId;

            const [sourceResponse, custResponse] = await Promise.allSettled([
                getAllSources(paramsForSources),
                customers.length === 0 ? getAllCustomers({ pageSize: 1000 }) : Promise.resolve(customers) // Pass existing if already loaded
            ]);

            if (sourceResponse.status === 'fulfilled' && sourceResponse.value) {
                setSources(sourceResponse.value.data || []);
                const totalItems = sourceResponse.value.headers['x-pagination-totalitems'];
                const currentPgSize = sourceResponse.value.headers['x-pagination-pagesize'] || pageSize;
                if (totalItems && currentPgSize) setTotalPages(Math.ceil(parseInt(totalItems) / parseInt(currentPgSize)));
                else setTotalPages(sourceResponse.value.data?.length > 0 ? Math.ceil(sourceResponse.value.data.length / pageSize) : 0);
            } else { setSources([]); setError(sourceResponse.reason?.message || "Failed to load sources."); }

            if (custResponse.status === 'fulfilled' && Array.isArray(custResponse.value)) { // If getAllCustomers returns array directly
                if (customers.length === 0) setCustomers(custResponse.value);
            } else if (custResponse.status === 'fulfilled' && custResponse.value && Array.isArray(custResponse.value.data)){ // If it returns {data, headers}
                if (customers.length === 0) setCustomers(custResponse.value.data);
            } else if (customers.length === 0) { console.error("Error fetching customers for filter:", custResponse.reason); }

            setCurrentPage(page);
        } catch (err) { setError(err.message); setSources([]); }
        finally { setLoading(false); }
    }, [selectedCubeId, pageSize, currentPage, customers]); // customers in dep array for conditional fetch

    useEffect(() => {
        const pageToFetch = parseInt(searchParams.get('pageNumber')) || 1;
        if (pageToFetch !== currentPage) setCurrentPage(pageToFetch);
        fetchSourcesAndCustomers(pageToFetch);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCubeId, searchParams.get('pageNumber'), pageSize]);


    const handleDeleteSource = async (id) => {
        if (!window.confirm(`Delete source ID: ${id}?`)) return;
        try {
            await apiDeleteSource(id);
            alert(`Source ID: ${id} deleted.`);
            if (sources.length === 1 && currentPage > 1) handlePageChange(currentPage - 1);
            else fetchSourcesAndCustomers(currentPage);
        } catch (err) { alert(`Error: ${err.response?.data?.message || err.message}`); }
    };

    const handleFilterChange = (setter, paramName, value) => { /* ... as before ... */
        setter(value); setCurrentPage(1);
        const newSearchParams = new URLSearchParams(searchParams);
        if (value) newSearchParams.set(paramName, value); else newSearchParams.delete(paramName);
        newSearchParams.set('pageNumber', '1'); setSearchParams(newSearchParams);
    };
    const clearFilters = () => { /* ... as before ... */
        setSelectedCubeId(''); setCurrentPage(1); setSearchParams({pageNumber: '1'});
    };
    const handlePageChange = (newPage) => { /* ... as before ... */
        if (newPage >= 1 && (newPage <= totalPages || totalPages === 0) ) {
            setCurrentPage(newPage);
            const params = { pageNumber: String(newPage) };
            if (selectedCubeId) params.cubeIdPk = selectedCubeId;
            setSearchParams(params);
        }
    };

    return (
        <div>
            <h1>Sources Management</h1>
            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div>
                    <label htmlFor="customerFilterSourcePage" style={{ marginRight: '10px' }}>Filter by Customer:</label>
                    <select id="customerFilterSourcePage" value={selectedCubeId} onChange={(e) => handleFilterChange(setSelectedCubeId, 'cubeIdPk', e.target.value)}>
                        <option value="">All Customers</option>
                        {customers.map(cust => <option key={cust.cube_id_pk} value={cust.cube_id_pk}>{cust.cube_name} ({cust.cube_id_pk})</option>)}
                    </select>
                </div>
                <button onClick={clearFilters} className="secondary">Clear Filters</button>
                <button className="primary" onClick={() => navigate(selectedCubeId ? `/sources/add?cubeIdPk=${selectedCubeId}` : '/sources/add')} style={{ marginLeft: 'auto' }}>
                    Add New Source
                </button>
            </div>

            <SourceList
                sources={sources}
                onEdit={(source) => navigate(`/sources/edit/${source.source_id_pk}`)}
                onDelete={handleDeleteSource}
                loading={loading}
                error={error}
                // onAdd is handled by the button above for a top-level page
            />

            {/* Corrected Comment for Pagination Controls */}
            {totalPages > 0 && (
                <div className="pagination-controls" style={{ marginTop: '20px', textAlign: 'center' }}>
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Prev</button>
                    <span> Page {currentPage} of {totalPages} </span>
                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0}>Next</button>
                </div>
            )}
            {/* If you wanted a comment here instead of the actual controls: */}
            {/* {totalPages > 0 && (
                {/* This is where pagination controls would go if implemented for real * / }
            )} */}
        </div>
    );
}
export default SourceListPage;