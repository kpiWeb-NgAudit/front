// src/pages/RdlTypeListPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom'; // For potential filtering
import { getAllRdlTypes } from '../api/rdlTypeService';
import { getAllRdlGroups } from '../api/rdlGroupService'; // For filter dropdown
import RdlTypeList from '../components/RdlTypeList';

function RdlTypeListPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [rdlTypes, setRdlTypes] = useState([]);
    const [rdlGroups, setRdlGroups] = useState([]); // For filter
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState({ main: null, filters: null });

    const [selectedRdlGroupId, setSelectedRdlGroupId] = useState(searchParams.get('rdlGroupIdPk') || '');

    const fetchRdlTypesAndGroups = useCallback(async () => {
        setLoading(true);
        setError(prev => ({ ...prev, main: null }));
        try {
            const params = {};
            if (selectedRdlGroupId) {
                params.rdlGroupIdPk = selectedRdlGroupId;
            }
            const typesData = await getAllRdlTypes(params); // Returns array of RdlTypeDto
            if (Array.isArray(typesData)) {
                setRdlTypes(typesData);
            } else {
                setRdlTypes([]);
                setError(prev => ({...prev, main: "Invalid data for RDL types."}));
            }

            if (rdlGroups.length === 0) { // Fetch groups only once for the filter
                const groupsData = await getAllRdlGroups();
                if(Array.isArray(groupsData)){
                    setRdlGroups(groupsData);
                } else {
                    setRdlGroups([]);
                    setError(prev => ({...prev, filters: "Failed to load RDL groups for filter."}));
                }
            }
        } catch (err) {
            console.error("Error fetching RDL types or groups:", err);
            setError(prev => ({...prev, main: err.message || "Failed to load RDL types."}));
            setRdlTypes([]);
        } finally {
            setLoading(false);
        }
    }, [selectedRdlGroupId, rdlGroups.length]); // rdlGroups.length to control re-fetch of groups

    useEffect(() => {
        fetchRdlTypesAndGroups();
    }, [fetchRdlTypesAndGroups]);


    const handleGroupFilterChange = (e) => {
        const newGroupId = e.target.value;
        setSelectedRdlGroupId(newGroupId);
        const newSearchParams = new URLSearchParams(searchParams);
        if (newGroupId) {
            newSearchParams.set('rdlGroupIdPk', newGroupId);
        } else {
            newSearchParams.delete('rdlGroupIdPk');
        }
        setSearchParams(newSearchParams);
    };

    return (
        <div>
            <h1>RDL Types (Read-Only)</h1>
            <p style={{marginBottom: '20px'}}>Predefined types for RDL reports, categorized by groups.</p>

            <div className="filters" style={{ marginBottom: '20px' }}>
                <label htmlFor="rdlGroupFilter" style={{ marginRight: '10px' }}>Filter by RDL Group:</label>
                <select id="rdlGroupFilter" value={selectedRdlGroupId} onChange={handleGroupFilterChange}>
                    <option value="">All Groups</option>
                    {rdlGroups.map(group => (
                        <option key={group.rdlGroupIdPk} value={group.rdlGroupIdPk}>
                            {group.rdlGroupLabel}
                        </option>
                    ))}
                </select>
                {error && error.filters && <p className="error-message">{error.filters}</p>}
            </div>

            <RdlTypeList
                rdlTypes={rdlTypes}
                loading={loading}
                error={error?.main}
            />
        </div>
    );
}

export default RdlTypeListPage;