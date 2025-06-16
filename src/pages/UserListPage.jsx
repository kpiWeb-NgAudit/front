// src/pages/UserListPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getAllUsers, deleteUser as apiDeleteUser } from '../api/userService';
import UserList from '../components/UserList';

function UserListPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('pageNumber')) || 1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);

    const fetchUsers = useCallback(async (page = currentPage) => {
        setLoading(true); setError(null);
        try {
            const params = { pageNumber: page, pageSize };
            const response = await getAllUsers(params);
            setUsers(response.data || []);
            const totalItemsHeader = response.headers['x-pagination-totalitems'];
            const pageSizeHeader = response.headers['x-pagination-pagesize'];
            if (totalItemsHeader && pageSizeHeader) {
                setTotalPages(Math.ceil(parseInt(totalItemsHeader) / parseInt(pageSizeHeader)));
            } else { setTotalPages(response.data?.length > 0 ? Math.ceil(response.data.length / pageSize) : 0); }
            setCurrentPage(page);
        } catch (err) {
            setError(err); setUsers([]);
        } finally {
            setLoading(false);
        }
    }, [pageSize, currentPage]); // Add currentPage if it's directly used in params without page argument

    useEffect(() => {
        const pageToFetch = parseInt(searchParams.get('pageNumber')) || 1;
        fetchUsers(pageToFetch);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams.get('pageNumber'), pageSize]);


    const handleDeleteUser = async (id) => {
        if (!window.confirm(`Delete user ID: ${id}?`)) return;
        try {
            await apiDeleteUser(id);
            alert(`User ID: ${id} deleted.`);
            if (users.length === 1 && currentPage > 1) {
                handlePageChange(currentPage - 1);
            } else {
                fetchUsers(currentPage);
            }
        } catch (err) {
            alert(`Error: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleNavigateToAdd = () => navigate('/users/add');

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && (newPage <= totalPages || totalPages === 0) ) {
            setCurrentPage(newPage);
            setSearchParams({ pageNumber: newPage, pageSize });
        }
    };

    return (
        <div>
            <h1>Users Management</h1>
            <UserList
                users={users}
                onDelete={handleDeleteUser}
                loading={loading}
                error={error}
                onAdd={handleNavigateToAdd}
            />
            {totalPages > 0 && (
                <div className="pagination-controls" style={{ marginTop: '20px', textAlign: 'center' }}>
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Prev</button>
                    <span> Page {currentPage} of {totalPages} </span>
                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0}>Next</button>
                </div>
            )}
        </div>
    );
}
export default UserListPage;