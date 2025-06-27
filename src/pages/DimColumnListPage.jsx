// Créez ce nouveau fichier : src/pages/DimColumnListPage.jsx

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getAllDimColumns, deleteDimColumn as apiDeleteDimColumn } from '../api/dimColumnService';
import { getAllDimensions } from '../api/dimensionService'; // Pour le filtre
import DimColumnList from '../components/DimColumnList';
import Pagination from '../components/Pagination'; // Réutiliser notre composant

function DimColumnListPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // États locaux
    const [dimColumns, setDimColumns] = useState([]);
    const [dimensions, setDimensions] = useState([]); // Pour le filtre
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // États locaux pour piloter la logique
    const [selectedDimensionId, setSelectedDimensionId] = useState(searchParams.get('dimensionId') || '');
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('pageNumber'), 10) || 1);
    const [totalPages, setTotalPages] = useState(0);
    const pageSize = 15; // Un peu plus grand pour les listes de colonnes

    // Logique de récupération des données
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = { pageNumber: currentPage, pageSize };
            if (selectedDimensionId) {
                params.dimensionId = selectedDimensionId;
            }

            const [dimColsResponse, dimsResponse] = await Promise.all([
                getAllDimColumns(params),
                dimensions.length === 0 ? getAllDimensions({ pageSize: 1000 }) : Promise.resolve({ data: dimensions })
            ]);

            setDimColumns(dimColsResponse.data || []);
            if (dimensions.length === 0) {
                setDimensions(dimsResponse.data || []);
            }

            const totalPagesHeader = dimColsResponse.headers['x-pagination-totalpages'];
            setTotalPages(totalPagesHeader ? parseInt(totalPagesHeader, 10) : 0);

        } catch (err) {
            setError(err.message || "Failed to load data.");
        } finally {
            setLoading(false);
        }
    }, [selectedDimensionId, currentPage, dimensions.length]);

    // Déclencheur
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Gestionnaires d'événements
    const handleDelete = async (id) => {
        if (!window.confirm(`Delete dimension column ID: ${id}?`)) return;
        try {
            await apiDeleteDimColumn(id);
            alert(`Dimension column ID: ${id} deleted.`);
            if (dimColumns.length === 1 && currentPage > 1) {
                handlePageChange(currentPage - 1);
            } else {
                fetchData();
            }
        } catch (err) {
            alert(`Error deleting dimension column: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleFilterChange = (e) => {
        const newDimId = e.target.value;
        setSelectedDimensionId(newDimId);
        setCurrentPage(1);
        const params = { pageNumber: '1' };
        if (newDimId) {
            params.dimensionId = newDimId;
        }
        setSearchParams(params);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            const params = { pageNumber: String(newPage) };
            if (selectedDimensionId) {
                params.dimensionId = selectedDimensionId;
            }
            setSearchParams(params);
        }
    };

    return (
        <div className="container mt-4">
            <h1>Dimension Columns</h1>
            <div className="card card-body mb-3">
                <label htmlFor="dimensionFilter" className="form-label">Filter by Dimension:</label>
                <select id="dimensionFilter" value={selectedDimensionId} onChange={handleFilterChange} className="form-select">
                    <option value="">All Dimensions</option>
                    {dimensions.map(dim => (
                        <option key={dim.dim_id_pk} value={dim.dim_id_pk}>
                            {dim.dim_shortpresname} (ID: {dim.dim_id_pk})
                        </option>
                    ))}
                </select>
            </div>

            {/* Le bouton "Add" n'a pas de sens ici, car les colonnes se créent depuis la page d'une dimension */}

            <DimColumnList
                dimColumns={dimColumns}
                onEdit={(col) => navigate(`/dimcolumns/edit/${col.dimcol_id_pk}`)}
                onDelete={handleDelete}
                loading={loading}
                error={error}
            />

            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    );
}

export default DimColumnListPage;