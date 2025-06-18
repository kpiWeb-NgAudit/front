// src/pages/RdlTypeListPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAllRdlTypes } from '../api/rdlTypeService';
import { getAllRdlGroups } from '../api/rdlGroupService'; // For filter dropdown
import RdlTypeList from '../components/RdlTypeList';

function RdlTypeListPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [rdlTypes, setRdlTypes] = useState([]);
    const [rdlGroups, setRdlGroups] = useState([]); // For filter
    const [loading, setLoading] = useState(true); // Combined loading for main data
    const [loadingFilters, setLoadingFilters] = useState(true); // Separate for filter dropdowns
    const [error, setError] = useState({ main: null, filters: null });

    const [selectedRdlGroupId, setSelectedRdlGroupId] = useState(searchParams.get('rdlGroupIdPk') || '');

    // Fetch RDL Groups for the filter dropdown once on mount
    useEffect(() => {
        const fetchGroupsForFilter = async () => {
            console.log("RdlTypeListPage: Fetching RDL Groups for filter...");
            setLoadingFilters(true);
            setError(prev => ({ ...prev, filters: null }));
            try {
                const groupsDataArray = await getAllRdlGroups(); // Expects array directly
                if (Array.isArray(groupsDataArray)) {
                    setRdlGroups(groupsDataArray);
                    console.log("RdlTypeListPage: RDL Groups fetched for filter:", groupsDataArray);
                } else {
                    console.error("RdlTypeListPage: Fetched RDL groups data is not an array", groupsDataArray);
                    setRdlGroups([]);
                    setError(prev => ({ ...prev, filters: "Invalid data format for RDL groups filter." }));
                }
            } catch (err) {
                console.error("Error fetching RDL groups for filter:", err);
                setError(prev => ({ ...prev, filters: err.message || "Failed to load RDL groups." }));
                setRdlGroups([]);
            } finally {
                setLoadingFilters(false);
            }
        };
        fetchGroupsForFilter();
    }, []); // Empty dependency array means it runs once on mount

    // Fetch RDL Types when selectedRdlGroupId (filter) changes or on initial load
    const fetchRdlTypes = useCallback(async () => {
        setLoading(true); // For the main list of RDL Types
        setError(prev => ({ ...prev, main: null })); // Clear previous main list errors
        try {
            const params = {};
            if (selectedRdlGroupId) {
                params.rdlGroupIdPk = selectedRdlGroupId;
            }
            console.log("RdlTypeListPage: Fetching RDL Types with params:", params);
            const typesDataArray = await getAllRdlTypes(params); // Expects array of RdlTypeDto directly
            console.log("RdlTypeListPage: RDL Types received from API:", typesDataArray);

            if (Array.isArray(typesDataArray)) {
                setRdlTypes(typesDataArray);
            } else {
                console.error("RdlTypeListPage: Fetched RDL types data is not an array!", typesDataArray);
                setRdlTypes([]);
                setError(prev => ({...prev, main: "Invalid data format for RDL types."}));
            }
        } catch (err) {
            console.error("Error fetching RDL types:", err);
            setError(prev => ({ ...prev, main: err.message || "Failed to load RDL types." }));
            setRdlTypes([]);
        } finally {
            setLoading(false);
        }
    }, [selectedRdlGroupId]); // Re-fetch RDL Types if the selected group changes

    useEffect(() => {
        // This effect now only triggers the fetch for RDL Types
        console.log("RdlTypeListPage: useEffect for fetching RDL Types triggered by selectedRdlGroupId change or initial load via fetchRdlTypes dependency.");
        fetchRdlTypes();
    }, [fetchRdlTypes]); // fetchRdlTypes is memoized and depends on selectedRdlGroupId

    const handleGroupFilterChange = (e) => {
        const newGroupId = e.target.value;
        setSelectedRdlGroupId(newGroupId); // This will trigger the useEffect for fetchRdlTypes

        // Update URL searchParams
        const newSearchParams = new URLSearchParams(searchParams);
        if (newGroupId) {
            newSearchParams.set('rdlGroupIdPk', newGroupId);
        } else {
            newSearchParams.delete('rdlGroupIdPk');
        }
        // newSearchParams.set('pageNumber', '1'); // If using pagination
        setSearchParams(newSearchParams);
    };

    const clearFilters = () => {
        setSelectedRdlGroupId('');
        setSearchParams({});
    };


    if (loadingFilters) { // Show loading until filter options are ready
        return <p>Loading filter options...</p>;
    }

    return (
        <div>
            <h1>RDL Types (Read-Only)</h1>
            <p style={{marginBottom: '20px'}}>Predefined types for RDL reports, categorized by groups.</p>

            <div className="filters" style={{ marginBottom: '20px', display: 'flex', gap: '15px', alignItems: 'center' }}>
                <div>
                    <label htmlFor="rdlGroupFilter" style={{ marginRight: '10px' }}>Filter by RDL Group:</label>
                    <select id="rdlGroupFilter" value={selectedRdlGroupId} onChange={handleGroupFilterChange} disabled={loadingFilters || loading}>
                        <option value="">All Groups</option>
                        {rdlGroups.map(group => (
                            <option key={group.rdlGroupIdPk} value={group.rdlGroupIdPk}>
                                {group.rdlGroupLabel} (ID: {group.rdlGroupIdPk})
                            </option>
                        ))}
                    </select>
                </div>
                <button onClick={clearFilters} className="secondary" disabled={loading}>Clear Filter</button>
                {error && error.filters && <p className="error-message" style={{ marginLeft: '10px', color: 'red' }}>{error.filters}</p>}
            </div>

            <RdlTypeList
                rdlTypes={rdlTypes}
                loading={loading} // This is for the rdlTypes list loading state
                error={error?.main} // Pass only the main list error
            />
            {/* Pagination controls would go here if implemented */}
        </div>
    );
}

export default RdlTypeListPage;