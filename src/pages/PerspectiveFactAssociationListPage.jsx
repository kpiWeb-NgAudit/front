// src/pages/PerspectiveFactAssociationListPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAllPerspectiveFactAssociations } from '../api/perspectiveFactAssociationService';
import { getAllPerspectives } from '../api/perspectiveService'; // For perspective filter
import { getAllFacts } from '../api/factService';           // For fact filter
import GlobalPerspectiveFactList from '../components/GlobalPerspectiveFactList';

function PerspectiveFactAssociationListPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [associations, setAssociations] = useState([]);
    const [perspectives, setPerspectives] = useState([]); // For filter dropdown
    const [facts, setFacts] = useState([]);               // For filter dropdown

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState({ main: null, filters: null });

    const [selectedPerspId, setSelectedPerspId] = useState(searchParams.get('perspIdPk') || '');
    const [selectedFactId, setSelectedFactId] = useState(searchParams.get('factIdPk') || '');

    // Pagination state (implement if backend supports it for global list)
    // const [currentPage, setCurrentPage] = useState(1);
    // const [pageSize] = useState(20);

    // Fetch filter options (perspectives, facts) once on mount
    useEffect(() => {
        const fetchFilterOptions = async () => {
            setError(prev => ({ ...prev, filters: null }));
            setLoading(true); // Combined loading for initial setup
            try {
                const [pspResponse, factResponse] = await Promise.allSettled([
                    getAllPerspectives({ pageSize: 1000 }), // Get all perspectives for filter
                    getAllFacts({ pageSize: 1000 })        // Get all facts for filter
                ]);

                if (pspResponse.status === 'fulfilled' && pspResponse.value && Array.isArray(pspResponse.value.data)) {
                    setPerspectives(pspResponse.value.data);
                } else {
                    console.error("Failed to load perspectives for filter:", pspResponse.reason);
                    setError(prev => ({ ...prev, filters: `${prev.filters || ''} Failed to load perspectives.`.trim()}));
                }

                if (factResponse.status === 'fulfilled' && factResponse.value && Array.isArray(factResponse.value.data)) {
                    setFacts(factResponse.value.data);
                } else {
                    console.error("Failed to load facts for filter:", factResponse.reason);
                    setError(prev => ({ ...prev, filters: `${prev.filters || ''} Failed to load facts.`.trim()}));
                }
            } catch (err) {
                setError(prev => ({ ...prev, filters: "Error loading filter options."}));
            } finally {
                // setLoading(false); // Let main data fetch control final loading state
            }
        };
        fetchFilterOptions();
    }, []);

    // Fetch associations when filters change
    const fetchAssociationsData = useCallback(async () => {
        setLoading(true);
        setError(prev => ({ ...prev, main: null }));
        try {
            const params = {};
            if (selectedPerspId) params.perspIdPk = parseInt(selectedPerspId, 10);
            if (selectedFactId) params.factIdPk = parseInt(selectedFactId, 10);
            // Add pagination params if API supports it for this global list

            console.log("PerspectiveFactAssociationListPage: Fetching associations with params:", params);
            const response = await getAllPerspectiveFactAssociations(params); // Expects {data, headers}
            console.log("PerspectiveFactAssociationListPage: Associations received:", response);

            if (response && Array.isArray(response.data)) {
                setAssociations(response.data);
                // Handle pagination headers if your service returns them
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
    }, [selectedPerspId, selectedFactId /*, currentPage, pageSize */]);

    useEffect(() => {
        fetchAssociationsData();
    }, [fetchAssociationsData]);

    const handleFilterChange = (setter, paramName, value) => {
        setter(value);
        const newSearchParams = new URLSearchParams(searchParams);
        if (value) newSearchParams.set(paramName, value);
        else newSearchParams.delete(paramName);
        // newSearchParams.set('pageNumber', '1'); // Reset page
        setSearchParams(newSearchParams);
        // setCurrentPage(1);
    };

    const clearFilters = () => {
        setSelectedPerspId('');
        setSelectedFactId('');
        setSearchParams({});
        // setCurrentPage(1);
    };

    if (loading && associations.length === 0) return <p>Loading perspective-fact associations...</p>;
    // Display filter error separately
    if (error && error.filters && perspectives.length === 0 && facts.length === 0) {
        return <p className="error-message">Error loading filter options: {error.filters}. Please try refreshing.</p>;
    }


    return (
        <div>
            <h1>All Perspective-Fact Associations (Read-Only)</h1>
            <div className="filters" style={{ marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center' }}>
                <div>
                    <label htmlFor="perspectiveFilter" style={{ marginRight: '5px' }}>Filter by Perspective:</label>
                    <select id="perspectiveFilter" value={selectedPerspId} onChange={(e) => handleFilterChange(setSelectedPerspId, 'perspIdPk', e.target.value)} disabled={loading}>
                        <option value="">All Perspectives</option>
                        {/* Assuming perspective DTO/entity has perspIdPk and perspName */}
                        {perspectives.map(psp => (
                            <option key={psp.perspIdPk} value={psp.perspIdPk}>
                                {psp.perspName} (ID: {psp.perspIdPk})
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="factFilter" style={{ marginRight: '5px' }}>Filter by Fact:</label>
                    <select id="factFilter" value={selectedFactId} onChange={(e) => handleFilterChange(setSelectedFactId, 'factIdPk', e.target.value)} disabled={loading}>
                        <option value="">All Facts</option>
                        {/* Assuming fact DTO/entity has fact_id_pk and fact_tname */}
                        {facts.map(fact => (
                            <option key={fact.fact_id_pk} value={fact.fact_id_pk}>
                                {fact.fact_tname || `Fact ID ${fact.fact_id_pk}`}
                            </option>
                        ))}
                    </select>
                </div>
                <button onClick={clearFilters} className="secondary" disabled={loading}>Clear Filters</button>
            </div>

            {error && error.main && <p className="error-message">Error loading associations: {error.main}</p>}

            <GlobalPerspectiveFactList
                associations={associations}
                loading={loading} // Pass down loading state for the list itself
                // error state is handled above for the main list
            />
            {/* Pagination controls if implemented */}
        </div>
    );
}

export default PerspectiveFactAssociationListPage;