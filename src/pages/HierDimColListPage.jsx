// src/pages/HierDimColListPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
// Change the imported name to match what's exported
import { getHierDimColsByHierarchyId as getAllHierDimCols, deleteHierDimCol } from '../api/hierDimColService';
// Or simply use getHierDimColsByHierarchyId directly in your code below
import { getAllHierarchies } from '../api/hierarchyService';
import { getAllDimColumns } from '../api/dimColumnService';
import HierDimColList from '../components/HierDimColList';

function HierDimColListPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [hierDimCols, setHierDimCols] = useState([]);
    const [hierarchies, setHierarchies] = useState([]); // For hierarchy filter dropdown
    const [dimColumns, setDimColumns] = useState([]);   // For dimCol filter dropdown (optional)

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedHierId, setSelectedHierId] = useState(searchParams.get('hierIdPk') || '');
    const [selectedDimColId, setSelectedDimColId] = useState(searchParams.get('dimcolIdPk') || '');

    // Basic pagination (can be expanded)
    // const [currentPage, setCurrentPage] = useState(1);
    // const [pageSize] = useState(20);
    // const [totalPages, setTotalPages] = useState(0);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const paramsForApi = {};
            if (selectedHierId) paramsForApi.hierIdPk = parseInt(selectedHierId);
            if (selectedDimColId) paramsForApi.dimcolIdPk = parseInt(selectedDimColId);
            // Add pagination params if implemented: paramsForApi.pageNumber = currentPage; paramsForApi.pageSize = pageSize;

            // Fetch associations and data for filters
            const [assocData, hierData, allDimColsData] = await Promise.all([
                getAllHierDimCols(paramsForApi),
                getAllHierarchies({ pageSize: 1000 }), // Fetch all hierarchies for filter
                getAllDimColumns({ pageSize: 1000 })   // Fetch all dim columns for filter
            ]);

            setHierDimCols(assocData || []); // getAllHierDimCols returns array directly based on earlier service
            setHierarchies(hierData.data || []);
            setDimColumns(allDimColsData.data || []);

            // Handle pagination headers from assocData if your API provides them
            // const totalItems = assocData.headers?.['x-pagination-totalitems'];
            // if (totalItems) setTotalPages(Math.ceil(totalItems / pageSize));

        } catch (err) {
            console.error("Error fetching HierDimCol list data:", err);
            setError(err.message || "Failed to load data.");
            setHierDimCols([]);
            setHierarchies([]);
            setDimColumns([]);
        } finally {
            setLoading(false);
        }
    }, [selectedHierId, selectedDimColId /*, currentPage, pageSize */]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDeleteAssociation = async (hierId, dimcolId) => {
        if (!window.confirm(`Delete association (Hierarchy ${hierId} - DimCol ${dimcolId})?`)) return;
        try {
            await deleteHierDimCol(hierId, dimcolId);
            alert('Association deleted successfully.');
            fetchData(); // Refresh the list
        } catch (err) {
            alert(`Error deleting association: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleFilterChange = (setter, paramName, value) => {
        setter(value);
        const newParams = new URLSearchParams(searchParams);
        if (value) {
            newParams.set(paramName, value);
        } else {
            newParams.delete(paramName);
        }
        // newParams.set('pageNumber', '1'); // Reset to page 1 on filter change
        setSearchParams(newParams);
    };

    // Note: Adding/Editing hier_dimcol from this global list page is complex
    // because you need to select BOTH a hierarchy AND a dimension column.
    // It's often simpler to manage these from within the Hierarchy's edit page.
    // For now, we'll omit a direct "Add New" button on this global list.

    return (
        <div>
            <h1>Hierarchy Levels (All Associations)</h1>
            <div className="filters" style={{ marginBottom: '20px', display: 'flex', gap: '20px' }}>
                <div>
                    <label htmlFor="hierFilter" style={{ marginRight: '10px' }}>Filter by Hierarchy:</label>
                    <select
                        id="hierFilter"
                        value={selectedHierId}
                        onChange={(e) => handleFilterChange(setSelectedHierId, 'hierIdPk', e.target.value)}
                    >
                        <option value="">All Hierarchies</option>
                        {hierarchies.map(h => (
                            <option key={h.hier_id_pk} value={h.hier_id_pk}>
                                {h.hier_cubename} (ID: {h.hier_id_pk}, Cust: {h.cube_id_pk})
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="dimColFilter" style={{ marginRight: '10px' }}>Filter by Dimension Column:</label>
                    <select
                        id="dimColFilter"
                        value={selectedDimColId}
                        onChange={(e) => handleFilterChange(setSelectedDimColId, 'dimcolIdPk', e.target.value)}
                    >
                        <option value="">All Dimension Columns</option>
                        {dimColumns.map(dc => (
                            <option key={dc.dimcol_id_pk} value={dc.dimcol_id_pk}>
                                {dc.dimcol_cname} (ID: {dc.dimcol_id_pk}, Dim: {dc.dim_id_pk})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <HierDimColList
                hierDimCols={hierDimCols}
                // onEdit would navigate to a complex edit page or open a modal
                // For simplicity, we might say "Edit attributes on the Hierarchy's edit page"
                onEdit={(assoc) => navigate(`/hierarchies/edit/${assoc.hierIdPk}`)} // Navigate to parent hierarchy
                onDelete={handleDeleteAssociation}
                loading={loading}
                error={error}
            />
            {/* Add pagination controls if implemented */}
        </div>
    );
}

export default HierDimColListPage;