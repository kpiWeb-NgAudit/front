// src/pages/DimDbExtractV2ListPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom'; // Link for navigation
import { getAllDimDbExtractsV2 } from '../api/dimDbExtractV2Service';
import { getAllDimensions } from '../api/dimensionService'; // For dimension filter
import { getAllCustomers } from '../api/customerService';   // For customer filter

function DimDbExtractV2ListPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [extracts, setExtracts] = useState([]);
    const [dimensions, setDimensions] = useState([]); // For dimension filter dropdown
    const [customers, setCustomers] = useState([]);   // For customer filter dropdown

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState({ main: null, filters: null });

    // Filter states from URL or default
    const [selectedDimId, setSelectedDimId] = useState(searchParams.get('dimIdPk') || '');
    const [selectedProdSourceId, setSelectedProdSourceId] = useState(searchParams.get('prodDataSourceId') || '');
    const [selectedCubeId, setSelectedCubeId] = useState(searchParams.get('cubeIdPk') || '');

    // Pagination (optional for this view, but good for consistency if many records)
    // const [currentPage, setCurrentPage] = useState(1);
    // const [pageSize] = useState(20);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(prev => ({ ...prev, main: null })); // Clear main list error
        try {
            const params = {};
            if (selectedDimId) params.dimIdPk = parseInt(selectedDimId, 10);
            if (selectedProdSourceId) params.prodDataSourceId = parseInt(selectedProdSourceId, 10);
            if (selectedCubeId) params.cubeIdPk = selectedCubeId;
            // params.pageNumber = currentPage;
            // params.pageSize = pageSize;

            console.log("DimDbExtractV2ListPage: Fetching extracts with params:", params);
            const extractsDataArray = await getAllDimDbExtractsV2(params); // Returns array of DimDbExtractV2Dto
            console.log("DimDbExtractV2ListPage: Extracts received:", extractsDataArray);

            if (Array.isArray(extractsDataArray)) {
                setExtracts(extractsDataArray);
            } else {
                console.error("DimDbExtractV2ListPage: extractsDataArray is not an array!", extractsDataArray);
                setExtracts([]);
            }
            // Pagination header handling would go here if applicable
        } catch (err) {
            console.error("Error fetching DimDbExtractV2 records:", err);
            setError(prev => ({ ...prev, main: err.message || "Failed to load extract definitions." }));
            setExtracts([]);
        } finally {
            setLoading(false);
        }
    }, [selectedDimId, selectedProdSourceId, selectedCubeId /*, currentPage, pageSize*/]);

    // Fetch filter options (dimensions, customers) once on mount
    useEffect(() => {
        const fetchFilterOptions = async () => {
            setError(prev => ({ ...prev, filters: null }));
            try {
                const [dimResponse, custResponse] = await Promise.allSettled([
                    getAllDimensions({ pageSize: 1000 }), // Assuming service returns {data, headers}
                    getAllCustomers({ pageSize: 1000 })  // Assuming service returns array directly
                ]);

                if (dimResponse.status === 'fulfilled' && dimResponse.value && Array.isArray(dimResponse.value.data)) {
                    setDimensions(dimResponse.value.data);
                } else {
                    console.error("Failed to load dimensions for filter:", dimResponse.reason);
                    setError(prev => ({ ...prev, filters: `${prev.filters || ''} Failed to load dimensions.`.trim()}));
                }

                if (custResponse.status === 'fulfilled' && Array.isArray(custResponse.value)) {
                    setCustomers(custResponse.value);
                } else {
                    console.error("Failed to load customers for filter:", custResponse.reason);
                    setError(prev => ({ ...prev, filters: `${prev.filters || ''} Failed to load customers.`.trim()}));
                }
            } catch (err) { // Should be caught by allSettled rejections
                console.error("Unexpected error fetching filter options:", err);
                setError(prev => ({ ...prev, filters: "Error loading filter options."}));
            }
        };
        fetchFilterOptions();
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]); // Runs when fetchData (and its dependencies like filters) change

    const handleFilterChange = (setter, paramName, value) => {
        setter(value);
        const newSearchParams = new URLSearchParams(searchParams);
        if (value) {
            newSearchParams.set(paramName, value);
        } else {
            newSearchParams.delete(paramName);
        }
        // newSearchParams.set('pageNumber', '1'); // Reset page on filter change
        setSearchParams(newSearchParams);
        // setCurrentPage(1);
    };

    const clearFilters = () => {
        setSelectedDimId('');
        setSelectedProdSourceId('');
        setSelectedCubeId('');
        setSearchParams({});
        // setCurrentPage(1);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString();
    };

    return (
        <div>
            <h1>All Data Extract Definitions (Read-Only)</h1>
            <div className="filters" style={{ marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center' }}>
                <div>
                    <label htmlFor="dimFilter" style={{ marginRight: '5px' }}>Filter by Dimension:</label>
                    <select id="dimFilter" value={selectedDimId} onChange={(e) => handleFilterChange(setSelectedDimId, 'dimIdPk', e.target.value)}>
                        <option value="">All Dimensions</option>
                        {dimensions.map(dim => (
                            <option key={dim.dim_id_pk} value={dim.dim_id_pk}>
                                {dim.dim_tname} (ID: {dim.dim_id_pk})
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="customerFilterExtractPage" style={{ marginRight: '5px' }}>Filter by Customer:</label>
                    <select id="customerFilterExtractPage" value={selectedCubeId} onChange={(e) => handleFilterChange(setSelectedCubeId, 'cubeIdPk', e.target.value)}>
                        <option value="">All Customers</option>
                        {customers.map(cust => (
                            <option key={cust.cube_id_pk} value={cust.cube_id_pk}>
                                {cust.cube_name} ({cust.cube_id_pk})
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="prodSourceFilter" style={{ marginRight: '5px' }}>Prod. Source ID:</label>
                    <input
                        type="number"
                        id="prodSourceFilter"
                        value={selectedProdSourceId}
                        onChange={(e) => handleFilterChange(setSelectedProdSourceId, 'prodDataSourceId', e.target.value)}
                        placeholder="e.g., 0 or 1"
                        min="0"
                    />
                </div>
                <button onClick={clearFilters} className="secondary" disabled={loading}>Clear Filters</button>
            </div>

            {error && error.filters && <p className="error-message">Error loading filter options: {error.filters}</p>}

            {loading ? <p>Loading extract definitions...</p> :
                error && error.main ? <p className="error-message">Error: {error.main}</p> :
                    extracts.length === 0 ? <p>No extract definitions found matching your criteria.</p> : (
                        <div style={{overflowX: 'auto'}}>
                            <table>
                                <thead>
                                <tr>
                                    <th>Dim ID</th>
                                    <th>Dimension Name</th>
                                    <th>Prod. Src ID</th>
                                    <th>Date Insert</th>
                                    <th>Comments</th>
                                    <th>Customer Name (ID)</th>
                                    {/* SQL Clause is too long, maybe a details link or modal */}
                                    {/* <th>SQL Clause</th> */}
                                    <th>View Details</th>
                                </tr>
                                </thead>
                                <tbody>
                                {extracts.map((ext) => (
                                    <tr key={`${ext.dimIdPk}-${ext.dimDbExtrV2ProdDataSourceId}-${new Date(ext.dimDbExtrV2DateInsert).toISOString()}`}>
                                        <td>{ext.dimIdPk}</td>
                                        <td>{ext.dimensionName || 'N/A'}</td>
                                        <td>{ext.dimDbExtrV2ProdDataSourceId}</td>
                                        <td>{formatDate(ext.dimDbExtrV2DateInsert)}</td>
                                        <td title={ext.dimDbExtrV2Comments} style={{maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                                            {ext.dimDbExtrV2Comments}
                                        </td>
                                        <td>{ext.customerName || 'N/A'} ({ext.cubeIdPk})</td>
                                        {/* <td><pre style={{maxWidth: '300px', overflow: 'auto', whiteSpace: 'pre-wrap'}}>{ext.dimDbExtrV2DbSelectSqlClause}</pre></td> */}
                                        <td>
                                            {/* Link to where this extract is managed (Dimension Edit Page) */}
                                            <Link to={`/dimensions/edit/${ext.dimIdPk}`} className="button-link-inline">
                                                View/Manage on Dim {ext.dimIdPk}
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
            {/* Pagination controls if implemented */}
        </div>
    );
}

export default DimDbExtractV2ListPage;