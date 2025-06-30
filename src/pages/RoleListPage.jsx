// src/pages/RoleListPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getAllRoles, deleteRole as apiDeleteRole } from '../api/roleService';
import { getAllCustomers } from '../api/customerService'; // To populate customer filter
import RoleList from '../components/RoleList'; // Your existing RoleList component

function RoleListPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [roles, setRoles] = useState([]);
    const [customers, setCustomers] = useState([]); // For filter dropdown
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedCubeId, setSelectedCubeId] = useState(searchParams.get('cubeIdPk') || '');
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('pageNumber')) || 1);
    const [pageSize] = useState(10); // Or make configurable
    const [totalPages, setTotalPages] = useState(0);

    const fetchRolesAndCustomers = useCallback(async (page = currentPage, cubeId = selectedCubeId) => {
        setLoading(true);
        setError(null);
        try {
            const paramsForRoles = { pageNumber: page, pageSize };
            if (cubeId) {
                paramsForRoles.cubeIdPk = cubeId;
            }
            console.log('DEBUG: Fetching roles with params:', paramsForRoles); // Debug log

            const [rolesResponse, custData] = await Promise.all([
                getAllRoles(paramsForRoles),
                getAllCustomers({ pageSize: 1000 }) // Fetch customers for filter
            ]);

            console.log('DEBUG: Roles response data:', rolesResponse.data); // Debug log
            console.log('DEBUG: Customers for filter:', custData.data || custData); // Debug log

            setRoles(rolesResponse.data || []);
            setCustomers(custData.data || []); // Assuming getAllCustomers returns {data, headers}

            const totalItemsHeader = rolesResponse.headers['x-pagination-totalitems'];
            const pageSizeHeader = rolesResponse.headers['x-pagination-pagesize'];
            if (totalItemsHeader && pageSizeHeader) {
                setTotalPages(Math.ceil(parseInt(totalItemsHeader) / parseInt(pageSizeHeader)));
            } else {
                setTotalPages(rolesResponse.data && rolesResponse.data.length > 0 ? Math.ceil(rolesResponse.data.length / pageSize) : 0);
            }
            setCurrentPage(page);

        } catch (err) {
            console.error('Error fetching roles/customers:', err);
            setError(err);
            setRoles([]);
            setCustomers([]);
        } finally {
            setLoading(false);
        }
    }, [pageSize, currentPage, selectedCubeId]);

    useEffect(() => {
        const pageToFetch = parseInt(searchParams.get('pageNumber')) || 1;
        console.log('DEBUG: selectedCubeId before fetch:', selectedCubeId); // Debug log
        fetchRolesAndCustomers(pageToFetch);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCubeId, searchParams.get('pageNumber'), pageSize]); // Simplified deps, fetch on filter or page change


    const handleDeleteRole = async (id) => {
        if (!window.confirm(`Delete role ID: ${id}?`)) return;
        try {
            await apiDeleteRole(id);
            alert(`Role ID: ${id} deleted.`);
            // Refresh list, consider current page
            if (roles.length === 1 && currentPage > 1) {
                handlePageChange(currentPage - 1);
            } else {
                fetchRolesAndCustomers(currentPage);
            }
        } catch (err) {
            alert(`Error deleting role: ${err.response?.data?.message || err.response?.data?.title || err.message}`);
        }
    };

    const handleCustomerFilterChange = (e) => {
        const newCubeId = e.target.value;
        setSelectedCubeId(newCubeId);
        setCurrentPage(1); // Reset to first page
        const params = { pageNumber: 1, pageSize };
        if (newCubeId) params.cubeIdPk = newCubeId;
        setSearchParams(params);
        console.log('DEBUG: handleCustomerFilterChange set selectedCubeId to:', newCubeId); // Debug log

        // Immediately fetch roles with the new filter value
        fetchRolesAndCustomers(1, newCubeId);
    };

    const handleNavigateToAdd = () => {
        // If a customer is selected, pass it to pre-fill the customer for the new role
        navigate(selectedCubeId ? `/roles/add?cubeIdPk=${selectedCubeId}` : '/roles/add');
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && (newPage <= totalPages || totalPages === 0)) {
            setCurrentPage(newPage);
            const params = { pageNumber: newPage, pageSize };
            if (selectedCubeId) params.cubeIdPk = selectedCubeId;
            setSearchParams(params);
        }
    };

    return (
        <div>
            <h1>Roles Management (All)</h1>
            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                {/*
                <div>
                    <label htmlFor="customerFilter" style={{ marginRight: '10px' }}>Filter by Customer:</label>
                    <select id="customerFilter" value={selectedCubeId} onChange={handleCustomerFilterChange} onClick={() => console.log('DEBUG: Customer filter dropdown clicked')}>
                        <option value="">All Customers</option>
                        {customers.map(cust => <option key={cust.cube_id_pk} value={cust.cube_id_pk}>{cust.cube_name} ({cust.cube_id_pk})</option>)}
                    </select>
                </div>
                */}
                <button className="primary" onClick={handleNavigateToAdd}>
                    Add New Role
                </button>
            </div>

            <RoleList
                roles={roles}
                onEdit={(role) => navigate(`/roles/edit/${role.role_id_pk}`)} // Navigate to top-level edit page
                onDelete={handleDeleteRole}
                loading={loading}
                error={error}
            />
            {totalPages > 0 && (
                <div className="pagination-controls" style={{ marginTop: '20px', textAlign: 'center' }}>
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                        Previous
                    </button>
                    <span style={{ margin: '0 10px' }}> Page {currentPage} of {totalPages} </span>
                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0}>
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}

export default RoleListPage;