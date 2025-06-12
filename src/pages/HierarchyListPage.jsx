// src/pages/HierarchyListPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getAllHierarchies, deleteHierarchy as apiDeleteHierarchy } from '../api/hierarchyService';
import { getAllDimensions } from '../api/dimensionService'; // For dimension filter
import HierarchyList from '../components/HierarchyList';

function HierarchyListPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [hierarchies, setHierarchies] = useState([]);
    const [dimensions, setDimensions] = useState([]); // For filter dropdown
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDimId, setSelectedDimId] = useState(searchParams.get('dimIdPk') || '');
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('pageNumber')) || 1);
    const [pageSize] = useState(10); // Or make this configurable
    const [totalPages, setTotalPages] = useState(0);

    const fetchHierarchiesAndDimensions = useCallback(async (page = currentPage) => {
        setLoading(true); setError(null);
        try {
            const params = { pageNumber: page, pageSize };
            if (selectedDimId) params.dimIdPk = parseInt(selectedDimId);

            const [hierResponse, dimData] = await Promise.all([
                getAllHierarchies(params),
                getAllDimensions({ pageSize: 500 }) // Fetch dimensions for filter
            ]);
            setHierarchies(hierResponse.data || []);
            setDimensions(dimData.data || []);

            const totalItemsHeader = hierResponse.headers['x-pagination-totalitems'];
            const pageSizeHeader = hierResponse.headers['x-pagination-pagesize'];
            if (totalItemsHeader && pageSizeHeader) {
                setTotalPages(Math.ceil(parseInt(totalItemsHeader) / parseInt(pageSizeHeader)));
            } else { setTotalPages(hierResponse.data?.length > 0 ? 1 : 0); }
            setCurrentPage(page);

        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [selectedDimId, pageSize, currentPage]);

    useEffect(() => {
        const pageToFetch = parseInt(searchParams.get('pageNumber')) || 1;
        fetchHierarchiesAndDimensions(pageToFetch);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDimId, searchParams.get('pageNumber'), pageSize]);


    const handleDeleteHierarchy = async (id) => {
        if (!window.confirm(`Delete hierarchy ID: ${id}?`)) return;
        try {
            await apiDeleteHierarchy(id);
            setHierarchies(prev => prev.filter(h => h.hier_id_pk !== id));
            alert(`Hierarchy ID: ${id} deleted.`);
            if (hierarchies.length === 1 && currentPage > 1) {
                handlePageChange(currentPage - 1);
            } else {
                fetchHierarchiesAndDimensions(currentPage);
            }
        } catch (err) {
            alert(`Error deleting hierarchy: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleDimensionFilterChange = (e) => {
        const newDimId = e.target.value;
        setSelectedDimId(newDimId);
        setCurrentPage(1);
        const params = { pageNumber: 1, pageSize };
        if (newDimId) params.dimIdPk = newDimId;
        setSearchParams(params);
    };

    const handleNavigateToAdd = () => {
        navigate(selectedDimId ? `/hierarchies/add?dimIdPk=${selectedDimId}` : '/hierarchies/add');
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && (newPage <= totalPages || totalPages === 0) ) { // Allow page change even if totalPages is 0 initially
            setCurrentPage(newPage);
            const params = { pageNumber: newPage, pageSize };
            if (selectedDimId) params.dimIdPk = selectedDimId;
            setSearchParams(params);
        }
    };

    return (
        <div>
            <h1>Hierarchies Management</h1>
            <div style={{ marginBottom: '20px' }}>
                <label htmlFor="dimensionFilter" style={{ marginRight: '10px' }}>Filter by Dimension:</label>
                <select id="dimensionFilter" value={selectedDimId} onChange={handleDimensionFilterChange}>
                    <option value="">All Dimensions</option>
                    {dimensions.map(dim => <option key={dim.dim_id_pk} value={dim.dim_id_pk}>{dim.dim_tname} (ID: {dim.dim_id_pk})</option>)}
                </select>
            </div>

            <HierarchyList
                hierarchies={hierarchies}
                onDelete={handleDeleteHierarchy}
                loading={loading}
                error={error}
                onAdd={handleNavigateToAdd}
                parentIdForFilter={selectedDimId}
                parentType="Dimension"
            />
            {totalPages > 0 && (
                <div className="pagination-controls" style={{ marginTop: '20px', textAlign: 'center' }}>
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                        Previous
                    </button>
                    <span style={{ margin: '0 10px' }}> Page {currentPage} of {totalPages} </span>
                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}

export default HierarchyListPage;