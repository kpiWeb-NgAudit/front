// src/pages/EditCubesetPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CubesetForm from '../components/CubesetForm';
import { getCubesetById, updateCubeset } from '../api/cubesetService';

function EditCubesetPage() {
    const navigate = useNavigate();
    const { id } = useParams(); // Cubeset ID
    const [cubeset, setCubeset] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const numericId = parseInt(id);

    const fetchCubeset = useCallback(async () => {
        if (isNaN(numericId)) {
            setError(new Error("Invalid Cubeset ID.")); setLoading(false); return;
        }
        setLoading(true); setError(null);
        try {
            const data = await getCubesetById(numericId);
            setCubeset(data);
        } catch (err) {
            setError(err.message || "Failed to load cubeset.");
        } finally {
            setLoading(false);
        }
    }, [numericId]);

    useEffect(() => {
        fetchCubeset();
    }, [fetchCubeset]);

    const handleUpdateCubeset = async (cubesetData) => {
        if (isNaN(numericId)) return Promise.reject(new Error("Invalid Cubeset ID"));
        try {
            const updatedCubeset = await updateCubeset(numericId, cubesetData);
            alert(`Cubeset "${updatedCubeset.cubeset_name || updatedCubeset.cubeset_id_pk}" updated.`);
            navigate(cubesetData.CubeIdPk ? `/cubesets?cubeIdPk=${cubesetData.CubeIdPk}` : '/cubesets');
        } catch (error) {
            alert(`Error updating cubeset: ${error.response?.data?.message || error.message}`);
            throw error;
        }
    };

    if (loading) return <p>Loading cubeset data...</p>;
    if (error) return <p className="error-message">Error: {error}</p>;
    if (!cubeset && !loading) return <p>Cubeset not found (ID: {id}).</p>;
    if (!cubeset) return null;

    return (
        <div>
            <h2>Edit Cubeset (ID: {cubeset.cubeset_id_pk})</h2>
            <CubesetForm
                onSubmit={handleUpdateCubeset}
                onCancel={() => navigate(cubeset.cube_id_pk ? `/cubesets?cubeIdPk=${cubeset.cube_id_pk}` : '/cubesets')}
                initialData={cubeset} // this line is imp
                isEditMode={true}
                parentCubeIdPk={cubeset.cube_id_pk}
            />

        </div>
    );
}
export default EditCubesetPage;