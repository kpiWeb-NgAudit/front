// src/pages/CalcTypeFactColListPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom'; // Link for navigation
import { getAllCalcTypeFactColAssociations } from '../api/calcTypeFactColService';
import { getAllFactColumns } from '../api/factColumnService'; // For FactColumn filter
import { getAllCalcTypes } from '../api/calcTypeService';   // For CalcType filter
import CalcTypeAssociationList from '../components/CalcTypeAssociationList'; // The list component we made

function CalcTypeFactColListPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [associations, setAssociations] = useState([]);
    const [factColumns, setFactColumns] = useState([]); // For filter dropdown
    const [calcTypes, setCalcTypes] = useState([]);       // For filter dropdown

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState({ main: null, filters: null });

    // Filter states from URL or default
    const [selectedFactColId, setSelectedFactColId] = useState(searchParams.get('factcolIdPk') || '');
    const [selectedCalcType, setSelectedCalcType] = useState(searchParams.get('calcTypeType') || '');

    // Pagination (optional, but structure is here)
    // const [currentPage, setCurrentPage] = useState(1);
    // const [pageSize] = useState(20);

    // Fetch filter options (FactColumns, CalcTypes) once on mount
    useEffect(() => {
        const fetchFilterOptions = async () => {
            setLoading(true); // General loading indicator
            setError(prev => ({ ...prev, filters: null }));
            try {
                const [fcRes, ctRes] = await Promise.allSettled([
                    getAllFactColumns({ pageSize: 2000 }), // Fetch a good number for filter
                    getAllCalcTypes()                   // Usually not too many calc types
                ]);

                if (fcRes.status === 'fulfilled' && fcRes.value && Array.isArray(fcRes.value.data)) {
                    setFactColumns(fcRes.value.data);
                } else if (fcRes.status === 'rejected') {
                    console.error("Failed to load Fact Columns for filter:", fcRes.reason);
                    setError(prev => ({ ...prev, filters: `${prev.filters || ''} Failed to load Fact Columns.`.trim()}));
                }

                if (ctRes.status === 'fulfilled' && Array.isArray(ctRes.value)) {
                    setCalcTypes(ctRes.value);
                } else if (ctRes.status === 'rejected') {
                    console.error("Failed to load Calc Types for filter:", ctRes.reason);
                    setError(prev => ({ ...prev, filters: `${prev.filters || ''} Failed to load Calc Types.`.trim()}));
                }
            } catch (err) {
                setError(prev => ({ ...prev, filters: "Error loading filter options."}));
            }
            // setLoading(false); // Let main association fetch control final loading state
        };
        fetchFilterOptions();
    }, []);

    // Fetch associations when filters change
    const fetchAssociationsData = useCallback(async () => {
        setLoading(true);
        setError(prev => ({ ...prev, main: null }));
        try {
            const params = {};
            if (selectedFactColId) params.factcolIdPk = parseInt(selectedFactColId, 10);
            if (selectedCalcType) params.calcTypeType = selectedCalcType;
            // Add pagination params here

            console.log("CalcTypeFactColListPage: Fetching associations with params:", params);
            // Use the renamed service function and expect {data, headers}
            const response = await getAllCalcTypeFactColAssociations(params);
            console.log("CalcTypeFactColListPage: Associations API response object:", response);

            if (response && Array.isArray(response.data)) {
                setAssociations(response.data); // Access the .data property
                // Handle pagination headers from response.headers if present
                // const totalItems = response.headers['x-pagination-totalitems'];
                // ...
            } else {
                console.error("CalcTypeFactColListPage: Invalid data structure for associations", response);
                setAssociations([]);
                // setTotalPages(0);
            }
        } catch (err) {
            console.error("Error fetching CalcType-FactCol associations:", err);
            setError(prev => ({ ...prev, main: err.message || "Failed to load associations." }));
            setAssociations([]);
            // setTotalPages(0);
        } finally {
            setLoading(false);
        }
    }, [selectedFactColId, selectedCalcType /*, currentPage, pageSize */]);

    useEffect(() => {
        fetchAssociationsData();
    }, [fetchAssociationsData]); // Runs when selectedFactColId or selectedCalcType changes

    const handleFilterChange = (setter, paramName, value) => {
        setter(value);
        const newSearchParams = new URLSearchParams(searchParams);
        if (value) {
            newSearchParams.set(paramName, value);
        } else {
            newSearchParams.delete(paramName);
        }
        // newSearchParams.set('pageNumber', '1'); // Reset page if using pagination
        setSearchParams(newSearchParams);
        // setCurrentPage(1);
    };

    const clearFilters = () => {
        setSelectedFactColId('');
        setSelectedCalcType('');
        setSearchParams({});
        // setCurrentPage(1);
    };

    // No Add, Edit, Delete handlers directly on this page for the associations
    // Links within the list will point to where management happens

    if (loading && associations.length === 0 && factColumns.length === 0 && calcTypes.length === 0) {
        return <p>Loading CalcType - Fact Column association data...</p>;
    }

    return (
        <div>
            <h1>All CalcType - Fact Column Settings (Read-Only)</h1>
            <div className="filters" style={{ marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center' }}>
                <div>
                    <label htmlFor="factColFilter" style={{ marginRight: '5px' }}>Filter by Fact Column:</label>
                    <select id="factColFilter" value={selectedFactColId} onChange={(e) => handleFilterChange(setSelectedFactColId, 'factcolIdPk', e.target.value)} disabled={loading}>
                        <option value="">All Fact Columns</option>
                        {/* Assuming factColumns DTOs have factcolIdPk and factcolCname */}
                        {factColumns.map(fc => <option key={fc.factcolIdPk} value={fc.factcolIdPk}>{fc.factcolCname} (ID: {fc.factcolIdPk})</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="calcTypeFilter" style={{ marginRight: '5px' }}>Filter by CalcType:</label>
                    <select id="calcTypeFilter" value={selectedCalcType} onChange={(e) => handleFilterChange(setSelectedCalcType, 'calcTypeType', e.target.value)} disabled={loading}>
                        <option value="">All CalcTypes</option>
                        {/* Assuming calcTypes DTOs have calcTypeType and calcTypeComments */}
                        {calcTypes.map(ct => <option key={ct.calcTypeType} value={ct.calcTypeType}>{ct.calcTypeComments} ({ct.calcTypeType})</option>)}
                    </select>
                </div>
                <button onClick={clearFilters} className="secondary" disabled={loading}>Clear Filters</button>
            </div>

            {error && error.filters && <p className="error-message" style={{color: 'orange'}}>{error.filters}</p>}

            <CalcTypeAssociationList
                associations={associations} // Pass the fetched associations
                loading={loading}
                error={error?.main}
                // No onEdit or onDelete for this read-only list directly
            />
            {/* Pagination controls if implemented */}
        </div>
    );
}

export default CalcTypeFactColListPage;