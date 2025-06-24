// src/pages/EditSourcePage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SourceForm from '../components/SourceForm';
import { getSourceById, updateSource } from '../api/sourceService';
import SourceFactManager from '../components/SourceFactManager'; // Notre nouveau manager !


function EditSourcePage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [source, setSource] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const numericId = parseInt(id);

    const fetchSource = useCallback(async () => {
        if (isNaN(numericId)) { setError(new Error("Invalid ID.")); setLoading(false); return; }
        setLoading(true); setError(null);
        try {
            const data = await getSourceById(numericId);
            setSource(data);
        } catch (err) { setError(err.message || "Failed to load."); }
        finally { setLoading(false); }
    }, [numericId]);

    useEffect(() => { fetchSource(); }, [fetchSource]);

    const handleUpdateSource = async (sourceData) => {
        if (isNaN(numericId)) return Promise.reject(new Error("Invalid ID"));
        try {
            await updateSource(numericId, sourceData); // updateSource might return 204 or updated obj
            alert(`Source (ID: ${numericId}) updated.`);
            navigate(sourceData.CubeIdPk ? `/sources?cubeIdPk=${sourceData.CubeIdPk}` : '/sources');
        } catch (error) {
            alert(`Error: ${error.response?.data?.message || error.message}`);
            throw error;
        }
    };

    if (loading) return <p>Loading source data...</p>;
    if (error) return <p className="error-message">Error: {error}</p>;
    if (!source && !loading) return <p>Source not found.</p>;
    if (!source) return null;

    return (
        <div className="container mt-4">
            {/* Titre de la page */}
            <h2>Edit Source (ID: {source.source_id_pk})</h2>

            {/* Formulaire pour éditer les propriétés de l'entité `source` elle-même */}
            <SourceForm
                onSubmit={handleUpdateSource}
                onCancel={() => navigate(source.cube_id_pk ? `/sources/by-customer/${source.cube_id_pk}` : '/sources')}
                initialData={source}
                isEditMode={true}
                parentCubeIdPk={source.cube_id_pk}
            />

            {/*
              <<< 2. INTÉGRATION DU MANAGER
              Le composant SourceFactManager est ajouté ici.
              - Il est complètement autonome et n'a besoin que de l'ID de la source parente.
              - Il gère ses propres appels API, états de chargement et erreurs pour les faits associés.
              - Cela maintient le code de la page `EditSourcePage` propre et centré sur la gestion de l'entité `source`.
            */}
            <SourceFactManager sourceId={numericId} />

        </div>
    );
}

export default EditSourcePage;