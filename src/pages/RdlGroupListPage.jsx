// src/pages/RdlGroupListPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { getAllRdlGroups } from '../api/rdlGroupService';
import RdlGroupList from '../components/RdlGroupList';

function RdlGroupListPage() {
    const [rdlGroups, setRdlGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchRdlGroups = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAllRdlGroups(); // Returns array of RdlGroupDto
            if (Array.isArray(data)) {
                setRdlGroups(data);
            } else {
                console.error("RdlGroupListPage: Fetched data is not an array", data);
                setRdlGroups([]);
                setError("Received invalid data format for RDL groups.");
            }
        } catch (err) {
            console.error("Error fetching RDL groups:", err);
            setError(err.message || "Failed to load RDL groups.");
            setRdlGroups([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRdlGroups();
    }, [fetchRdlGroups]);

    return (
        <div>
            <h1>RDL Groups (Read-Only)</h1>
            <p style={{marginBottom: '20px'}}>This is a list of predefined RDL groups used to categorize RDL types.</p>
            <RdlGroupList
                rdlGroups={rdlGroups}
                loading={loading}
                error={error}
            />
        </div>
    );
}

export default RdlGroupListPage;