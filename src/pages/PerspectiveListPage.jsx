// src/pages/PerspectiveListPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getAllPerspectives, deletePerspective as apiDeletePerspective } from '../api/perspectiveService'; // Renamed for clarity
import { getAllCustomers } from '../api/customerService';
import PerspectiveList from '../components/PerspectiveList';

function PerspectiveListPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [perspectives, setPerspectives] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // Simplified error state for now

    // Derive state from URL search params for filters and page
    const selectedCubeId = searchParams.get('cubeIdPk') || '';
    const selectedPage = parseInt(searchParams.get('pageNumber')) || 1;
    // Add other filter states here if you implement them (e.g., selectedType)

    const [pageSize] = useState(10); // Or make this configurable via state/URL
    const [totalPages, setTotalPages] = useState(0);

    // Effect to fetch customers for filter dropdown (runs once)
    useEffect(() => {
        setLoading(true); // Indicate loading for filters
        getAllCustomers({ pageSize: 1000 })
            .then(custDataArray => {
                setCustomers(Array.isArray(custDataArray) ? custDataArray : []);
            })
            .catch(err => {
                console.error("Error fetching customers for filter:", err);
                setError(prev => ({ ...prev, filters: "Failed to load customers." }));
                setCustomers([]);
            })
            .finally(() => {
                // setLoading(false); // Let the main data fetch control overall loading
            });
    }, []);

    // Effect to fetch Perspectives data when filters or page (from URL) change
    useEffect(() => {
        const fetchPerspectiveData = async () => {
            console.log(`PerspectiveListPage: Fetching perspectives. Customer: '${selectedCubeId}', Page: ${selectedPage}`);
            setLoading(true);
            setError(null); // Clear previous main list errors
            try {
                const params = { pageNumber: selectedPage, pageSize };
                if (selectedCubeId) {
                    params.cubeIdPk = selectedCubeId;
                }
                // Add other filters to params here

                const response = await getAllPerspectives(params);
                console.log("PerspectiveListPage: Perspectives API response:", response);

                if (response && Array.isArray(response.data)) {
                    setPerspectives(response.data);
                    const totalItems = response.headers['x-pagination-totalitems'];
                    const currentPgSize = response.headers['x-pagination-pagesize'] || pageSize;
                    if (totalItems && currentPgSize) {
                        const calculatedTotalPages = Math.ceil(parseInt(totalItems) / parseInt(currentPgSize));
                        setTotalPages(calculatedTotalPages);
                    } else {
                        // Fallback if pagination headers are missing but data is present
                        setTotalPages(response.data.length > 0 ? Math.ceil(response.data.length / pageSize) : 0);
                    }
                } else {
                    console.error("PerspectiveListPage: Invalid data structure for perspectives", response);
                    setPerspectives([]);
                    setTotalPages(0);
                }
            } catch (err) {
                console.error("Error fetching perspectives:", err);
                setError({ message: err.message || "Failed to load perspectives." });
                setPerspectives([]);
                setTotalPages(0);
            } finally {
                setLoading(false);
            }
        };

        fetchPerspectiveData();
    }, [selectedCubeId, selectedPage, pageSize]); // Dependencies: filters and pagination info

    const handleDelete = async (id) => {
        console.log(`PerspectiveListPage: Attempting to delete Perspective ID: ${id}`);
        if (!window.confirm(`Are you sure you want to delete perspective with ID: ${id}? This may affect linked facts.`)) {
            return;
        }
        // setLoading(true); // Optional: set loading during delete operation
        try {
            await apiDeletePerspective(id); // Use the aliased import
            alert(`Perspective ID: ${id} deleted successfully.`);
            // Re-fetch data for the current page and filters
            // If it was the last item on a page greater than 1, navigate to previous page
            if (perspectives.length === 1 && selectedPage > 1) {
                handlePageChange(selectedPage - 1);
            } else {
                // Trigger a re-fetch by "touching" searchParams or calling fetch directly
                // For simplicity, we can rely on the useEffect to re-fetch if searchParams were the trigger.
                // Or, more directly:
                const currentPageToFetch = parseInt(searchParams.get('pageNumber')) || 1;
                // Re-trigger the effect that fetches data:
                // This can be done by re-setting searchParams to its current value if no better way.
                // Or, if fetchPerspectiveData was memoized with useCallback and its deps changed,
                // it would refetch. Our current fetchPerspectiveData is not memoized with useCallback.
                // Let's make fetchPerspectiveData a useCallback and call it directly.
                // For now, a simple way is to re-set a param to trigger searchParam change.
                setSearchParams(prev => {
                    const newParams = new URLSearchParams(prev);
                    newParams.set('pageNumber', String(currentPageToFetch)); // ensure page is current
                    return newParams;
                });
            }
        } catch (err) {
            console.error(`PerspectiveListPage: Error deleting perspective ${id}:`, err);
            alert(`Error deleting perspective: ${err.response?.data?.message || err.message}`);
            // setLoading(false);
        }
    };

    // Generic filter change handler
    const handleFilterChange = (paramName, value) => {
        console.log(`PerspectiveListPage: Filter change. Param: ${paramName}, Value: '${value}'`);
        const newSearchParams = new URLSearchParams(searchParams);
        if (value) {
            newSearchParams.set(paramName, value);
        } else {
            newSearchParams.delete(paramName);
        }
        newSearchParams.set('pageNumber', '1'); // Always go to page 1 on filter change
        setSearchParams(newSearchParams);
    };

    const clearFilters = () => {
        console.log("PerspectiveListPage: Clearing all filters.");
        setSearchParams({ pageNumber: '1' }); // Clears other filters, resets page to 1
    };

    const handlePageChange = (newPage) => {
        console.log(`PerspectiveListPage: Page change requested to: ${newPage}. Current total: ${totalPages}`);
        if (newPage >= 1 && (newPage <= totalPages || totalPages === 0) && newPage !== selectedPage ) {
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.set('pageNumber', String(newPage));
            setSearchParams(newSearchParams);
        }
    };

    return (
        <div>
            <h1>Perspectives Management</h1>
            <div className="filters" style={{display:'flex', alignItems:'center', gap:'15px', marginBottom:'20px'}}>
                <div>
                    <label htmlFor="customerFilterPsp">Filter by Customer:</label>
                    <select
                        id="customerFilterPsp"
                        value={selectedCubeId} // Controlled by state derived from URL
                        onChange={(e) => handleFilterChange('cubeIdPk', e.target.value)}
                        disabled={loading}
                    >
                        <option value="">All Customers</option>
                        {customers.map(c => <option key={c.cube_id_pk} value={c.cube_id_pk}>{c.cube_name} ({c.cube_id_pk})</option>)}
                    </select>
                </div>
                {/* Add other filter dropdowns here if needed (e.g., for perspective type) */}
                <button onClick={clearFilters} className="secondary" disabled={loading}>Clear Filters</button>
                <button
                    className="primary"
                    onClick={() => navigate(selectedCubeId ? `/perspectives/add?cubeIdPk=${selectedCubeId}` : '/perspectives/add')}
                    style={{marginLeft:'auto'}}
                    disabled={loading}
                >
                    Add New Perspective
                </button>
            </div>

            {error && error.message && <p className="error-message" style={{color: 'red'}}>{error.message}</p>}
            {error && error.filters && <p className="error-message" style={{color: 'orange'}}>Note: {error.filters}</p>}


            <PerspectiveList
                perspectives={perspectives}
                onEdit={(psp) => navigate(`/perspectives/edit/${psp.perspIdPk}`)}
                onDelete={handleDelete}
                loading={loading}
                // error prop for PerspectiveList can be simplified or removed if general error is shown above
            />
            {totalPages > 0 && !loading && (
                <div className="pagination-controls" style={{ marginTop: '20px', textAlign: 'center' }}>
                    <button onClick={() => handlePageChange(selectedPage - 1)} disabled={selectedPage === 1}>
                        Previous
                    </button>
                    <span style={{ margin: '0 10px' }}>
                        Page {selectedPage} of {totalPages}
                    </span>
                    <button onClick={() => handlePageChange(selectedPage + 1)} disabled={selectedPage === totalPages || totalPages === 0}>
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
export default PerspectiveListPage;