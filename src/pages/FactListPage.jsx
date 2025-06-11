// src/pages/FactListPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getAllFacts, deleteFact as apiDeleteFact } from '../api/factService';
import { getAllCustomers } from '../api/customerService';
import FactList from '../components/FactList';

function FactListPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [facts, setFacts] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCubeId, setSelectedCubeId] = useState(searchParams.get('cubeIdPk') || '');
    // Pagination state
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('pageNumber')) || 1);
    const [pageSize, setPageSize] = useState(parseInt(searchParams.get('pageSize')) || 10);
    const [totalPages, setTotalPages] = useState(0);


    const fetchFactsAndCustomers = useCallback(async (page = currentPage) => {
        setLoading(true);
        setError(null);
        try {
            const params = { pageNumber: page, pageSize };
            if (selectedCubeId) params.cubeIdPk = selectedCubeId;

            const [factsResponse, custData] = await Promise.all([
                getAllFacts(params),
                getAllCustomers()
            ]);

            setFacts(factsResponse.data || []);
            setCustomers(custData || []);

            // Extract pagination info from headers
            const totalItemsHeader = factsResponse.headers['x-pagination-totalitems'];
            const pageSizeHeader = factsResponse.headers['x-pagination-pagesize'];
            if (totalItemsHeader && pageSizeHeader) {
                setTotalPages(Math.ceil(parseInt(totalItemsHeader) / parseInt(pageSizeHeader)));
            } else {
                setTotalPages(0); // Or 1 if data exists but no headers
            }
            setCurrentPage(page);

        } catch (err) {
            console.error("Error fetching facts data:", err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [selectedCubeId, pageSize, currentPage]); // Include currentPage if it's used directly in API call

    useEffect(() => {
        const pageToFetch = parseInt(searchParams.get('pageNumber')) || 1;
        fetchFactsAndCustomers(pageToFetch);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCubeId, searchParams.get('pageNumber'), pageSize]); // Re-fetch if filter or page in URL changes


    const handleDeleteFact = async (id) => {
        if (!window.confirm(`Delete fact ID: ${id}?`)) return;
        try {
            await apiDeleteFact(id);
            setFacts(prevFacts => prevFacts.filter(f => f.fact_id_pk !== id));
            alert(`Fact ID: ${id} deleted.`);
            // Potentially re-fetch or adjust pagination if on last page and last item deleted
            if (facts.length === 1 && currentPage > 1) {
                handlePageChange(currentPage - 1);
            } else {
                fetchFactsAndCustomers(currentPage); // Refresh current page
            }
        } catch (err) {
            alert(`Error deleting fact: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleCustomerFilterChange = (e) => {
        const newCubeId = e.target.value;
        setSelectedCubeId(newCubeId);
        setCurrentPage(1); // Reset to first page on filter change
        const params = { pageNumber: 1, pageSize };
        if (newCubeId) params.cubeIdPk = newCubeId;
        setSearchParams(params);
    };

    const handleNavigateToAdd = () => {
        navigate(selectedCubeId ? `/facts/add?cubeIdPk=${selectedCubeId}` : '/facts/add');
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            const params = { pageNumber: newPage, pageSize };
            if (selectedCubeId) params.cubeIdPk = selectedCubeId;
            setSearchParams(params);
        }
    };


    return (
        <div>
            <h1>Facts Management</h1>
            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div>
                    <label htmlFor="customerFilter" style={{ marginRight: '10px' }}>Filter by Customer:</label>
                    <select id="customerFilter" value={selectedCubeId} onChange={handleCustomerFilterChange}>
                        <option value="">All Customers</option>
                        {customers.map(cust => <option key={cust.cube_id_pk} value={cust.cube_id_pk}>{cust.cube_name} ({cust.cube_id_pk})</option>)}
                    </select>
                </div>
            </div>

            <FactList
                facts={facts}
                onDelete={handleDeleteFact}
                loading={loading}
                error={error}
                onAdd={handleNavigateToAdd}
                cubeIdForFilter={selectedCubeId}
            />

            {totalPages > 0 && (
                <div className="pagination-controls" style={{ marginTop: '20px', textAlign: 'center' }}>
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                        Previous
                    </button>
                    <span style={{ margin: '0 10px' }}>
                        Page {currentPage} of {totalPages}
                    </span>
                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}

export default FactListPage;