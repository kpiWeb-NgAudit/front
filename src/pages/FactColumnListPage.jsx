// src/pages/FactColumnListPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getAllFactColumns, deleteFactColumn as apiDelete } from '../api/factColumnService';
import { getAllFacts } from '../api/factService'; // For parent fact filter
import FactColumnList from '../components/FactColumnList';

function FactColumnListPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [factColumns, setFactColumns] = useState([]);
    const [facts, setFacts] = useState([]); // For filter dropdown
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const selectedFactId = searchParams.get('factIdPk') || '';
    const currentPage = parseInt(searchParams.get('pageNumber')) || 1;
    const [pageSize] = useState(10); // Or make configurable
    const [totalPages, setTotalPages] = useState(0);

    // Fetch parent facts for filter dropdown (runs once)
    useEffect(() => {
        setLoading(true); // Indicate general loading
        getAllFacts({ pageSize: 1000 }) // Assuming getAllFacts returns {data, headers}
            .then(response => {
                setFacts(response.data || []);
            })
            .catch(err => {
                console.error("FactColumnListPage: Failed to load facts for filter", err);
                setError(prev => ({ ...prev, filters: "Failed to load parent facts."}));
                setFacts([]);
            })
            .finally(() => {
                // Loading state will be set by the main data fetch
            });
    }, []);


    // Fetch Fact Columns based on filter and page
    const fetchFactColumnData = useCallback(async (pageToFetch) => {
        setLoading(true);
        setError(prev => ({...prev, main: null}));
        try {
            const params = { pageNumber: pageToFetch, pageSize };
            if (selectedFactId) {
                params.factIdPk = parseInt(selectedFactId, 10);
            }

            const response = await getAllFactColumns(params);
            if (response && Array.isArray(response.data)) {
                setFactColumns(response.data);
                const totalItems = response.headers['x-pagination-totalitems'];
                const currentPgSize = response.headers['x-pagination-pagesize'] || pageSize;
                if (totalItems && currentPgSize) {
                    setTotalPages(Math.ceil(parseInt(totalItems) / parseInt(currentPgSize)));
                } else {
                    setTotalPages(response.data.length > 0 ? Math.ceil(response.data.length / pageSize) : 0);
                }
            } else {
                setFactColumns([]); setTotalPages(0);
            }
        } catch (err) {
            setError({ message: err.message || "Failed to load fact columns." });
            setFactColumns([]); setTotalPages(0);
        } finally {
            setLoading(false);
        }
    }, [selectedFactId, pageSize]); // Removed currentPage from here, page is passed as arg

    useEffect(() => {
        const pageToFetch = parseInt(searchParams.get('pageNumber')) || 1;
        fetchFactColumnData(pageToFetch);
    }, [selectedFactId, searchParams, pageSize, fetchFactColumnData]); // searchParams to react to URL page changes

    const handleDelete = async (id) => {
        if (!window.confirm(`Delete Fact Column ID: ${id}?`)) return;
        try {
            await apiDelete(id);
            alert(`Fact Column ID: ${id} deleted.`);
            if (factColumns.length === 1 && currentPage > 1) {
                handlePageChange(currentPage - 1);
            } else {
                fetchFactColumnData(currentPage);
            }
        } catch (err) {
            alert(`Error: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleFilterChange = (setter, paramName, value) => {
        setter(value); // This updates local state for selectedFactId
        const newSearchParams = new URLSearchParams(searchParams);
        if (value) newSearchParams.set(paramName, value);
        else newSearchParams.delete(paramName);
        newSearchParams.set('pageNumber', '1');
        setSearchParams(newSearchParams);
    };

    const clearFilters = () => {
        // setSelectedFactId(''); // Not needed if deriving from searchParams
        setSearchParams({ pageNumber: '1' });
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && (newPage <= totalPages || totalPages === 0) && newPage !== currentPage ) {
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.set('pageNumber', String(newPage));
            setSearchParams(newSearchParams);
        }
    };

    return (
        <div>
            <h1>Fact Columns Management</h1>
            <div className="filters" style={{display:'flex', alignItems:'center', gap:'15px', marginBottom:'20px'}}>
                <div>
                    <label htmlFor="factFilterFcPage">Filter by Parent Fact:</label>
                    <select
                        id="factFilterFcPage"
                        value={selectedFactId}
                        onChange={(e) => handleFilterChange(setSelectedFactId /* No need to pass setter */, 'factIdPk', e.target.value)}
                        disabled={loading}
                    >
                        <option value="">All Facts</option>
                        {facts.map(f => <option key={f.fact_id_pk} value={f.fact_id_pk}>{f.fact_tname} (ID: {f.fact_id_pk})</option>)}
                    </select>
                </div>
                <button onClick={clearFilters} className="secondary" disabled={loading}>Clear Filter</button>
                <button className="primary" onClick={() => navigate(selectedFactId ? `/fact-columns/add?factIdPk=${selectedFactId}` : '/fact-columns/add')} style={{marginLeft:'auto'}} disabled={loading}>
                    Add New Fact Column
                </button>
            </div>
            {error && error.filters && <p className="error-message">{error.filters}</p>}
            <FactColumnList
                factColumns={factColumns}
                onEdit={(fc) => navigate(`/fact-columns/edit/${fc.factcolIdPk}`)}
                onDelete={handleDelete}
                loading={loading}
                error={error?.message ? { message: error.message } : null} // Pass main list error
            />
            {totalPages > 0 && !loading && (
                <div className="pagination-controls" style={{ marginTop: '20px', textAlign: 'center' }}>
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Prev</button>
                    <span> Page {currentPage} of {totalPages} </span>
                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0}>Next</button>
                </div>
            )}
        </div>
    );
}

export default FactColumnListPage;