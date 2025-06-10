// src/pages/DimensionListPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom'; // useSearchParams for query params
import { getAllDimensions, deleteDimension as apiDeleteDimension } from '../api/dimensionService';
import { getAllCustomers } from '../api/customerService'; // To populate customer filter
import DimensionList from '../components/DimensionList';

function DimensionListPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [dimensions, setDimensions] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Read filter from URL query parameters
    const [selectedCubeId, setSelectedCubeId] = useState(searchParams.get('cubeIdPk') || '');
    // Add states for pagination and sorting if you implement them fully
    // const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('pageNumber')) || 1);
    // const [pageSize, setPageSize] = useState(parseInt(searchParams.get('pageSize')) || 10);


    const fetchDimensionsAndCustomers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [dimData, custData] = await Promise.all([
                getAllDimensions({ cubeIdPk: selectedCubeId || undefined }), // Pass undefined if empty
                getAllCustomers()
            ]);
            setDimensions(dimData || []);
            setCustomers(custData || []);
        } catch (err) {
            console.error("Error fetching data:", err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [selectedCubeId]); // Re-fetch if selectedCubeId changes

    useEffect(() => {
        fetchDimensionsAndCustomers();
    }, [fetchDimensionsAndCustomers]);

    const handleDeleteDimension = async (id) => {
        if (!window.confirm(`Are you sure you want to delete dimension with ID: ${id}? This action cannot be undone.`)) {
            return;
        }
        try {
            await apiDeleteDimension(id);
            setDimensions(prevDimensions => prevDimensions.filter(dim => dim.dim_id_pk !== id));
            alert(`Dimension with ID: ${id} deleted successfully.`);
        } catch (err) {
            console.error(`Failed to delete dimension ${id}:`, err);
            alert(`Error deleting dimension: ${err.response?.data?.message || err.response?.data?.title || err.message}`);
        }
    };

    const handleCustomerFilterChange = (e) => {
        const newCubeId = e.target.value;
        setSelectedCubeId(newCubeId);
        // Update URL query parameters
        if (newCubeId) {
            setSearchParams({ cubeIdPk: newCubeId });
        } else {
            setSearchParams({}); // Clear query params if filter is removed
        }
    };

    const handleNavigateToAdd = () => {
        // If a customer is selected in the filter, pass it as a query param to pre-fill in AddDimensionPage
        if (selectedCubeId) {
            navigate(`/dimensions/add?cubeIdPk=${selectedCubeId}`);
        } else {
            navigate('/dimensions/add');
        }
    };


    return (
        <div>
            <h1>Dimensions Management</h1>

            <div style={{ marginBottom: '20px' }}>
                <label htmlFor="customerFilter" style={{ marginRight: '10px' }}>Filter by Customer:</label>
                <select
                    id="customerFilter"
                    value={selectedCubeId}
                    onChange={handleCustomerFilterChange}
                >
                    <option value="">All Customers</option>
                    {customers.map(cust => (
                        <option key={cust.cube_id_pk} value={cust.cube_id_pk}>
                            {cust.cube_name} ({cust.cube_id_pk})
                        </option>
                    ))}
                </select>
            </div>

            <DimensionList
                dimensions={dimensions}
                onDelete={handleDeleteDimension}
                loading={loading}
                error={error}
                onAdd={handleNavigateToAdd} // Pass navigation function
                cubeIdForFilter={selectedCubeId}
            />
        </div>
    );
}

export default DimensionListPage;