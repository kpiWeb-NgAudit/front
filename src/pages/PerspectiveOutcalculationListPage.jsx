// src/pages/PerspectiveOutcalculationListPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom'; // Added useNavigate
import { getAllPerspectiveOutcalculations, deletePerspectiveOutcalculation as apiDelete } from '../api/perspectiveOutcalculationService';
import { getAllPerspectives } from '../api/perspectiveService';
import { getAllFacts } from '../api/factService'; // Though fact filter wasn't fully implemented in prev example
import GlobalPerspectiveFactList from '../components/GlobalPerspectiveFactList';
import {deletePerspectiveFactAssociation} from "../api/perspectiveFactAssociationService.js";

function PerspectiveFactAssociationListPage() {
    const navigate = useNavigate(); // For Add button
    const [searchParams, setSearchParams] = useSearchParams();
    const [associations, setAssociations] = useState([]);
    const [perspectives, setPerspectives] = useState([]);
    const [facts, setFacts] = useState([]); // Keep if you plan to use fact filter

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState({ main: null, filters: null });

    // Derive filter states from URL on every render for consistency
    const selectedPerspId = searchParams.get('perspIdPk') || '';
    const selectedFactId = searchParams.get('factIdPk') || '';
    // const currentPage = parseInt(searchParams.get('pageNumber')) || 1; // If using pagination

    // ... (useEffect for fetching filter options: perspectives, facts - as before) ...
    useEffect(() => {
        const fetchFilterOptions = async () => {
            setLoading(true); // Indicate combined loading start
            setError(prev => ({ ...prev, filters: null }));
            try {
                const [pspResponse, factResponse] = await Promise.allSettled([
                    getAllPerspectives({ pageSize: 1000 }),
                    getAllFacts({ pageSize: 1000 })
                ]);

                if (pspResponse.status === 'fulfilled' && pspResponse.value && Array.isArray(pspResponse.value.data)) {
                    setPerspectives(pspResponse.value.data);
                } else { console.error("Failed to load perspectives for filter:", pspResponse.reason); }

                if (factResponse.status === 'fulfilled' && factResponse.value && Array.isArray(factResponse.value.data)) {
                    setFacts(factResponse.value.data);
                } else { console.error("Failed to load facts for filter:", factResponse.reason); }

            } catch (err) { setError(prev => ({...prev, filters: "Error loading filter options."})); }
            // setLoading(false) will be handled by main data fetch
        };
        fetchFilterOptions();
    }, []);


    // Fetch associations when filters change
    const fetchAssociationsData = useCallback(async () => {
        setLoading(true);
        setError(prev => ({ ...prev, main: null }));
        try {
            const params = {};
            // Use the derived selectedPerspId and selectedFactId
            if (selectedPerspId) params.perspIdPk = parseInt(selectedPerspId, 10);
            if (selectedFactId) params.factIdPk = parseInt(selectedFactId, 10);
            // Add pagination params here

            console.log("PerspectiveFactAssociationListPage: Fetching associations with params:", params);
            const response = await getAllPerspectiveOutcalculations(params);
            console.log("PerspectiveFactAssociationListPage: Associations received:", response);

            if (response && Array.isArray(response.data)) {
                setAssociations(response.data);
            } else {
                setAssociations([]);
                setError(prev => ({...prev, main: "Invalid data format for associations."}));
            }
        } catch (err) {
            setError(prev => ({ ...prev, main: err.message || "Failed to load associations." }));
            setAssociations([]);
        } finally {
            setLoading(false);
        }
    }, [selectedPerspId, selectedFactId /*, currentPage, pageSize */]); // Depend on derived filter states

    useEffect(() => {
        fetchAssociationsData();
    }, [fetchAssociationsData]); // Runs when selectedPerspId or selectedFactId changes

    // Generic filter change handler - updates URL search params
    const handleFilterChange = (paramName, value) => {
        console.log(`PerspectiveFactAssociationListPage: Filter change. Param: ${paramName}, Value: '${value}'`);
        const newSearchParams = new URLSearchParams(searchParams); // Create from current
        if (value) {
            newSearchParams.set(paramName, value);
        } else {
            newSearchParams.delete(paramName);
        }
        // newSearchParams.set('pageNumber', '1'); // Always go to page 1 on filter change if paginating
        setSearchParams(newSearchParams); // This will cause re-render, selectedPerspId/selectedFactId update, and data re-fetch
    };

    const clearFilters = () => {
        console.log("PerspectiveFactAssociationListPage: Clearing all filters.");
        // Setting searchParams to empty (or just with pageNumber) will clear filters
        // and trigger re-fetch via the useEffect that depends on derived selectedPerspId/selectedFactId.
        setSearchParams({ /* pageNumber: '1' */ }); // Clears all other query params
    };

    const handleDeleteAssociation = async (perspId, factId) => {
        if (!window.confirm(`Are you sure you want to delete the association between Perspective ID ${perspId} and Fact ID ${factId}?`)) {
            return;
        }
        setLoading(true); // Optional: indicate activity
        try {
            await deletePerspectiveFactAssociation(perspId, factId);
            alert('Association deleted successfully.');
            fetchAssociationsData(); // Re-fetch the list to reflect the deletion
        } catch (err) {
            console.error("Error deleting perspective-fact association:", err);
            alert(`Error deleting association: ${err.response?.data?.message || err.message}`);
            setError({ main: err.response?.data?.message || err.message, filters: error.filters });
            setLoading(false);
        }
        // setLoading(false) is handled by fetchAssociationsData's finally block if successful
    };

    if (loading && associations.length === 0 && perspectives.length === 0 && facts.length === 0) {
        return <p>Loading perspective-fact association data...</p>;
    }

    return (
        <div>
            <h1>All Perspective-Fact Associations</h1>
            <div className="filters" style={{ marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center' }}>
                {/* ... your filter select dropdowns for Perspective and Fact ... */}
                <div>
                    <label htmlFor="perspectiveFilterPO" style={{ marginRight: '5px' }}>Filter by Perspective:</label>
                    <select id="perspectiveFilterPO" value={selectedPerspId} onChange={(e) => handleFilterChange(selectedPerspId, 'perspIdPk', e.target.value)} disabled={loading}>
                        <option value="">All Perspectives</option>
                        {perspectives.map(psp => (<option key={psp.perspIdPk} value={psp.perspIdPk}>{psp.perspName} (ID: {psp.perspIdPk})</option>))}
                    </select>
                </div>
                <div>
                    <label htmlFor="factFilterPO" style={{ marginRight: '5px' }}>Filter by Fact:</label>
                    <select id="factFilterPO" value={selectedFactId} onChange={(e) => handleFilterChange(selectedFactId, 'factIdPk', e.target.value)} disabled={loading}>
                        <option value="">All Facts</option>
                        {facts.map(fact => (<option key={fact.fact_id_pk} value={fact.fact_id_pk}>{fact.fact_tname || `Fact ID ${fact.fact_id_pk}`}</option>))}
                    </select>
                </div>
                <button onClick={clearFilters} className="secondary" disabled={loading}>Clear Filters</button>
                {/* Add New Association Button - this page now also supports creating */}
                <button
                    className="primary"
                    onClick={() => navigate('/perspective-outcalculations/add')} // Ensure this route exists for AddPerspectiveOutcalculationPage
                    style={{ marginLeft: 'auto' }}
                    disabled={loading}
                >
                    Add New Association
                </button>
            </div>

            {error && error.filters && <p className="error-message" style={{color: 'orange'}}>{error.filters}</p>}
            {error && error.main && <p className="error-message" style={{color: 'red'}}>{error.main}</p>}


            <GlobalPerspectiveFactList
                associations={associations}
                onDelete={handleDeleteAssociation} // Pass the delete handler
                loading={loading}
                // error state is handled above the list
            />
            {/* Pagination controls if implemented */}
        </div>
    );
}

export default PerspectiveFactAssociationListPage;