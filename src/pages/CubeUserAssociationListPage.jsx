// src/pages/CubeUserAssociationListPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom'; // Added useNavigate
import { getCubeUserAssociations } from '../api/cubeUserService';
import { getAllCustomers } from '../api/customerService';
import { getAllUsers } from '../api/userService';

function CubeUserAssociationListPage() {
    const navigate = useNavigate(); // For navigation if needed (e.g., to an edit page if you add it)
    const [searchParams, setSearchParams] = useSearchParams();

    const [associations, setAssociations] = useState([]);
    const [customers, setCustomers] = useState([]); // For customer filter dropdown
    const [users, setUsers] = useState([]);       // For user filter dropdown

    const [loadingAssociations, setLoadingAssociations] = useState(true);
    const [loadingFilters, setLoadingFilters] = useState(true);
    const [error, setError] = useState({ main: null, filters: null }); // Separate errors

    const [selectedCubeId, setSelectedCubeId] = useState(searchParams.get('cubeIdPk') || '');
    const [selectedUserId, setSelectedUserId] = useState(searchParams.get('userIdPk') || '');

    // Pagination state (optional, can be expanded)
    // const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('pageNumber')) || 1);
    // const [pageSize] = useState(20); // Example page size
    // const [totalPages, setTotalPages] = useState(0);

    // Effect to fetch data for filter dropdowns (Customers & Users) - runs once on mount
    useEffect(() => {
        const fetchFilterData = async () => {
            console.log("CubeUserListPage: Fetching filter data (customers & users)...");
            setLoadingFilters(true);
            setError(prev => ({ ...prev, filters: null })); // Clear previous filter errors

            try {
                const results = await Promise.allSettled([
                    getAllCustomers({ pageSize: 1000 }), // Returns array directly
                    getAllUsers({ pageSize: 1000 })     // Returns { data: array, headers: ... }
                ]);

                const custResult = results[0];
                const userResult = results[1];

                if (custResult.status === 'fulfilled') {
                    setCustomers(Array.isArray(custResult.value) ? custResult.value : []);
                } else {
                    console.error("Error fetching customers for filter:", custResult.reason);
                    setCustomers([]);
                    setError(prev => ({ ...prev, filters: `${prev.filters || ''} Failed to load customers.`.trim() }));
                }

                if (userResult.status === 'fulfilled') {
                    setUsers(userResult.value && Array.isArray(userResult.value.data) ? userResult.value.data : []);
                } else {
                    console.error("Error fetching users for filter:", userResult.reason);
                    setUsers([]);
                    setError(prev => ({ ...prev, filters: `${prev.filters || ''} Failed to load users.`.trim() }));
                }

            } catch (err) { // Should not be reached if using Promise.allSettled for API calls
                console.error("Unexpected error in fetchFilterData:", err);
                setError(prev => ({ ...prev, filters: "Unexpected error loading filter options."}));
                setCustomers([]);
                setUsers([]);
            } finally {
                setLoadingFilters(false);
                console.log("CubeUserListPage: Finished fetching filter data.");
            }
        };

        fetchFilterData();
    }, []); // Empty dependency array - fetch once

    // Effect to fetch associations when filters (selectedCubeId, selectedUserId) change
    const fetchAssociations = useCallback(async () => {
        setLoadingAssociations(true);
        setError(prev => ({ ...prev, main: null })); // Clear previous main list errors
        try {
            const params = {};
            if (selectedCubeId) params.cubeIdPk = selectedCubeId;
            if (selectedUserId) params.userIdPk = selectedUserId;
            // Add pagination params here if you implement them:
            // params.pageNumber = currentPage;
            // params.pageSize = pageSize;

            console.log("CubeUserListPage: Fetching associations with params:", params);
            const assocDataArray = await getCubeUserAssociations(params); // Expects array of CubeUserDto directly
            console.log("CubeUserListPage: assocDataArray received:", assocDataArray);

            if (Array.isArray(assocDataArray)) {
                setAssociations(assocDataArray);
                // If using pagination headers from this call:
                // const totalItemsHeader = assocDataArray.headers['x-pagination-totalitems']; // Assuming service would return {data, headers}
                // ... setTotalPages, setCurrentPage ...
            } else {
                console.error("CubeUserListPage: assocDataArray is not an array!", assocDataArray);
                setAssociations([]);
            }
        } catch (err) {
            console.error("Error fetching cube-user associations:", err);
            setError(prev => ({ ...prev, main: err.message || "Failed to load associations." }));
            setAssociations([]);
        } finally {
            setLoadingAssociations(false);
        }
    }, [selectedCubeId, selectedUserId /*, currentPage, pageSize */]); // Add pagination state if used

    useEffect(() => {
        console.log("CubeUserListPage: useEffect (for fetching associations) triggered. Deps changed or initial.");
        fetchAssociations();
    }, [fetchAssociations]); // Runs when fetchAssociations (and its dependencies) change

    const handleFilterChange = (setter, paramName, value) => {
        setter(value);
        const newSearchParams = new URLSearchParams(searchParams);
        if (value) {
            newSearchParams.set(paramName, value);
        } else {
            newSearchParams.delete(paramName);
        }
        // newSearchParams.set('pageNumber', '1'); // Always reset to page 1 on filter change
        setSearchParams(newSearchParams);
        // setCurrentPage(1); // Also reset current page state
    };

    const handleCustomerFilterChange = (e) => {
        handleFilterChange(setSelectedCubeId, 'cubeIdPk', e.target.value);
    };

    const handleUserFilterChange = (e) => {
        handleFilterChange(setSelectedUserId, 'userIdPk', e.target.value);
    };

    const clearFilters = () => {
        setSelectedCubeId('');
        setSelectedUserId('');
        setSearchParams({});
        // setCurrentPage(1);
    };

    // const handlePageChange = (newPage) => { ... if pagination implemented ... };

    // Combined loading state for initial render of filters
    if (loadingFilters) return <p>Loading filter options...</p>;

    return (
        <div>
            <h1>Customer-User Assignments (Read-Only View)</h1>
            <div className="filters" style={{ marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>
                <div>
                    <label htmlFor="customerFilterGlobal" style={{ marginRight: '5px' }}>Filter by Customer:</label>
                    <select id="customerFilterGlobal" value={selectedCubeId} onChange={handleCustomerFilterChange}>
                        <option value="">All Customers</option>
                        {customers.map(cust => (
                            <option key={cust.cube_id_pk} value={cust.cube_id_pk}>
                                {cust.cube_name} ({cust.cube_id_pk})
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="userFilterGlobal" style={{ marginRight: '5px' }}>Filter by User:</label>
                    <select id="userFilterGlobal" value={selectedUserId} onChange={handleUserFilterChange}>
                        <option value="">All Users</option>
                        {users.map(user => (
                            <option key={user.user_id_pk} value={user.user_id_pk}>
                                {user.user_firstname} {user.user_lastname} ({user.user_id_pk})
                            </option>
                        ))}
                    </select>
                </div>
                <button onClick={clearFilters} className="secondary" disabled={loadingAssociations}>Clear Filters</button>
            </div>

            {error && error.filters && <p className="error-message">Error loading filter data: {error.filters}</p>}

            {loadingAssociations ? <p>Loading associations...</p> :
                error && error.main ? <p className="error-message">Error loading associations: {error.main}</p> :
                    associations.length === 0 ? <p>No associations found matching your criteria.</p> : (
                        <div style={{overflowX: 'auto'}}>
                            <table>
                                <thead>
                                <tr>
                                    <th>Customer Name (ID)</th>
                                    <th>User Name (ID)</th>
                                    <th>Role Name (ID)</th>
                                    <th>Send Stats Option</th>
                                    {/* No actions column for a read-only view */}
                                </tr>
                                </thead>
                                <tbody>
                                {associations.map((assoc) => (
                                    <tr key={`${assoc.cubeIdPk}-${assoc.userIdPk}`}>
                                        <td>{assoc.customerName || 'N/A'} ({assoc.cubeIdPk})</td>
                                        <td>{assoc.userFullName || 'N/A'} ({assoc.userIdPk})</td>
                                        <td>{assoc.roleName || 'N/A'} (ID: {assoc.roleIdPk})</td>
                                        <td>{assoc.cubeUserWhenSendStatsIfAdmin}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
            {/* Pagination controls would go here */}
            {/* Example:
            {totalPages > 0 && (
                 <div className="pagination-controls" style={{ marginTop: '20px', textAlign: 'center' }}>
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Prev</button>
                    <span> Page {currentPage} of {totalPages} </span>
                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0}>Next</button>
                </div>
            )}
            */}
        </div>
    );
}

export default CubeUserAssociationListPage;