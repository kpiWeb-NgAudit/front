// src/pages/PerspDimnatListPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { getAllPerspDimnatAssociations } from '../api/perspDimnatService';
import { getAllPerspectives } from '../api/perspectiveService';
import { getAllDimensions } from '../api/dimensionService';
import GlobalPerspDimnatList from '../components/GlobalPerspDimnatList'; // Use the new list component

function PerspDimnatListPage() {
    const navigate = useNavigate(); // For "Add New" button navigation
    const [searchParams, setSearchParams] = useSearchParams();

    const [associations, setAssociations] = useState([]);
    const [perspectives, setPerspectives] = useState([]); // For perspective filter dropdown
    const [dimensions, setDimensions] = useState([]);   // For dimension filter dropdown

    const [loading, setLoading] = useState(true); // Combined loading for main list and filters
    const [error, setError] = useState({ main: null, filters: null });

    // Derive filter states from URL on every render for consistency
    const selectedPerspId = searchParams.get('perspId') || ''; // Match controller DTO param name
    const selectedDimId = searchParams.get('dimId') || '';     // Match controller DTO param name

    // Pagination state (implement fully if needed)
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('pageNumber')) || 1);
    const [pageSize] = useState(20); // Example, or make configurable
    const [totalPages, setTotalPages] = useState(0);

    // Fetch filter options (Perspectives, Dimensions) once on mount
    useEffect(() => {
        let isMounted = true;
        const fetchFilterOptions = async () => {
            console.log("PerspDimnatListPage: Fetching filter options (perspectives & dimensions)...");
            setLoading(true); // General loading for the page
            setError(prev => ({ ...prev, filters: null }));
            try {
                const [pspRes, dimRes] = await Promise.allSettled([
                    getAllPerspectives({ pageSize: 1000 }), // Fetch all for dropdown
                    getAllDimensions({ pageSize: 1000 })  // Fetch all for dropdown
                ]);

                if (isMounted) {
                    if (pspRes.status === 'fulfilled' && pspRes.value && Array.isArray(pspRes.value.data)) {
                        setPerspectives(pspRes.value.data);
                    } else {
                        console.error("Failed to load perspectives for filter:", pspRes.reason);
                        setError(prev => ({ ...prev, filters: `${prev.filters || ''} Failed to load perspectives.`.trim()}));
                    }

                    if (dimRes.status === 'fulfilled' && dimRes.value && Array.isArray(dimRes.value.data)) {
                        setDimensions(dimRes.value.data);
                    } else {
                        console.error("Failed to load dimensions for filter:", dimRes.reason);
                        setError(prev => ({ ...prev, filters: `${prev.filters || ''} Failed to load dimensions.`.trim()}));
                    }
                }
            } catch (err) { // Should be caught by allSettled
                if (isMounted) setError(prev => ({ ...prev, filters: "Error loading filter options."}));
            }
            // Do not set setLoading(false) here; let the main data fetch do it.
        };
        fetchFilterOptions();
        return () => { isMounted = false; };
    }, []); // Empty: fetch filter options once

    // Fetch associations when filters or page change
    const fetchAssociations = useCallback(async (pageToFetch) => {
        setLoading(true);
        setError(prev => ({ ...prev, main: null }));
        try {
            const params = { pageNumber: pageToFetch, pageSize };
            if (selectedPerspId) params.perspId = parseInt(selectedPerspId, 10); // Match backend DTO param
            if (selectedDimId) params.dimId = parseInt(selectedDimId, 10);     // Match backend DTO param

            console.log("PerspDimnatListPage: Fetching associations with params:", params);
            const response = await getAllPerspDimnatAssociations(params); // Expects {data, headers}
            console.log("PerspDimnatListPage: Associations API response:", response);

            if (response && Array.isArray(response.data)) {
                setAssociations(response.data);
                const totalItems = response.headers['x-pagination-totalitems'];
                const currentPgSize = response.headers['x-pagination-pagesize'] || pageSize;
                if (totalItems && currentPgSize) {
                    setTotalPages(Math.ceil(parseInt(totalItems) / parseInt(currentPgSize)));
                } else {
                    setTotalPages(response.data.length > 0 ? Math.ceil(response.data.length / pageSize) : 0);
                }
            } else {
                setAssociations([]); setTotalPages(0);
                setError(prev => ({...prev, main: "Invalid data format for associations."}));
            }
            setCurrentPage(pageToFetch); // Update current page state
        } catch (err) {
            setError(prev => ({ ...prev, main: err.message || "Failed to load associations." }));
            setAssociations([]); setTotalPages(0);
        } finally {
            setLoading(false);
        }
    }, [selectedPerspId, selectedDimId, pageSize]); // Removed currentPage, will pass as arg

    useEffect(() => {
        const pageFromUrl = parseInt(searchParams.get('pageNumber')) || 1;
        console.log(`PerspDimnatListPage: useEffect for main data. Page: ${pageFromUrl}, PerspFilter: ${selectedPerspId}, DimFilter: ${selectedDimId}`);
        fetchAssociations(pageFromUrl);
    }, [selectedPerspId, selectedDimId, searchParams, pageSize, fetchAssociations]); // searchParams ensures reaction to URL changes


    const handleFilterChange = (paramName, value) => {
        const newSearchParams = new URLSearchParams(searchParams);
        if (value) {
            newSearchParams.set(paramName, value);
        } else {
            newSearchParams.delete(paramName);
        }
        newSearchParams.set('pageNumber', '1'); // Always reset to page 1 on filter change
        setSearchParams(newSearchParams);
    };

    const clearFilters = () => {
        setSearchParams({ pageNumber: '1' }); // Clears other filters, resets page to 1
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && (newPage <= totalPages || totalPages === 0) && newPage !== currentPage ) {
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.set('pageNumber', String(newPage));
            setSearchParams(newSearchParams);
        }
    };

    // No Add/Edit/Delete handlers for associations directly on this page
    // Management will be done on parent (Perspective) edit page.

    if (loading && associations.length === 0 && perspectives.length === 0 && dimensions.length === 0) {
        return <p>Loading Perspective - Dimension association data...</p>;
    }

    return (
        <div>
            <h1>All Perspective - Dimension Associations (Read-Only)</h1>
            <p>This page shows all links between Perspectives and Dimensions (DimNats). Management of these links is typically done on the specific Perspective's edit page.</p>

            <div className="filters" style={{ marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center' }}>
                <div>
                    <label htmlFor="perspectiveFilterPDL" style={{ marginRight: '5px' }}>Filter by Perspective:</label>
                    <select
                        id="perspectiveFilterPDL"
                        value={selectedPerspId}
                        onChange={(e) => handleFilterChange('perspId', e.target.value)} // Param name perspId
                        disabled={loading}
                    >
                        <option value="">All Perspectives</option>
                        {/* Assuming perspectives have perspIdPk and perspName */}
                        {perspectives.map(psp => (
                            <option key={psp.perspIdPk} value={psp.perspIdPk}>
                                {psp.perspName} (ID: {psp.perspIdPk})
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="dimensionFilterPDL" style={{ marginRight: '5px' }}>Filter by Dimension:</label>
                    <select
                        id="dimensionFilterPDL"
                        value={selectedDimId}
                        onChange={(e) => handleFilterChange('dimId', e.target.value)} // Param name dimId
                        disabled={loading}
                    >
                        <option value="">All Dimensions</option>
                        {/* Assuming dimensions have dim_id_pk and dim_tname or dim_shortpresname */}
                        {dimensions.map(dim => (
                            <option key={dim.dim_id_pk} value={dim.dim_id_pk}>
                                {dim.dim_shortpresname || dim.dim_tname} (ID: {dim.dim_id_pk})
                            </option>
                        ))}
                    </select>
                </div>
                <button onClick={clearFilters} className="secondary" disabled={loading}>Clear Filters</button>
                {/* No "Add New" button for this read-only global list */}
            </div>

            {error && error.filters && <p className="error-message" style={{color: 'orange'}}>{error.filters}</p>}

            <GlobalPerspDimnatList
                associations={associations}
                loading={loading}
                error={error?.main}
                // No onDelete or onEdit directly here for a read-only list
            />

            {totalPages > 0 && !loading && (
                <div className="pagination-controls" style={{ marginTop: '20px', textAlign: 'center' }}>
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                        Previous
                    </button>
                    <span style={{ margin: '0 10px' }}> Page {currentPage} of {totalPages} </span>
                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0}>
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}

export default PerspDimnatListPage;