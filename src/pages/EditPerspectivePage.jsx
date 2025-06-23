// src/pages/EditPerspectivePage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PerspectiveForm from '../components/PerspectiveForm';
import { getPerspectiveById, updatePerspective } from '../api/perspectiveService';
import PerspectiveFactAssociationManager from '../components/PerspectiveFactAssociationManager'; // <<< NEW IMPORT

function EditPerspectivePage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [perspective, setPerspective] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const numericId = parseInt(id);

    const fetchPerspective = useCallback(async () => {
        if (isNaN(numericId)) { setError(new Error("Invalid Perspective ID.")); setLoading(false); return; }
        setLoading(true); setError(null);
        try {
            const data = await getPerspectiveById(numericId);
            setPerspective(data);
        } catch (err) { setError(err.message || "Failed to load perspective."); }
        finally { setLoading(false); }
    }, [numericId]);

    useEffect(() => { fetchPerspective(); }, [fetchPerspective]);

    const handleUpdatePerspective = async (perspectiveData) => {
        try {
            await updatePerspective(numericId, perspectiveData);
            alert(`Perspective (ID: ${numericId}) updated.`);
            // Optionally re-fetch perspective to update timestamp in main form
            fetchPerspective();
            // navigate(perspectiveData.CubeIdPk ? `/perspectives?cubeIdPk=${perspectiveData.CubeIdPk}` : '/perspectives');
        } catch (error) {
            alert(`Error: ${error.response?.data?.message || error.message}`);
            throw error;
        }
    };

    if (loading) return <p>Loading perspective data...</p>;
    if (error) return <p className="error-message">Error: {error}</p>;
    if (!perspective) return <p>Perspective not found.</p>;

    return (
        <div>
            <h2>Edit Perspective (ID: {perspective.perspIdPk})</h2>
            <PerspectiveForm
                onSubmit={handleUpdatePerspective}
                onCancel={() => navigate(perspective.cubeIdPk ? `/perspectives?cubeIdPk=${perspective.cubeIdPk}` : '/perspectives')}
                initialData={perspective}
                isEditMode={true}
                parentCubeIdPk={perspective.cubeIdPk}
            />

            <hr style={{ margin: '30px 0', borderTop: '1px solid #eee' }} />

            {/* Manage Fact Associations */}
            {!isNaN(numericId) && (
                <PerspectiveFactAssociationManager perspectiveId={numericId} />
            )}
        </div>
    );
}
export default EditPerspectivePage;