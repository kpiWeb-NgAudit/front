// src/pages/CubesetListPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getAllCubesets, deleteCubeset as apiDeleteCubeset } from '../api/cubesetService';
import { getAllCustomers } from '../api/customerService'; // To populate customer filter
import CubesetList from '../components/CubesetList'; // Your existing CubesetList component

function CubesetListPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [cubesets, setCubesets] = useState([]);
    const [customers, setCustomers] = useState([]); // For filter dropdown
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedCubeId, setSelectedCubeId] = useState(searchParams.get('cubeIdPk') || '');
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('pageNumber')) || 1);
    const [pageSize] = useState(10); // Or make configurable
    const [totalPages, setTotalPages] = useState(0);

    const fetchCubesetsAndCustomers = useCallback(async (page = currentPage) => {
        setLoading(true);
        setError(null);
        try {
            const paramsForCubesets = { pageNumber: page, pageSize };
            if (selectedCubeId) {
                paramsForCubesets.cubeIdPk = selectedCubeId;
            }

            const [cubesetsResponse, custDataResponse] = await Promise.all([
                getAllCubesets(paramsForCubesets),
                // Fetch customers only if list is empty, to avoid refetching on every page change unless necessary
                customers.length === 0 ? getAllCustomers({ pageSize: 1000 }) : Promise.resolve({ data: customers })
            ]);

            setCubesets(cubesetsResponse.data || []);
            if (customers.length === 0 && custDataResponse.data) { // Only set if fetched
                setCustomers(custDataResponse.data || []);
            }


            const totalItemsHeader = cubesetsResponse.headers['x-pagination-totalitems'];
            const pageSizeHeader = cubesetsResponse.headers['x-pagination-pagesize'];
            if (totalItemsHeader && pageSizeHeader) {
                setTotalPages(Math.ceil(parseInt(totalItemsHeader) / parseInt(pageSizeHeader)));
            } else {
                setTotalPages(cubesetsResponse.data && cubesetsResponse.data.length > 0 ? Math.ceil(cubesetsResponse.data.length / pageSize) : 0);
            }
            setCurrentPage(page);

        } catch (err) {
            console.error("Error fetching cubesets/customers:", err);
            setError(err.message || "Failed to load data.");
            setCubesets([]);
            // setCustomers([]); // Don't clear customers if it was just cubesets failing
        } finally {
            setLoading(false);
        }
    }, [selectedCubeId, pageSize, currentPage, customers]); // Added customers to deps for conditional fetch

    useEffect(() => {
        const pageToFetch = parseInt(searchParams.get('pageNumber')) || 1;
        if (pageToFetch !== currentPage) { // Sync currentPage state with URL on first load or back/forward
            setCurrentPage(pageToFetch);
        }
        fetchCubesetsAndCustomers(pageToFetch);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCubeId, searchParams.get('pageNumber'), pageSize]); // Main trigger


    const handleDeleteCubeset = async (id) => {
        if (!window.confirm(`Delete cubeset ID: ${id}?`)) return;
        try {
            await apiDeleteCubeset(id);
            alert(`Cubeset ID: ${id} deleted.`);
            if (cubesets.length === 1 && currentPage > 1) {
                handlePageChange(currentPage - 1);
            } else {
                fetchCubesetsAndCustomers(currentPage); // Refresh current page
            }
        } catch (err) {
            alert(`Error deleting cubeset: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleCustomerFilterChange = (e) => {
        const newCubeId = e.target.value;
        setSelectedCubeId(newCubeId);
        setCurrentPage(1); // Reset to first page
        const params = { pageNumber: '1' }; // pageSize is fixed for now
        if (newCubeId) params.cubeIdPk = newCubeId;
        setSearchParams(params);
    };

    const handleNavigateToAdd = () => {
        navigate(selectedCubeId ? `/cubesets/add?cubeIdPk=${selectedCubeId}` : '/cubesets/add');
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && (newPage <= totalPages || totalPages === 0) ) {
            setCurrentPage(newPage);
            const params = { pageNumber: String(newPage) };
            if (selectedCubeId) params.cubeIdPk = selectedCubeId;
            // params.pageSize = String(pageSize); // if pageSize can change
            setSearchParams(params);
        }
    };


    return (
        <div>
            <h1>Cubesets Management</h1>
            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div>
                    <label htmlFor="customerFilterCubesetPage" style={{ marginRight: '10px' }}>Filter by Customer:</label>
                    <select id="customerFilterCubesetPage" value={selectedCubeId} onChange={handleCustomerFilterChange}>
                        <option value="">All Customers</option>
                        {customers.map(cust => <option key={cust.cube_id_pk} value={cust.cube_id_pk}>{cust.cube_name} ({cust.cube_id_pk})</option>)}
                    </select>
                </div>
                <button className="primary" onClick={handleNavigateToAdd}>
                    Add New Cubeset
                </button>
            </div>

            <CubesetList
                cubesets={cubesets}
                onEdit={(cubeset) => navigate(`/cubesets/edit/${cubeset.cubeset_id_pk}`)}
                onDelete={handleDeleteCubeset}
                loading={loading}
                error={error}

            />
            {totalPages > 0 && (
                <div className="pagination-controls" style={{ marginTop: '20px', textAlign: 'center' }}>
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Prev</button>
                    <span> Page {currentPage} of {totalPages} </span>
                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0}>Next</button>
                </div>
            )}
        </div>
    );
}

export default CubesetListPage;