// src/pages/RdlListPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getAllRdlLists, deleteRdlList as apiDelete } from '../api/rdlListService';
import { getAllCustomers } from '../api/customerService';
import { getAllThemes } from '../api/themeService';
import { getAllRdlTypes } from '../api/rdlTypeService';
import RdlListList from '../components/RdlListList';

function RdlListPage() {
    console.log("RdlListPage: Component rendering or re-rendering.");
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [rdlLists, setRdlLists] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [themes, setThemes] = useState([]);
    const [rdlTypes, setRdlTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // Simplified error state for now

    const [selectedCubeId, setSelectedCubeId] = useState(() => searchParams.get('cubeIdPk') || '');
    const [selectedThemeId, setSelectedThemeId] = useState(() => searchParams.get('themeIdPk') || '');
    const [selectedRdlTypeId, setSelectedRdlTypeId] = useState(() => searchParams.get('rdlTypeIdPk') || '');

    const [currentPage, setCurrentPage] = useState(() => parseInt(searchParams.get('pageNumber')) || 1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);

    // Fetch filter options (customers, themes, rdlTypes)
    useEffect(() => {
        console.log("RdlListPage: useEffect for fetching filter options mounting/running.");
        let isMounted = true;
        const fetchFilterOptions = async () => {
            setLoading(true); // Indicate general loading start
            setError(null);
            try {
                console.log("RdlListPage: Fetching data for filter dropdowns...");
                const [custRes, themeRes, rdlTypeRes] = await Promise.allSettled([
                    getAllCustomers({ pageSize: 1000 }),
                    getAllThemes(),
                    getAllRdlTypes({ pageSize: 1000 })
                ]);

                if (isMounted) {
                    if (custRes.status === 'fulfilled') setCustomers(Array.isArray(custRes.value) ? custRes.value : []);
                    else console.error("RdlListPage: Failed to load customers for filter:", custRes.reason);

                    if (themeRes.status === 'fulfilled') setThemes(Array.isArray(themeRes.value) ? themeRes.value : []);
                    else console.error("RdlListPage: Failed to load themes for filter:", themeRes.reason);

                    if (rdlTypeRes.status === 'fulfilled') setRdlTypes(Array.isArray(rdlTypeRes.value) ? rdlTypeRes.value : []);
                    else console.error("RdlListPage: Failed to load RDL types for filter:", rdlTypeRes.reason);
                }
            } catch (err) { // Should be caught by allSettled promise rejections
                if (isMounted) setError(err.message || "Error loading filter options.");
            }
            // setLoading(false) will be handled by the main data fetch effect
        };
        fetchFilterOptions();
        return () => { isMounted = false; };
    }, []); // Run once on mount

    // Fetch RDL Lists
    const fetchRdlListData = useCallback(async (pageToFetch) => {
        console.log(`RdlListPage: fetchRdlListData called for page ${pageToFetch}. Filters - Customer: ${selectedCubeId}, Theme: ${selectedThemeId}, RDLType: ${selectedRdlTypeId}`);
        setLoading(true); // For the list itself
        setError(null);
        try {
            const params = { pageNumber: pageToFetch, pageSize };
            if (selectedCubeId) params.cubeIdPk = selectedCubeId;
            if (selectedThemeId) params.themeIdPk = selectedThemeId;
            if (selectedRdlTypeId) params.rdlTypeIdPk = selectedRdlTypeId;

            const listResponse = await getAllRdlLists(params);
            console.log("RdlListPage: RDL Lists API response:", listResponse);

            if (listResponse && Array.isArray(listResponse.data)) {
                setRdlLists(listResponse.data);
                const totalItems = listResponse.headers['x-pagination-totalitems'];
                const currentPgSize = listResponse.headers['x-pagination-pagesize'] || pageSize;
                if (totalItems && currentPgSize) {
                    const calculatedTotalPages = Math.ceil(parseInt(totalItems) / parseInt(currentPgSize));
                    setTotalPages(calculatedTotalPages);
                    console.log(`RdlListPage: Pagination - TotalItems: ${totalItems}, TotalPages: ${calculatedTotalPages}`);
                } else {
                    const fallbackTotalPages = listResponse.data.length > 0 ? Math.ceil(listResponse.data.length / pageSize) : 0;
                    setTotalPages(fallbackTotalPages);
                    console.log(`RdlListPage: Pagination (fallback) - TotalPages: ${fallbackTotalPages}`);
                }
            } else {
                console.error("RdlListPage: Invalid data structure for RDL Lists", listResponse);
                setRdlLists([]);
                setTotalPages(0);
            }
            setCurrentPage(pageToFetch); // Sync current page state

        } catch (err) {
            console.error("Error fetching RDL Lists:", err);
            setError(err.message || "Failed to load RDL lists.");
            setRdlLists([]);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    }, [selectedCubeId, selectedThemeId, selectedRdlTypeId, pageSize, currentPage]); // currentPage for internal logic, but fetch initiated with pageToFetch

    useEffect(() => {
        const pageFromUrl = parseInt(searchParams.get('pageNumber')) || 1;
        console.log(`RdlListPage: useEffect for list data. pageFromUrl: ${pageFromUrl}, selectedCubeId: ${selectedCubeId}, selectedThemeId: ${selectedThemeId}, selectedRdlTypeId: ${selectedRdlTypeId}`);
        fetchRdlListData(pageFromUrl);
    }, [selectedCubeId, selectedThemeId, selectedRdlTypeId, searchParams, pageSize, fetchRdlListData]); // searchParams to react to URL changes (e.g. back/fwd button)


    const handleDelete = async (id) => {
        console.log(`RdlListPage: Attempting to delete RDL List ID: ${id}`);
        if (!window.confirm(`Delete RDL List ID: ${id}?`)) return;
        try {
            await apiDelete(id);
            alert(`RDL List ID: ${id} deleted.`);
            // Optimistic update or re-fetch
            if (rdlLists.length === 1 && currentPage > 1) {
                handlePageChange(currentPage - 1); // Go to previous page if last item on current page deleted
            } else {
                fetchRdlListData(currentPage); // Refresh current page
            }
        } catch (err) {
            console.error(`RdlListPage: Error deleting RDL List ${id}:`, err);
            alert(`Error: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleFilterChange = (setter, paramName, value) => {
        console.log(`RdlListPage: Filter change. Param: ${paramName}, Value: '${value}'`);
        setter(value);
        // setCurrentPage(1); // Reset page to 1 on any filter change
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
        console.log("RdlListPage: Clearing all filters.");
        setSelectedCubeId('');
        setSelectedThemeId('');
        setSelectedRdlTypeId('');
        // setCurrentPage(1);
        setSearchParams({ pageNumber: '1' }); // Keep pageNumber or clear all
    };

    const handlePageChange = (newPage) => {
        console.log(`RdlListPage: Page change requested to: ${newPage}. Current total: ${totalPages}`);
        if (newPage >= 1 && (newPage <= totalPages || totalPages === 0) ) { // Allow if totalPages is 0 (initial load)
            // setCurrentPage(newPage); // State will be updated by useEffect reacting to searchParams
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.set('pageNumber', String(newPage));
            setSearchParams(newSearchParams);
        }
    };

    console.log("RdlListPage: Rendering. Loading:", loading, "Error:", error, "RdlLists Count:", rdlLists.length);
    return (
        <div>
            <h1>RDL Lists Management</h1>
            <div className="filters" style={{display:'flex', flexWrap:'wrap', gap:'10px', marginBottom:'20px', paddingBottom:'10px', borderBottom:'1px solid #eee'}}>
                <div>
                    <label>Customer: </label>
                    <select value={selectedCubeId} onChange={(e)=>handleFilterChange(setSelectedCubeId, 'cubeIdPk', e.target.value)} disabled={loading}>
                        <option value="">All Customers</option>
                        {customers.map(c=><option key={c.cube_id_pk} value={c.cube_id_pk}>{c.cube_name} ({c.cube_id_pk})</option>)}
                    </select>
                </div>
                <div>
                    <label>Theme: </label>
                    <select value={selectedThemeId} onChange={(e)=>handleFilterChange(setSelectedThemeId, 'themeIdPk', e.target.value)} disabled={loading}>
                        <option value="">All Themes</option>
                        {themes.map(t=><option key={t.themeIdPk} value={t.themeIdPk}>{t.themeLabel} ({t.themeIdPk})</option>)}
                    </select>
                </div>
                <div>
                    <label>RDL Type: </label>
                    <select value={selectedRdlTypeId} onChange={(e)=>handleFilterChange(setSelectedRdlTypeId, 'rdlTypeIdPk', e.target.value)} disabled={loading}>
                        <option value="">All RDL Types</option>
                        {rdlTypes.map(rt=><option key={rt.rdlTypeIdPk} value={rt.rdlTypeIdPk}>{rt.rdlTypeLabel} (Group: {rt.rdlGroupName})</option>)}
                    </select>
                </div>
                <button onClick={clearFilters} className="secondary" disabled={loading}>Clear Filters</button>
                <button className="primary" onClick={() => navigate('/rdl-lists/add')} style={{marginLeft:'auto'}} disabled={loading}>Add RDL List</button>
            </div>

            {error && <p className="error-message" style={{color: 'red'}}>{error.message || JSON.stringify(error)}</p>}

            <RdlListList
                rdlLists={rdlLists}
                onEdit={(item) => navigate(`/rdl-lists/edit/${item.rdlListIdPk}`)}
                onDelete={handleDelete}
                loading={loading}
                // Error is displayed above the list
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

export default RdlListPage;