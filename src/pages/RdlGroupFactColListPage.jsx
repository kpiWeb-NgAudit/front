// src/pages/RdlGroupFactColListPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom'; // useNavigate removed if no Add button
import { getAllRdlGroupFactColAssociations } from '../api/rdlGroupFactColService';
import { getAllRdlGroups } from '../api/rdlGroupService';
import { getAllFactColumns } from '../api/factColumnService';
import RdlGroupFactColList from '../components/RdlGroupFactColList';

function RdlGroupFactColListPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [associations, setAssociations] = useState([]);
    const [rdlGroups, setRdlGroups] = useState([]);
    const [factColumns, setFactColumns] = useState([]);

    const [loading, setLoading] = useState(true); // Combined loading for all data on this page
    const [error, setError] = useState({ main: null, filters: null });

    const selectedRdlGroupId = searchParams.get('rdlGroupIdPk') || '';
    const selectedFactColId = searchParams.get('factcolIdPk') || '';
    // Pagination state (can be simplified if not paginating this read-only list heavily)
    // const currentPage = parseInt(searchParams.get('pageNumber')) || 1;
    // const [pageSize] = useState(50); // Show more for a read-only audit list

    // Fetch filter options and main data
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError({ main: null, filters: null }); // Clear all errors
        try {
            const filterParams = {};
            if (selectedRdlGroupId) filterParams.rdlGroupIdPk = selectedRdlGroupId;
            if (selectedFactColId) filterParams.factcolIdPk = parseInt(selectedFactColId, 10);
            // Add pagination params to getAllRdlGroupFactColAssociations if implemented
            // filterParams.pageNumber = currentPage;
            // filterParams.pageSize = pageSize;

            const [assocRes, groupRes, factColRes] = await Promise.allSettled([
                getAllRdlGroupFactColAssociations(filterParams),
                // Fetch dropdown data only if not already present to avoid re-fetching on every filter
                rdlGroups.length === 0 ? getAllRdlGroups() : Promise.resolve(rdlGroups),
                factColumns.length === 0 ? getAllFactColumns({ pageSize: 2000 }) : Promise.resolve({data: factColumns})
            ]);

            if (assocRes.status === 'fulfilled' && assocRes.value && Array.isArray(assocRes.value.data)) {
                setAssociations(assocRes.value.data);
                // Handle pagination headers if your service returns them
            } else if (assocRes.status === 'rejected') {
                console.error("Error fetching associations:", assocRes.reason);
                setError(prev => ({...prev, main: assocRes.reason?.message || "Failed to load associations."}));
                setAssociations([]);
            }

            if (groupRes.status === 'fulfilled' && Array.isArray(groupRes.value)) {
                if(rdlGroups.length === 0) setRdlGroups(groupRes.value);
            } else if (groupRes.status === 'rejected' && rdlGroups.length === 0) {
                console.error("Failed to load RDL Groups for filter:", groupRes.reason);
            }

            if (factColRes.status === 'fulfilled' && factColRes.value && Array.isArray(factColRes.value.data)) {
                if(factColumns.length === 0) setFactColumns(factColRes.value.data);
            } else if (factColRes.status === 'rejected' && factColumns.length === 0) {
                console.error("Failed to load Fact Columns for filter:", factColRes.reason);
            }

        } catch (err) { // Should primarily catch errors if Promise.allSettled itself fails
            console.error("General error fetching RDL Group Fact Column page data:", err);
            setError({ main: err.message || "Failed to load page data.", filters: null });
            setAssociations([]);
        } finally {
            setLoading(false);
        }
    }, [selectedRdlGroupId, selectedFactColId, rdlGroups.length, factColumns.length /*, currentPage, pageSize*/]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleFilterChange = (setter, paramName, value) => {
        setter(value); // This local state update might become redundant if deriving directly from searchParams
        const newSearchParams = new URLSearchParams(searchParams);
        if (value) {
            newSearchParams.set(paramName, value);
        } else {
            newSearchParams.delete(paramName);
        }
        // newSearchParams.set('pageNumber', '1'); // Reset page if using pagination
        setSearchParams(newSearchParams);
    };

    const clearFilters = () => {
        setSelectedRdlGroupId(''); // Clear local state for immediate UI update
        setSelectedFactColId('');  // Clear local state
        setSearchParams({});       // Clear URL params, which will trigger re-fetch
        // setCurrentPage(1);
    };

    if (loading && associations.length === 0 && rdlGroups.length === 0 && factColumns.length === 0) {
        // More comprehensive initial loading state
        return <p>Loading RDL Group - Fact Column association data...</p>;
    }

    return (
        <div>
            <h1>RDL Group - Fact Column Associations (Read-Only View)</h1>
            <div className="filters" style={{ marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center' }}>
                <div>
                    <label htmlFor="rdlGroupFilterGlobal" style={{ marginRight: '5px' }}>Filter by RDL Group:</label>
                    <select id="rdlGroupFilterGlobal" value={selectedRdlGroupId} onChange={(e) => handleFilterChange(setSelectedRdlGroupId, 'rdlGroupIdPk', e.target.value)} disabled={loading}>
                        <option value="">All RDL Groups</option>
                        {rdlGroups.map(rg => <option key={rg.rdlGroupIdPk} value={rg.rdlGroupIdPk}>{rg.rdlGroupLabel}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="factColFilterGlobal" style={{ marginRight: '5px' }}>Filter by Fact Column:</label>
                    <select id="factColFilterGlobal" value={selectedFactColId} onChange={(e) => handleFilterChange(setSelectedFactColId, 'factcolIdPk', e.target.value)} disabled={loading}>
                        <option value="">All Fact Columns</option>
                        {factColumns.map(fc => <option key={fc.factcolIdPk} value={fc.factcolIdPk}>{fc.factcolCname} (ID: {fc.factcolIdPk})</option>)}
                    </select>
                </div>
                <button onClick={clearFilters} className="secondary" disabled={loading}>Clear Filters</button>
                {/* REMOVED Add New Button from here */}
            </div>

            {error && error.filters && <p className="error-message" style={{color: 'orange'}}>{error.filters}</p>}

            <RdlGroupFactColList
                associations={associations}
                loading={loading} // This loading is for the main association list
                error={error?.main}
                // No onEdit, onDelete, or onAdd props
            />
            {/* Pagination controls would go here if this list is paginated */}
        </div>
    );
}

export default RdlGroupFactColListPage;