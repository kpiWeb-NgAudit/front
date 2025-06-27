import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getAllCubesets, deleteCubeset as apiDeleteCubeset } from '../api/cubesetService';
import { getAllCustomers } from '../api/customerService';
import CubesetList from '../components/CubesetList';

function CubesetListPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [cubesets, setCubesets] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedCubeId, setSelectedCubeId] = useState(searchParams.get('cubeIdPk') || '');
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('pageNumber'), 10) || 1);
    const [totalPages, setTotalPages] = useState(0);
    const pageSize = 10;

    // Version finale et correcte de la fonction, à placer dans votre CubesetListPage.jsx

    const fetchCubesetsAndCustomers = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // 1. Préparer les paramètres pour la requête des cubesets (qui est paginée)
            const cubesetParams = {
                pageNumber: currentPage,
                pageSize: pageSize // pageSize est défini dans le scope du composant, ex: const pageSize = 10;
            };
            if (selectedCubeId) {
                cubesetParams.cubeIdPk = selectedCubeId;
            }

            // 2. Lancer les deux appels API en parallèle
            const [cubesetsResponse, customersData] = await Promise.all([
                // Appel pour les cubesets, qui retourne { data, headers }
                getAllCubesets(cubesetParams),

                // Appel pour les clients :
                // - On ne le fait qu'une seule fois (si la liste est vide).
                // - Il appelle la nouvelle version simple de getAllCustomers() qui retourne directement les données.
                customers.length === 0 ? getAllCustomers() : Promise.resolve(customers)
            ]);

            // 3. Mettre à jour l'état avec les résultats

            // Mettre à jour les cubesets et la pagination
            setCubesets(cubesetsResponse.data || []);
            const totalPagesHeader = cubesetsResponse.headers['x-pagination-totalpages'];
            setTotalPages(totalPagesHeader ? parseInt(totalPagesHeader, 10) : 0);

            // Mettre à jour la liste des clients si elle vient d'être chargée
            if (customers.length === 0) {
                setCustomers(customersData || []);
            }

        } catch (err) {
            console.error("Error fetching page data:", err);
            setError(err.message || "Failed to load data. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [selectedCubeId, currentPage, customers.length]); // Les dépendances restent les mêmes et sont correctes

    useEffect(() => {
        fetchCubesetsAndCustomers();
    }, [fetchCubesetsAndCustomers]);

    const handleCustomerFilterChange = (e) => {
        const newCubeId = e.target.value;

        // <<< LOG 1 : VERIFIER L'INTERACTION DE L'UTILISATEUR >>>
        console.log(`%c[Log 1] handleCustomerFilterChange: User selected newCubeId: '${newCubeId}'`, 'color: purple; font-weight: bold;');

        setSelectedCubeId(newCubeId);
        setCurrentPage(1);

        const params = { pageNumber: '1' };
        if (newCubeId) {
            params.cubeIdPk = newCubeId;
        }
        setSearchParams(params);
    };

    // ... (les autres fonctions handlePageChange, handleDeleteCubeset, etc. ne changent pas)
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            const params = { pageNumber: String(newPage) };
            if (selectedCubeId) {
                params.cubeIdPk = selectedCubeId;
            }
            setSearchParams(params);
        }
    };

    const handleDeleteCubeset = async (id) => {
        if (!window.confirm(`Delete cubeset ID: ${id}?`)) return;
        try {
            await apiDeleteCubeset(id);
            alert(`Cubeset ID: ${id} deleted.`);
            if (cubesets.length === 1 && currentPage > 1) {
                handlePageChange(currentPage - 1);
            } else {
                fetchCubesetsAndCustomers();
            }
        } catch (err) {
            alert(`Error deleting cubeset: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleNavigateToAdd = () => {
        navigate(selectedCubeId ? `/cubesets/add?cubeIdPk=${selectedCubeId}` : '/cubesets/add');
    };


    return (
        <div className="container mt-4">
            <h1>Cubesets Management</h1>
            <div className="card card-body mb-3">
                <div className="row g-3 align-items-center">
                    <div className="col-md-8">
                        <label htmlFor="customerFilterCubesetPage" className="form-label">Filter by Customer:</label>
                        <select id="customerFilterCubesetPage" value={selectedCubeId} onChange={handleCustomerFilterChange} className="form-select">
                            <option value="">All Customers</option>
                            {customers.map(cust => <option key={cust.cube_id_pk} value={cust.cube_id_pk}>{cust.cube_name} ({cust.cube_id_pk})</option>)}
                        </select>
                    </div>
                    <div className="col-md-4">
                        <label className="form-label"> </label>
                        <button className="btn btn-primary w-100" onClick={handleNavigateToAdd}>
                            Add New Cubeset
                        </button>
                    </div>
                </div>
            </div>

            <CubesetList
                cubesets={cubesets}
                onEdit={(cubeset) => navigate(`/cubesets/edit/${cubeset.cubeset_id_pk}`)}
                onDelete={handleDeleteCubeset}
                loading={loading}
                error={error}
            />

            {totalPages > 1 && (
                <div className="pagination-controls mt-3 d-flex justify-content-center">
                    <button className="btn btn-outline-secondary" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                        « Prev
                    </button>
                    <span className="mx-3 my-auto"> Page {currentPage} of {totalPages} </span>
                    <button className="btn btn-outline-secondary" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages}>
                        Next »
                    </button>
                </div>
            )}
        </div>
    );
}

export default CubesetListPage;